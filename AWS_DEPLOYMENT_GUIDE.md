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
   - `AmazonS3ReadOnlyAccess` (for S3 Gateway Endpoint)
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

1. **VPC → NAT Gateways → Create NAT gateway**
2. Name: `VanguardNAT`, Subnet: `public-subnet-1a`, Connectivity: **Public**
3. Click **Allocate Elastic IP** → Create NAT gateway (takes ~2 min)

### 4.3 Private Route Table

1. **Route Tables → Create route table**
2. Name: `private-rt`, VPC: `VanguardVPC` → Create
3. Select `private-rt` → **Routes → Edit routes → Add route**:
   - Destination: `0.0.0.0/0` | Target: **NAT Gateway** → `VanguardNAT` → Save
4. **Subnet associations** → select all 4 private subnets → Save

---

## PHASE 5 — Security Groups

Go to **VPC → Security Groups → Create security group** (VPC: `VanguardVPC`)

### SG-1: `alb-sg` (Application Load Balancer)

| Type | Protocol | Port | Source | Description |
|---|---|---|---|---|
| **Inbound** | HTTP | 80 | `0.0.0.0/0` | Public web traffic |
| **Outbound** | All traffic | All | `0.0.0.0/0` | |

### SG-2: `ec2-sg` (EC2 App Servers)

| Type | Protocol | Port | Source | Description |
|---|---|---|---|---|
| **Inbound** | HTTP | 80 | SG: `alb-sg` | From ALB only |
| **Inbound** | HTTPS | 443 | SG: `alb-sg` | |
| **Outbound** | All traffic | All | `0.0.0.0/0` | |

> ⚠️ No SSH (22) inbound — we use SSM Session Manager instead!

### SG-3: `rds-sg` (RDS Database)

| Type | Protocol | Port | Source | Description |
|---|---|---|---|---|
| **Inbound** | MySQL/Aurora | 3306 | SG: `ec2-sg` | From EC2 only |
| **Outbound** | All traffic | All | `0.0.0.0/0` | |

---

## PHASE 6 — Network ACLs

### 6.1 Public Subnet NACL

1. **VPC → Network ACLs → Create network ACL**
2. Name: `public-nacl`, VPC: `VanguardVPC` → Create
3. **Subnet associations**: associate both public subnets

**Inbound Rules:**

| Rule # | Type | Protocol | Port | Source | Allow/Deny |
|---|---|---|---|---|---|
| 100 | HTTP (80) | TCP | 80 | 0.0.0.0/0 | ALLOW |
| 110 | HTTPS (443) | TCP | 443 | 0.0.0.0/0 | ALLOW |
| 120 | Custom TCP | TCP | 1024-65535 | 0.0.0.0/0 | ALLOW |
| * | All traffic | All | All | 0.0.0.0/0 | DENY |

**Outbound Rules:**

| Rule # | Type | Protocol | Port | Dest | Allow/Deny |
|---|---|---|---|---|---|
| 100 | All TCP | TCP | 0-65535 | 0.0.0.0/0 | ALLOW |
| * | All traffic | All | All | 0.0.0.0/0 | DENY |

### 6.2 Private App Subnet NACL

1. Create NACL: `private-app-nacl` → associate `private-app-1a`, `private-app-1b`

**Inbound Rules:**

| Rule # | Type | Port | Source | Allow/Deny |
|---|---|---|---|---|
| 100 | TCP | 80 | 10.0.1.0/24, 10.0.4.0/24 | ALLOW |
| 110 | TCP | 443 | 10.0.1.0/24, 10.0.4.0/24 | ALLOW |
| 120 | TCP | 1024-65535 | 0.0.0.0/0 | ALLOW |
| * | All | All | 0.0.0.0/0 | DENY |

**Outbound Rules:**

| Rule # | Type | Port | Dest | Allow/Deny |
|---|---|---|---|---|
| 100 | TCP | 0-65535 | 0.0.0.0/0 | ALLOW |
| * | All | All | 0.0.0.0/0 | DENY |

---

## PHASE 7 — S3 Gateway Endpoint

1. **VPC → Endpoints → Create endpoint**
2. Name: `VanguardS3Endpoint`
3. Service category: **AWS services**
4. Search: `com.amazonaws.us-east-1.s3` → select the **Gateway** type
5. VPC: `VanguardVPC`
6. Route tables: select **both** `public-rt` and `private-rt` → Create endpoint

---

## PHASE 8 — VPC Interface Endpoints (PrivateLink)

> These allow private subnets to reach SSM and Secrets Manager **without internet**.

### 8.1 SSM Endpoints (need 3)

Repeat **Create endpoint** for each:

| Name | Service |
|---|---|
| `ssm-endpoint` | `com.amazonaws.us-east-1.ssm` |
| `ssmmessages-endpoint` | `com.amazonaws.us-east-1.ssmmessages` |
| `ec2messages-endpoint` | `com.amazonaws.us-east-1.ec2messages` |

