#!/bin/bash
# ============================================================
# RouteSync — AWS CLI Deployment Script
# Deploys all 15 services in one go.
# ============================================================
# PREREQUISITES:
#   1. Install AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html
#   2. Run: aws configure  (enter your Access Key, Secret Key, region: us-east-1)
#   3. Fill in your API keys in the CONFIGURATION block below
#   4. Run: chmod +x deploy-aws.sh && ./deploy-aws.sh
# ============================================================

set -e
export AWS_PAGER=""          # Disable pager
export MSYS_NO_PATHCONV=1   # Prevent Git Bash path conversion

# ─── CONFIGURATION — FILL IN YOUR REAL VALUES ────────────────
REGION="us-east-1"
GROQ_API_KEY="PASTE_YOUR_GROQ_API_KEY_HERE"
OPENWEATHER_API_KEY="PASTE_YOUR_OPENWEATHER_KEY_HERE"
JWT_SECRET="routesync_jwt_secret_2024"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
# ─────────────────────────────────────────────────────────────

# ─── Save resource IDs on exit (even if script fails midway) ──
VPC_ID="" NAT_ID="" EIP_ALLOC="" IGW_ID="" PUB_RT="" PRIV_RT=""
ALB_SG="" EC2_SG="" ENDPOINT_SG="" PUB_NACL="" PRIV_NACL=""
ALB_ARN="" TG_ARN="" BUCKET_NAME=""
save_ids() {
  cat > ./aws-resource-ids.env << EOF
VPC_ID=$VPC_ID
NAT_ID=$NAT_ID
EIP_ALLOC=$EIP_ALLOC
IGW_ID=$IGW_ID
PUB_RT=$PUB_RT
PRIV_RT=$PRIV_RT
PUB_NACL=$PUB_NACL
PRIV_NACL=$PRIV_NACL
ALB_SG=$ALB_SG
EC2_SG=$EC2_SG
ENDPOINT_SG=$ENDPOINT_SG
ALB_ARN=$ALB_ARN
TG_ARN=$TG_ARN
BUCKET_NAME=$BUCKET_NAME
EOF
}
trap save_ids EXIT   # Auto-save IDs whenever script exits (success or failure)

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║     RouteSync AWS Deployment — Starting...           ║"
echo "╚══════════════════════════════════════════════════════╝"
echo "Account: $ACCOUNT_ID | Region: $REGION"
echo ""

# ════════════════════════════════════════════════════════════
# PHASE 1 — IAM Role
# ════════════════════════════════════════════════════════════
echo "▶ PHASE 1: Creating IAM Role..."

aws iam create-role \
  --role-name VanguardEC2Role \
  --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"ec2.amazonaws.com"},"Action":"sts:AssumeRole"}]}' \
  --region $REGION > /dev/null 2>&1 || echo "  Role already exists, skipping."

for policy in \
  "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore" \
  "arn:aws:iam::aws:policy/SecretsManagerReadWrite" \
  "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess" \
  "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"; do
  aws iam attach-role-policy --role-name VanguardEC2Role --policy-arn $policy > /dev/null 2>&1 || true
done

aws iam create-instance-profile --instance-profile-name VanguardEC2Role > /dev/null 2>&1 || true
aws iam add-role-to-instance-profile --instance-profile-name VanguardEC2Role --role-name VanguardEC2Role > /dev/null 2>&1 || true
sleep 10  # Wait for IAM propagation

echo "  ✅ IAM Role ready"

# ════════════════════════════════════════════════════════════
# PHASE 2 — VPC + Subnets
# ════════════════════════════════════════════════════════════
echo "▶ PHASE 2: Creating VPC..."

VPC_ID=$(aws ec2 create-vpc \
  --cidr-block 10.0.0.0/16 \
  --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=VanguardVPC}]' \
  --query 'Vpc.VpcId' --output text --region $REGION)

# Enable DNS
aws ec2 modify-vpc-attribute --vpc-id $VPC_ID --enable-dns-support --region $REGION
aws ec2 modify-vpc-attribute --vpc-id $VPC_ID --enable-dns-hostnames --region $REGION

echo "  VPC: $VPC_ID"

