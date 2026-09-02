**Kubernetes application setup (from your YAML files)**

Your files define a simple Express.js app deployed on Kubernetes with:

- **Deployment** → runs 2 replicas of the container
- **Service** → internal ClusterIP that load-balances to the pods
- **Ingress** → external entry point (nginx) that routes traffic to the service

### Architecture Diagram

```
                    Internet / Client
                            │
                            ▼
              ┌─────────────────────────────┐
              │   Ingress (nginx)           │
              │   express-ingress           │
              │   path: /                   │
              └─────────────┬───────────────┘
                            │
                            ▼
              ┌─────────────────────────────┐
              │   Service (ClusterIP)       │
              │   express-service           │
              │   port 80 → targetPort 3000 │
              └─────────────┬───────────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
    ┌──────────────────┐        ┌──────────────────┐
    │  Pod (Replica 1) │        │  Pod (Replica 2) │
    │  express-kub-    │        │  express-kub-    │
    │  container       │        │  container       │
    │  Port: 3000      │        │  Port: 3000      │
    │  Image:          │        │  Image:          │
    │  cohort_kuber_   │        │  cohort_kuber_   │
    │  express:latest  │        │  express:latest  │
    └──────────────────┘        └──────────────────┘
```

### How the pieces connect

| Resource          | File            | Key settings                              | Role                              |
|-------------------|-----------------|-------------------------------------------|-----------------------------------|
| Deployment        | `deployment.yml`| 2 replicas, label `app: express`, port 3000, resource limits | Runs the actual containers       |
| Service           | `service.yml`   | ClusterIP, selector `app: express`, 80 → 3000 | Stable internal endpoint + load balancing |
| Ingress           | `ingress.yml`   | `ingressClassName: nginx`, path `/` → service port 80 | External access via nginx Ingress |

### Recommended order to apply

```bash
# 1. Make sure you have an Ingress Controller (you already have the command)
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.12.1/deploy/static/provider/cloud/deploy.yaml

# 2. Apply your manifests
kubectl apply -f deployment.yml
kubectl apply -f service.yml
kubectl apply -f ingress.yml
```

### Quick verification commands

```bash
kubectl get deploy,svc,ingress,pods -l app=express
kubectl describe ingress express-ingress
kubectl logs -l app=express --tail=50
```
----
----
**In-Depth Kubernetes Architecture Breakdown**

Here is a detailed explanation of your entire setup based on the provided YAML files, Dockerfile, and application code.

---

### 1. Overall Architecture & Traffic Flow

```
Client (Browser / curl)
        │
        │  HTTP request to Ingress IP / domain
        ▼
┌──────────────────────────────────────────────┐
│  Ingress Controller (nginx)                  │
│  Resource: express-ingress                   │
│  - Path: / (Prefix)                          │
│  - Routes to Service: express-service:80     │
└────────────────────┬─────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────┐
│  Service (ClusterIP)                         │
│  Resource: express-service                   │
│  - Port: 80                                  │
│  - TargetPort: 3000                          │
│  - Selector: app=express                     │
│  - Load balances across all matching Pods    │
└────────────────────┬─────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
┌──────────────────┐     ┌──────────────────┐
│  Pod Replica 1   │     │  Pod Replica 2   │
│  (Deployment)    │     │  (Deployment)    │
│                  │     │                  │
│  Container:      │     │  Container:      │
│  express-kub-    │     │  express-kub-    │
│  container       │     │  container       │
│  Port: 3000      │     │  Port: 3000      │
│  Image:          │     │  Image:          │
│  cohort_kuber_   │     │  cohort_kuber_   │
│  express:latest  │     │  express:latest  │
└──────────────────┘     └──────────────────┘
```

**Traffic path in detail:**
1. Client hits the Ingress (usually via LoadBalancer IP or NodePort of the nginx Ingress Controller).
2. Ingress matches path `/` and forwards the request to the Service on port 80.
3. Service uses the selector `app: express` to find all Pods that have that label.
4. Service load-balances (round-robin by default) to one of the Pods on targetPort 3000.
5. The Express app inside the container receives the request on port 3000 and responds.

---

### 2. Detailed Breakdown of Each YAML File

