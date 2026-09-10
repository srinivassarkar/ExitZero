export interface TelemetryLog {
  command: string;
  output: string;
}

export interface TriageOption {
  id: "A" | "B" | "C" | "D";
  action: string;
  isCorrect: boolean;
  terminalResult: string;
  explanation: string;
}

export interface IncidentScenario {
  id: string;
  severity: "SEV-1" | "SEV-2" | "SEV-3";
  title: string;
  service: string;
  category: "kubernetes" | "linux" | "database" | "aws" | "networking" | "terraform";
  categoryLabel: string;
  symptomSummary: string;
  pagerDutyAlert: string;
  mttrTarget: string;
  telemetryLogs: TelemetryLog[];
  options: TriageOption[];
  rootCause: string;
  preventionRule: string;
  interviewTakeaway: string;
}

export const incidentScenarios: IncidentScenario[] = [
  {
    id: "k8s-oom-exit137",
    severity: "SEV-1",
    title: "Pod CrashLoopBackOff with Exit Code 137",
    service: "payment-api",
    category: "kubernetes",
    categoryLabel: "Kubernetes",
    symptomSummary: "P99 checkout latency spiking past 15,000ms. Transactions failing with 503 Service Unavailable.",
    pagerDutyAlert: "[P1-CRITICAL] payment-api SLO breach: Error rate > 8.5% over 5m window",
    mttrTarget: "4 mins",
    telemetryLogs: [
      {
        command: "kubectl get pods -n production -l app=payment-api",
        output: `NAME                           READY   STATUS             RESTARTS   AGE
payment-api-7c89f8b4d-9xk2m    0/1     CrashLoopBackOff   6 (90s)    12m
payment-api-7c89f8b4d-4z8lq    0/1     CrashLoopBackOff   5 (2m)     10m
payment-api-7c89f8b4d-p1q9x    1/1     Running            0          45m`,
      },
      {
        command: "kubectl describe pod payment-api-7c89f8b4d-9xk2m -n production | grep -E 'State:|Reason:|Exit Code:|Limits:' -A 2",
        output: `    State:          Waiting
      Reason:       CrashLoopBackOff
    Last State:     Terminated
      Reason:       OOMKilled
      Exit Code:    137
      Started:      Fri, 11 Sep 2026 02:28:10 +0530
      Finished:     Fri, 11 Sep 2026 02:29:40 +0530
    Limits:
      cpu:     1000m
      memory:  512Mi`,
      },
      {
        command: "kubectl logs payment-api-7c89f8b4d-9xk2m -n production --previous | tail -n 6",
        output: `2026-09-11T02:29:38.102Z [main] INFO  c.e.p.PaymentApplication - Allocating batch buffers
java.lang.OutOfMemoryError: Java heap space
Dumping heap to java_pid1.hprof ...
Killed (SIGKILL sent by Linux cgroup OOM killer)`,
      },
    ],
    options: [
      {
        id: "A",
        action: "Run `kubectl scale deployment payment-api --replicas=20` to distribute traffic across more pods.",
        isCorrect: false,
        terminalResult: `[TRIAGE FAILED] Scaled to 20 replicas. 18 new pods spawned and immediately entered CrashLoopBackOff (OOMKilled). Node memory pressure spiked, triggering kubelet eviction on unrelated services.`,
        explanation: "Scaling out replicas does not resolve memory leaks or container heap sizing; it only multiplies the number of crashing pods and starves the node.",
      },
      {
        id: "B",
        action: "Patch deployment memory limits to 2Gi and configure `-XX:MaxRAMPercentage=75.0` in the container JAVA_TOOL_OPTIONS.",
        isCorrect: true,
        terminalResult: `[✓ MITIGATION SUCCESSFUL]
Deployment patched. Pod memory cgroup updated to 2Gi.
JVM heap sized dynamically to 1.5Gi.
All 3/3 pods transitioned to Running 1/1. P99 latency normalized to 38ms. Exit code 0.`,
        explanation: "Exit Code 137 (128 + 9 = SIGKILL) indicates the Linux cgroup OOM killer terminated the container because its memory usage exceeded the 512Mi Kubernetes limit. Giving the container 2Gi and instructing the JVM to use 75% of container RAM prevents heap saturation.",
      },
      {
        id: "C",
        action: "Cordon worker node `k8s-node-worker-08` and execute `kubectl drain` to evict pods to other nodes.",
        isCorrect: false,
        terminalResult: `[TRIAGE FAILED] Node cordoned and drained. Pods rescheduled on worker-04 and worker-05, but crashed with Exit Code 137 within 60 seconds. Root cause is container memory limits, not host node failure.`,
        explanation: "The issue is a cgroup memory constraint defined in the pod spec, not a physical hardware failure on the Kubernetes worker node.",
      },
      {
        id: "D",
        action: "Delete the Pod Disruption Budget (PDB) and restart CoreDNS pods in kube-system.",
        isCorrect: false,
        terminalResult: `[TRIAGE FAILED] CoreDNS restarted. PDB removed. Outage ongoing: payment-api pods remain in CrashLoopBackOff. CoreDNS has zero connection to container memory limits.`,
        explanation: "CoreDNS handles internal cluster name resolution; it has no relationship to JVM memory allocation or SIGKILL exit code 137.",
      },
    ],
    rootCause: "The container spec had a 512Mi memory limit, while the JVM service was processing large payment payload batches. Without container-aware heap flags, the JVM attempted to allocate memory beyond the cgroup boundary, triggering Linux kernel SIGKILL.",
    preventionRule: "Always configure container requests and limits based on observed 95th percentile metrics, and pair them with JVM container-aware flags: `-XX:InitialRAMPercentage=50.0 -XX:MaxRAMPercentage=75.0`.",
    interviewTakeaway: "In interviews, whenever you hear 'Exit Code 137', immediately connect it to Linux cgroups OOM killer (128 + 9). Explain the interplay between JVM heap and container cgroup memory limits.",
  },
  {
    id: "linux-inode-exhaustion",
    severity: "SEV-1",
    title: "No Space Left on Device with 45% Disk Space Free",
    service: "file-processor",
    category: "linux",
    categoryLabel: "Linux OS",
    symptomSummary: "Applications crashing with 'write error: No space left on device'. Monitoring dashboards show 130GB disk free.",
    pagerDutyAlert: "[P1-CRITICAL] file-processor disk write failure on mount /var",
    mttrTarget: "3 mins",
    telemetryLogs: [
      {
        command: "df -h /var",
        output: `Filesystem      Size  Used Avail Use% Mounted on
/dev/nvme0n1p2  250G  110G  130G  46% /var`,
      },
      {
        command: "df -i /var",
        output: `Filesystem        Inodes    IUsed   IFree IUse% Mounted on
/dev/nvme0n1p2  16384000 16384000       0  100% /var`,
      },
      {
        command: "for d in /var/*; do echo -n \"$d \"; find \"$d\" -maxdepth 2 2>/dev/null | wc -l; done | sort -k2 -nr | head -n 3",
        output: `/var/spool/clientmqueue 16298104
/var/log 412
/var/lib 320`,
      },
    ],
    options: [
      {
        id: "A",
        action: "Run `rm -rf /var/log/*.gz` to delete archived gzip logs.",
        isCorrect: false,
        terminalResult: `[TRIAGE FAILED] Deleted 14 compressed log files. Reclaimed 1.2GB of block space, but Inode utilization remains at 100% (16,383,986/16,384,000 used). Write failures persist.`,
        explanation: "Deleting a few large files frees block storage (GBs) but only frees a handful of inodes. The disk has 16 million orphaned tiny files in the spool directory.",
      },
      {
        id: "B",
        action: "Expand the AWS EBS volume from 250GB to 500GB and run `growpart` on the partition.",
        isCorrect: false,
        terminalResult: `[TRIAGE FAILED] EBS volume resized in AWS console. However, ext4 filesystems do not dynamically multiply existing inode count on online resize. Inodes remain at 100% saturation.`,
        explanation: "On standard ext4 filesystems, the inode ratio is fixed at format time. Resizing the block storage volume does not automatically fix 16 million accumulated orphan files.",
      },
      {
        id: "C",
        action: "Purge the orphaned queue files using `find /var/spool/clientmqueue -type f -delete` and disable the broken sendmail cron job.",
        isCorrect: true,
        terminalResult: `[✓ MITIGATION SUCCESSFUL]
Purged 16.2M orphan files using in-kernel find -delete.
df -i /var now shows: 16,384,000 total, 85,896 used (1% Inode Use).
Application write operations immediately restored. System fully healthy.`,
        explanation: "`df -h` measures disk block storage, whereas `df -i` measures filesystem index nodes (inodes). Every file, directory, or symlink requires one inode. Millions of empty or tiny queued files exhausted the inode table despite 130GB of free block space.",
      },
      {
        id: "D",
        action: "Run `tune2fs -m 0 /dev/nvme0n1p2` to reclaim the 5% root reserved blocks.",
        isCorrect: false,
        terminalResult: `[TRIAGE FAILED] Reserved block percentage set to 0. Reclaimed 12.5GB of block storage, but IFree remains 0. Write error 'No space left on device' continues unabated.`,
        explanation: "Reserved block percentage only affects block capacity for root vs non-root users; it has zero impact on available inodes.",
      },
    ],
    rootCause: "A misconfigured local sendmail cron job was generating undeliverable bounce notifications every 5 seconds, dumping over 16 million 0-byte temporary files into `/var/spool/clientmqueue`, completely consuming the filesystem's inode table.",
    preventionRule: "Monitor both disk block usage (`node_filesystem_free_bytes`) and inode saturation (`node_filesystem_files_free`) in Prometheus alerting rules. Set a PagerDuty alert at 80% inode capacity.",
    interviewTakeaway: "Senior interviewers love testing this nuance. When asked 'What do you check when df -h shows free space but write operations fail?', always answer: 'Check df -i for inode exhaustion or lsof +L1 for deleted files still held open by processes.'",
  },
  {
    id: "postgres-pool-exhaustion",
    severity: "SEV-1",
    title: "Database Connection Pool Saturation & 504 Gateway Timeout",
    service: "auth-service",
    category: "database",
    categoryLabel: "Database",
    symptomSummary: "All user logins failing with 504 Gateway Timeout. Postgres active connection count maxed out at 500/500.",
    pagerDutyAlert: "[P1-CRITICAL] RDS PostgreSQL db-primary connection pool exhausted",
    mttrTarget: "5 mins",
    telemetryLogs: [
      {
        command: "psql -h pg-primary.internal -U postgres -c \"SELECT count(*) FROM pg_stat_activity;\"",
        output: ` count 
-------
   500
(1 row)  -- max_connections is configured to 500`,
      },
      {
        command: "psql -h pg-primary.internal -U postgres -c \"SELECT pid, now() - query_start AS duration, state, query FROM pg_stat_activity WHERE state != 'idle' ORDER BY duration DESC LIMIT 2;\"",
        output: `  pid  | duration        | state  | query
-------+-----------------+--------+-------------------------------------------------------
 18492 | 00:08:42.194821 | active | SELECT * FROM users WHERE lower(email) = $1;
 18501 | 00:08:39.810284 | active | SELECT * FROM users WHERE lower(email) = $1;
(Sequential scan on 28 million rows running concurrently across 420 connections)`,
      },
    ],
    options: [
      {
        id: "A",
        action: "Edit postgresql.conf to increase `max_connections` from 500 to 2,500 and reboot PostgreSQL.",
        isCorrect: false,
        terminalResult: `[TRIAGE FAILED] PostgreSQL rebooted. 2,000 unindexed sequential scan queries immediately connected, driving database server CPU to 100% and causing kernel out-of-memory panic on the database host.`,
        explanation: "Increasing max_connections on slow, unindexed sequential queries only amplifies CPU and memory contention, leading to database host thrashing.",
      },
      {
        id: "B",
        action: "Terminate runaway queries via `SELECT pg_terminate_backend(pid)`, deploy an index on `lower(email)`, and route traffic through PgBouncer.",
        isCorrect: true,
        terminalResult: `[✓ MITIGATION SUCCESSFUL]
Terminated 420 blocking sequential scans.
Created expression index: CREATE INDEX CONCURRENTLY idx_users_lower_email ON users(lower(email)).
Active connections dropped from 500 to 24. P99 query latency dropped from 8,400ms to 1.8ms. Service fully restored.`,
        explanation: "Unindexed sequential scans across 28M rows held connections open for minutes. Terminating the stuck queries freed connection slots immediately, while adding an expression index reduced query time to 2ms.",
      },
      {
        id: "C",
        action: "Trigger an immediate RDS Multi-AZ failover to the standby replica.",
        isCorrect: false,
        terminalResult: `[TRIAGE FAILED] Failover triggered. Standby instance promoted to primary. Within 15 seconds, incoming traffic fired the same unindexed sequential queries, maxing out connections on the new primary.`,
        explanation: "Failover does not fix query performance. The new primary will inherit the exact same query stampede and saturate its connection pool immediately.",
      },
      {
        id: "D",
        action: "Delete the users table write-ahead logs (WAL) in `/var/lib/postgresql/data/pg_wal`.",
        isCorrect: false,
        terminalResult: `[CATASTROPHIC FAILURE] WAL files deleted. Database crashed with data corruption: 'PANIC: could not locate a valid checkpoint record'. Total database failure.`,
        explanation: "Deleting WAL files corrupts the database transaction log and causes catastrophic data loss. Never delete WAL files manually.",
      },
    ],
    rootCause: "A frontend update started querying `lower(email)` without a corresponding functional/expression index on the 28M-row users table. Queries took 8+ seconds each, causing incoming traffic to saturate all 500 connection slots in under 3 minutes.",
    preventionRule: "Enforce query linters in CI to detect unindexed queries, configure `statement_timeout = 3000` (3s limit) in PostgreSQL, and deploy PgBouncer in transaction pooling mode in front of the database.",
    interviewTakeaway: "In SRE interviews, explain the difference between connection exhaustion caused by traffic spikes vs connection starvation caused by slow locking queries. Mention connection pooling (PgBouncer) and statement timeouts.",
  },
  {
    id: "aws-irsa-s3-403",
    severity: "SEV-2",
    title: "AWS S3 403 AccessDenied for EKS Kubernetes Pod",
    service: "invoice-worker",
    category: "aws",
    categoryLabel: "AWS & IAM",
    symptomSummary: "Billing invoice generator pods failing with AccessDenied when attempting to upload generated PDF receipts to S3.",
    pagerDutyAlert: "[P2-HIGH] invoice-worker upload pipeline halted: 403 Forbidden",
    mttrTarget: "5 mins",
    telemetryLogs: [
      {
        command: "kubectl logs -n billing invoice-worker-5d8f99764-q2x8v --tail=3",
        output: `com.amazonaws.services.s3.model.AmazonS3Exception: Access Denied (Service: Amazon S3; Status Code: 403; Error Code: AccessDenied)
User: arn:aws:sts::123456789012:assumed-role/eks-worker-node-role/i-09ab12cd34ef is not authorized to perform: s3:PutObject on resource: "arn:aws:s3:::prod-customer-invoices/2026/..."`,
      },
      {
        command: "kubectl get sa invoice-sa -n billing -o jsonpath='{.metadata.annotations}'",
        output: `{"eks.amazonaws.com/role-arn":"arn:aws:iam::123456789012:role/InvoiceS3WorkerRole"}`,
      },
      {
        command: "aws iam get-role --role-name InvoiceS3WorkerRole --query 'Role.AssumeRolePolicyDocument' --output json",
        output: `{
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Federated": "arn:aws:iam::123456789012:oidc-provider/oidc.eks.us-west-2.amazonaws.com/id/OLD_STALE_CLUSTER_ID" },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": { "StringEquals": { "oidc.eks.us-west-2.amazonaws.com/id/OLD_STALE_CLUSTER_ID:sub": "system:serviceaccount:billing:invoice-sa" } }
  }]
}`,
      },
    ],
    options: [
      {
        id: "A",
        action: "Attach AmazonS3FullAccess directly to the EC2 worker node IAM instance profile `eks-worker-node-role`.",
        isCorrect: false,
        terminalResult: `[SECURITY AUDIT VIOLATION] Permissive policy attached to node profile. Invoice pods work, but EVERY pod on the node now has full read/write access to customer invoice data, violating principle of least privilege and SOC2 compliance.`,
        explanation: "Granting S3 permissions to the EC2 node role is a severe security vulnerability because any container running on that EC2 instance inherits those broad permissions.",
      },
      {
        id: "B",
        action: "Update the IAM Role's trust relationship with the current EKS cluster OIDC Provider ID and bounce the pods.",
        isCorrect: true,
        terminalResult: `[✓ MITIGATION SUCCESSFUL]
Updated IAM Role trust policy with current cluster OIDC ID: 'NEW_EKS_CLUSTER_ID_9876'.
Pods restarted: AWS token projection refreshed (/var/run/secrets/eks.amazonaws.com/serviceaccount/token).
STS AssumeRole succeeded as arn:aws:sts::...:assumed-role/InvoiceS3WorkerRole. Invoices uploading cleanly.`,
        explanation: "When EKS was migrated or upgraded, the OIDC issuer ID changed. The IAM Role's AssumeRolePolicyDocument was still pointing to the old OIDC provider ID, preventing AWS STS from validating the projected web identity token.",
      },
      {
        id: "C",
        action: "Generate permanent AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY and inject them as plaintext environment variables.",
        isCorrect: false,
        terminalResult: `[SECURITY AUDIT VIOLATION] Long-lived static credentials deployed. Static access keys violate AWS well-architected framework and create credential leak hazards.`,
        explanation: "Static IAM user credentials should never be injected into containers. IAM Roles for Service Accounts (IRSA) provides temporary, rotating, least-privilege STS credentials.",
      },
      {
        id: "D",
        action: "Change the S3 bucket policy to public read-write for anyone on the internet.",
        isCorrect: false,
        terminalResult: `[CATASTROPHIC DATA LEAK] S3 bucket prod-customer-invoices made public. Confidential customer billing records exposed to the open internet.`,
        explanation: "Never make sensitive customer buckets public to resolve an IAM authentication mismatch.",
      },
    ],
    rootCause: "Following a cluster upgrade, the EKS OpenID Connect (OIDC) identity provider URL was updated, but the IAM Role's trust relationship condition remained pinned to the legacy cluster's OIDC hash.",
    preventionRule: "Manage IRSA role definitions through Terraform modules using `module.eks.oidc_provider_arn` and `module.eks.oidc_provider` dynamically so OIDC issuer changes automatically update IAM trust policies.",
    interviewTakeaway: "Demonstrate clear understanding of IRSA: Pod service account annotation &rarr; Webhook injects `AWS_WEB_IDENTITY_TOKEN_FILE` &rarr; SDK calls `sts:AssumeRoleWithWebIdentity` validated against EKS OIDC provider.",
  },
  {
    id: "dns-ndots-exhaustion",
    severity: "SEV-1",
    title: "CoreDNS Outage Triggered by ndots:5 Query Amplification",
    service: "ingress-gateway",
    category: "networking",
    categoryLabel: "Networking",
    symptomSummary: "Intermittent 502 Bad Gateway across all services. CoreDNS pods crashing under 28,000 UDP requests/sec.",
    pagerDutyAlert: "[P1-CRITICAL] CoreDNS packet drop rate > 25% across all kube-dns replicas",
    mttrTarget: "4 mins",
    telemetryLogs: [
      {
        command: "kubectl top pods -n kube-system -l k8s-app=kube-dns",
        output: `NAME                       CPU(cores)   MEMORY(bytes)
coredns-7c65d6cfc9-5k8lp   1000m (100%) 170Mi
coredns-7c65d6cfc9-w2p9x   1000m (100%) 168Mi`,
      },
      {
        command: "kubectl exec -it deployment/api-gateway -- cat /etc/resolv.conf",
        output: `nameserver 10.96.0.10
search production.svc.cluster.local svc.cluster.local cluster.local us-west-2.compute.internal
options ndots:5`,
      },
      {
        command: "kubectl exec -it deployment/coredns -n kube-system -- tcpdump -i any port 53 -c 4",
        output: `02:41:01.129 IP 10.244.1.18.51234 > 10.96.0.10.53: 1284+ A? api.stripe.com.production.svc.cluster.local.
02:41:01.130 IP 10.244.1.18.51234 > 10.96.0.10.53: 1285+ A? api.stripe.com.svc.cluster.local.
02:41:01.131 IP 10.244.1.18.51234 > 10.96.0.10.53: 1286+ A? api.stripe.com.cluster.local.
02:41:01.132 IP 10.244.1.18.51234 > 10.96.0.10.53: 1287+ A? api.stripe.com.`,
      },
    ],
    options: [
      {
        id: "A",
        action: "Reduce CoreDNS memory requests to 32Mi to force faster pod garbage collection.",
        isCorrect: false,
        terminalResult: `[TRIAGE FAILED] Lowering memory caused CoreDNS to crash with OOMKilled immediately. Entire cluster DNS resolution ceased. All services down.`,
        explanation: "Reducing memory does not reduce DNS query volume; it instantly kills CoreDNS under load.",
      },
      {
        id: "B",
        action: "Deploy NodeLocal DNSCache and append a trailing dot to external FQDNs (e.g. `api.stripe.com.`) or tune `dnsConfig: options: [{ name: 'ndots', value: '2' }]`.",
        isCorrect: true,
        terminalResult: `[✓ MITIGATION SUCCESSFUL]
NodeLocal DNSCache deployed.
Trailing dot configured on external HTTP client endpoints.
DNS query amplification eliminated: 4x redundant NXDOMAIN searches stopped immediately.
CoreDNS CPU dropped from 100% to 8%. Cluster DNS latency normalized to 0.4ms.`,
        explanation: "By default, Kubernetes sets `ndots:5`. Any domain with fewer than 5 dots (like `api.stripe.com`, which has 2) is checked against all search domains sequentially before querying public DNS. Appending a trailing dot or lowering `ndots` prevents the 4x NXDOMAIN query storm.",
      },
      {
        id: "C",
        action: "Delete the Kubernetes kube-dns ClusterIP service and direct pods to Google public DNS 8.8.8.8.",
        isCorrect: false,
        terminalResult: `[TRIAGE FAILED] Deleting kube-dns service broke all internal microservice routing. Pods can no longer resolve other Kubernetes services by name.`,
        explanation: "Pointing directly to 8.8.8.8 breaks internal Kubernetes cluster DNS (e.g., `service.namespace.svc.cluster.local`).",
      },
      {
        id: "D",
        action: "Restart all worker node kubelet daemons in parallel.",
        isCorrect: false,
        terminalResult: `[TRIAGE FAILED] Kubelet restarted on all nodes. Node status transitioned to NotReady briefly. CoreDNS query flood resumed immediately upon node reconnect.`,
        explanation: "The root cause is application DNS resolution configuration (`ndots:5`), not a kubelet process bug.",
      },
    ],
    rootCause: "Kubernetes default `ndots:5` caused high-volume external API calls (`api.stripe.com`, `api.datadog.com`) to generate 4 failed internal cluster lookups before making the actual external query, multiplying DNS query load by 5x and exhausting CoreDNS CPU.",
    preventionRule: "Deploy NodeLocal DNSCache DaemonSet on every cluster. Use trailing dots on external URLs in microservice configs (`https://api.stripe.com./`) to force immediate root domain resolution.",
    interviewTakeaway: "Understanding `ndots:5` in `/etc/resolv.conf` is a hallmark of a senior SRE. Explain how search domains amplify UDP query volume and how NodeLocal DNSCache caches DNS at the node level.",
  },
  {
    id: "terraform-dynamodb-state-lock",
    severity: "SEV-2",
    title: "Terraform Pipeline Blocked by Deadlocked DynamoDB Lock",
    service: "infra-ci",
    category: "terraform",
    categoryLabel: "Terraform",
    symptomSummary: "Emergency hotfix production deployment blocked in GitHub Actions. Terraform fails acquiring DynamoDB state lock.",
    pagerDutyAlert: "[P2-HIGH] CI/CD Pipeline Failure: Error acquiring Terraform state lock",
    mttrTarget: "2 mins",
    telemetryLogs: [
      {
        command: "terraform apply -auto-approve",
        output: `Acquiring state lock. This may take a few moments...
╷
│ Error: Error acquiring the state lock
│ 
│ Error message: ConditionalCheckFailedException: The conditional request failed
│ Lock Info:
│   ID:        f8e32910-c481-4f12-89ba-98124081ef12
│   Path:      exit0-prod-tfstate/terraform.tfstate
│   Operation: OperationTypeApply
│   Who:       runner@gh-runner-04
│   Version:   1.7.4
│   Created:   2026-09-11 00:15:10.19821 UTC (2+ hours ago)
│   Info:      Pipeline #4812 (Terminated due to runner spot instance reclamation)`,
      },
      {
        command: "aws dynamodb get-item --table-name tf-state-locks --key '{\"LockID\":{\"S\":\"exit0-prod-tfstate/terraform.tfstate-md5\"}}'",
        output: `{
    "Item": {
        "LockID": { "S": "exit0-prod-tfstate/terraform.tfstate-md5" },
        "Info": { "S": "{\"ID\":\"f8e32910-c481-4f12-89ba-98124081ef12\",\"Who\":\"runner@gh-runner-04\"...}" }
    }
}`,
      },
    ],
    options: [
      {
        id: "A",
        action: "Drop and recreate the DynamoDB table `tf-state-locks`.",
        isCorrect: false,
        terminalResult: `[UNINTENDED DESTRUCTIVE ACTION] DynamoDB table dropped. All lock histories destroyed, and permissions broke across all environment pipelines requiring IAM re-provisioning.`,
        explanation: "Dropping infrastructure locking tables is unnecessary and dangerous. Terraform provides native force-unlock mechanisms.",
      },
      {
        id: "B",
        action: "Confirm no other engineer or runner is running, then execute `terraform force-unlock f8e32910-c481-4f12-89ba-98124081ef12`.",
        isCorrect: true,
        terminalResult: `[✓ MITIGATION SUCCESSFUL]
Do you really want to force-unlock? Yes.
Lock f8e32910-c481-4f12-89ba-98124081ef12 removed from DynamoDB table.
State released. CI hotfix pipeline rerun: Plan & Apply completed with 0 errors.`,
        explanation: "When a CI runner crashes or is terminated mid-execution, it leaves an orphan lock item in DynamoDB. Running `terraform force-unlock <ID>` safely clears the abandoned lock.",
      },
      {
        id: "C",
        action: "Delete the remote `terraform.tfstate` file from AWS S3 to bypass the lock check.",
        isCorrect: false,
        terminalResult: `[DISASTROUS STATE LOSS] Remote tfstate deleted from S3. Terraform lost track of all existing infrastructure. Next run attempted to recreate existing VPCs, crashing with name collision errors.`,
        explanation: "Deleting the state file destroys Terraform's knowledge of provisioned cloud assets. Never delete remote state to clear a lock.",
      },
      {
        id: "D",
        action: "Add `-lock=false` flag to all production CI deployment scripts permanently.",
        isCorrect: false,
        terminalResult: `[DANGEROUS CONFIGURATION] -lock=false applied. Concurrent PR merge runs executed simultaneously, causing state file race conditions and corrupted resources.`,
        explanation: "Disabling locking permanently opens the door to concurrent state write race conditions, which inevitably corrupts production state files.",
      },
    ],
    rootCause: "A GitHub Actions spot runner was reclaimed by AWS mid-apply. Because the runner was terminated with SIGKILL, Terraform's graceful exit handler could not release the DynamoDB LockID.",
    preventionRule: "Always verify the LockID timestamp and creator before unlocking. Implement run timeouts and use dedicated on-demand runners for production `terraform apply` workflows to prevent spot reclamation.",
    interviewTakeaway: "Explain how Terraform remote backends use DynamoDB conditional writes (`attribute_not_exists(LockID)`) for distributed mutex locking, and how to safely inspect and release stale locks.",
  },
  {
    id: "redis-latency-keys-freeze",
    severity: "SEV-1",
    title: "Primary Redis Cluster Freezes for 18 Seconds Every 5 Minutes",
    service: "session-cache",
    category: "database",
    categoryLabel: "Caching",
    symptomSummary: "API gateway times out every 5 minutes. Redis p99 latency spikes from 2ms to 18,000ms.",
    pagerDutyAlert: "[P1-CRITICAL] Redis primary cluster heartbeat missed; cluster latency > 15s",
    mttrTarget: "3 mins",
    telemetryLogs: [
      {
        command: "redis-cli -h redis-primary.internal SLOWLOG GET 2",
        output: `1) 1) (integer) 492
   2) (integer) 1718920194
   3) (integer) 17821042  -- Execution duration: 17.82 seconds!
   4) 1) "KEYS"
      2) "session:user:*"
2) 1) (integer) 491
   2) (integer) 1718919894
   3) (integer) 17812901  -- Execution duration: 17.81 seconds!
   4) 1) "KEYS"
      2) "session:user:*"`,
      },
      {
        command: "redis-cli -h redis-primary.internal DBSIZE",
        output: `(integer) 8419204  -- Over 8.4 million keys in database`,
      },
    ],
    options: [
      {
        id: "A",
        action: "Increase Redis instance size from 4 vCPUs to 16 vCPUs.",
        isCorrect: false,
        terminalResult: `[TRIAGE FAILED] Instance upgraded to 16 vCPUs. The 18-second freeze still occurs! Because Redis core command execution is single-threaded, extra CPU cores do not speed up single-threaded O(N) KEYS scans.`,
        explanation: "Redis processes commands sequentially on a single thread. Additional CPU cores do not accelerate an O(N) full-keyspace traversal.",
      },
      {
        id: "B",
        action: "Kill the offending cron job, replace `KEYS session:user:*` with non-blocking `SCAN`, or maintain a separate Set of active user sessions.",
        isCorrect: true,
        terminalResult: `[✓ MITIGATION SUCCESSFUL]
Terminated the rogue cron script running KEYS.
Migrated cleanup routine to cursor-based 'SCAN 0 MATCH session:user:* COUNT 500'.
Redis command queue cleared immediately. P99 latency dropped from 17,800ms to 1.2ms. Zero client timeouts.`,
        explanation: "The `KEYS` command is an O(N) blocking operation. With 8.4 million keys, Redis blocked all incoming requests for 17.8 seconds while scanning memory. Using cursor-based `SCAN` processes keys in small batches without blocking the event loop.",
      },
      {
        id: "C",
        action: "Enable Redis cluster multi-threading using `io-threads 16` in redis.conf.",
        isCorrect: false,
        terminalResult: `[TRIAGE FAILED] io-threads enabled. Network I/O was offloaded, but command execution remains single-threaded. KEYS command still froze the instance for 17 seconds.`,
        explanation: "`io-threads` in Redis only offloads reading and writing network socket buffers. Command execution itself is still single-threaded.",
      },
      {
        id: "D",
        action: "Execute `FLUSHALL ASYNC` to purge the cache.",
        isCorrect: false,
        terminalResult: `[DATA LOSS] 8.4 million active user sessions cleared. Hundreds of thousands of users logged out simultaneously, flooding the authentication service and triggering cascading outage.`,
        explanation: "Flushing the entire cache destroys valid active user sessions and causes a devastating cache stampede on the primary database.",
      },
    ],
    rootCause: "A newly deployed session cleanup cron script was running `KEYS session:user:*` every 5 minutes. On a database with 8.4 million keys, this O(N) blocking command monopolized the single-threaded Redis event loop for nearly 18 seconds.",
    preventionRule: "Disable destructive commands in `redis.conf` using `rename-command KEYS \"\"`. Enforce cursor-based `SCAN` or use dedicated data structures like Sets and Sorted Sets for indexing.",
    interviewTakeaway: "Always highlight that Redis command execution is single-threaded. Mention the dangers of O(N) commands like `KEYS`, `FLUSHALL`, `HGETALL` on large hashes, and recommend `SCAN`, `HSCAN`, `SSCAN`.",
  },
  {
    id: "nginx-ephemeral-port-exhaustion",
    severity: "SEV-2",
    title: "Nginx Upstream 502 Bad Gateway under 8,000 QPS Load",
    service: "api-gateway",
    category: "networking",
    categoryLabel: "Networking",
    symptomSummary: "Nginx ingress returning intermittent 502 Bad Gateway during high traffic. Upstream microservices show low 15% CPU load.",
    pagerDutyAlert: "[P2-HIGH] api-gateway 502 Bad Gateway rate spiked to 14%",
    mttrTarget: "4 mins",
    telemetryLogs: [
      {
        command: "tail -n 3 /var/log/nginx/error.log",
        output: `2026/09/11 02:44:19 [crit] 14210#14210: *849102 connect() to 10.0.4.12:8080 failed (99: Cannot assign requested address) while connecting to upstream, client: 198.51.100.4, server: api.exit0.dev, request: "POST /v1/orders"`,
      },
      {
        command: "netstat -an | grep TIME_WAIT | wc -l",
        output: `28219`,
      },
      {
        command: "sysctl net.ipv4.ip_local_port_range",
        output: `net.ipv4.ip_local_port_range = 32768 60999  -- Available ephemeral ports: ~28,231`,
      },
    ],
    options: [
      {
        id: "A",
        action: "Configure upstream `keepalive 64;` in Nginx upstream block, and enable `sysctl net.ipv4.tcp_tw_reuse = 1`.",
        isCorrect: true,
        terminalResult: `[✓ MITIGATION SUCCESSFUL]
Added keepalive connection pool to Nginx upstream definition and HTTP/1.1 proxy headers.
Enabled tcp_tw_reuse. TIME_WAIT sockets dropped from 28,219 to 180.
Upstream socket reuse eliminated ephemeral port exhaustion. 502 Bad Gateway dropped to 0%.`,
        explanation: "By default, Nginx opens a new TCP connection for every incoming request and closes it immediately, leaving sockets in TIME_WAIT for 60s. At 8,000 QPS, all ~28k ephemeral source ports were consumed (`Cannot assign requested address`). Enabling upstream keepalive pools connection sockets.",
      },
      {
        id: "B",
        action: "Increase `proxy_connect_timeout` and `proxy_read_timeout` from 60s to 300s.",
        isCorrect: false,
        terminalResult: `[TRIAGE FAILED] Timeouts increased. Sockets remained stuck in TIME_WAIT, and now slow client connections piled up in Nginx worker memory, making latency worse.`,
        explanation: "Increasing timeouts does nothing to free exhausted local ephemeral ports; in fact, it holds file descriptors open longer.",
      },
      {
        id: "C",
        action: "Restart Nginx every 60 seconds with a systemd cron timer.",
        isCorrect: false,
        terminalResult: `[TRIAGE REJECTED] Bouncing Nginx drops in-flight client connections and only temporarily clears sockets before they immediately saturate again under load.`,
        explanation: "A restart loop drops active connections and does not address the fundamental lack of connection reuse.",
      },
      {
        id: "D",
        action: "Turn off Nginx access logging to save disk I/O.",
        isCorrect: false,
        terminalResult: `[TRIAGE FAILED] Access logging disabled. Error 99 (Cannot assign requested address) continues occurring because networking ports are exhausted, not disk write queues.`,
        explanation: "Disk I/O has nothing to do with TCP local port exhaustion.",
      },
    ],
    rootCause: "Nginx was communicating with backend upstream microservices using HTTP/1.0 without keepalive connection pooling. Each request opened and closed a fresh TCP socket, causing TIME_WAIT sockets to consume all 28,231 ephemeral ports.",
    preventionRule: "Always configure `keepalive` inside Nginx `upstream` blocks and set `proxy_http_version 1.1; proxy_set_header Connection \"\";` to keep upstream connections persistent.",
    interviewTakeaway: "Error 99 `Cannot assign requested address` in reverse proxies is a classic interview question. Explain TCP 4-tuple `(src_ip, src_port, dst_ip, dst_port)` and TIME_WAIT lifecycle.",
  },
  {
    id: "kafka-rebalance-storm",
    severity: "SEV-1",
    title: "Kafka Consumer Group Lag Explosion & Rebalance Storm",
    service: "order-consumer",
    category: "linux",
    categoryLabel: "Event Streams",
    symptomSummary: "Order processing lag spiking to 3.8M messages. Consumers continually revoking and reassigning partitions.",
    pagerDutyAlert: "[P1-CRITICAL] Kafka consumer lag on topic order-events exceeds 1,000,000",
    mttrTarget: "5 mins",
    telemetryLogs: [
      {
        command: "kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group order-worker-group",
        output: `GROUP              TOPIC           PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG             CONSUMER-ID
order-worker-group order-events    0          1048102         1892019         843917          -
order-worker-group order-events    1          1029104         1910284         881180          -
(Group state: PreparingRebalance - constantly churning, 0 messages progressing)`,
      },
      {
        command: "tail -n 4 /var/log/order-consumer/app.log",
        output: `2026-09-11 02:42:10 WARN  o.a.k.c.c.i.ConsumerCoordinator - [Consumer clientId=c1, groupId=order-worker-group] 
max.poll.interval.ms (300000 ms = 5m) elapsed between calls to poll(). Member will be evicted from consumer group.
2026-09-11 02:42:11 INFO  o.a.k.c.c.i.ConsumerCoordinator - Revoking previously assigned partitions [order-events-0, order-events-1]`,
      },
    ],
    options: [
      {
        id: "A",
        action: "Increase topic partitions from 12 to 120 and spin up 100 new consumer pods.",
        isCorrect: false,
        terminalResult: `[TRIAGE FAILED] 100 new consumer pods started. Because individual message batches still take 7 minutes to process, all 100 consumers hit max.poll.interval.ms and joined the rebalance storm, halting all processing.`,
        explanation: "Adding consumers does not fix a single-batch processing time that exceeds `max.poll.interval.ms`.",
      },
      {
        id: "B",
        action: "Decrease `max.poll.records` from 500 to 50, increase `max.poll.interval.ms`, and offload slow third-party calls to an asynchronous worker thread pool.",
        isCorrect: true,
        terminalResult: `[✓ MITIGATION SUCCESSFUL]
max.poll.records reduced to 50. max.poll.interval.ms raised to 600,000ms.
Consumer loop now polls every 18 seconds, well within timeout limits.
Group stabilized in Stable state. Lag steadily draining at 15,000 msgs/sec.`,
        explanation: "If a consumer takes longer than `max.poll.interval.ms` to process a batch of records returned by `poll()`, Kafka assumes the consumer has hung or died and triggers a rebalance. Reducing batch size ensures `poll()` is called frequently.",
      },
      {
        id: "C",
        action: "Delete the consumer offsets topic `__consumer_offsets` and restart the Kafka cluster brokers.",
        isCorrect: false,
        terminalResult: `[CATASTROPHIC FAILURE] Deleted __consumer_offsets. Every consumer group across the company lost track of its progress, causing massive message duplication across all banking and billing pipelines.`,
        explanation: "Never delete `__consumer_offsets`. It destroys the committed offsets of all consumer applications in the entire cluster.",
      },
      {
        id: "D",
        action: "Change the consumer `auto.offset.reset` setting to `latest`.",
        isCorrect: false,
        terminalResult: `[SILENT DATA LOSS] Unprocessed 3.8 million customer orders skipped and permanently lost from the queue. Financial discrepancy alerts triggered.`,
        explanation: "Resetting offsets to latest skips all unprocessed messages in the lag queue, resulting in permanent data loss.",
      },
    ],
    rootCause: "A downstream payment fraud API added latency, causing a batch of 500 records to take 7 minutes to process. Because this exceeded the 5-minute `max.poll.interval.ms`, the Kafka broker continually evicted the consumer, triggering continuous rebalance loops.",
    preventionRule: "Ensure `max.poll.records * p99_processing_time_per_message < max.poll.interval.ms`. Decouple slow I/O from the Kafka polling thread using worker queues or reactive pipelines.",
    interviewTakeaway: "Explain the difference between `session.timeout.ms` (heartbeat failure detection) and `max.poll.interval.ms` (client processing starvation).",
  },
  {
    id: "mtls-cert-expiration",
    severity: "SEV-1",
    title: "Service Mesh gRPC Outage: Internal TLS Handshake Failure",
    service: "auth-proxy",
    category: "kubernetes",
    categoryLabel: "Security & Mesh",
    symptomSummary: "All inter-service gRPC calls failing with TLS handshake error across the entire Kubernetes cluster.",
    pagerDutyAlert: "[P1-CRITICAL] Envoy sidecar mTLS verification failure: 100% gRPC failure rate",
    mttrTarget: "4 mins",
    telemetryLogs: [
      {
        command: "kubectl logs deployment/api-gateway -c istio-proxy --tail=2",
        output: `[2026-09-11T02:46:12.190Z] "POST /grpc.user.UserService/GetUser HTTP/2" 503 UF,URX upstream connect error or disconnect/reset before headers.
reset reason: connection failure, transport failure reason: TLS error: 268435581:SSL routines:OPENSSL_internal:CERTIFICATE_VERIFY_FAILED:certificate has expired`,
      },
      {
        command: "kubectl get secret istio-ca-secret -n istio-system -o jsonpath='{.data.ca-cert\\.pem}' | base64 -d | openssl x509 -noout -enddate",
        output: `notAfter=Sep 10 23:59:59 2026 GMT  -- (Expired 2 hours 46 minutes ago!)`,
      },
    ],
    options: [
      {
        id: "A",
        action: "Disable Istio sidecar injection and rewrite all service URLs from HTTPS to plain unencrypted HTTP.",
        isCorrect: false,
        terminalResult: `[SECURITY BREACH] mTLS disabled cluster-wide. Sensitive banking and authentication payloads transmitted in cleartext, violating PCI-DSS and zero-trust compliance standards.`,
        explanation: "Disabling security encryption completely to avoid an expired certificate is a severe compliance violation and operational regression.",
      },
      {
        id: "B",
        action: "Renew the root CA in `istio-ca-secret` using cert-manager or internal PKI and restart `istiod` to push new certificates via SDS.",
        isCorrect: true,
        terminalResult: `[✓ MITIGATION SUCCESSFUL]
Rotated root CA in istio-system.
Restarted istiod control plane.
Secret Discovery Service (SDS) pushed new valid leaf certificates to all 48 Envoy sidecar proxies.
mTLS handshakes resumed successfully. All gRPC endpoints 100% operational.`,
        explanation: "The intermediate/root CA expired, causing all sidecar proxies to reject peer mTLS certificates. Generating a valid CA certificate and bouncing istiod triggers the Secret Discovery Service (SDS) to push fresh certificates to all Envoy proxies without restarting application pods.",
      },
      {
        id: "C",
        action: "Increase Envoy proxy connection timeout from 15s to 600s in the VirtualService configuration.",
        isCorrect: false,
        terminalResult: `[TRIAGE FAILED] Timeout increased. TLS handshake verification still fails immediately due to certificate expiration. Outage continues.`,
        explanation: "Increasing HTTP connection timeouts has zero effect on an OpenSSL cryptographic certificate verification failure.",
      },
      {
        id: "D",
        action: "Delete the Kubernetes API server pods on all control plane nodes.",
        isCorrect: false,
        terminalResult: `[TRIAGE FAILED] API server pods restarted. The Istio CA certificate secret in etcd is still expired. Inter-service TLS failures persist.`,
        explanation: "The Kubernetes API server is not responsible for the Istio service mesh CA certificate validity.",
      },
    ],
    rootCause: "The 1-year internal root Certificate Authority secret (`istio-ca-secret`) was not registered with automated cert-manager renewal. It expired at midnight GMT, causing all Envoy sidecars to fail peer verification.",
    preventionRule: "Automate CA rotation with `cert-manager` and configure Prometheus alerts on `x509_cert_expiry` with warning alerts at 30 days and critical alerts at 7 days before expiration.",
    interviewTakeaway: "Demonstrate deep knowledge of Service Mesh mTLS: Citadel/Istiod CA &rarr; Secret Discovery Service (SDS) &rarr; Envoy sidecar mutual TLS authentication.",
  },
];