# Create 6 subnets
create_subnet() {
  aws ec2 create-subnet \
    --vpc-id $VPC_ID --cidr-block $1 --availability-zone ${REGION}$2 \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$3}]" \
    --query 'Subnet.SubnetId' --output text --region $REGION
}

PUB_1A=$(create_subnet "10.0.1.0/24" "a" "public-subnet-1a")
PRIV_APP_1A=$(create_subnet "10.0.2.0/24" "a" "private-app-1a")
PRIV_DB_1A=$(create_subnet "10.0.3.0/24" "a" "private-db-1a")
PUB_1B=$(create_subnet "10.0.4.0/24" "b" "public-subnet-1b")
PRIV_APP_1B=$(create_subnet "10.0.5.0/24" "b" "private-app-1b")
PRIV_DB_1B=$(create_subnet "10.0.6.0/24" "b" "private-db-1b")

# Enable public IP on public subnets
aws ec2 modify-subnet-attribute --subnet-id $PUB_1A --map-public-ip-on-launch --region $REGION
aws ec2 modify-subnet-attribute --subnet-id $PUB_1B --map-public-ip-on-launch --region $REGION

echo "  ✅ VPC + 6 Subnets ready"

# ════════════════════════════════════════════════════════════
# PHASE 3 — Internet Gateway
# ════════════════════════════════════════════════════════════
echo "▶ PHASE 3: Creating Internet Gateway..."

IGW_ID=$(aws ec2 create-internet-gateway \
  --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=VanguardIGW}]' \
  --query 'InternetGateway.InternetGatewayId' --output text --region $REGION)

aws ec2 attach-internet-gateway --internet-gateway-id $IGW_ID --vpc-id $VPC_ID --region $REGION

echo "  IGW: $IGW_ID ✅"

# ════════════════════════════════════════════════════════════
# PHASE 4 — Route Tables + NAT Gateway
# ════════════════════════════════════════════════════════════
echo "▶ PHASE 4: Creating Route Tables + NAT Gateway..."

# Public route table
PUB_RT=$(aws ec2 create-route-table \
  --vpc-id $VPC_ID \
  --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=public-rt}]' \
  --query 'RouteTable.RouteTableId' --output text --region $REGION)

aws ec2 create-route --route-table-id $PUB_RT --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW_ID --region $REGION
aws ec2 associate-route-table --route-table-id $PUB_RT --subnet-id $PUB_1A --region $REGION
aws ec2 associate-route-table --route-table-id $PUB_RT --subnet-id $PUB_1B --region $REGION

# Elastic IP + NAT Gateway
EIP_ALLOC=$(aws ec2 allocate-address --domain vpc --query 'AllocationId' --output text --region $REGION)

NAT_ID=$(aws ec2 create-nat-gateway \
  --subnet-id $PUB_1A \
  --allocation-id $EIP_ALLOC \
  --tag-specifications 'ResourceType=natgateway,Tags=[{Key=Name,Value=VanguardNAT}]' \
  --query 'NatGateway.NatGatewayId' --output text --region $REGION)

echo "  Waiting for NAT Gateway to be available (~2 min)..."
aws ec2 wait nat-gateway-available --nat-gateway-ids $NAT_ID --region $REGION
echo "  NAT: $NAT_ID ✅"

# Private route table
PRIV_RT=$(aws ec2 create-route-table \
  --vpc-id $VPC_ID \
  --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=private-rt}]' \
  --query 'RouteTable.RouteTableId' --output text --region $REGION)

aws ec2 create-route --route-table-id $PRIV_RT --destination-cidr-block 0.0.0.0/0 --nat-gateway-id $NAT_ID --region $REGION

for subnet in $PRIV_APP_1A $PRIV_APP_1B $PRIV_DB_1A $PRIV_DB_1B; do
  aws ec2 associate-route-table --route-table-id $PRIV_RT --subnet-id $subnet --region $REGION
done

echo "  ✅ Route Tables ready"

# ════════════════════════════════════════════════════════════
# PHASE 5 — Security Groups
# ════════════════════════════════════════════════════════════
echo "▶ PHASE 5: Creating Security Groups..."

ALB_SG=$(aws ec2 create-security-group \
  --group-name alb-sg --description "ALB - public web traffic" \
  --vpc-id $VPC_ID --query 'GroupId' --output text --region $REGION)