For each:
- Type: **Interface**
- VPC: `VanguardVPC`
- Subnets: `private-app-1a`, `private-app-1b`
- Security group: Create a new SG `endpoint-sg` with inbound HTTPS (443) from `10.0.0.0/16`
- Enable DNS: ✅ Yes

### 8.2 Secrets Manager Endpoint

| Name | Service |
|---|---|
| `secretsmanager-endpoint` | `com.amazonaws.us-east-1.secretsmanager` |

Same settings as SSM endpoints above.

---

## PHASE 9 — RDS: Multi-AZ MySQL

### 9.1 DB Subnet Group

1. **RDS → Subnet groups → Create DB subnet group**
2. Name: `vanguard-db-subnet-group`
3. VPC: `VanguardVPC`
4. Add subnets: `private-db-1a` (us-east-1a) + `private-db-1b` (us-east-1b) → Create

### 9.2 Create RDS MySQL

1. **RDS → Databases → Create database**
2. Engine: **MySQL**, Version: 8.0.x
3. Template: **Production** (enables Multi-AZ)
4. DB Identifier: `vanguard-mysql`
5. Master username: `admin`, set a password → **store this in Secrets Manager later**
6. DB Instance class: `db.t3.micro` (cheapest for testing)
7. Storage: 20 GiB gp2, **disable autoscaling** for cost
8. Availability: ✅ **Multi-AZ DB instance**
9. VPC: `VanguardVPC`, DB subnet group: `vanguard-db-subnet-group`
10. Public access: ❌ **No**
11. VPC security group: `rds-sg`
12. Database name: `routesync`
13. **Create database** (takes ~5–10 min)

> [!TIP]
> After RDS is created, go to **Secrets Manager → Store a new secret → RDS credentials** and save the DB password there.

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

echo "=== [1/6] System update ==="
dnf update -y

echo "=== [2/6] Install Git and NGINX ==="
dnf install -y git nginx

echo "=== [3/6] Install Node.js 18 via nvm ==="
export HOME=/root
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 18
nvm use 18
nvm alias default 18

# Make node/npm available system-wide
ln -sf "$(which node)" /usr/local/bin/node
ln -sf "$(which npm)" /usr/local/bin/npm

echo "=== [4/6] Clone RouteSync from GitHub ==="
mkdir -p /var/www
cd /var/www
git clone https://github.com/Pramodh92/RouteSync.git routesync
cd routesync

echo "=== [5/6] Install dependencies & build React app ==="
npm install --legacy-peer-deps
npm run build

# Copy build output to web root
mkdir -p /var/www/routesync-dist
cp -r dist/. /var/www/routesync-dist/ 2>/dev/null || cp -r build/. /var/www/routesync-dist/

echo "=== [6/6] Configure and start NGINX ==="
# Disable default NGINX site
rm -f /etc/nginx/conf.d/default.conf

cat > /etc/nginx/conf.d/routesync.conf << 'NGINXCONF'
server {
    listen 80;
    server_name _;
    root /var/www/routesync-dist;
    index index.html;

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
| 4 | RDS Database | RDS → Databases → Modify → Disable multi-AZ → Delete (no final snapshot) |
| 5 | NAT Gateway | VPC → NAT Gateways → Delete |
| 6 | VPC Endpoints | VPC → Endpoints → Delete all 5 |
| 7 | Elastic IP | EC2 → Elastic IPs → Release |
| 8 | CloudTrail | CloudTrail → Trails → Delete |
| 9 | S3 Buckets | S3 → Empty bucket first → Delete bucket |
| 10 | CloudWatch Alarms | CloudWatch → Alarms → Delete |
| 11 | RDS Subnet Group | RDS → Subnet groups → Delete |
| 12 | Security Groups | VPC → Security Groups → Delete (ec2-sg, rds-sg, alb-sg) |
| 13 | NACLs | VPC → NACLs → Delete custom ones |
| 14 | Route Tables | VPC → Route Tables → Delete private-rt, public-rt |
| 15 | Subnets | VPC → Subnets → Delete all 6 |
| 16 | Internet Gateway | Detach → Delete |
| 17 | VPC | VPC → Your VPCs → Delete |
| 18 | IAM Role | IAM → Roles → Delete VanguardEC2Role |

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
│  │ [RDS Primary]│       │ [RDS Standby]│     │
│  └─────────────┘       └─────────────┘      │
│                                             │
│  [S3 Gateway Endpoint] [SSM PrivateLink]    │
│  [Secrets Manager PrivateLink]              │
└─────────────────────────────────────────────┘
         │ SSM Session Manager
         ▼
      (Your Browser — no SSH!)
```

---

> [!TIP]
> **Cost Estimate for 1 hour:** NAT Gateway ~$0.05/hr, 2x t2.micro ~$0.02, RDS t3.micro Multi-AZ ~$0.04, ALB ~$0.02, VPC Endpoints ~$0.01 each. **Total ≈ $0.20–$0.50 for 1 hour** if you clean up promptly. RDS takes ~5 min to delete, so start cleanup at 55 min mark.
