/**
 * DXHUB Login API — MCP server (stdio).
 * Run from project root: npm run mcp:login
 * Wire Cursor MCP: command npx, args: ["tsx","mcp-server/index.ts"], cwd: this repo.
 * Do not log to stdout (JSON-RPC); diagnostics may use stderr.
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import * as z from 'zod/v4';
import { LOGIN_TEST_CASE_IDS, runAllLoginTestCases, runLoginTestCase } from './login-runner';

const server = new McpServer(
  {
    name: 'dxhub-login-api',
    version: '1.0.0',
  },
  {
    instructions:
      'DXHUB Login API automation. Uses the same scenarios as tests/api/login.api.spec.ts (API_TC_001–API_TC_021; API_TC_021 lockout is skipped). ' +
      'Requires .env: AUTH_API_BASE_URL, VALID_EMAIL, VALID_PASSWORD, INVALID_PASSWORD; optional INVALID_EMAIL for API_TC_007.',
  }
);

server.registerTool(
  'login_run_test_case',
  {
    description:
      'Run a single Login API test case by id (API_TC_001 … API_TC_021). Returns HTTP status, pass/fail, and a short response snippet.',
    inputSchema: {
      testCaseId: z
        .string()
        .refine((id) => (LOGIN_TEST_CASE_IDS as readonly string[]).includes(id), {
          message: `Must be one of: ${LOGIN_TEST_CASE_IDS.join(', ')}`,
        })
        .describe('Test case id matching login.api.spec.ts'),
    },
  },
  async ({ testCaseId }) => {
    const result = await runLoginTestCase(testCaseId);
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.registerTool(
  'login_run_all_tests',
  {
    description:
      'Run all automatable Login API MCP cases (API_TC_001–API_TC_020) and return a summary plus per-case results.',
  },
  async () => {
    const out = await runAllLoginTestCases();
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(out, null, 2) }],
    };
  }
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('dxhub-login MCP server failed:', err);
  process.exit(1);
});
