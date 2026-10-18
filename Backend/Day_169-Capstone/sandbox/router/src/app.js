import express from 'express';
import morgan from 'morgan';
import { createProxyMiddleware } from "http-proxy-middleware";
import http from 'http';
import { getAgentRoute, getPreviewHmrRoute, getPreviewRoute } from "./agent-route.js";
import { createProxyServer } from 'httpxy';
import { refreshTTL } from './config/redis.js';

const app = express();
app.use(morgan('combined'));

app.get('/api/status/healthz', (req, res) => {
    res.status(200).json({ status: 'ok' });
})

app.get('/api/status/readyz', (req, res) => {
    res.status(200).json({ status: 'ready' });
})

const proxies = {}
const agentProxies = {}

app.use((req, res, next) => {
    const previewHmrRoute = getPreviewHmrRoute(req.url);
    if (previewHmrRoute) {
        return getProxy(previewHmrRoute.sandboxId)(req, res, next);
    }

    const agentRoute = getAgentRoute(req.url);
    if (agentRoute) {
        req.url = agentRoute.path;
        return getAgentProxy(agentRoute.sandboxId)(req, res, next);
    }

    const previewRoute = getPreviewRoute(req.url);
    if (!previewRoute) {
        return next();
    }

    req.url = previewRoute.path;
    return getProxy(previewRoute.sandboxId)(req, res, next);
});


function getProxy(sandboxId) {
    const target = `http://sandbox-service-${sandboxId}`; // Construct target URL based on sandboxId

    if (!proxies[ sandboxId ]) {
        proxies[ sandboxId ] = createProxyMiddleware({
            target,
            changeOrigin: true,
            // ws: true,
        });
    }
    return proxies[ sandboxId ];
}

function getAgentProxy(sandboxId) {
    const target = `http://sandbox-service-${sandboxId}:3000`; // Construct target URL based on sandboxId

    if (!agentProxies[ sandboxId ]) {
        agentProxies[ sandboxId ] = createProxyMiddleware({
            target,
            changeOrigin: true,
            // ws: true,
        });
    }
    return agentProxies[ sandboxId ];
}

// Single httpxy proxy server for all WebSocket upgrades
const wsProxy = createProxyServer({ changeOrigin: true });
wsProxy.on('error', (err, req, socket) => {
    console.error('WS proxy error:', err.message);
    socket?.destroy();
});


app.use(async(req, res, next) => {
    const host = req.headers.host;

    if (!host) {
        return next();
    }

    const hostParts = host.split('.');
    if (hostParts.length < 2) {
        return next();
    }

    const sandboxId = hostParts[ 0 ]; // Extract sandboxId from subdomain
    await refreshTTL(sandboxId);
    /**
     * pod1.preview.localhost
     * pod1.agent.localhost
     */

    if (hostParts[ 1 ] === 'agent') {
        return getAgentProxy(sandboxId)(req, res, next);
    }

    if (hostParts[ 1 ] === 'preview') {
        return getProxy(sandboxId)(req, res, next);
    }

    return next();
});

// Create the HTTP server explicitly to handle WebSocket upgrades
const server = http.createServer(app);

// Handle WebSocket upgrade requests
server.on('upgrade', (req, socket, head) => {
    const previewHmrRoute = getPreviewHmrRoute(req.url);
    if (previewHmrRoute) {
        getProxy(previewHmrRoute.sandboxId).upgrade(req, socket, head);
        return;
    }

    const agentRoute = getAgentRoute(req.url);
    if (agentRoute) {
        req.url = agentRoute.path;
        wsProxy.ws(req, socket, {
            target: `http://sandbox-service-${agentRoute.sandboxId}:3000`,
        }, head).catch(() => socket.destroy());
        return;
    }

    const previewRoute = getPreviewRoute(req.url);
    if (previewRoute) {
        req.url = previewRoute.path;
        getProxy(previewRoute.sandboxId).upgrade(req, socket, head);
        return;
    }

    const host = req.headers.host;
    if (!host) {
        socket.destroy();
        return;
    }
    // Prevent EPIPE and connection-reset errors from crashing the process
    // during the active piped session (after ws() Promise has resolved)
    socket.on('error', () => socket.destroy());

    const hostParts = host.split('.');
    const sandboxId = hostParts[ 0 ];
    const type = hostParts[ 1 ];

    console.log(`WebSocket upgrade request: ${host}, sandboxId: ${sandboxId}, type: ${type}`);

    // Handle WebSocket upgrade based on the type (agent or preview)
    if (hostParts.length < 2) {
        socket.destroy();
    } else if (type === 'agent') {
        // getAgentProxy(sandboxId).upgrade(req, socket, head); // Upgrade the WebSocket connection for agent
         wsProxy.ws(req, socket, { target: `http://sandbox-service-${sandboxId}:3000` }, head)
            .catch(() => socket.destroy());
    } else if (type === 'preview') {
        // getProxy(sandboxId).upgrade(req, socket, head); // Upgrade the WebSocket connection for preview
        wsProxy.ws(req, socket, { target: `http://sandbox-service-${sandboxId}` }, head)
            .catch(() => socket.destroy());
    } else {
        socket.destroy();
    }
});

export default server;