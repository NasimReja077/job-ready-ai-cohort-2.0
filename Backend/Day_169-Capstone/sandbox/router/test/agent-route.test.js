import assert from "node:assert/strict";
import { test } from "node:test";
import { getAgentRoute, getPreviewRoute } from "../src/agent-route.js";

test("routes sandbox agent HTTP requests to the matching service path", () => {
    assert.deepEqual(
        getAgentRoute("/api/sandbox/agent/01a14612-a165-7594-9e9c-08f808f2a1b9/list-files"),
        {
            sandboxId: "01a14612-a165-7594-9e9c-08f808f2a1b9",
            path: "/list-files",
        }
    );
});

test("preserves the Socket.IO path and query when routing WebSocket handshakes", () => {
    assert.deepEqual(
        getAgentRoute("/api/sandbox/agent/sandbox-123/socket.io/?EIO=4&transport=websocket"),
        {
            sandboxId: "sandbox-123",
            path: "/socket.io/?EIO=4&transport=websocket",
        }
    );
});

test("routes preview asset and WebSocket paths to the sandbox root", () => {
    assert.deepEqual(
        getPreviewRoute("/api/sandbox/preview/sandbox-123/src/main.jsx?import"),
        {
            sandboxId: "sandbox-123",
            path: "/src/main.jsx?import",
        }
    );
    assert.deepEqual(
        getPreviewRoute("/api/sandbox/preview/sandbox-123/?token=abc"),
        {
            sandboxId: "sandbox-123",
            path: "/?token=abc",
        }
    );
});

test("does not match malformed or unrelated paths", () => {
    assert.equal(getAgentRoute("/api/sandbox/agent/invalid_id/socket.io/"), null);
    assert.equal(getAgentRoute("/api/sandbox/start"), null);
    assert.equal(getPreviewRoute("/api/sandbox/start"), null);
});
