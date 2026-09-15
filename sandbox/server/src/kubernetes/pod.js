import { k8sCoreApi } from "./config.js";

export async function createPod(sandboxId){
    const podManifest = {
        metadata: {
            name: `sandbox-pod-${sandboxId}`,
            labels: {
                app: 'sandbox',
                sandboxId: sandboxId
            }
        },
        spec: {
            containers: [
                {
                    name: `sandbox-container`,
                    image: "template",
                    imagePullPolicy: "IfNotPresent",
                    ports: [{ containerPort: 5173,  name: 'http' }],
                    resources: [
                        {
                            limits: { cpu: "500m", memory: "512Mi" },
                            requests: { cpu: "250m", memory: "256Mi" }
                        }
                    ]
                }
            ],
        },
    };

    try {
        const response = await k8sCoreApi.createNamespacedPod({
            namespace: "default",
            body: podManifest
        });
        return response;
    } catch (error) {
        console.error("Error creating pod:", error);
        throw error;
    }
}