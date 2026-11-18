import { Router } from 'express';
import { describeModules, runAudit } from '../compliance/index.js';
import { parseSpec, buildSampleSpecs } from '../services/specParser.js';
import { buildReportExport } from '../services/reportBuilder.js';
import { record, saveReport, getReport, listReports, snapshot } from '../services/auditLog.js';

const router = Router();

router.get('/modules', (req, res) => res.json({ modules: describeModules() }));

router.get('/samples', (req, res) => res.json({ samples: buildSampleSpecs() }));

/** Parse an uploaded spec file (sent as text) into module inputs. The file is not stored. */
router.post('/parse', (req, res) => {
  const { filename, content } = req.body || {};
  try {
    const parsed = parseSpec({ filename: typeof filename === 'string' ? filename.slice(0, 120) : 'specification', content });
    record(req.sessionId, 'spec.upload', { filename: parsed.filename, moduleId: parsed.moduleId, matched: parsed.matched.length }, `Uploaded ${parsed.filename} for ${parsed.moduleId} (${parsed.matched.length} parameters read)`);
    res.json(parsed);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});

router.post('/run', (req, res) => {
  const { moduleId, values, source, filename } = req.body || {};
  const report = runAudit(moduleId, values || {}, {
    source: source === 'file' ? 'uploaded specification file' : 'manual entry',
    filename: typeof filename === 'string' ? filename.slice(0, 120) : null,
  });
  saveReport(req.sessionId, report);
  record(
    req.sessionId,
    'compliance.run',
    { reportId: report.reportId, moduleId: report.moduleId, verdict: report.verdict.code, counts: report.counts, source: report.source },
    `${report.title}: ${report.verdict.label} (${report.counts.pass} pass, ${report.counts.fail} fail, ${report.counts.warn} obs.) ${report.reportId}`,
  );
  res.json(report);
});

router.get('/reports', (req, res) => res.json({ reports: listReports(req.sessionId) }));

router.get('/reports/:id', (req, res) => {
  const report = getReport(req.sessionId, req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found in this session.' });

  const format = ['html', 'json', 'md'].includes(req.query.format) ? req.query.format : null;
  if (!format) return res.json(report);

  const out = buildReportExport(report, format, snapshot(req.sessionId).integrity);
  record(req.sessionId, 'export', { kind: 'report', reportId: report.reportId, format }, `Exported report ${report.reportId} as ${format.toUpperCase()}`);
  res.set({ 'Content-Type': out.contentType, 'Content-Disposition': `attachment; filename="${out.filename}"`, 'Access-Control-Expose-Headers': 'Content-Disposition, x-session-id' });
  res.send(out.body);
});

export default router;
