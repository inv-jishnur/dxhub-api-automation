/**
 * One-shot check: runs login-runner (no MCP). Use to verify .env and API reachability.
 * Usage:
 *   npx tsx mcp-server/smoke.ts [--all] [API_TC_001|...|API_TC_021]
 *   --all     run all automatable cases (API_TC_001–API_TC_020) and print PASS/FAIL per id
 *   --list    print valid test case ids
 */
import {
  LOGIN_TEST_CASE_IDS,
  runAllLoginTestCases,
  runLoginTestCase,
} from './login-runner';

async function main(): Promise<void> {
  const argv = process.argv.slice(2);

  if (argv.includes('--list')) {
    console.log(LOGIN_TEST_CASE_IDS.join('\n'));
    return;
  }

  if (argv.includes('--all')) {
    const { summary, results } = await runAllLoginTestCases();
    console.log(`Login automation summary: ${summary.passed} passed, ${summary.failed} failed (of ${summary.total})\n`);
    for (const r of results) {
      const tag = r.passed ? 'PASS' : 'FAIL';
      console.log(`  ${r.testCaseId}  ${tag}  HTTP ${r.httpStatus}  ${r.message}`);
    }
    console.log('');
    process.exit(summary.failed > 0 ? 1 : 0);
  }

  const positional = argv.filter((a) => !a.startsWith('-'));
  const id = positional[0] ?? 'API_TC_009';

  const result = await runLoginTestCase(id);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.passed ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
