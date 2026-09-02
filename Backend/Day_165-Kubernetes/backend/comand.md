# Kubernetes learning commands

## Check prerequisites

Use Docker Desktop with Kubernetes enabled. Run these commands from the
`Day_165-Kubernetes` folder:

```powershell
docker version
kubectl version --client
kubectl config current-context
kubectl get nodes
```

The current Docker Desktop context should be `docker-desktop`.

## Build and test the image locally

Run these commands from the `backend` folder:

```powershell
docker build -t cohort_kuber_express:latest .
docker run --rm -p 3001:3000 -e CPU_ITERATIONS=100000 cohort_kuber_express:latest
```

Open `http://localhost:3001` in a browser. Health endpoints:

```text
http://localhost:3001/healthz
http://localhost:3001/readyz
```

Press `Ctrl+C` to stop the local container. Port `3001` avoids conflicts
with another process using host port `3000`.

Useful Docker commands:

```powershell
docker ps
docker ps -a
docker images
docker logs <container-id>
docker stop <container-id>
docker rm <container-id>
```

Use a current ID from `docker ps -a`; old container IDs may no longer exist.

## Install the ingress controller

PowerShell does not use `\` for line continuation. Run the URL on one line:

```powershell
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.12.1/deploy/static/provider/cloud/deploy.yaml
kubectl get pods -n ingress-nginx
kubectl get service -n ingress-nginx
```

Wait until the controller pod shows `1/1 Running`.

## Deploy the application

Run these commands from the `Day_165-Kubernetes` folder:

```powershell
kubectl apply -f .\k8s\deployment.yml
kubectl apply -f .\k8s\service.yml
kubectl apply -f .\k8s\ingress.yml
```

Check the resources:

```powershell
kubectl get deployments
kubectl get pods -o wide
kubectl get services
kubectl get ingress
```

The deployment creates two replicas. The service exposes port `80` inside
the cluster and forwards traffic to the container on port `3000`.

## Test the application

Forward the service to your computer:

```powershell
kubectl port-forward service/express-service 3000:80
```

In another PowerShell window:

```powershell
Invoke-WebRequest http://localhost:3000/healthz
Invoke-WebRequest http://localhost:3000/readyz
Invoke-WebRequest http://localhost:3000/
```

Stop port forwarding with `Ctrl+C`.

## Scale and generate load

```powershell
kubectl scale deployment express-deployment --replicas=5
kubectl get pods -w
```

Press `Ctrl+C` to stop watching. Generate requests in another window:

```powershell
1..20 | ForEach-Object { Invoke-WebRequest http://localhost:3000/ | Out-Null }
```

Observe usage and events:

```powershell
kubectl top pods
kubectl describe deployment express-deployment
kubectl get events --sort-by=.lastTimestamp
```

`kubectl top pods` requires Metrics Server. If unavailable, use
`kubectl describe` and Docker Desktop resource metrics.

Return to two replicas:

```powershell
kubectl scale deployment express-deployment --replicas=2
```

## Troubleshooting

```powershell
kubectl describe pod <pod-name>
kubectl logs deployment/express-deployment
kubectl get endpoints express-service
kubectl describe ingress express-ingress
```

If a pod is stuck in `ImagePullBackOff` with the local image, change
`imagePullPolicy` in `k8s/deployment.yml` from `Always` to `IfNotPresent`:

```powershell
kubectl apply -f .\k8s\deployment.yml
```

## Clean up

```powershell
kubectl delete -f .\k8s\ingress.yml
kubectl delete -f .\k8s\service.yml
kubectl delete -f .\k8s\deployment.yml
```