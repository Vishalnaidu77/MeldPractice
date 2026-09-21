import { k8sCoreApi } from "./config.js";

export async function createService(sandboxId) {
    const serviceManifest = {
        metadata: {
            name: `sandbox-service-${sandboxId}`,
            labels: {
                app: 'sandbox', 
                sandboxId: sandboxId
            }
        },
        spec: {
            type: 'ClusterIP',
            selector: {
                app: 'sandbox',
                sandboxId: sandboxId
            },
            ports: [
                {
                    port: 80,
                    targetPort: 5173,
                    name: 'http',
                    protocol: "TCP"
                },
                {
                    port: 8000,
                    targetPort: 8000,
                    name: 'agent-http',
                    protocol: "TCP"
                },
            ]
        }
    };

    try {
        const response = await k8sCoreApi.createNamespacedService({
            namespace: "default",
            body: serviceManifest
        });
        return response;
    } catch (error) {
        console.error("Error creating service:", error);
        throw error;
    }
}