aws ec2 authorize-security-group-ingress --group-id $ALB_SG \
  --protocol tcp --port 80 --cidr 0.0.0.0/0 --region $REGION

EC2_SG=$(aws ec2 create-security-group \
  --group-name ec2-sg --description "EC2 - accepts traffic from ALB only" \
  --vpc-id $VPC_ID --query 'GroupId' --output text --region $REGION)
aws ec2 authorize-security-group-ingress --group-id $EC2_SG \
  --protocol tcp --port 80 --source-group $ALB_SG --region $REGION
aws ec2 authorize-security-group-ingress --group-id $EC2_SG \
  --protocol tcp --port 443 --source-group $ALB_SG --region $REGION

ENDPOINT_SG=$(aws ec2 create-security-group \
  --group-name endpoint-sg --description "SSM/Secrets Manager endpoints" \
  --vpc-id $VPC_ID --query 'GroupId' --output text --region $REGION)
aws ec2 authorize-security-group-ingress --group-id $ENDPOINT_SG \
  --protocol tcp --port 443 --cidr 10.0.0.0/16 --region $REGION

echo "  alb-sg: $ALB_SG | ec2-sg: $EC2_SG | endpoint-sg: $ENDPOINT_SG ✅"

# ════════════════════════════════════════════════════════════
# PHASE 6 — Network ACLs
# ════════════════════════════════════════════════════════════
echo "▶ PHASE 6: Creating Network ACLs..."

# Public NACL
PUB_NACL=$(aws ec2 create-network-acl --vpc-id $VPC_ID \
  --tag-specifications 'ResourceType=network-acl,Tags=[{Key=Name,Value=public-nacl}]' \
  --query 'NetworkAcl.NetworkAclId' --output text --region $REGION)

for port_from_to in "100 80 80" "110 443 443" "120 1024 65535"; do
  read rn pf pt <<< $port_from_to
  aws ec2 create-network-acl-entry --network-acl-id $PUB_NACL --ingress \
    --rule-number $rn --protocol tcp --port-range From=$pf,To=$pt --cidr-block 0.0.0.0/0 --rule-action allow --region $REGION
done
aws ec2 create-network-acl-entry --network-acl-id $PUB_NACL --egress \
  --rule-number 100 --protocol tcp --port-range From=0,To=65535 --cidr-block 0.0.0.0/0 --rule-action allow --region $REGION

aws ec2 replace-network-acl-association \
  --association-id $(aws ec2 describe-network-acls --filters Name=vpc-id,Values=$VPC_ID Name=default,Values=true \
    --query 'NetworkAcls[0].Associations[?SubnetId==`'$PUB_1A'`].NetworkAclAssociationId' --output text --region $REGION) \
  --network-acl-id $PUB_NACL --region $REGION 2>/dev/null || true

# Private App NACL
PRIV_NACL=$(aws ec2 create-network-acl --vpc-id $VPC_ID \
  --tag-specifications 'ResourceType=network-acl,Tags=[{Key=Name,Value=private-app-nacl}]' \
  --query 'NetworkAcl.NetworkAclId' --output text --region $REGION)

rule=100
for cidr in "10.0.1.0/24" "10.0.4.0/24"; do
  for port in 80 443; do
    aws ec2 create-network-acl-entry --network-acl-id $PRIV_NACL --ingress \
      --rule-number $rule --protocol tcp --port-range From=$port,To=$port --cidr-block $cidr --rule-action allow --region $REGION
    rule=$((rule+10))
  done
done
aws ec2 create-network-acl-entry --network-acl-id $PRIV_NACL --ingress \
  --rule-number $rule --protocol tcp --port-range From=1024,To=65535 --cidr-block 0.0.0.0/0 --rule-action allow --region $REGION

for port_from_to in "100 80 80" "110 443 443" "120 1024 65535"; do
  read rn pf pt <<< $port_from_to
  aws ec2 create-network-acl-entry --network-acl-id $PRIV_NACL --egress \
    --rule-number $rn --protocol tcp --port-range From=$pf,To=$pt --cidr-block 0.0.0.0/0 --rule-action allow --region $REGION
done

echo "  ✅ NACLs ready"

# ════════════════════════════════════════════════════════════
# PHASE 7 — Gateway Endpoints (S3 + DynamoDB)
# ════════════════════════════════════════════════════════════
echo "▶ PHASE 7: Creating Gateway Endpoints..."

