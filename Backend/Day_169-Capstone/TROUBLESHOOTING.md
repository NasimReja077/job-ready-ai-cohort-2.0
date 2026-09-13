# Sandbox Troubleshooting Guide

This document records the problems found while running the sandbox project with Docker and Kubernetes, how they were diagnosed, and the commands used to fix them.

## Project Flow

The request flow is:

```text
Postman/browser
    -> localhost:80
    -> NGINX Ingress Controller
    -> sandbox-service:80
    -> sandbox-deployment pod:3000
```

The sandbox server exposes these routes:

- `GET /api/sandbox/livez` - Kubernetes liveness probe
- `GET /api/sandbox/health` - Kubernetes readiness and health endpoint
- `POST /api/sandbox/start` - Creates a sandbox pod and service

## Problem 1: Sandbox Pod Crashed

### Error shown

The pod logs showed:

```text
TypeError: webidl.util.markAsUncloneable is not a function

Node.js v20.20.2
```

The crash occurred while loading `undici`, which is imported by `@kubernetes/client-node`.

### Cause

The server package resolved `undici@8.10.2`. That version requires Node `>=22.19.0`, but the Docker image used:

```dockerfile
FROM node:20-alpine
```

Node 20 was incompatible with the resolved `undici` version. Because the process crashed before Express started, Kubernetes could not access the liveness or readiness routes.

### Fix

Change `sandbox/server/dockerfile` to:

```dockerfile
FROM node:22-alpine
```

The deployment uses the explicit image tag `sandbox:node22` so Kubernetes does not reuse an old `sandbox:latest` image.

### Rebuild the image

Run from the repository root:

```powershell
docker build -t sandbox:node22 .\sandbox\server
```

Verify the Node version inside the image:

```powershell
docker run --rm sandbox:node22 node --version
```

Expected result:

```text
v22.x.x
```

## Problem 2: Kubernetes Used the Old Image

### Symptom

The Docker image was rebuilt, but Kubernetes continued to show:

```text
Node.js v20.20.2
```

### Cause

The deployment used:

```yaml
image: sandbox:latest
imagePullPolicy: IfNotPresent
```

With the `latest` tag and `IfNotPresent`, Kubernetes can use a cached old image. Rebuilding the local Docker image does not guarantee that the existing pod will use it.

### Fix

Use a unique image tag in `k8s/sandbox-deployment.yml`:

```yaml
image: sandbox:node22
imagePullPolicy: IfNotPresent
```

Apply the deployment:

```powershell
kubectl apply -f .\k8s\sandbox-deployment.yml
```

Check which image the deployment uses:

```powershell
kubectl get deployment sandbox-deployment -o jsonpath="{.spec.template.spec.containers[0].image}{'\n'}"
```

Expected result:

```text
sandbox:node22
```

Check the pod:

```powershell
kubectl get pods -l app=sandbox
kubectl logs deployment/sandbox-deployment --tail=40
```

The logs should show the server starting without the `undici` error.

## Problem 3: Liveness and Readiness Failed

### Cause

The probe configuration was not the root problem. The Node process crashed before port `3000` was available.

The configured probes are:

```yaml
livenessProbe:
  httpGet:
    path: /api/sandbox/livez
    port: 3000

readinessProbe:
  httpGet:
    path: /api/sandbox/health
    port: 3000
```

These routes are correctly registered in `sandbox/server/src/app.js`.

### Verify probe responses directly

```powershell
kubectl logs deployment/sandbox-deployment --tail=40
```

Successful logs contain requests such as:

```text
GET /api/sandbox/livez 200
GET /api/sandbox/health 200
```

Check readiness:

```powershell
kubectl get pods -l app=sandbox
```

Expected result:

```text
READY   STATUS
1/1     Running
```

## Problem 4: Localhost Returned a Connection Error

### Symptom

These URLs did not work:

```text
http://localhost/api/sandbox/health
http://localhost/api/sandbox/start
```

