# Skaffold + MERN Microservices Tutorial

This project shows how to run a small Node.js microservice app in Docker Desktop Kubernetes using Skaffold for fast local development.

The setup includes:

- `core` service
- `notification` service
- Kubernetes Deployments and Services
- Ingress routing
- File sync for instant local development feedback

---

## 1. What is Skaffold?

Skaffold is a command-line tool that helps developers build, deploy, and develop Kubernetes apps faster.

Instead of manually running commands like:

```bash
docker build
kubectl apply -f k8s/
```

Skaffold does it automatically while watching your source code for changes.

It can:

- build Docker images
- apply Kubernetes manifests
- port-forward services
- sync changed files directly into running containers
- rebuild only when needed

---

## 2. Project Architecture

This workspace has the following structure:

```text
mern-app/
├── skaffold.yaml
├── core/
│   ├── dockerfile
│   ├── nodemon.json
│   ├── package.json
│   └── src/
│       └── index.js
├── notification/
│   ├── dockerfile
│   ├── nodemon.json
│   ├── package.json
│   └── src/
│       └── index.js
└── k8s/
    ├── core-deployment.yml
    ├── core-service.yml
    ├── notification-deployment.yml
    ├── notification-service.yml
    └── ingress.yml
```

### Core service

The `core` service is a simple Express app:

