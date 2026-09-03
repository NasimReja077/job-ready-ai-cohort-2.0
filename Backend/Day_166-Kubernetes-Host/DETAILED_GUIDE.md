# Complete Kubernetes Setup - Detailed Line-by-Line Explanation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Main Server Application](#main-server-application)
3. [Product Server Application](#product-server-application)
4. [Docker Files](#docker-files)
5. [Kubernetes Deployments](#kubernetes-deployments)
6. [Kubernetes Services](#kubernetes-services)
7. [Kubernetes Ingress](#kubernetes-ingress)
8. [How Everything Works Together](#how-everything-works-together)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    KUBERNETES CLUSTER                   │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │              INGRESS (nginx-controller)           │  │
│  │                                                    │  │
│  │  Routes traffic based on paths:                   │  │
│  │  - "/" → main-server-service                      │  │
│  │  - "/api/product" → product-service              │  │
│  └───────────────────────────────────────────────────┘  │
│                          ↓                               │
│  ┌─────────────────────────────────────────────────┐    │
│  │      main-server-service (ClusterIP)            │    │
│  │      Ports: 80 (external) → 3000 (pod)          │    │
│  └─────────────────────────────────────────────────┘    │
│           ↓              ↓              ↓                 │
│    ┌─────────────┬─────────────┬─────────────┐           │
│    │   Pod-1     │   Pod-2     │   Pod-3     │  (3 pods) │
│    │Main-Server  │Main-Server  │Main-Server  │           │
│    │  Port 3000  │  Port 3000  │  Port 3000  │           │
│    └─────────────┴─────────────┴─────────────┘           │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │     product-service (ClusterIP)                 │    │
│  │     Ports: 80 (external) → 8080 (pod)          │    │
│  └─────────────────────────────────────────────────┘    │
│           ↓              ↓              ↓                 │
│    ┌─────────────┬─────────────┬─────────────┐           │
│    │   Pod-1     │   Pod-2     │   Pod-3     │  (3 pods) │
│    │   Product   │   Product   │   Product   │           │
│    │  Port 8080  │  Port 8080  │  Port 8080  │           │
│    └─────────────┴─────────────┴─────────────┘           │
└─────────────────────────────────────────────────────────┘
```

---

## Main Server Application

### File: `backend/main-server/server.js`

```javascript
import express from "express";      // Line 1: Import Express framework
import morgan from "morgan";        // Line 2: Import Morgan (HTTP request logger)

const app = express();              // Line 6: Create Express app instance

app.use(morgan("dev"));             // Line 8: Enable Morgan middleware in "dev" mode
                                    //   - Logs every HTTP request
                                    //   - Shows: METHOD, PATH, STATUS CODE, RESPONSE TIME
                                    //   - Example: GET / 200 3378.716 ms - 66

app.use(express.json());            // Line 9: Enable JSON parsing middleware
                                    //   - Automatically parse incoming JSON requests
                                    //   - Makes req.body available

app.get("/", (req, res) => {        // Line 11: Define GET route for root path "/"
    let sum = 0;                    // Line 12: Initialize sum variable

    for (let i = 0; i < 1000000000; i++) {  // Line 13: Loop 1 BILLION times
        sum += i;                   // Line 14: Add each i to sum
    }
    // PURPOSE: This loop simulates CPU-intensive work
    // EFFECT: Takes ~12 seconds per request (see logs showing 12000+ ms)
    // USED FOR: Testing HPA - when CPU load increases, new pods are created

    res.status(200)                 // Line 16: Set HTTP status 200 (OK)
        .json({                     // Line 17: Send JSON response
            message: "Sum calculated successfully",
            sum
        });
});

app.listen(3000, () => {            // Line 23: Start server on port 3000
    console.log("Server is running on port 3000");
});
```

### What This Server Does

- **Purpose**: Main entry point for all requests
- **Performance**: Intentionally slow (CPU-intensive calculation)
- **Route**: `GET /` - does heavy computation on every request
- **Response**: Returns the sum and a success message
- **Port**: 3000 (internal, exposed as 80 via Service)

### Expected Behavior

```
Request arrives → Logger logs it → Heavy computation runs (~12 seconds) → Response sent
GET / 200 12000.123 ms - 66  ← Morgan log output
```

---

## Product Server Application

### File: `backend/product/server.js`

```javascript
import express from 'express';     // Line 1: Import Express framework
import morgan from 'morgan';       // Line 2: Import Morgan logger
import axios from 'axios';         // Line 3: Import Axios (HTTP client)

const app = express();             // Line 5: Create Express app instance

app.use(morgan('dev'));            // Line 7: Enable request logging
app.use(express.json());           // Line 8: Enable JSON parsing

app.get('/api/product', async (req, res) => {   // Line 11: Define async GET route
    // This is an async function because it makes an HTTP request

    const response = await axios.get("http://main-server-service/");
    // Line 12: Call main-server using Kubernetes DNS name
    //   - "main-server-service" is the Service name (DNS resolves in K8s)
    //   - Port 80 is implicit (default HTTP port)
    //   - This makes HTTP request: GET http://main-server-service/
    //   - 'await' waits for response before continuing
    //   - This pod waits for main-server response (~12 seconds)

    res.send(response.data);        // Line 13: Send the response from main-server to client
});

app.listen(8080, () => {           // Line 16: Start server on port 8080
    console.log('Server is running on port 8080');
});
```

### What This Server Does

- **Purpose**: Proxy/aggregator that calls main-server
- **Performance**: Depends on main-server (13+ seconds because it waits for main-server)
- **Route**: `GET /api/product` - makes request to main-server and returns response
- **Port**: 8080 (internal, exposed as 80 via Service)
- **DNS**: Uses Kubernetes Service DNS name (`main-server-service`)

### Request Flow

```
Client → Ingress → product-service (port 80) → Product Pod (port 8080)
    → axios.get("http://main-server-service/")
    → Ingress → main-server-service (port 80) → Main Pod (port 3000)
    → Heavy computation (12 seconds)
    → Response back through the chain (13+ seconds total)
```

---

## Docker Files

### Main Server Dockerfile: `backend/main-server/dockerfile`

```dockerfile
FROM node:20-alpine               # Line 1: Base image
                                  #   - node:20 = Node.js version 20
                                  #   - alpine = minimal Linux (only ~170MB)
                                  #   - Why Alpine? Smaller image = faster deployment

WORKDIR /app                      # Line 3: Set working directory
                                  #   - All commands run from /app
                                  #   - Files copied to /app

COPY package*.json ./             # Line 5: Copy package.json and package-lock.json
                                  #   - package*.json = matches both files (if they exist)
                                  #   - ./ = copy to /app (working directory)
                                  #   - Why separate? Speeds up builds (caching)

RUN npm install                   # Line 6: Install dependencies
                                  #   - Installs: express, morgan
                                  #   - Takes time but cached if dependencies don't change

COPY . .                          # Line 8: Copy entire project
                                  #   - First . = source (your local directory)
                                  #   - Second . = destination (/app)
                                  #   - Copies: server.js, node_modules already installed

EXPOSE 3000                       # Line 10: Document that port 3000 is used
                                  #   - Informational (doesn't actually expose)
                                  #   - Helps people know which port to use

CMD ["node", "server.js"]         # Line 12: Command to run when container starts
                                  #   - Runs: node server.js
                                  #   - This starts the Express server
```

### Product Server Dockerfile: `backend/product/dockerfile`

```dockerfile
FROM node:20-alpine               # Same as main-server

WORKDIR /app

COPY package*.json ./

RUN npm install
                                  # Main difference: dependencies include axios

COPY . .

EXPOSE 8080                       # Port 8080 (different from main-server)
                                  #   - main-server uses 3000
                                  #   - product uses 8080 (custom choice)

CMD ["node", "server.js"]         # Start the product server
```

### Docker Build Process

```
1. Read Dockerfile
2. Pull base image (node:20-alpine)
3. Create container layer
4. Set working directory (/app)
5. Copy package files
6. Run npm install
7. Copy project files
8. Build complete → image created
9. Tag image (express_host_cohort:latest or product_server:latest)
10. Ready to run in Kubernetes
```

### Build Commands (from terminal log)

```bash
# Main server build
docker build . -t express_host_cohort:latest

# Product server build
docker build . -t product_server:latest

# These create images that Kubernetes uses
```

---

## Kubernetes Deployments

### Main Server Deployment: `k8s/deployment.yml`

```yaml
apiVersion: apps/v1               # Line 1: Kubernetes API version for Deployments

kind: Deployment                  # Line 2: Resource type = Deployment
                                  #   - Deployments manage pod replicas
                                  #   - Handle rolling updates, rollbacks

metadata:
  name: express-host-deployment   # Line 4: Name of this deployment
                                  #   - Used in commands: kubectl get deployment
                                  #   - Visible in Kubernetes dashboard

spec:                             # Line 5: Deployment specification
  replicas: 3                     # Line 6: Always run 3 pod replicas
                                  #   - If pod dies → new one created
                                  #   - If you delete pod → replacement appears
                                  #   - HPA may override this (scale to 1-5)

  selector:
    matchLabels:
      app: main-server            # Line 9: Find pods with label "app: main-server"
                                  #   - Deployment manages pods with this label
                                  #   - Service uses same label to find pods

  template:                       # Line 11: Pod template (blueprint for each pod)
    metadata:
      labels:
        app: main-server          # Line 13: Label each pod as "app: main-server"
                                  #   - Deployment/Service uses this label

    spec:
      containers:                 # Line 15: Pods contain containers
      - name: main-server         # Line 16: Container name (internal identifier)

        image: express_host_cohort:latest   # Line 17: Docker image to use
                                  #   - From docker build . -t express_host_cohort:latest
                                  #   - :latest = tag (version)

        imagePullPolicy: Always   # Line 18: Always pull latest image
                                  #   - Even if local image exists
                                  #   - Ensures fresh updates

        ports:
        - containerPort: 3000     # Line 20: Pod listens on port 3000
                                  #   - Internal port inside pod

        resources:                # Line 21: Resource limits and requests
          limits:                 # Line 22: Maximum resources pod can use
            memory: "128Mi"       # Line 23: Max 128 Megabytes RAM
                                  #   - If pod exceeds → Kubernetes kills it
            cpu: "500m"           # Line 24: Max 500 millicores (0.5 CPU)
                                  #   - 1000m = 1 full CPU core
                                  #   - Pod limited to half a CPU

          requests:               # Line 25: Resources to reserve per pod
            memory: "64Mi"        # Line 26: Reserve 64MB per pod
                                  #   - 3 pods × 64Mi = 192Mi total
            cpu: "250m"           # Line 27: Reserve 0.25 CPU per pod
                                  #   - 3 pods × 250m = 750m = 0.75 CPU total
                                  #   - Kubernetes uses this for scheduling
```

### Product Deployment: `k8s/deployment-product.yml`

```yaml
apiVersion: apps/v1
kind: Deployment

metadata:
  name: product-deployment        # Different name: product-deployment

spec:
  replicas: 3

  selector:
    matchLabels:
      app: product                # Different label: app: product

  template:
    metadata:
      labels:
        app: product              # Pods labeled as "app: product"

    spec:
      containers:
      - name: product             # Container name: product

        image: product_server:latest    # Uses product Docker image

        imagePullPolicy: Always

        ports:
        - containerPort: 8080     # Product runs on port 8080
                                  #   - Different from main-server (3000)

        resources:
          limits:
            memory: "128Mi"
            cpu: "500m"
          requests:
            memory: "64Mi"
            cpu: "250m"
```

### Key Differences

| Aspect | Main-Server | Product |
|--------|-------------|---------|
| **Deployment Name** | express-host-deployment | product-deployment |
| **Image** | express_host_cohort:latest | product_server:latest |
| **Container Port** | 3000 | 8080 |
| **Pod Label** | app: main-server | app: product |
| **CPU** | 500m limit, 250m request | 500m limit, 250m request |
| **Memory** | 128Mi limit, 64Mi request | 128Mi limit, 64Mi request |

### Resource Management Explained

**Requests** = Kubernetes reserves these for scheduling
```
Main-Server: 3 pods × 250m CPU = 0.75 CPU cores reserved
             3 pods × 64Mi RAM = 192 MB reserved

Product: 3 pods × 250m CPU = 0.75 CPU cores reserved
         3 pods × 64Mi RAM = 192 MB reserved

Total: 1.5 CPU cores + 384 MB reserved
```

**Limits** = Maximum allowed (pod killed if exceeded)
```
Main-Server: 3 pods × 500m CPU = 1.5 CPU cores max
             3 pods × 128Mi RAM = 384 MB max

Product: 3 pods × 500m CPU = 1.5 CPU cores max
         3 pods × 128Mi RAM = 384 MB max

Total: 3 CPU cores max + 768 MB max
```

---

## Kubernetes Services

### Main Server Service: `k8s/service.yml`

```yaml
kind: Service                     # Line 1: Resource type = Service
                                  #   - Makes pods accessible by DNS name

apiVersion: v1                    # Line 2: API version for core resources

metadata:
  name: main-server-service       # Line 4: Service name
                                  #   - DNS name in cluster: main-server-service
                                  #   - Any pod can access via: http://main-server-service/
                                  #   - Product server uses this!

spec:
  selector:
    app: main-server              # Line 7: Route traffic to pods with this label
                                  #   - Finds pods from deployment

  type: ClusterIP                 # Line 9: Service type
                                  #   - ClusterIP: accessible only within cluster
                                  #   - No external IP (unlike LoadBalancer/NodePort)
                                  #   - Most common for internal services

  ports:
  - name: name-of-the-port        # Line 11: Port name (optional label)

    port: 80                      # Line 12: Listening port (inside Service)
                                  #   - What clients use: http://main-server-service:80/
                                  #   - Port 80 = default HTTP (can omit in URL)

    targetPort: 3000              # Line 13: Pod port (where traffic goes)
                                  #   - Service receives on port 80
                                  #   - Forwards to pod port 3000
                                  #   - Translation: 80 → 3000
```

### Product Service: `k8s/service-product.yml`

```yaml
kind: Service

apiVersion: v1

metadata:
  name: product-service           # Service name for product

spec:
  selector:
    app: product                  # Route to pods with "app: product" label

  type: ClusterIP

  ports:
  - name: product-service-port    # Named port

    port: 80                      # External port (Service listening)
                                  #   - Accessible as: http://product-service:80/

    targetPort: 8080              # Pod port (product runs here)
                                  #   - Translation: 80 → 8080
```

### Service Architecture

```
┌─────────────────────────────────────────┐
│   main-server-service (DNS)             │
│   Port 80 listening                     │
├─────────────────────────────────────────┤
│  Routes to ANY pod with:                │
│  - app: main-server label               │
├─────────────────────────────────────────┤
│         ↓        ↓        ↓              │
│  Port 3000  Port 3000  Port 3000        │
│   (Pod 1)   (Pod 2)    (Pod 3)         │
│                                         │
│  Service performs load balancing        │
│  - Round-robin by default               │
│  - Distributes traffic evenly           │
└─────────────────────────────────────────┘
```

### Why Port Mapping?

```
HTTP Standard: Port 80 = HTTP, Port 443 = HTTPS
Consistency: All services listen on 80/443 externally
Internal Flexibility: Pods can use any port (3000, 8080, 9000, etc.)

Example:
- Both services expose port 80 (standard)
- main-server pod uses 3000 internally
- product pod uses 8080 internally
- Uniform external interface, flexible internal choice
```

---

## Kubernetes Ingress

### File: `k8s/ingress.yml`

```yaml
apiVersion: networking.k8s.io/v1  # Line 1: API version for Ingress

kind: Ingress                      # Line 2: Resource type = Ingress
                                  #   - Routes external traffic to services
                                  #   - Like a reverse proxy / load balancer
                                  #   - Handles HTTP/HTTPS

metadata:
  name: express-host-app          # Line 4: Ingress name

  labels:
    app.kubernetes.io/name: express-host-app   # Line 6: Labels for organization

spec:
  ingressClassName: nginx         # Line 8: Use nginx controller
                                  #   - nginx processes these routing rules
                                  #   - Most popular Ingress controller

  rules:                          # Line 9: List of routing rules

   - http:                        # Line 10: HTTP routing rules
      paths:
      - pathType: Prefix          # Line 12: Match routes starting with this path
                                  #   - Prefix: "/" matches "/" and "/anything"
                                  #   - Exact: "/" matches only "/"

        path: "/"                 # Line 13: The path to match
                                  #   - "any URL starting with /"

        backend:                  # Line 14: Where to send traffic
          service:
            name: main-server-service   # Line 16: Service name
                                  #   - Send to main-server-service

            port:
              number: 80          # Line 18: Service port
                                  #   - Send to service's port 80
                                  #   - Service then forwards to pod port 3000

   - http:                        # Line 20: Second routing rule
      paths:
      - pathType: Prefix

        path: "/api/product"      # Line 23: The path to match
                                  #   - "any URL starting with /api/product"
                                  #   - Examples: /api/product, /api/product/12, /api/product/list

        backend:
          service:
            name: product-service # Line 26: Send to product-service

            port:
              number: 80          # Line 28: Service port
                                  #   - Service forwards to pod port 8080
```

### Ingress Routing Logic

```
Request arrives at http://localhost/

                     ↓

         Ingress checks routing rules
         
          ↙                    ↘

Does path start       Does path start
with "/"?             with "/api/product"?

Yes ↓                 Yes ↓

Send to:              Send to:
main-server-service   product-service
port 80               port 80
   ↓                     ↓
Pod port 3000        Pod port 8080
   ↓                     ↓
Heavy compute        Calls main-server
Loop (12 sec)        (13+ sec total)
```

### Routing Examples

| URL | Matched Rule | Destination | Final Port |
|-----|--------------|-------------|-----------|
| `http://localhost/` | "/" | main-server-service | 3000 |
| `http://localhost/test` | "/" | main-server-service | 3000 |
| `http://localhost/api/product` | "/api/product" | product-service | 8080 |
| `http://localhost/api/product/123` | "/api/product" | product-service | 8080 |

---

## How Everything Works Together

### Complete Request Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          EXTERNAL WORLD                             │
│                    (Your laptop / load tester)                      │
└────────────────────────────┬──────────────────────────────────────┘
                             │
                   HTTP Request to
                  http://localhost/
                             │
                             ↓
            ┌─────────────────────────────┐
            │   DOCKER DESKTOP / K8s      │
            │   Kubernetes Cluster        │
            └────────────┬────────────────┘
                         │
                         ↓
            ┌─────────────────────────────┐
            │      INGRESS (nginx)        │
            │  express-host-app           │
            │                             │
            │  Reads routing rules        │
            │  URL "/" → ???              │
            └─────────────┬───────────────┘
                          │
        Is path "/"? YES! │
                          │
                          ↓
            ┌──────────────────────────────┐
            │  main-server-service         │
            │  ClusterIP Service           │
            │  Port 80 listening           │
            │                              │
            │  Selects pods with:          │
            │  app: main-server            │
            └────────┬────────┬────────────┘
                     │        │
          ┌──────────┴─────┬──┴────────────┐
          │                │               │
          ↓                ↓               ↓
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │  Pod 1   │    │  Pod 2   │    │  Pod 3   │
    │Port 3000 │    │Port 3000 │    │Port 3000 │
    │          │    │          │    │          │
    │ Express  │    │ Express  │    │ Express  │
    │ Server   │    │ Server   │    │ Server   │
    │          │    │          │    │          │
    │ morgan   │    │ morgan   │    │ morgan   │
    │ logging  │    │ logging  │    │ logging  │
    │          │    │          │    │          │
    │ GET /    │    │ GET /    │    │ GET /    │
    │ (12 sec) │    │ (12 sec) │    │ (12 sec) │
    │          │    │          │    │          │
    │ Loop 1B  │    │ Loop 1B  │    │ Loop 1B  │
    │ times    │    │ times    │    │ times    │
    │ sum++    │    │ sum++    │    │ sum++    │
    │          │    │          │    │          │
    │ JSON     │    │ JSON     │    │ JSON     │
    │ Response │    │ Response │    │ Response │
    └──────────┘    └──────────┘    └──────────┘
         ↑                ↑               ↑
         └────────────────┼───────────────┘
                          │
                   Service load balances
                   (round-robin)
                          │
                          ↓
        ┌─────────────────────────────┐
        │   Response to Ingress       │
        │   Port 80 (Service port)    │
        └─────────────┬───────────────┘
                      │
                      ↓
        ┌─────────────────────────────┐
        │   Response to External      │
        │   Client (localhost)        │
        └─────────────────────────────┘

TOTAL TIME: ~12 seconds (main loop computation)
```

### Product Server Request Flow

```
Request: http://localhost/api/product

                    ↓

          Ingress checks path
          Is "/api/product"? YES!

                    ↓

          Route to product-service
          
                    ↓

    Product Pod (running on port 8080)
    
          ↓
    
    axios.get("http://main-server-service/")
    
    Makes HTTP request to main-server-service
    
          ↓
    
    Ingress routes to main-server-service
    
          ↓
    
    Main Server Pod computes (12 seconds)
    
          ↓
    
    Response returns to Product Pod
    
          ↓
    
    Product Pod sends response to client

TOTAL TIME: ~13+ seconds
  - 1 second: network + setup
  - 12 seconds: main server computation
```

---

## Summary Table

### Services & Routing

| Component | Type | Listen Port | Pod Port | Purpose |
|-----------|------|-------------|----------|---------|
| main-server-service | ClusterIP | 80 | 3000 | Routes to main-server pods |
| product-service | ClusterIP | 80 | 8080 | Routes to product pods |
| Ingress | HTTP Router | N/A | N/A | Routes external traffic by path |

### Deployments & Replicas

| Deployment | Pods | Image | Port | CPU | Memory | Purpose |
|------------|------|-------|------|-----|--------|---------|
| express-host | 3 | express_host_cohort:latest | 3000 | 500m | 128Mi | Heavy computation |
| product | 3 | product_server:latest | 8080 | 500m | 128Mi | Proxy to main-server |

### Ports Summary

```
External (Internet)
    ↓
Ingress (HTTP Router)
    ↓
Services (80)
    ├→ main-server-service → Pod Port 3000
    └→ product-service → Pod Port 8080
```

---

## Command Reference

### View Everything

```bash
# See all deployments
kubectl get deployments

# See all pods
kubectl get pods

# See all services
kubectl get services

# See ingress rules
kubectl get ingress

# See specific deployment details
kubectl describe deployment express-host-deployment
kubectl describe deployment product-deployment

# See service details
kubectl describe service main-server-service
kubectl describe service product-service

# See ingress rules
kubectl describe ingress express-host-app
```

### Monitor During Testing

```bash
# Watch pods being created/destroyed
kubectl top pods --watch

# Follow logs from main-server
kubectl logs deployment/express-host-deployment -f

# Follow logs from product
kubectl logs deployment/product-deployment -f

# Test the services
curl http://localhost/
curl http://localhost/api/product

# Run load test
npx autocannon -c 200 -d 120 http://localhost
```

### Understanding the Output

```
NAME                                       CPU(cores)   MEMORY(bytes)
express-host-deployment-774c7dfcd5-jk8zx   501m         23Mi
  └─ Pod name: express-host-deployment-774c7dfcd5-jk8zx
  └─ CPU: 501 millicores (half a core)
  └─ Memory: 23 megabytes

product-deployment-58d5867c66-c2frl        1m           22Mi
  └─ Pod name: product-deployment-58d5867c66-c2frl
  └─ CPU: 1 millicore (very little, waiting for main-server)
  └─ Memory: 22 megabytes
```

---

## Why This Architecture?

### Problems Solved

| Problem | Solution | Component |
|---------|----------|-----------|
| Multiple servers need routing | HTTP routing by path | Ingress |
| Pods fail randomly | Auto-restart pods | Deployment spec (replicas) |
| Need to distribute load | Round-robin load balancing | Service |
| Resource limits needed | CPU/Memory limits | Pod resources spec |
| Different ports per app | Port mapping | Service port→targetPort |
| Need DNS names in cluster | Kubernetes DNS | Service creates DNS |
| Want internal-only access | ClusterIP service type | Service type selection |

### Production Benefits

✅ **High Availability**: Multiple pod replicas survive failures  
✅ **Auto-Scaling**: HPA adds pods during high load  
✅ **Load Balancing**: Service distributes traffic evenly  
✅ **Resource Isolation**: Pod limits prevent one service hogging resources  
✅ **Easy Deployment**: Update image, Kubernetes handles rolling updates  
✅ **Monitoring**: Real-time metrics for performance tuning  
✅ **Rollback**: Easy revert to previous versions  

---

## Key Takeaways

1. **Ingress** = Door to the cluster (routes by URL path)
2. **Service** = Stable DNS name + load balancer (routes to pods)
3. **Deployment** = Pod factory (creates and manages replicas)
4. **Pods** = Running containers (actual applications)
5. **Docker Images** = Frozen app snapshots
6. **Port Mapping** = Service translates external to internal ports
7. **Labels** = Tags to organize and select resources
8. **Resources** = CPU/Memory requests and limits

---

## Next Steps

To understand this better:
1. Run `kubectl get all` - see all resources
2. Run `kubectl describe deployment express-host-deployment` - see full details
3. Watch logs: `kubectl logs deployment/express-host-deployment -f`
4. Run load test: `npx autocannon -c 200 -d 120 http://localhost`
5. Monitor: `while ($true) { kubectl top pods; Start-Sleep -Seconds 2; Clear-Host }`
