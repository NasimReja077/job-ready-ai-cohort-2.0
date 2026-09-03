# Kubernetes Monitoring & Auto-Scaling Setup - Explained

## Overview
This guide explains the Kubernetes setup we're implementing for monitoring, auto-scaling, and load testing our containerized applications.

---

## 1. Metrics Server Installation

### What Happened
We installed the **Metrics Server**, which is a core Kubernetes component responsible for collecting resource metrics (CPU and memory usage) from kubelets running on each node.

### What Was Created
- A new deployment in the `kube-system` namespace
- Metrics Server pods that collect resource data from all nodes
- The ability to query real-time CPU and memory usage

### Commands Explained

```bash
# Install metrics-server from the official Kubernetes repository
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Patch to skip TLS verification (required for Docker Desktop's self-signed certificates)
kubectl patch deployment metrics-server -n kube-system \
  --type=json \
  -p='[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]'

# Wait for metrics-server to be fully ready (~30 seconds)
kubectl rollout status deployment/metrics-server -n kube-system
```

### Why We Use This
- **Kubernetes needs metrics data** to make auto-scaling decisions
- **Docker Desktop limitation**: Uses self-signed TLS certificates, so we need the `--kubelet-insecure-tls` flag
- **Real-time monitoring**: Enables `kubectl top` command to see live resource usage
- **HPA dependency**: Horizontal Pod Autoscaler relies on metrics-server to function

### What We Get
✅ Ability to run `kubectl top pods` and `kubectl top nodes`  
✅ Real-time CPU and memory metrics for all pods  
✅ Foundation for auto-scaling policies

---

## 2. Horizontal Pod Autoscaler (HPA)

### What Is HPA?
HPA automatically scales the number of pod replicas based on observed metrics (CPU, memory, or custom metrics).

### What Was Created

```bash
kubectl autoscale deployment express-deployment \
  --min=1 \
  --max=5 \
  --cpu-percent=50
```

This creates an **HPA resource** that:
- Monitors the `express-deployment`
- Maintains **minimum of 1 pod** (always running)
- Scales up to **maximum of 5 pods** (under high load)
- Triggers scale-up when **average CPU reaches 50%**
- Scales down when CPU usage drops

### How It Works

| Scenario | Action | Why |
|----------|--------|-----|
| CPU < 50% | Scale down | Resource efficiency |
| CPU = 50% | Maintain | Target state |
| CPU > 50% | Scale up | Handle load |
| Max replicas reached | Reject new requests | Safety limit |

### What We Get
✅ Automatic pod scaling based on load  
✅ Cost optimization (fewer pods when not needed)  
✅ High availability (more pods under stress)  
✅ No manual intervention needed

---

## 3. Monitoring Commands

### kubectl top pods
```bash
kubectl top pods
```
**What it does**: Shows real-time CPU and memory usage of all pods

**Output example**:
```
NAME                                       CPU(cores)   MEMORY(bytes)
express-host-deployment-774c7dfcd5-jk8zx   501m         23Mi
product-deployment-58d5867c66-c2frl        1m           22Mi
```

**Why use it**: 
- Identify resource-hungry pods
- Verify HPA is working correctly
- Troubleshoot performance issues

### kubectl logs deployment
```bash
kubectl logs deployment/express-host-deployment --tail=100 -f
kubectl logs deployment/product-deployment --tail=100 -f
```

**What it does**: 
- Shows last 100 log lines (`--tail=100`)
- `-f` means "follow" (live streaming logs)

**Output shows**:
- HTTP requests being processed
- Response times
- Errors or issues
- Server startup messages

**Why use it**:
- Debug application issues
- Monitor request patterns
- Verify deployments are working
- Check for errors in real-time

### Continuous Monitoring Loop (PowerShell)
```powershell
while ($true) { 
    kubectl top pods
    Start-Sleep -Seconds 2
    Clear-Host 
}
```

**What it does**:
- Runs `kubectl top pods` every 2 seconds
- Clears screen and updates continuously
- Gives real-time resource monitoring dashboard

**Why use it**:
- Watch HPA in action during load testing
- See pods being created/destroyed
- Monitor CPU/memory trends
- Verify auto-scaling behavior

---

## 4. Load Testing

### npx autocannon
```bash
npx autocannon -c 100 -d 120 http://localhost/api/product
npx autocannon -c 200 -d 120 http://localhost
```

**Parameters explained**:
- `-c 100` = 100 concurrent connections
- `-d 120` = duration: 120 seconds (2 minutes)
- `http://localhost/api/product` = target endpoint

**What it measures**:
```
Latency: Response time (how fast requests complete)
Req/Sec: Requests per second (throughput)
Bytes/Sec: Data transfer rate
Errors: Failed requests or timeouts
```

**Why use it**:
- Simulate real-world traffic
- Trigger HPA scaling policies
- Measure system performance under load
- Identify bottlenecks
- Verify application stability

---

## 5. Complete Workflow Explanation

### Scenario: Load Testing with Auto-Scaling

```
1. Start monitoring in one terminal:
   while ($true) { kubectl top pods; Start-Sleep -Seconds 2; Clear-Host }

2. Start watching logs in another terminal:
   kubectl logs deployment/express-host-deployment --tail=100 -f

3. Run load test:
   npx autocannon -c 200 -d 120 http://localhost
```

### What Happens:

**Initial State** (Low Load):
- 1 pod running (minimum)
- CPU usage ~1-5%
- Response time: < 100ms

**Load Test Starts** (High Load):
- 200 concurrent connections send requests
- CPU usage rises to 50%+
- HPA detects high CPU
- **New pods are created** (you see them appear in `kubectl top pods`)
- Load is distributed across multiple pods
- Response time stays acceptable

