import { spawn } from "child_process";

const server = spawn("node", ["mcp.mjs"]);

server.stdout.on("data", (data) => {
  const responses = data.toString().split("\n").filter(Boolean);
  for (const resp of responses) {
    try {
      const json = JSON.parse(resp);
      console.log("Received:", JSON.stringify(json, null, 2));
      if (json.id === 2 && json.result && json.result.content) {
        console.log("Successfully retrieved thoughtform");
        server.kill();
        process.exit(0);
      }
    } catch (e) {
      console.error("Failed to parse output:", resp);
    }
  }
});

server.stderr.on("data", (data) => {
  console.error("Server Log:", data.toString());
});

server.on("close", (code) => {
  console.log(`Server exited with code ${code}`);
});

// JSON-RPC Init
const initRequest = {
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "test-client", version: "1.0.0" }
  }
};
server.stdin.write(JSON.stringify(initRequest) + "\n");

setTimeout(() => {
  // JSON-RPC Tool Call
  const callRequest = {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "boot_neuro_linguistic_thoughtform",
      arguments: {}
    }
  };
  server.stdin.write(JSON.stringify(callRequest) + "\n");
}, 500);

// Timeout to prevent hanging
setTimeout(() => {
  console.error("Timeout waiting for response");
  server.kill();
  process.exit(1);
}, 2000);
