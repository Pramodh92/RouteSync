# 🚀 RouteSync — AWS Console Deployment Guide
### All 15 Services · Step-by-Step · Console Only

> [!IMPORTANT]
> **Estimated Deployment Time:** 45–60 minutes  |  **Estimated Cost for 1 Hour:** ~$1–$3
> After 1 hour, go to each service and **delete resources in reverse order** (see Cleanup section at bottom).

---

## 📋 Pre-Requisites

- AWS Account with Admin / Power User IAM access
- GitHub repository: [https://github.com/Pramodh92/RouteSync.git](https://github.com/Pramodh92/RouteSync.git) (public — no token needed)
- A browser open at [console.aws.amazon.com](https://console.aws.amazon.com)
- **Region:** Choose one and stay consistent — e.g. `us-east-1`

---

## PHASE 1 — IAM: Create VanguardEC2Role

> [!NOTE]
> Do IAM first — EC2 instances will need this role at launch time.

1. Go to **IAM → Roles → Create role**
2. Trusted entity: **AWS service** → Use case: **EC2** → Next
3. Attach these policies:
   - `AmazonSSMManagedInstanceCore` (for SSM Session Manager)
   - `SecretsManagerReadWrite` (for Secrets Manager endpoint)
   - `AmazonDynamoDBFullAccess` (for DynamoDB access from EC2)
   - `CloudWatchAgentServerPolicy`
4. Role name: `VanguardEC2Role` → **Create role**

---

## PHASE 2 — VPC: VanguardVPC with 6 Subnets

### 2.1 Create the VPC

1. Go to **VPC → Your VPCs → Create VPC**
2. Select **VPC only**
3. Name tag: `VanguardVPC`
4. IPv4 CIDR: `10.0.0.0/16`
5. Tenancy: Default → **Create VPC**

### 2.1.1 Enable DNS Settings on VanguardVPC *(Required for Phase 8)*

> [!IMPORTANT]
> Without this, **VPC Interface Endpoints (Phase 8) will fail** with a DNS error. Do this immediately after creating the VPC.

1. In **VPC → Your VPCs**, select `VanguardVPC`
2. Click **Actions → Edit VPC settings**
3. Enable **both** checkboxes:
   - ✅ **Enable DNS resolution**
   - ✅ **Enable DNS hostnames**
4. Click **Save**

### 2.2 Create 6 Subnets (3 per AZ)

Go to **VPC → Subnets → Create subnet** — select `VanguardVPC`, then add all 6:

| Subnet Name | AZ | CIDR | Purpose |
|---|---|---|---|
| `public-subnet-1a` | us-east-1a | `10.0.1.0/24` | ALB, NAT |
| `private-app-1a` | us-east-1a | `10.0.2.0/24` | EC2 instances |
| `private-db-1a` | us-east-1a | `10.0.3.0/24` | RDS |
| `public-subnet-1b` | us-east-1b | `10.0.4.0/24` | ALB, NAT |
| `private-app-1b` | us-east-1b | `10.0.5.0/24` | EC2 instances |
| `private-db-1b` | us-east-1b | `10.0.6.0/24` | RDS |

> Click **Add new subnet** to add multiple subnets in one go before hitting Create.

### 2.3 Enable Auto-assign Public IP on Public Subnets

For **each** public subnet (`public-subnet-1a`, `public-subnet-1b`):
1. Select subnet → **Actions → Edit subnet settings**
2. ✅ Enable **Auto-assign public IPv4 address** → Save

---

## PHASE 3 — Internet Gateway

1. Go to **VPC → Internet Gateways → Create internet gateway**
2. Name: `VanguardIGW` → Create
3. Select `VanguardIGW` → **Actions → Attach to VPC** → Select `VanguardVPC` → Attach

---

## PHASE 4 — Route Tables

### 4.1 Public Route Table

1. **VPC → Route Tables → Create route table**
2. Name: `public-rt`, VPC: `VanguardVPC` → Create
3. Select `public-rt` → **Routes tab → Edit routes → Add route**:
   - Destination: `0.0.0.0/0` | Target: `VanguardIGW` → Save
4. **Subnet associations tab → Edit subnet associations** → select both public subnets → Save

### 4.2 NAT Gateway (for Private Subnet Internet Access)

1. Go to **VPC → NAT Gateways → Create NAT gateway**
2. Fill in each field **exactly** as below:

| Field | Value | Notes |
|---|---|---|
| **Name** | `VanguardNAT` | |
| **Availability mode** | `Regional` | Select **Regional** — AWS auto-spans all AZs, no subnet needed |
| **VPC** | `VanguardVPC` | Select from dropdown |
| **Connectivity type** | `Public` | Keep default |
| **Elastic IP allocation** | `Automatic` | AWS assigns the IP for you |

3. Click **Create NAT gateway**
4. ⏳ Wait **~2 minutes** until Status changes from `Pending` → **`Available`** before continuing to 4.3

> [!IMPORTANT]
> Do **not** proceed to Phase 4.3 until the NAT Gateway status is **Available**. Refresh the page to check.

### 4.3 Private Route Table

1. **Route Tables → Create route table**
2. Name: `private-rt`, VPC: `VanguardVPC` → Create
3. Select `private-rt` → **Routes → Edit routes → Add route**:
   - Destination: `0.0.0.0/0` | Target: **NAT Gateway** → `VanguardNAT` → Save
4. **Subnet associations** → select all 4 private subnets → Save

---

## PHASE 5 — Security Groups

> [!IMPORTANT]
> You will create **2 security groups** one at a time. For each one, go to **VPC → Security Groups → Create security group** and follow the steps below exactly.

---

### SG-1: `alb-sg` — Load Balancer Security Group

**Step 1 — Basic Details:**

| Field | Value |
|---|---|
| Security group name | `alb-sg` |
| Description | `ALB - public web traffic` |
| VPC | Select `VanguardVPC` from dropdown |

**Step 2 — Inbound Rules → click "Add rule":**

| Type | Protocol | Port range | Source | Description |
|---|---|---|---|---|
| HTTP | TCP | 80 | `0.0.0.0/0` | Public HTTP traffic |

**Step 3 — Outbound Rules:** Leave the default (All traffic → 0.0.0.0/0) — do NOT remove it.

**Step 4 →** Click **Create security group**

---

### SG-2: `ec2-sg` — EC2 App Server Security Group

> [!IMPORTANT]
> Create `alb-sg` first (above) before creating this one — you will need to reference it as a source.

**Step 1 — Basic Details:**

| Field | Value |
|---|---|
| Security group name | `ec2-sg` |
| Description | `EC2 - accepts traffic from ALB only` |
| VPC | Select `VanguardVPC` from dropdown |

**Step 2 — Inbound Rules → click "Add rule" twice:**

| # | Type | Protocol | Port range | Source | How to set Source |
|---|---|---|---|---|---|
| 1 | HTTP | TCP | 80 | `alb-sg` | Choose **Custom** → search for `alb-sg` |
| 2 | HTTPS | TCP | 443 | `alb-sg` | Choose **Custom** → search for `alb-sg` |

> ⚠️ **No SSH (port 22) rule** — we use SSM Session Manager instead. Never allow port 22.

**Step 3 — Outbound Rules:** Leave the default (All traffic → 0.0.0.0/0).

**Step 4 →** Click **Create security group**

---

### SG-3: DynamoDB — No Security Group Needed ✅

> [!NOTE]
> DynamoDB is **serverless** — no server, no port, no SG required. EC2 reaches DynamoDB via the DynamoDB Gateway Endpoint (Phase 7) authenticated by IAM. Nothing to create here.

---

## PHASE 6 — Network ACLs

> [!NOTE]
> NACLs are stateless — you must explicitly allow **both inbound AND outbound** directions.
> The **`*` DENY rule is automatic** in every NACL — AWS adds it by default. You do NOT manually enter it.

### 6.1 Public Subnet NACL

**Create the NACL:**
1. Go to **VPC → Network ACLs → Create network ACL**
2. Name: `public-nacl`, VPC: `VanguardVPC` → **Create**
3. Select `public-nacl` → **Actions → Edit subnet associations** → select `public-subnet-1a` and `public-subnet-1b` → Save

**Inbound Rules** → Edit inbound rules → Add rule:

| Rule # | Type | Protocol | Port range | Source | Allow/Deny |
|---|---|---|---|---|---|
| 100 | Custom TCP | TCP | 80 | `0.0.0.0/0` | ALLOW |
| 110 | Custom TCP | TCP | 443 | `0.0.0.0/0` | ALLOW |
| 120 | Custom TCP | TCP | 1024-65535 | `0.0.0.0/0` | ALLOW |

**Outbound Rules** → Edit outbound rules → Add rule:

| Rule # | Type | Protocol | Port range | Destination | Allow/Deny |
|---|---|---|---|---|---|
| 100 | Custom TCP | TCP | 0-65535 | `0.0.0.0/0` | ALLOW |

### 6.2 Private App Subnet NACL

**Create the NACL:**
1. Go to **VPC → Network ACLs → Create network ACL**
2. Name: `private-app-nacl`, VPC: `VanguardVPC` → **Create**
3. Select `private-app-nacl` → **Actions → Edit subnet associations** → select `private-app-1a` and `private-app-1b` → Save

**Inbound Rules** → Edit inbound rules → Add rule:

> Each rule can only have **one CIDR** — enter them as separate rows:

| Rule # | Type | Protocol | Port range | Source | Allow/Deny |
|---|---|---|---|---|---|
| 100 | Custom TCP | TCP | 80 | `10.0.1.0/24` | ALLOW |
| 110 | Custom TCP | TCP | 80 | `10.0.4.0/24` | ALLOW |
| 120 | Custom TCP | TCP | 443 | `10.0.1.0/24` | ALLOW |
| 130 | Custom TCP | TCP | 443 | `10.0.4.0/24` | ALLOW |
| 140 | Custom TCP | TCP | 1024-65535 | `0.0.0.0/0` | ALLOW |

**Outbound Rules** → Edit outbound rules → Add rule:

| Rule # | Type | Protocol | Port range | Destination | Allow/Deny |
|---|---|---|---|---|---|
| 100 | Custom TCP | TCP | 80 | `0.0.0.0/0` | ALLOW |
| 110 | Custom TCP | TCP | 443 | `0.0.0.0/0` | ALLOW |
| 120 | Custom TCP | TCP | 1024-65535 | `0.0.0.0/0` | ALLOW |

---

## PHASE 7 — Gateway Endpoints (S3 + DynamoDB)

> [!TIP]
> Gateway endpoints are **free** and keep S3/DynamoDB traffic inside the AWS network — no NAT Gateway charges for these calls.

### 7.1 S3 Gateway Endpoint

1. **VPC → Endpoints → Create endpoint**
2. Name: `VanguardS3Endpoint`
3. Service category: **AWS services**
4. Search: `com.amazonaws.us-east-1.s3` → select the **Gateway** type
5. VPC: `VanguardVPC`
6. Route tables: select **both** `public-rt` and `private-rt` → Create endpoint

### 7.2 DynamoDB Gateway Endpoint

1. **VPC → Endpoints → Create endpoint**
2. Name: `VanguardDynamoDBEndpoint`
3. Service category: **AWS services**
4. Search: `com.amazonaws.us-east-1.dynamodb` → select the **Gateway** type
5. VPC: `VanguardVPC`
6. Route tables: select **both** `public-rt` and `private-rt` → Create endpoint

---

## PHASE 8 — VPC Interface Endpoints (PrivateLink)

> [!NOTE]
> These 4 endpoints let your EC2 instances (in private subnets) talk to SSM and Secrets Manager **through the AWS backbone — no internet, no NAT needed**.
> You will create **1 Security Group first**, then **4 endpoints**.

---

### Step 8.0 — Create `endpoint-sg` Security Group First

> [!IMPORTANT]
> Do this **before** creating any endpoint. You'll need this SG when creating each endpoint.

1. Go to **VPC → Security Groups → Create security group**

| Field | Value |
|---|---|
| Security group name | `endpoint-sg` |
| Description | `Allows HTTPS from VPC to interface endpoints` |
| VPC | `VanguardVPC` |

2. **Inbound Rules → Add rule:**

| Type | Protocol | Port | Source |
|---|---|---|---|
| HTTPS | TCP | 443 | `10.0.0.0/16` *(the entire VPC CIDR)* |

3. Outbound: leave default → **Create security group**

---

### Step 8.1 — Create Endpoint 1 of 4: `ssm-endpoint`

1. Go to **VPC → Endpoints → Create endpoint**
2. Fill in fields:

| Field | Value |
|---|---|
| Name | `ssm-endpoint` |
| Service category | AWS services |
| Service name | Search `com.amazonaws.us-east-1.ssm` → select it |
| **Type shown** | Make sure it says **Interface** (not Gateway) |
| VPC | `VanguardVPC` |
| Subnets | Tick `us-east-1a` → `private-app-1a` AND `us-east-1b` → `private-app-1b` |
| Security groups | Remove default → select `endpoint-sg` |
| Enable DNS name | ✅ **Enable** |

3. Click **Create endpoint**

---

### Step 8.2 — Create Endpoint 2 of 4: `ssmmessages-endpoint`

Repeat exactly the same steps as 8.1 with ONE change:

| Field | Value |
|---|---|
| Name | `ssmmessages-endpoint` |
| Service name | `com.amazonaws.us-east-1.ssmmessages` |

*(All other fields: same VPC, same subnets, same `endpoint-sg`, Enable DNS ✅)*

---

### Step 8.3 — Create Endpoint 3 of 4: `ec2messages-endpoint`

| Field | Value |
|---|---|
| Name | `ec2messages-endpoint` |
| Service name | `com.amazonaws.us-east-1.ec2messages` |

*(All other fields: same VPC, same subnets, same `endpoint-sg`, Enable DNS ✅)*

---

### Step 8.4 — Create Endpoint 4 of 4: `secretsmanager-endpoint`

| Field | Value |
|---|---|
| Name | `secretsmanager-endpoint` |
| Service name | `com.amazonaws.us-east-1.secretsmanager` |

*(All other fields: same VPC, same subnets, same `endpoint-sg`, Enable DNS ✅)*

---

> [!TIP]
> After creating all 4, go to **VPC → Endpoints** and confirm all 4 show **Status: Available** before continuing to Phase 9.

---

## PHASE 9 — DynamoDB: Create Tables

> [!NOTE]
> DynamoDB is **serverless** — no cluster, no VMs, no Security Group, no subnet. It is instantly available in your AWS account. Access from EC2 is handled by IAM (`VanguardEC2Role`) + the DynamoDB Gateway Endpoint you created in Phase 7.

### 9.1 Create the Users Table

1. Go to **DynamoDB → Tables → Create table**
2. Table name: `routesync-users`
3. Partition key: `userId` (String)
4. Sort key: *(leave blank)*
5. Table settings: **Customize settings**
   - Read/write capacity: **On-demand** (pay-per-request, best for 1-hour test)
   - Encryption: AWS owned key (default)
6. Click **Create table**

### 9.2 Create the Bookings Table

1. **DynamoDB → Tables → Create table**
2. Table name: `routesync-bookings`
3. Partition key: `bookingId` (String)
4. Sort key: `userId` (String) — allows querying all bookings per user
5. Table settings: **Customize settings → On-demand** capacity → **Create table**

### 9.3 Create the Routes Table

1. **DynamoDB → Tables → Create table**
2. Table name: `routesync-routes`
3. Partition key: `routeId` (String)
4. Sort key: *(leave blank)*
5. Table settings: **On-demand** → **Create table**

### 9.4 Add a Global Secondary Index (GSI) to Bookings

> Allows querying bookings by userId across all bookingIds.

1. Open `routesync-bookings` table → **Indexes tab → Create index**
2. Partition key: `userId` (String)
3. Index name: `userId-index`
4. Projected attributes: **All** → **Create index**

### 9.5 Verify Tables Are Active

1. In DynamoDB → Tables, confirm all 3 tables show **Status: Active** (takes <1 min)
2. Click any table → **Explore table items** → you can manually insert test data here

> [!TIP]
> **Connecting from your app (server-side):** Use the AWS SDK. The EC2 instance has `VanguardEC2Role` so no access keys needed — just use the region:
> ```js
> import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
> const client = new DynamoDBClient({ region: "us-east-1" });
> ```

---

## PHASE 10 — EC2: Launch Template (GitHub Deploy)

> [!NOTE]
> The User Data script below automatically clones **your RouteSync GitHub repo**, installs Node 18, builds the React app, and serves it with NGINX — **zero manual steps needed after launch**.

1. **EC2 → Launch Templates → Create launch template**
2. Name: `VanguardLaunchTemplate`
3. AMI: **Amazon Linux 2023** (search in Quick Start AMIs)
4. Instance type: `t2.micro`
5. Key pair: **Don't include** (we use SSM Session Manager — no SSH)
6. Network settings: **Don't include subnet** (ASG controls this)
7. Security groups: `ec2-sg`
8. IAM instance profile: `VanguardEC2Role`
9. Scroll to **Advanced details → User data**, paste the entire script below:

```bash
#!/bin/bash
set -e
exec > >(tee /var/log/user-data.log | logger -t user-data) 2>&1

echo "=== [1/7] System update ==="
dnf update -y

echo "=== [2/7] Install Git and NGINX ==="
dnf install -y git nginx

echo "=== [3/7] Install Node.js 18 via nvm ==="
export HOME=/root
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 18
nvm use 18
nvm alias default 18

ln -sf "$(which node)" /usr/local/bin/node
ln -sf "$(which npm)" /usr/local/bin/npm

echo "=== [4/7] Clone RouteSync from GitHub ==="
mkdir -p /var/www
cd /var/www
git clone https://github.com/Pramodh92/RouteSync.git routesync
cd routesync

# ──────────────────────────────────────────────────────────────────
# [5/7] CREATE .env — PASTE YOUR REAL API KEYS HERE IN AWS CONSOLE
# This script lives ONLY in AWS Launch Template (never in GitHub).
# Replace every REPLACE_WITH_... value with your actual secrets.
# ──────────────────────────────────────────────────────────────────
echo "=== [5/7] Create server/.env ==="
cat > /var/www/routesync/server/.env << 'ENVEOF'
PORT=3001
NODE_ENV=production
JWT_SECRET=REPLACE_WITH_YOUR_JWT_SECRET
JWT_EXPIRES_IN=7d
FRONTEND_ORIGIN=http://localhost:5173
GROQ_API_KEY=REPLACE_WITH_YOUR_GROQ_API_KEY
OPENWEATHER_API_KEY=REPLACE_WITH_YOUR_OPENWEATHER_KEY
AWS_REGION=us-east-1
DYNAMO_USERS_TABLE=routesync-users
DYNAMO_BOOKINGS_TABLE=routesync-bookings
DYNAMO_ROUTES_TABLE=routesync-routes
ENVEOF

chmod 600 /var/www/routesync/server/.env
echo ".env created successfully"

echo "=== [6/7] Install dependencies & build React app ==="
npm install --legacy-peer-deps
npm run build

# Copy build output to web root
mkdir -p /var/www/routesync-dist
cp -r dist/. /var/www/routesync-dist/ 2>/dev/null || cp -r build/. /var/www/routesync-dist/

# Install server dependencies
cd /var/www/routesync/server
npm install
cd /var/www/routesync

# Start the backend server with Node (background process)
nohup node /var/www/routesync/server/server.js >> /var/log/routesync-server.log 2>&1 &
echo "Backend server started on port 3001"

echo "=== [7/7] Configure and start NGINX ==="
rm -f /etc/nginx/conf.d/default.conf

cat > /etc/nginx/conf.d/routesync.conf << 'NGINXCONF'
server {
    listen 80;
    server_name _;
    root /var/www/routesync-dist;
    index index.html;

    # Proxy API calls to Express backend
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # React Router support — all paths serve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
}
NGINXCONF

nginx -t && systemctl enable nginx && systemctl start nginx

echo "=== ✅ RouteSync deployed successfully! ==="
```

10. Click **Create launch template**

> [!TIP]
> **Verify the boot log:** After instances launch, use SSM Session Manager (Phase 13) and run:
> ```bash
> cat /var/log/user-data.log
> ```
> You'll see each step printed. If NGINX is green, the site is live!

> [!IMPORTANT]
> The build process takes ~3–5 minutes. The ALB health check will show **Unhealthy** initially — wait until the health check turns **Healthy** before testing the URL.

---

## PHASE 11 — Auto Scaling Group (ASG)

1. **EC2 → Auto Scaling Groups → Create Auto Scaling group**
2. Name: `VanguardASG`
3. Launch template: `VanguardLaunchTemplate` → Next
4. VPC: `VanguardVPC`
5. Subnets: `private-app-1a` and `private-app-1b` → Next
6. Load balancing: select **Attach to a new load balancer** → (configure below in same step)
   - OR skip for now, create ALB separately, then attach

---

## PHASE 12 — ALB: Application Load Balancer

1. **EC2 → Load Balancers → Create load balancer → Application Load Balancer**
2. Name: `VanguardALB`
3. Scheme: **Internet-facing**
4. IP type: IPv4
5. VPC: `VanguardVPC`
6. Mappings: select `us-east-1a` → `public-subnet-1a` AND `us-east-1b` → `public-subnet-1b`
7. Security groups: `alb-sg`
8. **Listeners and routing:**
   - Protocol: HTTP, Port: 80
   - Default action: **Create target group**:
     - Name: `VanguardTG`
     - Target type: **Instances**
     - Protocol: HTTP, Port: 80
     - VPC: `VanguardVPC`
     - Health check path: `/`
     - Click **Next → Create target group** (no instances yet, ASG will add them)
9. Back in ALB, select `VanguardTG` as the target group → **Create load balancer**

### 12.1 Complete ASG Setup

1. Go back to **Auto Scaling Groups → Create** (or continue from Phase 11 step 6)
2. At step "Configure load balancing":
   - Select **Attach to an existing load balancer**
   - Select target group: `VanguardTG`
   - Health check type: ELB
3. Group size:
   - Desired: `2`, Minimum: `2`, Maximum: `4`
4. **Scaling policy → Target tracking**:
   - Metric: **Average CPU utilization**
   - Target value: `60`
5. Review → **Create Auto Scaling group**

> ✅ ASG will now launch 2 EC2 instances in the private subnets automatically.

---

## PHASE 13 — SSM Session Manager (Shell Access)

> [!IMPORTANT]
> This is the "screenshot this!" step. No SSH, no key pairs — pure AWS magic.

1. Wait until EC2 instances are **running** and show as **healthy** in the target group (~3–5 min)
2. Go to **Systems Manager → Session Manager → Start session**
3. You should see both EC2 instances listed (because of `VanguardEC2Role` + SSM endpoints)
4. Click an instance → **Start session**
5. A browser-based terminal opens! Run:
   ```bash
   whoami
   curl http://localhost/
   systemctl status nginx
   ```
6. **📸 Take your screenshot here** — showing the Session Manager terminal with the nginx status output

---

## PHASE 14 — CloudTrail

1. **CloudTrail → Trails → Create trail**
2. Trail name: `VanguardTrail`
3. Storage location: Create new S3 bucket → name: `vanguard-cloudtrail-logs-<youraccountid>`
4. ✅ Enable **CloudWatch Logs**:
   - Log group: `/aws/cloudtrail/VanguardTrail` (create new)
   - IAM role: Create new → `CloudTrailCWLogsRole`
5. Events: ✅ Management events, Read + Write → **Create trail**

---

## PHASE 15 — CloudWatch: Alarms + Log Groups

### 15.1 CPU Alarm (triggers ASG scale-out alert)

1. **CloudWatch → Alarms → Create alarm → Select metric**
2. EC2 → Per-Instance Metrics → find `CPUUtilization` for one of your ASG instances → Select metric
3. Statistic: Average, Period: 1 minute
4. Condition: Greater than `80` (percent)
5. Notification: Create new SNS topic `VanguardAlerts`, enter your email → Create topic
6. Alarm name: `VanguardCPUAlarm` → Create alarm
7. **Confirm the subscription email** AWS sends you

### 15.2 ALB 5XX Error Alarm

1. **CloudWatch → Alarms → Create alarm → Select metric**
2. ApplicationELB → Per AppELB Metrics → `HTTPCode_ELB_5XX_Count` for `VanguardALB`
3. Condition: Greater than `5` in 5 minutes
4. Notification: use existing `VanguardAlerts` SNS topic
5. Alarm name: `VanguardALB5xxAlarm` → Create alarm

### 15.3 Log Groups

1. **CloudWatch → Log Groups → Create log group**
2. Create:
   - `/vanguard/ec2/application` (for app logs)
   - `/vanguard/nginx/access` (for nginx access logs)
3. Retention: **1 day** (to save cost)

---

## PHASE 16 — Verify Deployment

1. **EC2 → Load Balancers** → find `VanguardALB` → copy the **DNS name**
2. Wait until both target group instances show **Healthy** status (~5–8 min from launch)
3. Open in browser: `http://VanguardALB-xxxx.us-east-1.elb.amazonaws.com`
4. ✅ You should see the **live RouteSync website** built directly from GitHub!

### Troubleshooting

| Symptom | Fix |
|---|---|
| Health check **Unhealthy** | Wait 3–5 more min, NGINX is still starting. Check `/var/log/user-data.log` via SSM |
| 502 Bad Gateway | NGINX not yet started — run `sudo systemctl status nginx` in SSM |
| Site loads but routes 404 | NGINX `try_files` is already set — force-refresh with `Ctrl+Shift+R` |
| Build failed | Check log: `cat /var/log/user-data.log` — likely a `npm install` error |

---

## 🧹 CLEANUP — After 1 Hour (Delete in This Order!)

> [!CAUTION]
> Failure to delete resources will result in ongoing charges. Delete in order to avoid dependency errors.

| Step | Resource | Where |
|---|---|---|
| 1 | ASG | EC2 → Auto Scaling Groups → Delete |
| 2 | ALB + Target Group | EC2 → Load Balancers → Delete |
| 3 | EC2 instances | Will terminate when ASG is deleted |
| 4 | DynamoDB Tables | DynamoDB → Tables → Delete `routesync-users`, `routesync-bookings`, `routesync-routes` |
| 5 | NAT Gateway | VPC → NAT Gateways → Delete |
| 6 | VPC Endpoints | VPC → Endpoints → Delete all 6 (S3, DynamoDB, SSM x3, Secrets Manager) |
| 7 | Elastic IP | EC2 → Elastic IPs → Release |
| 8 | CloudTrail | CloudTrail → Trails → Delete |
| 9 | S3 Buckets | S3 → Empty bucket first → Delete bucket |
| 10 | CloudWatch Alarms | CloudWatch → Alarms → Delete |
| 11 | Security Groups | VPC → Security Groups → Delete (`ec2-sg`, `alb-sg`, `endpoint-sg`) |
| 12 | NACLs | VPC → NACLs → Delete custom ones |
| 13 | Route Tables | VPC → Route Tables → Delete `private-rt`, `public-rt` |
| 14 | Subnets | VPC → Subnets → Delete all 6 |
| 15 | Internet Gateway | Detach → Delete |
| 16 | VPC | VPC → Your VPCs → Delete |
| 17 | IAM Role | IAM → Roles → Delete `VanguardEC2Role` |

---

## 🗺️ Architecture Diagram

```
Internet
    │
    ▼
VanguardIGW
    │
    ▼
┌─────────────────────────────────────────────┐
│           VanguardVPC (10.0.0.0/16)         │
│                                             │
│  ┌─────────────┐       ┌─────────────┐      │
│  │public-1a    │       │public-1b    │      │
│  │10.0.1.0/24  │       │10.0.4.0/24  │      │
│  │ [NAT GW]    │       │             │      │
│  │ [ALB node]  │       │ [ALB node]  │      │
│  └─────────────┘       └─────────────┘      │
│         │                     │             │
│  ┌──────▼─────────────────────▼──────┐      │
│  │      VanguardALB (public)         │      │
│  └──────┬─────────────────────┬──────┘      │
│         │                     │             │
│  ┌──────▼──────┐       ┌──────▼──────┐      │
│  │private-app-1a│       │private-app-1b│     │
│  │10.0.2.0/24  │       │10.0.5.0/24  │      │
│  │  [EC2 #1]   │       │  [EC2 #2]   │      │
│  └──────┬──────┘       └──────┬──────┘      │
│         │                     │             │
│  ┌──────▼──────┐       ┌──────▼──────┐      │
│  │private-db-1a│       │private-db-1b│      │
│  │10.0.3.0/24  │       │10.0.6.0/24  │      │
│  │  (reserved) │       │  (reserved) │      │
│  └─────────────┘       └─────────────┘      │
│                                             │
│  [S3 GW Endpoint]  [DynamoDB GW Endpoint]   │
│  [SSM PrivateLink] [Secrets Mgr PrivateLink] │
└─────────────────────────────────────────────┘
         │ SSM Session Manager        │ IAM-auth
         ▼                           ▼
    (Your Browser)           AWS DynamoDB
          (Serverless — no VPC, no port, no SG)
```

---

> [!TIP]
> **Cost Estimate for 1 hour:** NAT Gateway ~$0.05/hr, 2× t2.micro ~$0.02, DynamoDB on-demand ~$0.00 (free tier covers first 25 GB + 200M requests/month), ALB ~$0.02, VPC Interface Endpoints ~$0.01 each. **Total ≈ $0.10–$0.20 for 1 hour** — DynamoDB is much cheaper than RDS! No need to rush cleanup for the database.
