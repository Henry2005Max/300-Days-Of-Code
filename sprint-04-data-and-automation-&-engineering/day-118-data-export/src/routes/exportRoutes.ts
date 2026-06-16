import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { fetchSalesReport } from '../db/salesQueries';
import { buildCsv } from '../exporters/csvExporter';
import { buildExcel } from '../exporters/excelExporter';
import { buildPdf } from '../exporters/pdfExporter';
import { ExportFormat } from '../types';

const router = Router();

const querySchema = z.object({
  from:     z.string().optional(),
  to:       z.string().optional(),
  region:   z.string().optional(),
  category: z.string().optional(),
});

// GET /api/export/preview — JSON version of the report (useful for testing)
router.get('/preview', async (req: Request, res: Response) => {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid query params', details: parsed.error.flatten() });
    return;
  }
  const report = await fetchSalesReport(parsed.data);
  res.json(report);
});

// GET /api/export/csv
// GET /api/export/excel
// GET /api/export/pdf
router.get('/:format', async (req: Request, res: Response) => {
  const format = req.params.format as ExportFormat;
  if (!['csv', 'excel', 'pdf'].includes(format)) {
    res.status(404).json({ error: 'Unknown format. Use: csv, excel, or pdf.' });
    return;
  }

  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid query params', details: parsed.error.flatten() });
    return;
  }

  const report = await fetchSalesReport(parsed.data);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

  if (format === 'csv') {
    const buf = buildCsv(report);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="sales-report-${timestamp}.csv"`);
    res.send(buf);
    return;
  }

  if (format === 'excel') {
    const buf = await buildExcel(report);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="sales-report-${timestamp}.xlsx"`);
    res.send(buf);
    return;
  }

  // pdf
  const buf = await buildPdf(report);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="sales-report-${timestamp}.pdf"`);
  res.send(buf);
});

export default router;