The request failed because nothing was listening on `localhost:80`.

### Cause

The Kubernetes Ingress resource existed, but an NGINX Ingress Controller was not installed. An Ingress manifest only defines routing rules; it does not create the controller that receives external HTTP traffic.

Check for an ingress controller:

```powershell
kubectl get pods -A | Select-String -Pattern 'ingress|nginx'
kubectl get svc -A | Select-String -Pattern 'ingress|nginx'
```

If no controller is listed, install one:

```powershell
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml
```

Wait until the controller is ready:

```powershell
kubectl wait --namespace ingress-nginx `
  --for=condition=ready pod `
  --selector=app.kubernetes.io/component=controller `
  --timeout=120s
```

Reapply the Ingress:

```powershell
kubectl apply -f .\k8s\ingress.yml
kubectl get ingress codespace-ingress
```

The Ingress should eventually show an address or become reachable through Docker Desktop's Kubernetes networking.

## Temporary Test Without Ingress

To test the sandbox server and Service independently of Ingress, use port-forwarding:

```powershell
kubectl port-forward service/sandbox-service 8080:80
```

In another terminal:

```powershell
Invoke-WebRequest -UseBasicParsing http://localhost:8080/api/sandbox/health
```

Expected response status:

```text
200
```

This proves the sandbox pod and Service work even if external Ingress routing is not ready.

## Problem 5: `/start` Returned 404

### Symptom

Postman or the browser showed:

```text
Cannot GET /api/sandbox/start
```

### Cause

The route is defined as a `POST` route, not a `GET` route:

```javascript
app.post('/api/sandbox/start', async (req, res) => {
```

A browser address bar always sends a `GET` request, so opening this URL in a browser returns 404.

### Correct Postman request

```text
POST http://localhost/api/sandbox/start
```

Use a JSON body:

```json
{}
```

In Postman:

1. Select method `POST`.
2. Use URL `http://localhost/api/sandbox/start`.
3. Select `Body` -> `raw` -> `JSON`.
4. Send `{}`.

Expected response status: `201 Created`.

Expected response shape:

```json
{
  "message": "Sandbox environment created successfully",
  "sandboxId": "generated-uuid",
  "previewUrl": "http://generated-uuid.preview.localhost"
}
```

## Final Verification Checklist

Run these checks from the repository root:

```powershell
kubectl get deployment sandbox-deployment
kubectl get pods -l app=sandbox
kubectl get endpoints sandbox-service
kubectl get ingress codespace-ingress
```

The expected sandbox state is:

```text
Deployment READY: 1/1
Pod READY: 1/1
Pod STATUS: Running
sandbox-service: an endpoint on port 3000
```

Then test the API:

```text
GET  http://localhost/api/sandbox/health
POST http://localhost/api/sandbox/start
```

If Ingress is not available yet, use:

```text
GET  http://localhost:8080/api/sandbox/health
POST http://localhost:8080/api/sandbox/start
```

## Important Lessons


## Debugging Commands Runbook

Run these commands from the repository root unless a different directory is shown.

### Quick Status Check

```powershell
kubectl get nodes
kubectl get namespaces
kubectl get all
kubectl get all -A
kubectl get events --sort-by=.lastTimestamp
```

### Check Deployments and Pods

```powershell
kubectl get deployments
kubectl get deployment sandbox-deployment -o wide
kubectl describe deployment sandbox-deployment
kubectl get pods -l app=sandbox -o wide
kubectl get pods -l app=sandbox --show-labels
kubectl describe pod <sandbox-pod-name>
kubectl get pod <sandbox-pod-name> -o yaml
```

Useful pod status fields:

```powershell
kubectl get pods -l app=sandbox `
  -o custom-columns=NAME:.metadata.name,READY:.status.containerStatuses[*].ready,STATUS:.status.phase,RESTARTS:.status.containerStatuses[*].restartCount,IMAGE:.spec.containers[*].image
```

### Read Logs

```powershell
kubectl logs deployment/sandbox-deployment
kubectl logs deployment/sandbox-deployment --tail=50
kubectl logs deployment/sandbox-deployment -f
kubectl logs <sandbox-pod-name> --tail=100
kubectl logs <sandbox-pod-name> --previous
kubectl logs <sandbox-pod-name> -c main-sandbox-container
```

Use `--previous` when the container has restarted and the current logs no longer contain the original crash.

For the router:

```powershell
kubectl logs deployment/router-deployment --tail=100
kubectl logs deployment/router-deployment -f
```

### Check Images and Runtime Versions

```powershell
docker images
docker image inspect sandbox:node22
docker run --rm sandbox:node22 node --version
docker run --rm sandbox:node22 npm --version
docker history sandbox:node22
```

Build and test the sandbox image:

```powershell
docker build --no-cache -t sandbox:node22 .\sandbox\server
docker run --rm sandbox:node22 node --version
```

Check the image and command used by Kubernetes:

```powershell
kubectl get deployment sandbox-deployment `
  -o jsonpath="{.spec.template.spec.containers[0].image}{'\n'}"
kubectl get pod <sandbox-pod-name> `
  -o jsonpath="{.spec.containers[0].image}{'\n'}"
```

### Check Services and Endpoints

```powershell
kubectl get services
kubectl get service sandbox-service -o wide
kubectl describe service sandbox-service
kubectl get endpoints sandbox-service
kubectl get endpointslices -l kubernetes.io/service-name=sandbox-service
```

If `ENDPOINTS` is empty, the Service selector does not match a ready pod or the pod is not ready.

Check the labels and selectors:

```powershell
kubectl get pods --show-labels
kubectl get service sandbox-service -o yaml
```

### Test Inside the Cluster

Start a temporary curl pod:

```powershell
kubectl run debug-curl --rm -it --restart=Never `
  --image=curlimages/curl -- sh
```

Then run inside the temporary pod:

```sh
curl -i http://sandbox-service/api/sandbox/health
curl -i -X POST http://sandbox-service/api/sandbox/start `
  -H "Content-Type: application/json" -d '{}'
exit
```

A one-command health check is also possible:

```powershell
kubectl run sandbox-curl --rm -i --restart=Never `
  --image=curlimages/curl --command -- `
  curl -sS -i http://sandbox-service/api/sandbox/health
```

### Test with Port-Forwarding

Expose the Service locally:

```powershell
kubectl port-forward service/sandbox-service 8080:80
```

In another PowerShell terminal:

```powershell
Invoke-WebRequest -UseBasicParsing http://localhost:8080/api/sandbox/health
Invoke-WebRequest -UseBasicParsing -Method POST `
  -ContentType "application/json" -Body '{}' `
  http://localhost:8080/api/sandbox/start
```

Test the pod directly when the Service is suspicious:

```powershell
kubectl port-forward pod/<sandbox-pod-name> 8080:3000
Invoke-WebRequest -UseBasicParsing http://localhost:8080/api/sandbox/health
```

### Check Probes

```powershell
kubectl describe pod <sandbox-pod-name>
kubectl get events --field-selector involvedObject.name=<sandbox-pod-name> `
  --sort-by=.lastTimestamp
```

Look for these messages:

```text
Liveness probe failed
Readiness probe failed
Back-off restarting failed container
```

Confirm the probe configuration:

```powershell
kubectl get deployment sandbox-deployment `
  -o jsonpath="{.spec.template.spec.containers[0].livenessProbe}{'\n'}"
kubectl get deployment sandbox-deployment `
  -o jsonpath="{.spec.template.spec.containers[0].readinessProbe}{'\n'}"
```

### Check Ingress

```powershell
kubectl get ingress
kubectl get ingress codespace-ingress -o wide
kubectl describe ingress codespace-ingress
kubectl get ingressclass
kubectl get pods -A | Select-String -Pattern "ingress|nginx"
kubectl get services -A | Select-String -Pattern "ingress|nginx"
```

Check the Ingress Controller logs when it is installed:

```powershell
kubectl logs -n ingress-nginx `
  -l app.kubernetes.io/component=controller --tail=100
```

Test the host and path from PowerShell:

```powershell
Invoke-WebRequest -UseBasicParsing `
  -Headers @{ Host = "localhost" } `
  http://localhost/api/sandbox/health
```

For preview traffic, replace the Host value with the generated preview hostname:

```powershell
Invoke-WebRequest -UseBasicParsing `
  -Headers @{ Host = "<sandbox-id>.preview.localhost" } `
  http://localhost/
```

### Check Local Ports

```powershell
Test-NetConnection localhost -Port 80
Test-NetConnection localhost -Port 8080
Get-NetTCPConnection -LocalPort 80 -ErrorAction SilentlyContinue
Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
```

If port 80 is closed but port-forwarding works on 8080, the application is healthy and the problem is Ingress or host exposure.

### Test API Methods Correctly

`/api/sandbox/start` is a `POST` route. Test both methods explicitly:

```powershell
try {
  Invoke-WebRequest -UseBasicParsing `
    -Method GET http://localhost/api/sandbox/start
} catch {
  $_.Exception.Response.StatusCode.value__
}

Invoke-WebRequest -UseBasicParsing `
  -Method POST `
  -ContentType "application/json" `
  -Body '{}' `
  http://localhost/api/sandbox/start
```

Expected results:

- `GET /api/sandbox/start` returns `404` because no GET route exists.
- `POST /api/sandbox/start` returns `201` when routing and Kubernetes API access work.

### Inspect Kubernetes YAML

```powershell
kubectl get deployment sandbox-deployment -o yaml
kubectl get service sandbox-service -o yaml
kubectl get ingress codespace-ingress -o yaml
kubectl diff -f .\k8s\sandbox-deployment.yml
kubectl apply --dry-run=client -f .\k8s\sandbox-deployment.yml
```

Apply all project manifests when needed:

```powershell
kubectl apply -f .\k8s\rbac.yml
kubectl apply -f .\k8s\sandbox-deployment.yml
kubectl apply -f .\k8s\sandbox.service.yml
kubectl apply -f .\k8s\router-deployment.yml
kubectl apply -f .\k8s\router-service.yml
kubectl apply -f .\k8s\ingress.yml
```

### Rollout and Cleanup

```powershell
kubectl rollout status deployment/sandbox-deployment --timeout=120s
kubectl rollout history deployment/sandbox-deployment
kubectl rollout restart deployment/sandbox-deployment
kubectl delete pod -l app=sandbox
kubectl delete pod <sandbox-pod-name>
```

Use this only when you need to remove dynamically created sandbox resources:

```powershell
kubectl get pods -l app=sandbox
kubectl get services -l app=sandbox
kubectl delete pods,services -l app=sandbox
```

### Check Kubernetes Permissions

The sandbox deployment uses the `resource-manager` ServiceAccount. Check its permissions:

```powershell
kubectl get serviceaccount resource-manager
kubectl get role,rolebinding
kubectl describe role resource-manager
kubectl describe rolebinding resource-manager
kubectl auth can-i create pods --as=system:serviceaccount:default:resource-manager
kubectl auth can-i create services --as=system:serviceaccount:default:resource-manager
```

If `POST /api/sandbox/start` returns `500`, inspect the sandbox logs while sending the request:

```powershell
kubectl logs deployment/sandbox-deployment -f
```

### Docker Cleanup

```powershell
docker ps -a
docker images
docker logs <container-name>
docker inspect <container-name>
docker rm -f <container-name>
docker system df
```

Avoid `docker system prune` unless you intentionally want to remove unused images, containers, networks, and build cache.
