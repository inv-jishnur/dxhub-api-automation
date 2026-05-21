import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

/**
 * After Playwright finishes, generate the HTML Allure report and open it locally.
 * Set ALLURE_OPEN=false or CI=true to skip opening the browser.
 */
export default async function allureGlobalTeardown(): Promise<void> {
  const projectRoot = path.resolve(__dirname, '../..');
  const resultsDir = path.join(projectRoot, 'allure-results');

  if (!fs.existsSync(resultsDir)) {
    console.log('[Allure] No results directory — skipping report generation.');
    return;
  }

  const hasResults = fs.readdirSync(resultsDir).some((name) => !name.startsWith('.'));
  if (!hasResults) {
    console.log('[Allure] Results directory is empty — skipping report generation.');
    return;
  }

  try {
    console.log('[Allure] Generating HTML report from allure-results…');
    execSync('npx allure generate allure-results --clean -o allure-report', {
      cwd: projectRoot,
      stdio: 'inherit',
    });

    const shouldOpen = !process.env.CI && process.env.ALLURE_OPEN !== 'false';
    if (shouldOpen) {
      console.log('[Allure] Opening report in the browser…');
      execSync('npx allure open allure-report', {
        cwd: projectRoot,
        stdio: 'inherit',
      });
    } else {
      console.log('[Allure] Report ready at allure-report/index.html (auto-open disabled).');
    }
  } catch (error) {
    console.warn('[Allure] Report generation failed:', error);
  }
}
