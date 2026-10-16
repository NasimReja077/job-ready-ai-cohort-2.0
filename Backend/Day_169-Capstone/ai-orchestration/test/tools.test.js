import assert from "node:assert/strict";
import { createServer } from "node:http";
import { afterEach, test } from "node:test";
import { getSandboxAgentUrl, listFiles, readFiles, updateFiles } from "../src/agents/tools.js";

const originalSandboxAgentUrl = process.env.SANDBOX_AGENT_URL;
const originalSandboxId = process.env.SANDBOX_ID;

afterEach(() => {
    if (originalSandboxAgentUrl === undefined) {
        delete process.env.SANDBOX_AGENT_URL;
    } else {
        process.env.SANDBOX_AGENT_URL = originalSandboxAgentUrl;
    }

    if (originalSandboxId === undefined) {
        delete process.env.SANDBOX_ID;
    } else {
        process.env.SANDBOX_ID = originalSandboxId;
    }
});

test("uses SANDBOX_AGENT_URL when configured and removes trailing slashes", () => {
    process.env.SANDBOX_AGENT_URL = "http://localhost:8081///";
    delete process.env.SANDBOX_ID;

    assert.equal(getSandboxAgentUrl("sandbox-123"), "http://localhost:8081");
});

test("builds the sandbox service URL from the request projectId", () => {
    delete process.env.SANDBOX_AGENT_URL;
    delete process.env.SANDBOX_ID;

    assert.equal(getSandboxAgentUrl("sandbox-123"), "http://sandbox-service-sandbox-123:3000");
});

test("uses SANDBOX_ID when no request projectId is available", () => {
    delete process.env.SANDBOX_AGENT_URL;
    process.env.SANDBOX_ID = "sandbox-456";

    assert.equal(getSandboxAgentUrl(), "http://sandbox-service-sandbox-456:3000");
});

test("reports missing or invalid sandbox configuration", () => {
    delete process.env.SANDBOX_AGENT_URL;
    delete process.env.SANDBOX_ID;
    assert.throws(() => getSandboxAgentUrl(), /Set SANDBOX_AGENT_URL/);

    process.env.SANDBOX_AGENT_URL = "file:///tmp/sandbox";
    assert.throws(() => getSandboxAgentUrl(), /valid HTTP or HTTPS URL/);

    delete process.env.SANDBOX_AGENT_URL;
    assert.throws(() => getSandboxAgentUrl("invalid_id"), /valid Kubernetes service identifier/);
});

test("sandbox tools use the configured URL and project-relative file paths", async () => {
    const requests = [];
    const server = createServer(async (request, response) => {
        requests.push({ method: request.method, url: request.url });

        if (request.method === "GET" && request.url === "/list-files") {
            response.writeHead(200, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ files: ["src/App.jsx"] }));
            return;
        }
        if (request.method === "GET" && request.url === "/read-files?files=src%2FApp.jsx") {
            response.writeHead(200, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ files: [{ "/src/App.jsx": "export default App;" }] }));
            return;
        }
        if (request.method === "PATCH" && request.url === "/update-files") {
            let body = "";
            for await (const chunk of request) body += chunk;
            requests[requests.length - 1].body = JSON.parse(body);
            response.writeHead(200, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ results: [{ "/workspace/src/App.jsx": "File updated successfully" }] }));
            return;
        }

        response.writeHead(404);
        response.end();
    });

    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const { port } = server.address();
    process.env.SANDBOX_AGENT_URL = `http://127.0.0.1:${port}`;

    try {
        const config = { context: { projectId: "sandbox-123" }, writer: null };
        assert.deepEqual(JSON.parse(await listFiles.invoke({}, config)), ["src/App.jsx"]);
        assert.deepEqual(
            JSON.parse(await readFiles.invoke({ files: ["src/App.jsx"] }, config)),
            { files: [{ "/src/App.jsx": "export default App;" }] }
        );
        assert.deepEqual(
            JSON.parse(await updateFiles.invoke({ files: [{ file: "src/App.jsx", content: "updated" }] }, config)),
            [{ "/workspace/src/App.jsx": "File updated successfully" }]
        );
        assert.deepEqual(requests.map(({ method, url }) => [method, url]), [
            ["GET", "/list-files"],
            ["GET", "/read-files?files=src%2FApp.jsx"],
            ["PATCH", "/update-files"]
        ]);
        assert.deepEqual(requests[2].body, {
            updates: [{ file: "src/App.jsx", content: "updated" }]
        });
    } finally {
        if (originalSandboxAgentUrl === undefined) {
            delete process.env.SANDBOX_AGENT_URL;
        } else {
            process.env.SANDBOX_AGENT_URL = originalSandboxAgentUrl;
        }
        await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
});
