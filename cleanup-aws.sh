#!/bin/bash
# ============================================================
# RouteSync — AWS CLI Cleanup Script
# Run this after 1 hour to delete all resources and stop billing
# ============================================================
# Usage: source ./aws-resource-ids.env && ./cleanup-aws.sh
# ============================================================

set -e
export AWS_PAGER=""
export MSYS_NO_PATHCONV=1
REGION="us-east-1"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║     RouteSync AWS Cleanup — Starting...              ║"
echo "╚══════════════════════════════════════════════════════╝"

# Load saved resource IDs
if [ -f "./aws-resource-ids.env" ]; then
  source ./aws-resource-ids.env
else
  echo "❌ aws-resource-ids.env not found. Set resource IDs manually."
  exit 1
fi

echo "▶ Step 1: Delete ASG..."
aws autoscaling delete-auto-scaling-group --auto-scaling-group-name VanguardASG --force-delete --region $REGION 2>/dev/null || true
sleep 10

echo "▶ Step 2: Delete ALB + Target Group..."
aws elbv2 delete-load-balancer --load-balancer-arn $ALB_ARN --region $REGION 2>/dev/null || true
sleep 5
aws elbv2 delete-target-group --target-group-arn $TG_ARN --region $REGION 2>/dev/null || true

echo "▶ Step 3: Delete DynamoDB Tables..."
for table in routesync-users routesync-bookings routesync-routes; do
  aws dynamodb delete-table --table-name $table --region $REGION 2>/dev/null || true
done

echo "▶ Step 4: Delete NAT Gateway..."
aws ec2 delete-nat-gateway --nat-gateway-id $NAT_ID --region $REGION > /dev/null 2>/dev/null || true
echo "  Waiting for NAT Gateway to be deleted (~60s)..."
sleep 60

echo "▶ Step 5: Delete VPC Endpoints..."
ENDPOINT_IDS=$(aws ec2 describe-vpc-endpoints \
  --filters "Name=vpc-id,Values=$VPC_ID" "Name=vpc-endpoint-state,Values=available,pending" \
  --query 'VpcEndpoints[*].VpcEndpointId' --output text --region $REGION 2>/dev/null || echo "")
[ -n "$ENDPOINT_IDS" ] && aws ec2 delete-vpc-endpoints --vpc-endpoint-ids $ENDPOINT_IDS --region $REGION > /dev/null || echo "  No endpoints to delete"

echo "▶ Step 6: Release Elastic IP..."
aws ec2 release-address --allocation-id $EIP_ALLOC --region $REGION 2>/dev/null || true

echo "▶ Step 7: Delete CloudTrail..."
aws cloudtrail stop-logging --name VanguardTrail --region $REGION 2>/dev/null || true
aws cloudtrail delete-trail --name VanguardTrail --region $REGION 2>/dev/null || true

echo "▶ Step 8: Delete S3 Bucket (empty first)..."
aws s3 rm s3://$BUCKET_NAME --recursive 2>/dev/null || true
aws s3api delete-bucket --bucket $BUCKET_NAME --region $REGION 2>/dev/null || true

echo "▶ Step 9: Delete CloudWatch Alarms..."
aws cloudwatch delete-alarms --alarm-names VanguardCPUAlarm VanguardALB5xxAlarm --region $REGION 2>/dev/null || true
aws sns delete-topic --topic-arn $(aws sns list-topics --query "Topics[?contains(TopicArn,'VanguardAlerts')].TopicArn" --output text --region $REGION) 2>/dev/null || true

echo "▶ Step 10: Delete Launch Template..."
aws ec2 delete-launch-template --launch-template-name VanguardLaunchTemplate --region $REGION 2>/dev/null || true

echo "▶ Step 11: Delete Security Groups..."
sleep 15  # wait for ENIs to be released
for sg in $EC2_SG $ENDPOINT_SG $ALB_SG; do
  aws ec2 delete-security-group --group-id $sg --region $REGION 2>/dev/null || true
done

echo "▶ Step 12: Delete NACLs..."
aws ec2 delete-network-acl --network-acl-id $PUB_NACL --region $REGION 2>/dev/null || true
aws ec2 delete-network-acl --network-acl-id $PRIV_NACL --region $REGION 2>/dev/null || true

echo "▶ Step 13: Delete Route Tables..."
for rt in $PUB_RT $PRIV_RT; do
  ASSOC_IDS=$(aws ec2 describe-route-tables --route-table-ids $rt \
    --query 'RouteTables[0].Associations[?!Main].RouteTableAssociationId' --output text --region $REGION 2>/dev/null)
  for assoc in $ASSOC_IDS; do
    aws ec2 disassociate-route-table --association-id $assoc --region $REGION 2>/dev/null || true
  done
  aws ec2 delete-route-table --route-table-id $rt --region $REGION 2>/dev/null || true
done

echo "▶ Step 14: Delete Subnets..."
SUBNET_IDS=$(aws ec2 describe-subnets \
  --filters Name=vpc-id,Values=$VPC_ID \
  --query 'Subnets[*].SubnetId' --output text --region $REGION)
for subnet in $SUBNET_IDS; do
  aws ec2 delete-subnet --subnet-id $subnet --region $REGION 2>/dev/null || true
done

echo "▶ Step 15: Detach + Delete Internet Gateway..."
aws ec2 detach-internet-gateway --internet-gateway-id $IGW_ID --vpc-id $VPC_ID --region $REGION 2>/dev/null || true
aws ec2 delete-internet-gateway --internet-gateway-id $IGW_ID --region $REGION 2>/dev/null || true

echo "▶ Step 16: Delete VPC..."
aws ec2 delete-vpc --vpc-id $VPC_ID --region $REGION 2>/dev/null || true

echo "▶ Step 17: Delete IAM Role..."
aws iam remove-role-from-instance-profile --instance-profile-name VanguardEC2Role --role-name VanguardEC2Role 2>/dev/null || true
aws iam delete-instance-profile --instance-profile-name VanguardEC2Role 2>/dev/null || true
for policy in \
  "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore" \
  "arn:aws:iam::aws:policy/SecretsManagerReadWrite" \
  "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess" \
  "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"; do
  aws iam detach-role-policy --role-name VanguardEC2Role --policy-arn $policy 2>/dev/null || true
done
aws iam delete-role --role-name VanguardEC2Role 2>/dev/null || true

rm -f ./aws-resource-ids.env

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║        ✅  CLEANUP COMPLETE — No more billing!       ║"
echo "╚══════════════════════════════════════════════════════╝"
