import { Injectable, Inject } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import PDFDocument from 'pdfkit';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, gte, lte, eq, SQL } from 'drizzle-orm';
import { DRIZZLE } from '../database/database.module';
import { consultations } from '../consultations/consultations.schema';
import { requests } from '../requests/requests.schema';
import { patients } from '../patients/patients.schema';
import { companies } from '../companies/companies.schema';
import { positions } from '../positions/positions.schema';
import type { ConsultationReportDto } from './dto/consultation-report.dto';

const LOGO_PATH = path.join(__dirname, 'assets', 'LogoCAPMIL.jpg');

const FOOTER_LINES = [
  'Fundación Centro Médico Preventivo Empresarial',
  'RIF: J-30375826-6. Dirección: Carrera 3 entre calles 2 y 4, Local Galpón Nº 2, Zona Industrial Comdibar II, Barquisimeto. Estado Lara.',
  'Teléfonos: 0251-2412901 / Celular: 0414-5613034.   Correo electrónico: fcmpecapmil@gmail.com',
  'USO ADMINISTRATIVO: Este documento se emite exclusivamente para la entidad de trabajo solicitante con fines de gestión laboral.',
  'Resguarda el secreto médico y la confidencialidad de los datos según la normativa legal vigente.',
];

// Table column definitions (widths must sum to usable width = 515)
const COLS = [
  { label: 'Paciente', width: 120 },
  { label: 'Cédula', width: 65 },
  { label: 'Empresa', width: 100 },
  { label: 'Fecha', width: 60 },
  { label: 'Motivo', width: 80 },
  { label: 'Tipo', width: 50 },
  { label: 'Resultado', width: 40 },
];

const MARGIN = 40;
const USABLE_WIDTH = 515;
const HEADER_HEIGHT = 100;
const FOOTER_HEIGHT = 80;
const ROW_HEIGHT = 22;
const HEADER_ROW_HEIGHT = 24;
const PRIMARY_COLOR = '#1565C0';
const ALT_ROW_COLOR = '#F5F8FF';

type ReportRow = {
  patientName: string;
  cedula: string;
  companyName: string;
  requestDate: string;
  evaluationReason: string;
  consultationType: string;
  result: string;
};

@Injectable()
export class ReportsService {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  async generateConsultationsReport(filters: ConsultationReportDto): Promise<Buffer> {
    const rows = await this.fetchConsultationRows(filters);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: HEADER_HEIGHT + 10, bottom: FOOTER_HEIGHT + 10, left: MARGIN, right: MARGIN },
        bufferPages: true,
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Draw header on the first page (pageAdded fires for subsequent pages)
      this.drawHeader(doc);
      doc.on('pageAdded', () => this.drawHeader(doc));

      this.drawTitle(doc, filters);
      this.drawTable(doc, rows);

      // Add footer to every buffered page
      const range = doc.bufferedPageRange();
      for (let i = 0; i < range.count; i++) {
        doc.switchToPage(range.start + i);
        this.drawFooter(doc, i + 1, range.count);
      }

