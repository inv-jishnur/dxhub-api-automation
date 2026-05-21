/**
 * Reads JSON and YAML specs from test-cases/ and writes one Excel file per source:
 * test-cases/<API_NAME>_Test_Cases.xlsx
 */
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const yaml = require('js-yaml');

const ROOT = path.resolve(__dirname, '..');
const CASES_DIR = path.join(ROOT, 'test-cases');

function sanitizeFilePart(name) {
  return String(name)
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_|_$/g, '') || 'API';
}

function loadFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const raw = fs.readFileSync(filePath, 'utf8');
  if (ext === '.yaml' || ext === '.yml') {
    return yaml.load(raw);
  }
  return JSON.parse(raw);
}

function rowsFromDoc(doc) {
  const apiName = doc.apiName ?? doc.name ?? 'API';
  const cases = doc.testCases ?? doc.cases ?? [];
  if (!Array.isArray(cases)) {
    throw new Error(`testCases must be an array in ${JSON.stringify(doc).slice(0, 80)}…`);
  }
  return { apiName, cases };
}

function main() {
  if (!fs.existsSync(CASES_DIR)) {
    console.error('Missing folder:', CASES_DIR);
    process.exit(1);
  }

  const files = fs.readdirSync(CASES_DIR).filter((f) => {
    const e = path.extname(f).toLowerCase();
    return e === '.json' || e === '.yaml' || e === '.yml';
  });

  if (files.length === 0) {
    console.warn('No .json/.yaml files in test-cases/');
    return;
  }

  for (const file of files) {
    const full = path.join(CASES_DIR, file);
    let doc;
    try {
      doc = loadFile(full);
    } catch (err) {
      console.error('Failed to parse', full, err.message);
      process.exitCode = 1;
      continue;
    }

    const { apiName, cases } = rowsFromDoc(doc);
    const sheetName = sanitizeFilePart(apiName).slice(0, 31) || 'TestCases';

    const header = [
      'ID',
      'Scenario',
      'Method',
      'Endpoint',
      'ExpectedStatus',
      'Type',
      'Notes',
    ];

    const rows = [header];
    for (const tc of cases) {
      rows.push([
        tc.id ?? '',
        tc.scenario ?? tc.title ?? '',
        tc.method ?? '',
        tc.endpoint ?? tc.path ?? '',
        tc.expectedStatus ?? tc.status ?? '',
        tc.type ?? '',
        tc.notes ?? '',
      ]);
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    const outName = `${sanitizeFilePart(apiName)}_Test_Cases.xlsx`;
    const outPath = path.join(CASES_DIR, outName);
    XLSX.writeFile(wb, outPath);
    console.log('Wrote', outPath);
  }
}

main();