for svc in "s3" "dynamodb"; do
  aws ec2 create-vpc-endpoint \
    --vpc-id $VPC_ID --service-name "com.amazonaws.${REGION}.${svc}" \
    --route-table-ids $PUB_RT $PRIV_RT --vpc-endpoint-type Gateway \
    --tag-specifications "ResourceType=vpc-endpoint,Tags=[{Key=Name,Value=Vanguard${svc^}Endpoint}]" \
    --region $REGION > /dev/null
done

echo "  ✅ S3 + DynamoDB Gateway Endpoints ready"

# ════════════════════════════════════════════════════════════
# PHASE 8 — Interface Endpoints (SSM + Secrets Manager)
# ════════════════════════════════════════════════════════════
echo "▶ PHASE 8: Creating Interface Endpoints..."

for svc in "ssm" "ssmmessages" "ec2messages" "secretsmanager"; do
  aws ec2 create-vpc-endpoint \
    --vpc-id $VPC_ID \
    --service-name "com.amazonaws.${REGION}.${svc}" \
    --subnet-ids $PRIV_APP_1A $PRIV_APP_1B \
    --security-group-ids $ENDPOINT_SG \
    --vpc-endpoint-type Interface \
    --private-dns-enabled \
    --tag-specifications "ResourceType=vpc-endpoint,Tags=[{Key=Name,Value=${svc}-endpoint}]" \
    --region $REGION > /dev/null
done

echo "  ✅ Interface Endpoints ready"

# ════════════════════════════════════════════════════════════
# PHASE 9 — DynamoDB Tables
# ════════════════════════════════════════════════════════════
echo "▶ PHASE 9: Creating DynamoDB Tables..."

aws dynamodb create-table --table-name routesync-users \
  --attribute-definitions AttributeName=userId,AttributeType=S \
  --key-schema AttributeName=userId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST --region $REGION 2>/dev/null || echo "  routesync-users exists"

aws dynamodb create-table --table-name routesync-bookings \
  --attribute-definitions AttributeName=bookingId,AttributeType=S AttributeName=userId,AttributeType=S \
  --key-schema AttributeName=bookingId,KeyType=HASH AttributeName=userId,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes '[{
    "IndexName":"userId-index",
    "KeySchema":[{"AttributeName":"userId","KeyType":"HASH"}],
    "Projection":{"ProjectionType":"ALL"}
  }]' --region $REGION 2>/dev/null || echo "  routesync-bookings exists"

aws dynamodb create-table --table-name routesync-routes \
  --attribute-definitions AttributeName=routeId,AttributeType=S \
  --key-schema AttributeName=routeId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST --region $REGION 2>/dev/null || echo "  routesync-routes exists"

echo "  ✅ DynamoDB Tables ready"

# ════════════════════════════════════════════════════════════
# PHASE 10 — EC2 Launch Template
# ════════════════════════════════════════════════════════════
echo "▶ PHASE 10: Creating Launch Template..."

# Get latest Amazon Linux 2023 AMI
AMI_ID=$(aws ec2 describe-images \
  --owners amazon \
  --filters 'Name=name,Values=al2023-ami-*' 'Name=architecture,Values=x86_64' 'Name=state,Values=available' \
  --query 'sort_by(Images,&CreationDate)[-1].ImageId' \
  --output text --region $REGION)

echo "  AMI: $AMI_ID"

