import { k8sCoreV1Api } from "./config.js";

export async function createPod(sandboxId) {

    const podManifest = {
        apiVersion: 'v1',
        kind: 'Pod',
        metadata: {
            name: `sandbox-pod-${sandboxId}`,
            labels: {
                app: 'sandbox',
                sandboxId: sandboxId
            }
        },
        spec: {
            // # volumes it is used to share data between containers in the same pod. In this case, we are using an emptyDir volume to share the workspace between the template and agent containers.
            volumes:[
                {
                    name: "workspace-volume",
                    emptyDir: {}
                }
            ],
            initContainers: [ // init container is used to copy the workspace from the template image to the shared volume. This ensures that the agent container has access to the workspace files.
                {
                    name: 'init-container',
                    image: "template",
                    imagePullPolicy: "IfNotPresent",
                    command: ['sh', '-c', 'cp -r /workspace/. /seed/'], // copy the workspace from the template image to the shared volume
                    volumeMounts: [
                        {
                            name: 'workspace-volume',
                            mountPath: '/seed'
                        }
                    ]
                }
            ],
            containers: [
                {
                    image: "template",
                    imagePullPolicy: "IfNotPresent",
                    name: 'sandbox-container',
                    ports: [ { containerPort: 5173, name: "http" } ],
                    resources: {
                        limits: { cpu: "500m", memory: "1Gi" },
                        requests: { cpu: "250m", memory: "500Mi" }
                    },
                    volumeMounts: [
                        {
                            name: 'workspace-volume',
                            mountPath: '/workspace'
                        }
                    ]
                },
                {
                    image: "agent",
                    imagePullPolicy: "IfNotPresent",
                    name: 'agent-container',
                    ports: [ { containerPort: 3000, name: "http" } ],
                    resources: {
                        limits: { cpu: "500m", memory: "1Gi" },
                        requests: { cpu: "250m", memory: "500Mi" }
                    },
                    volumeMounts: [
                        {
                            name: 'workspace-volume',
                            mountPath: '/workspace'
                        }
                    ]
                }
            ]
        }
    }

    const response = await k8sCoreV1Api.createNamespacedPod({
        namespace: 'default',
        body: podManifest
    })

    return response;
}