```js
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.get('/number', (req, res) => {
  const randomNumber = Math.floor(Math.random() * 100) + 1;
  res.json({ number: randomNumber });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

### Notification service

The `notification` service returns JSON data and health status:

```js
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({
    service: 'notification',
    message: 'Hello from Notification Service!',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Notification service running on port ${PORT}`);
});
```

---

## 3. Prerequisites

Before running Skaffold, make sure you have:

- Docker Desktop installed
- Kubernetes enabled in Docker Desktop
- `kubectl` installed
- `skaffold` installed

### Verify Docker and K8s

```bash
kubectl config use-context docker-desktop
kubectl get nodes
```

You should see something like:

```text
NAME             STATUS   ROLES   AGE   VERSION
docker-desktop   Ready    control-plane  ...
```

---

## 4. Install Skaffold

### Windows with Chocolatey

```bash
choco install skaffold
```

### Verify installation

```bash
skaffold version
```

---

## 5. Install NGINX Ingress Controller

For local ingress routing, we install the NGINX Ingress controller:

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.0/deploy/static/provider/cloud/deploy.yaml

kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=90s
```

This gives us an ingress resource that can route requests into the cluster.

---

## 6. Kubernetes Manifests

The project uses several YAML files in `mern-app/k8s`.

### Core deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: core-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app: core
  template:
    metadata:
      labels:
        app: core
    spec:
      containers:
      - name: core
        image: core:latest
        imagePullPolicy: IfNotPresent
        ports:
          - containerPort: 3000
```

### Core service

```yaml
kind: Service
apiVersion: v1
metadata:
  name: core-service
spec:
  selector:
    app: core
  type: ClusterIP
  ports:
  - name: core-port
    port: 80
    targetPort: 3000
```

### Notification deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: notification-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: notification
  template:
    metadata:
      labels:
        app: notification
    spec:
      containers:
        - name: notification
          image: notification:latest
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 3000
```

### Notification service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: notification-service
spec:
  selector:
    app: notification
  type: ClusterIP
  ports:
    - name: notification-port
      port: 80
      targetPort: 3000
```

### Ingress configuration

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: queue-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
    - http:
        paths:
          - pathType: Prefix
            path: "/"
            backend:
              service:
                name: core-service
                port:
                  number: 80

          - pathType: Prefix
            path: "/api/notification"
            backend:
              service:
                name: notification-service
                port:
                  number: 80
```

This means:

- `/` goes to the `core` service
- `/api/notification` goes to the `notification` service

---

## 7. Skaffold Configuration

The actual Skaffold config is in `mern-app/skaffold.yaml`:

```yaml
apiVersion: skaffold/v4beta13
kind: Config
metadata:
  name: mern-app

build:
  local:
    push: false
  artifacts:
    - image: core
      context: core
      docker:
        dockerfile: dockerfile
      sync:
        manual:
          - src: '**/*.js'
            dest: /app
          - src: '**/*.json'
            dest: /app

    - image: notification
      context: notification
      docker:
        dockerfile: dockerfile
      sync:
        manual:
          - src: '**/*.js'
            dest: /app
          - src: '**/*.json'
            dest: /app

manifests:
  rawYaml:
    - k8s/core-deployment.yml
    - k8s/notification-deployment.yml
    - k8s/core-service.yml
    - k8s/notification-service.yml
    - k8s/ingress.yml

portForward:
  - resourceType: service
    resourceName: core-service
    port: 80
    localPort: 3000
  - resourceType: service
    resourceName: notification-service
    port: 80
    localPort: 4000
```

### What this config does

1. Builds two Docker images: `core` and `notification`
2. Uses local Docker build with `push: false`
3. Watches JavaScript and JSON files for quick sync
4. Applies the Kubernetes YAML files automatically
5. Forwards `core-service` to `localhost:3000`
6. Forwards `notification-service` to `localhost:4000`

---

## 8. Why `sync` is important

Skaffold supports file synchronization so you don't have to rebuild the whole image every time a file changes.

This is very useful for development.

```yaml
sync:
  manual:
    - src: '**/*.js'
      dest: /app
    - src: '**/*.json'
      dest: /app
```

This means:

- if a JavaScript file changes
- Skaffold copies the new version into the container
- your Node app can restart with nodemon
- your app reflects changes much faster

This is better than rebuilding everything on every simple change.

---

## 9. Dockerfiles

The app uses simple Node-based Dockerfiles.

### Core Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]
```

### Notification Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]
```

These Dockerfiles are designed to run the project in Kubernetes while keeping the dev workflow lightweight and fast.

---

## 10. Package Setup

Each service has a package config like this:

```json
{
  "name": "core",
  "version": "1.0.0",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "express": "^5.2.1",
    "express-validator": "^7.3.2",
    "nodemon": "^3.1.14"
  }
}
```

This is enough for a quick Express API service in local Kubernetes development.

---

## 11. Start the project with Skaffold

From the project root:

```bash
cd mern-app
skaffold dev
```

This will:

- build the images
- deploy Kubernetes resources
- start the watch loop
- keep monitoring file changes

### Useful commands

```bash
skaffold dev
skaffold dev --tail
skaffold dev --verbosity=info
skaffold build
skaffold delete
skaffold render
```

### With logs enabled

```bash
skaffold dev --tail
```

This streams logs from the running pods so you can see what is happening in real time.

---

## 12. Check running resources

After `skaffold dev` starts successfully, use:

```bash
kubectl get pods
kubectl get services
kubectl get ingress
```

You should see pods for `core` and `notification`, plus the ingress resource.

---

## 13. Access the app

Because of the port forwarding configured in `skaffold.yaml`:

- `http://localhost:3000` → `core` service
- `http://localhost:4000` → `notification` service

And through ingress:

- `http://localhost/` → `core` service
- `http://localhost/api/notification` → `notification` service

Example requests:

```bash
curl http://localhost:3000/
curl http://localhost:3000/number
curl http://localhost:4000/health
curl http://localhost/api/notification
```

---

## 14. Debugging and Troubleshooting

### Check pods

```bash
kubectl get pods
kubectl describe pod <pod-name>
```

### View logs

```bash
kubectl logs -f deploy/core-deployment
kubectl logs -f deploy/notification-deployment
```

### Exec into a running container

```bash
kubectl exec -it deploy/core-deployment -- /bin/sh
```

### Delete all deployed resources

```bash
skaffold delete
```

---

## 15. Common Issues

### 1. Kubernetes context is wrong

```bash
kubectl config use-context docker-desktop
```

### 2. Ingress not ready

Make sure the ingress controller is installed and the cluster is running.

### 3. App not updating on file save

Check that:

- `sync` paths are correct
- file patterns match your source structure
- nodemon is running in the container

### 4. Port is blocked

If `localhost:3000` or `localhost:4000` is not working:

```bash
kubectl get svc
```

and confirm the services exist and are mapped to the right ports.

---

## 16. Summary

This project demonstrates a clean local development flow with Skaffold:

- multiple microservices
- Docker-based builds
- Kubernetes deployments
- service discovery and ingress routing
- fast file sync during development

This is a great pattern for building and testing small backend systems locally before moving to full cloud deployment.

---

## 17. Final Quick Start

```bash
cd mern-app
kubectl config use-context docker-desktop
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.0/deploy/static/provider/cloud/deploy.yaml
skaffold dev --tail
```

Then open:

```text
http://localhost:3000
http://localhost:4000
http://localhost/api/notification
```

This is the complete local microservices workflow for this project.

---

## 18. Notes

This setup is intentionally simple and beginner-friendly. It is ideal for learning:

- Skaffold basics
- local Kubernetes workflow
- Dockerized multi-service apps
- service-to-service routing
- live file sync for Node.js development

If you want, this same project can later be extended with:

- environment variables
- MongoDB
- Redis
- Docker Compose
- production Kubernetes deployment
- CI/CD pipelines
