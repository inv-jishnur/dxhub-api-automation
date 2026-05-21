/**
 * Wraps fetch for mcp-server. Prefer fixing AUTH_API_BASE_URL so the hostname matches the server TLS certificate.
 * Set DXHUB_LOGIN_INSECURE_TLS=1 in .env for local debugging only (disables TLS hostname verification).
 */
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { Agent, fetch as undiciFetch } from 'undici';

function loadProjectDotenv(): void {
  const candidates = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(__dirname, '..', '.env'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      dotenv.config({ path: p });
      return;
    }
  }
  dotenv.config({ path: candidates[0] });
}

loadProjectDotenv();

function useInsecureTls(): boolean {
  return (
    process.env.DXHUB_LOGIN_INSECURE_TLS === '1' ||
    process.env.DXHUB_LOGIN_INSECURE_TLS === 'true'
  );
}

let insecureAgent: Agent | undefined;

function getInsecureAgent(): Agent {
  if (!insecureAgent) {
    insecureAgent = new Agent({ connect: { rejectUnauthorized: false } });
  }
  return insecureAgent;
}

export async function loginFetch(input: string | URL, init?: RequestInit): Promise<Response> {
  if (useInsecureTls()) {
    const res = await undiciFetch(input, {
      ...init,
      dispatcher: getInsecureAgent(),
    } as Parameters<typeof undiciFetch>[1]);
    return res as unknown as Response;
  }
  return fetch(input, init);
}