# Build user data script (base64 encoded)
USER_DATA=$(cat << SCRIPT | base64 -w 0
#!/bin/bash
set -e
exec > >(tee /var/log/user-data.log | logger -t user-data) 2>&1

echo "=== [1/7] System update ==="
dnf update -y

echo "=== [2/7] Install Git and NGINX ==="
dnf install -y git nginx

echo "=== [3/7] Install Node.js 20 via nvm ==="
export HOME=/root
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="\$HOME/.nvm"
[ -s "\$NVM_DIR/nvm.sh" ] && \\. "\$NVM_DIR/nvm.sh"
nvm install 20 && nvm use 20 && nvm alias default 20
ln -sf "\$(which node)" /usr/local/bin/node
ln -sf "\$(which npm)" /usr/local/bin/npm

echo "=== [4/7] Clone RouteSync ==="
mkdir -p /var/www && cd /var/www
git clone https://github.com/Pramodh92/RouteSync.git routesync
cd routesync

echo "=== [5/7] Create .env ==="
cat > /var/www/routesync/server/.env << 'ENVEOF'
PORT=3001
NODE_ENV=production
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d
FRONTEND_ORIGIN=http://localhost:5173
GROQ_API_KEY=${GROQ_API_KEY}
OPENWEATHER_API_KEY=${OPENWEATHER_API_KEY}
AWS_REGION=${REGION}
DYNAMO_USERS_TABLE=routesync-users
DYNAMO_BOOKINGS_TABLE=routesync-bookings
DYNAMO_ROUTES_TABLE=routesync-routes
ENVEOF
chmod 600 /var/www/routesync/server/.env

echo "=== [6/7] Build React app ==="
npm install --legacy-peer-deps && npm run build
mkdir -p /var/www/routesync-dist
cp -r dist/. /var/www/routesync-dist/ 2>/dev/null || cp -r build/. /var/www/routesync-dist/

cd /var/www/routesync/server && npm install
nohup node server.js >> /var/log/routesync-server.log 2>&1 &

echo "=== [7/7] Configure NGINX ==="
# Write full nginx.conf to avoid conflict with default server block
cat > /etc/nginx/nginx.conf << 'NGINXMAIN'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log notice;
pid /run/nginx.pid;
include /usr/share/nginx/modules/*.conf;
events { worker_connections 1024; }
http {
    log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" \$status';
    access_log /var/log/nginx/access.log main;
    sendfile on;
    keepalive_timeout 65;
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    server {
        listen 80 default_server;
        server_name _;
        root /var/www/routesync-dist;
        index index.html;
        location /api/ {
            proxy_pass http://localhost:3001;
            proxy_http_version 1.1;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
        }
        location / { try_files \$uri \$uri/ /index.html; }
        location ~* \.(js|css|png|jpg|ico|svg|woff2)$ { expires 1y; }
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
    }
}
NGINXMAIN
nginx -t && systemctl enable nginx && systemctl start nginx
echo "=== ✅ Deployed! ==="
SCRIPT
)

aws ec2 create-launch-template \
  --launch-template-name VanguardLaunchTemplate \
  --launch-template-data "{
    \"ImageId\": \"$AMI_ID\",
    \"InstanceType\": \"t3.micro\",
    \"SecurityGroupIds\": [\"$EC2_SG\"],
    \"IamInstanceProfile\": {\"Name\": \"VanguardEC2Role\"},
    \"UserData\": \"$USER_DATA\"
  }" --region $REGION > /dev/null

echo "  ✅ Launch Template ready"

# ════════════════════════════════════════════════════════════
# PHASE 11 + 12 — ALB + Target Group + ASG
# ════════════════════════════════════════════════════════════
echo "▶ PHASE 11+12: Creating ALB + Target Group + ASG..."

TG_ARN=$(aws elbv2 create-target-group \
  --name VanguardTG --protocol HTTP --port 80 --vpc-id $VPC_ID \
  --health-check-path "/api/health" --target-type instance \
  --query 'TargetGroups[0].TargetGroupArn' --output text --region $REGION)

ALB_ARN=$(aws elbv2 create-load-balancer \
  --name VanguardALB --scheme internet-facing --type application \
  --subnets $PUB_1A $PUB_1B --security-groups $ALB_SG \
  --query 'LoadBalancers[0].LoadBalancerArn' --output text --region $REGION)

echo "  Waiting for ALB to be active..."
aws elbv2 wait load-balancer-available --load-balancer-arns $ALB_ARN --region $REGION

aws elbv2 create-listener \
  --load-balancer-arn $ALB_ARN --protocol HTTP --port 80 \
  --default-actions "Type=forward,TargetGroupArn=$TG_ARN" \
  --region $REGION > /dev/null

LT_ID=$(aws ec2 describe-launch-templates \
  --filters Name=launch-template-name,Values=VanguardLaunchTemplate \
  --query 'LaunchTemplates[0].LaunchTemplateId' --output text --region $REGION)

aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name VanguardASG \
  --launch-template "LaunchTemplateId=$LT_ID,Version=\$Latest" \
  --min-size 2 --max-size 4 --desired-capacity 2 \
  --vpc-zone-identifier "$PRIV_APP_1A,$PRIV_APP_1B" \
  --target-group-arns $TG_ARN \
  --health-check-type ELB --health-check-grace-period 300 \
  --region $REGION

aws autoscaling put-scaling-policy \
  --auto-scaling-group-name VanguardASG \
  --policy-name VanguardCPUPolicy \
  --policy-type TargetTrackingScaling \
  --target-tracking-configuration '{
    "PredefinedMetricSpecification":{"PredefinedMetricType":"ASGAverageCPUUtilization"},
    "TargetValue":60.0
  }' --region $REGION > /dev/null

echo "  ✅ ALB + ASG ready"

# ════════════════════════════════════════════════════════════
# PHASE 14 — CloudTrail
# ════════════════════════════════════════════════════════════
echo "▶ PHASE 14: Setting up CloudTrail..."

BUCKET_NAME="vanguard-cloudtrail-${ACCOUNT_ID}"
aws s3api create-bucket --bucket $BUCKET_NAME --region $REGION 2>/dev/null || true
aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy "{
  \"Version\":\"2012-10-17\",
  \"Statement\":[
    {\"Effect\":\"Allow\",\"Principal\":{\"Service\":\"cloudtrail.amazonaws.com\"},
     \"Action\":\"s3:GetBucketAcl\",\"Resource\":\"arn:aws:s3:::$BUCKET_NAME\"},
    {\"Effect\":\"Allow\",\"Principal\":{\"Service\":\"cloudtrail.amazonaws.com\"},
     \"Action\":\"s3:PutObject\",\"Resource\":\"arn:aws:s3:::$BUCKET_NAME/AWSLogs/$ACCOUNT_ID/*\",
     \"Condition\":{\"StringEquals\":{\"s3:x-amz-acl\":\"bucket-owner-full-control\"}}}
  ]}"

aws cloudtrail create-trail \
  --name VanguardTrail --s3-bucket-name $BUCKET_NAME --region $REGION 2>/dev/null || true
aws cloudtrail start-logging --name VanguardTrail --region $REGION

echo "  ✅ CloudTrail ready"

# ════════════════════════════════════════════════════════════
# PHASE 15 — CloudWatch Alarms
# ════════════════════════════════════════════════════════════
echo "▶ PHASE 15: Creating CloudWatch Alarms..."

SNS_ARN=$(aws sns create-topic --name VanguardAlerts \
  --query 'TopicArn' --output text --region $REGION)

echo "  ⚠️  Subscribe your email to SNS topic manually:"
echo "     aws sns subscribe --topic-arn $SNS_ARN --protocol email --notification-endpoint YOUR_EMAIL"

aws cloudwatch put-metric-alarm \
  --alarm-name VanguardCPUAlarm \
  --metric-name CPUUtilization --namespace AWS/EC2 \
  --statistic Average --period 60 --threshold 80 \
  --comparison-operator GreaterThanThreshold --evaluation-periods 2 \
  --alarm-actions $SNS_ARN --region $REGION

echo "  ✅ CloudWatch Alarms ready"

# ════════════════════════════════════════════════════════════
# DONE — Print ALB DNS
# ════════════════════════════════════════════════════════════
ALB_DNS=$(aws elbv2 describe-load-balancers --load-balancer-arns $ALB_ARN \
  --query 'LoadBalancers[0].DNSName' --output text --region $REGION)

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║        ✅  DEPLOYMENT COMPLETE!                      ║"
echo "╠══════════════════════════════════════════════════════╣"
echo "  🌐 Site URL: http://$ALB_DNS"
echo "  ⏳ Wait 5-8 min for instances to boot & build"
echo "  📋 Check logs: SSM → Session Manager → cat /var/log/user-data.log"
echo ""
echo "  💾 Save these IDs for cleanup:"
echo "    VPC=$VPC_ID"
echo "    NAT=$NAT_ID"
echo "    EIP=$EIP_ALLOC"
echo "    ALB=$ALB_ARN"
echo "╚══════════════════════════════════════════════════════╝"

save_ids  # Final save with all IDs
echo "  📄 Resource IDs saved to ./aws-resource-ids.env"
