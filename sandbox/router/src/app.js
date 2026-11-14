import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware'
import morgan from 'morgan';

const app = express();
app.use(morgan('combined'))

app.get("/api/router/healthz", (req, res) => {
    res.status(200).json({ status: "ok" });
});

app.get("/api/router/readyz", (req, res) => {
    res.status(200).json({ status: "ready" });
});

const proxies = {};
const agentProxies = {};

function getProxy(sandboxId) {
    if(!proxies[sandboxId]){

        const target = `http://sandbox-service-${sandboxId}`
        proxies[sandboxId] = createProxyMiddleware({
            target,
            changeOrigin: true,
            ws: true,
        })
    }

    return proxies[sandboxId];
}

function getAgentProxy(sandboxId) {
    if(!agentProxies[sandboxId]){

        const target = `http://sandbox-service-${sandboxId}:8000`
        agentProxies[sandboxId] = createProxyMiddleware({
            target,
            changeOrigin: true,
            ws: true,
            timeout: 30000,
            proxyTimeout: 30000,
            xfwd: true,
            onError(err, req, res) {
                console.error(`Proxy error for agent ${sandboxId}:`, err.message);
                res.status(504).json({
                    error: 'Gateway Timeout',
                    message: `Agent sandbox ${sandboxId} did not respond in time.`
                });
            }
        })
    }

    return agentProxies[sandboxId];
}

app.use((req, res, next) => {
    const host = (req.headers.host || '').split(':')[0];
    const parts = host.split('.');
    const sandboxId = parts[0];
    const domainType = parts[1];

    if (!sandboxId || !domainType) {
        return next();
    }

    if (domainType === 'agent') {
        return getAgentProxy(sandboxId)(req, res, next);
    }

    if (domainType === 'preview') {
        return getProxy(sandboxId)(req, res, next);
    }

    return next();
});

export default app;