#### A. Deployment (`deployment.yml`)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: express-deployment
spec:
  replicas: 2                    # Always keep 2 running Pods
  selector:
    matchLabels:
      app: express               # Used by Deployment to manage Pods
  template:                      # Pod template
    metadata:
      labels:
        app: express             # This label is what the Service looks for
    spec:
      containers:
      - name: express-kub-container
        image: cohort_kuber_express:latest
        imagePullPolicy: Always  # Always pull even if image exists locally
        ports:
        - containerPort: 3000    # Declares that the app listens on 3000
        resources:
          limits:
            memory: "128Mi"      # Hard limit – container will be killed if exceeded
            cpu: "500m"          # 0.5 CPU cores maximum
          requests:
            memory: "64Mi"       # Guaranteed minimum
            cpu: "250m"          # 0.25 CPU cores guaranteed
```

**Key points:**
- The Deployment controller continuously ensures that **exactly 2 Pods** with the label `app: express` are running.
- If a Pod crashes or a node dies, Kubernetes automatically creates a new one.
- `imagePullPolicy: Always` is useful during development but can be changed to `IfNotPresent` in production.
- Resource requests/limits help the scheduler place Pods and protect the cluster from resource starvation.

#### B. Service (`service.yml`)

```yaml
kind: Service
apiVersion: v1
metadata:
  name: express-service
spec:
  selector:
    app: express                 # Must match the Pod labels
  type: ClusterIP                # Internal only (default)
  ports:
  - name: name-of-the-port
    port: 80                     # Port the Service listens on
    targetPort: 3000             # Port the container is actually listening on
```

**Key points:**
- `ClusterIP` means the Service is only reachable from inside the cluster.
- The Service creates a stable virtual IP + DNS name (`express-service`).
- It performs load balancing across all healthy Pods that match the selector.
- Port mapping: External clients talk to the Service on **80**, but the container receives traffic on **3000**.

#### C. Ingress (`ingress.yml`)

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: express-ingress
  labels:
    app.kubernetes.io/name: express-ingress
spec:
  ingressClassName: nginx        # Uses the nginx Ingress Controller
  rules:
  - http:
      paths:
      - pathType: Prefix
        path: "/"
        backend:
          service:
            name: express-service
            port:
              number: 80
```

**Key points:**
- This is the **external entry point**.
- Requires an Ingress Controller (you already have the command to install the official nginx one).
- `pathType: Prefix` means any path starting with `/` will be routed to the service.
- Currently there is no host (domain) specified, so it accepts traffic for any hostname.

---

### 3. Application & Docker Layer

**Dockerfile** builds a Node.js 20 Alpine image:
- Installs dependencies from `package.json` (express + morgan)
- Copies the source code
- Exposes port 3000
- Runs `node server.js`

**server.js** behavior:
- Listens on port 3000 (or `process.env.PORT`)
- Uses Morgan for request logging
- On every `GET /` request it performs a very heavy CPU loop (sums 1 billion numbers).  
  This makes the app a good example for observing CPU limits and autoscaling later.

---

### 4. Important Observations & Potential Issues

| Area                    | Current State                          | Recommendation / Risk |
|-------------------------|----------------------------------------|-----------------------|
| Replicas                | Fixed at 2                             | Consider HorizontalPodAutoscaler (HPA) because of the heavy CPU work |
| Resource Limits         | 128Mi / 500m                           | The sum loop can easily hit the CPU limit |
| Health Checks           | None                                   | Add `livenessProbe` and `readinessProbe` |
| Image Pull Policy       | Always                                 | Change to `IfNotPresent` in production |
| Namespace               | Default                                | Better to use a dedicated namespace |
| Ingress Host            | None                                   | Add a host rule for production |
| Service Type            | ClusterIP                              | Correct for Ingress-based exposure |
| Rolling Updates         | Default strategy                       | Can customize `maxUnavailable` / `maxSurge` |

---

### 5. Useful Commands for Deeper Inspection

```bash
# See everything related to your app
kubectl get all -l app=express

# Detailed view of the Deployment
kubectl describe deployment express-deployment

# Watch Pods being created / restarted
kubectl get pods -l app=express -w

# Check resource usage (requires metrics-server)
kubectl top pods -l app=express

# View Ingress details and events
kubectl describe ingress express-ingress

# Check which endpoints the Service is currently pointing to
kubectl get endpoints express-service

# Follow logs from both replicas
kubectl logs -l app=express -f --max-log-requests=10
```

---
