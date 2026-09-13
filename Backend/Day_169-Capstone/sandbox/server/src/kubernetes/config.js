import * as K8sApi from '@kubernetes/client-node';

const kc = new K8sApi.KubeConfig();

try {
    kc.loadFromDefault();
} catch (err) {
    console.error('Failed to load Kubernetes config:', err.message);
}

export const k8sCoreV1Api = kc.makeApiClient(K8sApi.CoreV1Api);