      doc.flushPages();
      doc.end();
    });
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private drawHeader(doc: PDFKit.PDFDocument) {
    const topY = 15;

    // Logo on the left
    if (fs.existsSync(LOGO_PATH)) {
      doc.image(LOGO_PATH, MARGIN, topY, { height: 75, fit: [170, 75] });
    }

    // Slogan on the right
    doc
      .font('Helvetica-BoldOblique')
      .fontSize(13)
      .fillColor(PRIMARY_COLOR)
      .text('Por trabajadores\nsanos, felices y\nseguros', MARGIN, topY + 10, {
        width: USABLE_WIDTH,
        align: 'right',
      });

    // Separator line below header
    const lineY = HEADER_HEIGHT + 2;
    doc
      .moveTo(MARGIN, lineY)
      .lineTo(MARGIN + USABLE_WIDTH, lineY)
      .strokeColor(PRIMARY_COLOR)
      .lineWidth(1.5)
      .stroke();

    doc.font('Helvetica').fillColor('#000000');
  }

  private drawTitle(doc: PDFKit.PDFDocument, filters: ConsultationReportDto) {
    const titleY = HEADER_HEIGHT + 14;
    doc
      .font('Helvetica-Bold')
      .fontSize(13)
      .fillColor(PRIMARY_COLOR)
      .text('Reporte de Consultas', MARGIN, titleY, { width: USABLE_WIDTH, align: 'center' });

    const parts: string[] = [];
    if (filters.dateFrom) parts.push(`Desde: ${filters.dateFrom}`);
    if (filters.dateTo) parts.push(`Hasta: ${filters.dateTo}`);
    if (!parts.length) parts.push('Todas las fechas');

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#555555')
      .text(parts.join('   ·   '), MARGIN, titleY + 18, { width: USABLE_WIDTH, align: 'center' });

    doc.fillColor('#000000');
    doc.moveDown(0.4);
  }

  private drawTable(doc: PDFKit.PDFDocument, rows: ReportRow[]) {
    // Table header row
    let x = MARGIN;
    let y = doc.y + 6;

    // Header background
    doc.rect(x, y, USABLE_WIDTH, HEADER_ROW_HEIGHT).fill(PRIMARY_COLOR);

    doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF');
    x = MARGIN;
    for (const col of COLS) {
      doc.text(col.label, x + 3, y + 7, { width: col.width - 6, align: 'left' });
      x += col.width;
    }

    y += HEADER_ROW_HEIGHT;

    // Data rows
    doc.font('Helvetica').fontSize(8).fillColor('#000000');

    if (rows.length === 0) {
      doc
        .font('Helvetica-Oblique')
        .fontSize(9)
        .fillColor('#888888')
        .text('No se encontraron consultas para los filtros seleccionados.', MARGIN, y + 10, {
          width: USABLE_WIDTH,
          align: 'center',
        });
      doc.fillColor('#000000');
      return;
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const isAlt = i % 2 === 1;

      // Check if we need a new page
      if (y + ROW_HEIGHT > doc.page.height - FOOTER_HEIGHT - 20) {
        doc.addPage();
        y = HEADER_HEIGHT + 14;
        // Redraw table header on new page
        x = MARGIN;
        doc.rect(x, y, USABLE_WIDTH, HEADER_ROW_HEIGHT).fill(PRIMARY_COLOR);
        doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF');
        x = MARGIN;
        for (const col of COLS) {
          doc.text(col.label, x + 3, y + 7, { width: col.width - 6, align: 'left' });
          x += col.width;
        }
        y += HEADER_ROW_HEIGHT;
        doc.font('Helvetica').fontSize(8).fillColor('#000000');
      }

      if (isAlt) {
        doc.rect(MARGIN, y, USABLE_WIDTH, ROW_HEIGHT).fill(ALT_ROW_COLOR);
      }

      const cells = [
        row.patientName,
        row.cedula,
        row.companyName,
        row.requestDate,
        row.evaluationReason,
        row.consultationType,
        row.result,
      ];

      x = MARGIN;
      doc.fillColor('#1A1A1A');
      for (let c = 0; c < COLS.length; c++) {
        doc.text(cells[c] ?? '-', x + 3, y + 6, { width: COLS[c].width - 6, lineBreak: false });
        x += COLS[c].width;
      }

      // Bottom border for each row
      doc
        .moveTo(MARGIN, y + ROW_HEIGHT)
        .lineTo(MARGIN + USABLE_WIDTH, y + ROW_HEIGHT)
        .strokeColor('#E0E0E0')
        .lineWidth(0.5)
        .stroke();

      y += ROW_HEIGHT;
    }

    // Outer border around the entire table
    const tableTop = doc.page.height - doc.page.height; // calculated per page — skip outer border for simplicity
    doc.fillColor('#000000');
  }

  private drawFooter(doc: PDFKit.PDFDocument, pageNum: number, totalPages: number) {
    const pageHeight = doc.page.height;
    const footerY = pageHeight - FOOTER_HEIGHT + 4;
    const lineSpacing = 9;

    // Separator line
    doc
      .moveTo(MARGIN, footerY - 4)
      .lineTo(MARGIN + USABLE_WIDTH, footerY - 4)
      .strokeColor('#BBBBBB')
      .lineWidth(0.8)
      .stroke();

    // Company info — all lines at absolute positions to avoid doc.y drift issues
    doc
      .font('Helvetica-Bold')
      .fontSize(7.5)
      .fillColor('#1A1A1A')
      .text(FOOTER_LINES[0], MARGIN, footerY, { width: USABLE_WIDTH, align: 'right' });

    doc.font('Helvetica').fontSize(6.5).fillColor('#444444');
    for (let i = 1; i < FOOTER_LINES.length; i++) {
      doc.text(FOOTER_LINES[i], MARGIN, footerY + i * lineSpacing, { width: USABLE_WIDTH, align: 'right' });
    }

    // Page number — left side, same baseline as first footer line
    doc
      .font('Helvetica')
      .fontSize(7)
      .fillColor('#888888')
      .text(`Página ${pageNum} de ${totalPages}`, MARGIN, footerY, { width: USABLE_WIDTH / 2 });

    doc.fillColor('#000000');
  }

  private async fetchConsultationRows(filters: ConsultationReportDto): Promise<ReportRow[]> {
    const conditions: SQL[] = [];

    if (filters.dateFrom) {
      conditions.push(gte(requests.requestDate, filters.dateFrom));
    }
    if (filters.dateTo) {
      conditions.push(lte(requests.requestDate, filters.dateTo));
    }
    if (filters.companyId) {
      conditions.push(eq(patients.companyId, filters.companyId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await this.db
      .select({
        type: consultations.type,
        consultationResult: consultations.consultationResult,
        psychologicalResult: consultations.psychologicalResult,
        requestDate: requests.requestDate,
        evaluationReason: requests.evaluationReason,
        cedula: patients.cedula,
        firstName: patients.firstName,
        lastName: patients.lastName,
        companyName: companies.name,
        positionName: positions.name,
      })
      .from(consultations)
      .innerJoin(requests, eq(consultations.requestId, requests.id))
      .innerJoin(patients, eq(requests.patientId, patients.cedula))
      .leftJoin(companies, eq(patients.companyId, companies.id))
      .leftJoin(positions, eq(patients.positionId, positions.id))
      .where(whereClause)
      .orderBy(requests.requestDate);

    return data.map((row) => ({
      patientName: `${row.firstName} ${row.lastName}`,
      cedula: row.cedula,
      companyName: row.companyName ?? '-',
      requestDate: row.requestDate ?? '-',
      evaluationReason: row.evaluationReason,
      consultationType: row.type,
      result: row.consultationResult ?? row.psychologicalResult ?? 'Pendiente',
    }));
  }
}
