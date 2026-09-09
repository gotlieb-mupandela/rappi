import fs from "fs";
import path from "path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const sqlPath = process.argv[2];
if (!sqlPath) {
  console.error("Usage: node scripts/mcp-exec-sql-file.mjs <sql-file>");
  process.exit(1);
}

const sql = fs.readFileSync(sqlPath, "utf8");
const projectRef = "wzmzwerzbyudcvoiiege";

const transport = new StdioClientTransport({
  command: "npx",
  args: ["-y", "@supabase/mcp-server-supabase@latest", "--project-ref", projectRef],
  env: process.env,
});

const client = new Client({ name: "products-batch-loader", version: "1.0.0" });

try {
  await client.connect(transport);
  const result = await client.callTool({
    name: "execute_sql",
    arguments: { query: sql },
  });
  console.log(JSON.stringify({ ok: true, result }));
} catch (error) {
  console.error(JSON.stringify({ ok: false, error: String(error) }));
  process.exit(1);
} finally {
  await client.close();
}
