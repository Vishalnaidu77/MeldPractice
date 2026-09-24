import e from "express";
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
            volumes: [
                {
                    name: "workspace-volume",
                    emptyDir: {}
                }
            ],
            initContainers: [
                {
                    name: "init-container",
                    image: "sandbox-template:latest",
                    imagePullPolicy: "IfNotPresent",
                    command: ["sh", "-c", "cp -r /workspace/. /seed/"],
                    volumeMounts: [
                        {
                            name: "workspace-volume",
                            mountPath: "/seed"
                        }
                    ]
                }
            ],
            containers: [
                {
                    name: `sandbox-container`,
                    // Keep this distinct from the API image (`sandbox-practice`).
                    // The generic `template` tag can easily point at an image built
                    // from the wrong Docker build context.
                    image: "sandbox-template:latest",
                    imagePullPolicy: "IfNotPresent",
                    ports: [{ containerPort: 5173,  name: 'http' }],
                    resources: {
                        limits: { cpu: "500m", memory: "512Mi" },
                        requests: { cpu: "250m", memory: "256Mi" }
                    },
                    volumeMounts: [
                        {
                            name: "workspace-volume",
                            mountPath: "/workspace"
                        }
                    ]
                },
                {
                    image: "sandbox-agent:v2",
                    imagePullPolicy: "IfNotPresent",
                    name: "agent-container",
                    ports: [{ containerPort: 8000, name: 'agent-http' }],
                    resources: {
                        limits: { cpu: "500m", memory: "512Mi" },
                        requests: { cpu: "250m", memory: "256Mi" }
                    },
                    volumeMounts: [
                        {
                            name: "workspace-volume",
                            mountPath: "/workspace"
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