**Load Test Ends** (Normal Load):
- Requests decrease
- CPU usage drops below 50%
- HPA waits for stabilization (~300 seconds by default)
- **Excess pods are terminated** (you see them disappear)
- Back to minimum of 1 pod

---

## 6. Key Metrics & What They Mean

### CPU Usage
- **Measured in**: millicores (m)
  - 500m = 0.5 CPU cores
  - 1000m = 1 full CPU core
- **HPA trigger**: 50% of requested CPU

### Memory Usage
- **Measured in**: bytes
  - Mi = Mebibytes (1 Mi ≈ 1 MB)
  - Gi = Gibibytes (1 Gi ≈ 1 GB)
- **Used for**: Understanding memory requirements

### Response Latency
- **P50 (median)**: 50% of requests finish this fast
- **P99 (99th percentile)**: 99% of requests finish this fast
- **Goal**: Keep low and stable under load

---

## 7. Why This Setup?

### Problem → Solution

| Problem | Solution | Component |
|---------|----------|-----------|
| Can't see pod resource usage | Metrics collection | Metrics Server |
| Manual pod scaling needed | Automatic scaling | HPA |
| No visibility into performance | Real-time monitoring | `kubectl top` |
| Bugs hard to find | Live log streaming | `kubectl logs -f` |
| Unknown capacity limits | Load testing | autocannon |
| No automated decisions | Intelligent scaling | HPA with metrics |

---

## 8. Expected Observations During Testing

### When Load Test Runs:
```
Initial (0s):
- 1 pod running
- ~1m CPU usage

At 30s (high load):
- 3-5 pods running (HPA scaling up)
- 50-100%+ total CPU usage
- Response time increases
- More throughput

At 120s (test ends):
- CPU starts dropping
- Some pods remain (cooling off)
- Requests complete faster

At 300s+ (stabilized):
- Back to 1 pod (minimum)
- Stable baseline
```

---

## 9. Summary: What We Get

| Capability | Benefit |
|-----------|---------|
| **Automatic Scaling** | Handle traffic spikes automatically |
| **Cost Efficiency** | Use only needed resources |
| **High Availability** | Always have enough capacity |
| **Real-time Visibility** | Know what's happening now |
| **Performance Data** | Measure system behavior |
| **Debugging Tools** | Find issues quickly |
| **Load Testing** | Validate system capacity |

---

## 10. Commands Quick Reference

```bash
# Check metrics server is running
kubectl get deployment metrics-server -n kube-system

# View HPA status
kubectl get hpa

# Check pod scaling details
kubectl describe hpa

# View real-time pod metrics
kubectl top pods

# View node metrics
kubectl top nodes

# Follow deployment logs
kubectl logs deployment/express-host-deployment -f

# Check HPA events (scale-up/down actions)
kubectl describe deployment express-host-deployment

# Run load test
npx autocannon -c 200 -d 120 http://localhost
```

---

## Conclusion

This Kubernetes setup creates a **self-managing, scalable, and observable** system that automatically responds to load changes while providing visibility into what's happening. Perfect for production-ready applications!
------------
kubectl top pods
NAME                                       CPU(cores)   MEMORY(bytes)   
express-host-deployment-774c7dfcd5-jk8zx   500m         23Mi            
express-host-deployment-774c7dfcd5-n2djj   501m         20Mi            
express-host-deployment-774c7dfcd5-t2rfs   500m         17Mi            
product-deployment-58d5867c66-c2frl        1m           38Mi            
product-deployment-58d5867c66-hr2js        1m           42Mi            
product-deployment-58d5867c66-pk67r        1m           27Mi            
PS C:\Users\User\Desktop\New folder\Sheryians_cohort_2.0\Backend\Day_166-Kubernetes-Host> 
----
kubectl logs deployment/express-host-deployment --tail=100 -f
Found 3 pods, using pod/express-host-deployment-774c7dfcd5-jk8zx
GET / 200 12044.254 ms - 66
GET / 200 10444.722 ms - 66
GET / 200 10902.977 ms - 66
GET / 200 8179.648 ms - 66
GET / 200 9805.399 ms - 66
----------
PS C:\Users\User\Desktop\New folder\Sheryians_cohort_2.0\Backend\Day_166-Kubernetes-Host> npx autocannon -c 200 -d 120 http://localhost
Running 120s test @ http://localhost
200 connections


┌─────────┬─────────┬─────────┬─────────┬─────────┬─────────┬───────┬─────────┐
│ Stat    │ 2.5%    │ 50%     │ 97.5%   │ 99%     │ Avg     │ Stdev │ Max     │
├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼───────┼─────────┤
│ Latency │ 6671 ms │ 6671 ms │ 6681 ms │ 6681 ms │ 6676 ms │ 5 ms  │ 6681 ms │
└─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴───────┴─────────┘
┌───────────┬─────┬──────┬─────┬───────┬────────┬────────┬───────┐
│ Stat      │ 1%  │ 2.5% │ 50% │ 97.5% │ Avg    │ Stdev  │ Min   │
├───────────┼─────┼──────┼─────┼───────┼────────┼────────┼───────┤
│ Req/Sec   │ 0   │ 0    │ 0   │ 0     │ 0.02   │ 0.19   │ 2     │
├───────────┼─────┼──────┼─────┼───────┼────────┼────────┼───────┤
│ Bytes/Sec │ 0 B │ 0 B  │ 0 B │ 0 B   │ 4.68 B │ 50.8 B │ 556 B │
└───────────┴─────┴──────┴─────┴───────┴────────┴────────┴───────┘

Req/Bytes counts sampled once per second.
# of samples: 119

2k requests in 120.63s, 556 B read
2k errors (2k timeouts)
--------------
while ($true) { kubectl top pods; Start-Sleep -Seconds 2; Clear-Host }