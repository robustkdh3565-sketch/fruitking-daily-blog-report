import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { locateSnapshotFiles, snapshotDateForReport, extractSnapshotCandidates } from './snapshot-candidates.mjs';

const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(.:)/, '$1'));
const dataDir = path.join(root, 'data');
const reportFile = fs.readdirSync(dataDir).filter((name) => /-daily-report\.json$/.test(name)).sort().at(-1);
if (!reportFile) throw new Error('DAILY_REPORT_NOT_FOUND');
const report = JSON.parse(fs.readFileSync(path.join(dataDir, reportFile), 'utf8'));
const snapshotDate = snapshotDateForReport(report.reportDate, report.pipelinePolicy?.previousDayRuleEffectiveFrom);
const snapshotFiles = locateSnapshotFiles(path.resolve(root, '..', 'keyword-status', 'snapshots'), snapshotDate);
const candidates = extractSnapshotCandidates(snapshotFiles);
if (snapshotFiles.length < 3) throw new Error(`SNAPSHOT_COVERAGE_LOW ${snapshotFiles.length}/3`);
if (candidates.length < 5) throw new Error(`AUTO_CANDIDATE_POOL_LOW ${candidates.length}/5`);
const payload = { schemaVersion: 1, reportDate: report.reportDate, snapshotDate, generatedAt: new Date().toISOString(), snapshotFiles: snapshotFiles.map((file) => path.basename(file)), candidates };
payload.evidenceHash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
fs.writeFileSync(path.join(dataDir, `${report.reportDate}-auto-candidates.json`), `${JSON.stringify(payload, null, 2)}\n`);
console.log(`auto candidate pool built: ${candidates.length} candidates`);
