import { Injectable, Inject } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import PDFDocument from 'pdfkit';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, gte, lte, eq, isNull, isNotNull, inArray, count, SQL } from 'drizzle-orm';
import { DRIZZLE } from '../database/database.module';
import { consultations } from '../consultations/consultations.schema';
import { requests } from '../requests/requests.schema';
import { patients } from '../patients/patients.schema';
import { companies } from '../companies/companies.schema';
import { positions } from '../positions/positions.schema';
import { restPeriods } from '../rest-periods/rest-periods.schema';
import { examResults } from '../exam-results/exam-results.schema';
import { exams } from '../exams/exams.schema';
import { positionRisks } from '../positions/positions.schema';
import { risks } from '../risks/risks.schema';
import { consultationReferrals } from '../consultation-referrals/consultation-referrals.schema';
import { medicalSpecialties } from '../medical-specialties/medical-specialties.schema';
import { riskExposureCategories } from '../risk-exposure-categories/risk-exposure-categories.schema';
import { consultationDiagnostics } from '../consultation-diagnostics/consultation-diagnostics.schema';
import { diseases } from '../diseases/diseases.schema';
import { bodySystems } from '../body-systems/body-systems.schema';
import type { ConsultationReportDto } from './dto/consultation-report.dto';
import type { VigilanciaReportDto } from './dto/vigilancia-report.dto';
import type { PathologiesReportDto } from './dto/pathologies-report.dto';
import type { BodySystemsReportDto } from './dto/body-systems-report.dto';
import type { MorbidityReportDto } from './dto/morbidity-report.dto';

const LOGO_PATH = path.join(__dirname, 'assets', 'LogoCAPMIL.jpg');

const FOOTER_LINES = [
  'Fundación Centro Médico Preventivo Empresarial',
  'RIF: J-30375826-6. Dirección: Carrera 3 entre calles 2 y 4, Local Galpón Nº 2, Zona Industrial Comdibar II, Barquisimeto. Estado Lara.',
  'Teléfonos: 0251-2412901 / Celular: 0414-5613034.   Correo electrónico: fcmpecapmil@gmail.com',
  'USO ADMINISTRATIVO: Este documento se emite exclusivamente para la entidad de trabajo solicitante con fines de gestión laboral.',
  'Resguarda el secreto médico y la confidencialidad de los datos según la normativa legal vigente.',
];

// Definición de columnas para el reporte de consultas (suma = 515)
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

type PathologyRow = {
  diseaseId: string;
  diseaseName: string;
  totalCases: number;
  totalRestDays: number;
  maleCases: number;
  femaleCases: number;
  commonOrigin: number;
  laborOrigin: number;
};

type BodySystemRow = {
  systemId: string;
  systemName: string;
  totalCases: number;
  totalRestDays: number;
  maleCases: number;
  femaleCases: number;
  commonOrigin: number;
  laborOrigin: number;
};

type MorbidityRow = {
  reason: string;
  total: number;
  medicalApto: number;
  medicalNoApto: number;
  medicalAptoCondicionado: number;
  psychApto: number;
  psychNoApto: number;
  psychAptoCondicionado: number;
};

// Tipos para las secciones del reporte de vigilancia
type SectionIRow = { reason: string; count: number; percentage: string };
type SectionIIRow = {
  category: string;
  femenino: number;
  masculino: number;
  total: number;
};
type SectionIIIRow = { examName: string; normales: number; anormales: number };
type SectionIVRow = { reason: string; count: number };
type SectionVRow = { specialty: string; count: number; percentage: string };
type SectionVIIRow = {
  riskType: string;
  name: string;
  conditions: string;
  healthEffects: string;
};

@Injectable()
export class ReportsService {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  async generateConsultationsReport(
    filters: ConsultationReportDto,
  ): Promise<Buffer> {
    const rows = await this.fetchConsultationRows(filters);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: HEADER_HEIGHT + 10,
          bottom: FOOTER_HEIGHT + 10,
          left: MARGIN,
          right: MARGIN,
        },
        bufferPages: true,
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Dibujar header en la primera página (pageAdded se dispara para las siguientes)
      this.drawHeader(doc);
      doc.on('pageAdded', () => this.drawHeader(doc));

      this.drawTitle(doc, filters);
      this.drawTable(doc, rows);

      // Agregar footer a cada página en el buffer
      const range = doc.bufferedPageRange();
      for (let i = 0; i < range.count; i++) {
        doc.switchToPage(range.start + i);
        this.drawFooter(doc, i + 1, range.count);
      }

      doc.flushPages();
      doc.end();
    });
  }

  async generateVigilanciaReport(
    filters: VigilanciaReportDto,
  ): Promise<Buffer> {
    // Recopilar datos de todas las secciones en paralelo
    const [
      sectionI,
      sectionII,
      sectionIII,
      sectionIV,
      sectionV,
      sectionVII,
    ] = await Promise.all([
      this.fetchWorkersByReason(filters),
      this.fetchAccidentsDiseaseBySex(filters),
      this.fetchExamResults(filters),
      this.fetchRestPeriodReasons(filters),
      this.fetchReferrals(filters),
      this.fetchRiskFactors(filters),
    ]);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: HEADER_HEIGHT + 10,
          bottom: FOOTER_HEIGHT + 10,
          left: MARGIN,
          right: MARGIN,
        },
        bufferPages: true,
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      this.drawHeader(doc);
      doc.on('pageAdded', () => this.drawHeader(doc));

      // Título del reporte
      this.drawVigilanciaTitle(doc, filters);

      // Sección I: Trabajadores por motivo de evaluación
      this.drawSectionHeader(doc, 'I. Trabajadores por Motivo de Evaluación');
      this.drawVigilanciaTable(
        doc,
        ['Motivo de Evaluación', 'Cantidad', '%'],
        [140, 80, 80],
        sectionI.map((r) => [r.reason, String(r.count), r.percentage]),
      );

      // Sección II: Accidentes y enfermedades por sexo
      this.ensureSpace(doc, 80);
      this.drawSectionHeader(doc, 'II. Accidentes y Enfermedades por Sexo');
      this.drawVigilanciaTable(
        doc,
        ['Categoría', 'Femenino', 'Masculino', 'Total'],
        [160, 80, 90, 80],
        sectionII.map((r) => [
          r.category,
          String(r.femenino),
          String(r.masculino),
          String(r.total),
        ]),
      );

      // Sección III: Resultados de exámenes
      this.ensureSpace(doc, 80);
      this.drawSectionHeader(doc, 'III. Resultados de Exámenes');
      this.drawVigilanciaTable(
        doc,
        ['Examen', 'Normales', 'Anormales'],
        [240, 90, 90],
        sectionIII.map((r) => [
          r.examName,
          String(r.normales),
          String(r.anormales),
        ]),
      );

      // Sección IV: Motivos de reposo
      this.ensureSpace(doc, 80);
      this.drawSectionHeader(doc, 'IV. Motivos de Reposo Médico');
      this.drawVigilanciaTable(
        doc,
        ['Motivo', 'Cantidad'],
        [200, 100],
        sectionIV.map((r) => [r.reason, String(r.count)]),
      );

      // Sección V: Referencias por especialidad
      this.ensureSpace(doc, 80);
      this.drawSectionHeader(doc, 'V. Referencias Médicas por Especialidad');
      this.drawVigilanciaTable(
        doc,
        ['Especialidad', 'Cantidad', '%'],
        [200, 80, 80],
        sectionV.map((r) => [r.specialty, String(r.count), r.percentage]),
      );

      // Sección VII: Factores de riesgo con efectos en la salud
      this.ensureSpace(doc, 80);
      this.drawSectionHeader(doc, 'VII. Factores de Riesgo y Efectos en la Salud');
      this.drawVigilanciaTable(
        doc,
        ['Tipo', 'Nombre', 'Condiciones', 'Efectos en Salud'],
        [70, 100, 160, 185],
        sectionVII.map((r) => [
          r.riskType,
          r.name,
          r.conditions,
          r.healthEffects,
        ]),
      );

      // Agregar footer a cada página
      const range = doc.bufferedPageRange();
      for (let i = 0; i < range.count; i++) {
        doc.switchToPage(range.start + i);
        this.drawFooter(doc, i + 1, range.count);
      }

      doc.flushPages();
      doc.end();
    });
  }

  // ─── Helpers privados ────────────────────────────────────────────────────────

  private drawHeader(doc: PDFKit.PDFDocument) {
    const topY = 15;

    // Logo a la izquierda
    if (fs.existsSync(LOGO_PATH)) {
      doc.image(LOGO_PATH, MARGIN, topY, { height: 75, fit: [170, 75] });
    }

    // Eslogan a la derecha
    doc
      .font('Helvetica-BoldOblique')
      .fontSize(13)
      .fillColor(PRIMARY_COLOR)
      .text('Por trabajadores\nsanos, felices y\nseguros', MARGIN, topY + 10, {
        width: USABLE_WIDTH,
        align: 'right',
      });

    // Línea separadora debajo del header
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
      .text('Reporte de Consultas', MARGIN, titleY, {
        width: USABLE_WIDTH,
        align: 'center',
      });

    const parts: string[] = [];
    if (filters.dateFrom) parts.push(`Desde: ${filters.dateFrom}`);
    if (filters.dateTo) parts.push(`Hasta: ${filters.dateTo}`);
    if (!parts.length) parts.push('Todas las fechas');

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#555555')
      .text(parts.join('   ·   '), MARGIN, titleY + 18, {
        width: USABLE_WIDTH,
        align: 'center',
      });

    doc.fillColor('#000000');
    doc.moveDown(0.4);
  }

  private drawVigilanciaTitle(
    doc: PDFKit.PDFDocument,
    filters: VigilanciaReportDto,
  ) {
    const titleY = HEADER_HEIGHT + 14;
    doc
      .font('Helvetica-Bold')
      .fontSize(13)
      .fillColor(PRIMARY_COLOR)
      .text(
        'Reporte de Vigilancia Epidemiológica',
        MARGIN,
        titleY,
        { width: USABLE_WIDTH, align: 'center' },
      );

    const parts: string[] = [];
    if (filters.dateFrom) parts.push(`Desde: ${filters.dateFrom}`);
    if (filters.dateTo) parts.push(`Hasta: ${filters.dateTo}`);
    if (!parts.length) parts.push('Todas las fechas');

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#555555')
      .text(parts.join('   ·   '), MARGIN, titleY + 18, {
        width: USABLE_WIDTH,
        align: 'center',
      });

    doc.fillColor('#000000');
    doc.moveDown(0.8);
  }

  private drawSectionHeader(doc: PDFKit.PDFDocument, title: string) {
    const y = doc.y;
    doc.rect(MARGIN, y, USABLE_WIDTH, 18).fill(PRIMARY_COLOR);
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor('#FFFFFF')
      .text(title, MARGIN + 6, y + 4, { width: USABLE_WIDTH - 12 });
    doc.fillColor('#000000');
    doc.moveDown(0.2);
  }

  private drawVigilanciaTable(
    doc: PDFKit.PDFDocument,
    headers: string[],
    widths: number[],
    rows: string[][],
  ) {
    const startY = doc.y;
    let y = startY;

    // Fila de encabezados de la tabla
    doc.rect(MARGIN, y, USABLE_WIDTH, HEADER_ROW_HEIGHT).fill('#E3EAF6');
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#1A1A1A');
    let x = MARGIN;
    for (let i = 0; i < headers.length; i++) {
      doc.text(headers[i], x + 3, y + 7, {
        width: widths[i] - 6,
        align: 'left',
      });
      x += widths[i];
    }
    y += HEADER_ROW_HEIGHT;

    // Filas de datos
    doc.font('Helvetica').fontSize(8).fillColor('#000000');

    if (rows.length === 0) {
      doc
        .font('Helvetica-Oblique')
        .fontSize(8)
        .fillColor('#888888')
        .text('Sin datos para el período seleccionado.', MARGIN, y + 6, {
          width: USABLE_WIDTH,
          align: 'center',
        });
      doc.fillColor('#000000');
      doc.moveDown(1);
      return;
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const isAlt = i % 2 === 1;

      // Verificar si necesitamos nueva página
      if (y + ROW_HEIGHT > doc.page.height - FOOTER_HEIGHT - 20) {
        doc.addPage();
        y = HEADER_HEIGHT + 14;
      }

      if (isAlt) {
        doc.rect(MARGIN, y, USABLE_WIDTH, ROW_HEIGHT).fill(ALT_ROW_COLOR);
      }

      x = MARGIN;
      doc.fillColor('#1A1A1A');
      for (let c = 0; c < headers.length; c++) {
        doc.text(row[c] ?? '-', x + 3, y + 6, {
          width: widths[c] - 6,
          lineBreak: false,
        });
        x += widths[c];
      }

      // Borde inferior de cada fila
      doc
        .moveTo(MARGIN, y + ROW_HEIGHT)
        .lineTo(MARGIN + USABLE_WIDTH, y + ROW_HEIGHT)
        .strokeColor('#E0E0E0')
        .lineWidth(0.5)
        .stroke();

      y += ROW_HEIGHT;
    }

    doc.fillColor('#000000');
    // Reposicionar el cursor de texto al final de la tabla + margen
    doc.y = y + 12;
  }

  // Asegura que haya al menos 'space' puntos disponibles antes del footer
  private ensureSpace(doc: PDFKit.PDFDocument, space: number) {
    if (doc.y + space > doc.page.height - FOOTER_HEIGHT - 20) {
      doc.addPage();
    }
  }

  private drawTable(doc: PDFKit.PDFDocument, rows: ReportRow[]) {
    // Fila de encabezado de la tabla
    let x = MARGIN;
    let y = doc.y + 6;

    // Fondo del encabezado
    doc.rect(x, y, USABLE_WIDTH, HEADER_ROW_HEIGHT).fill(PRIMARY_COLOR);

    doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF');
    x = MARGIN;
    for (const col of COLS) {
      doc.text(col.label, x + 3, y + 7, {
        width: col.width - 6,
        align: 'left',
      });
      x += col.width;
    }

    y += HEADER_ROW_HEIGHT;

    // Filas de datos
    doc.font('Helvetica').fontSize(8).fillColor('#000000');

    if (rows.length === 0) {
      doc
        .font('Helvetica-Oblique')
        .fontSize(9)
        .fillColor('#888888')
        .text(
          'No se encontraron consultas para los filtros seleccionados.',
          MARGIN,
          y + 10,
          {
            width: USABLE_WIDTH,
            align: 'center',
          },
        );
      doc.fillColor('#000000');
      return;
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const isAlt = i % 2 === 1;

      // Verificar si necesitamos nueva página
      if (y + ROW_HEIGHT > doc.page.height - FOOTER_HEIGHT - 20) {
        doc.addPage();
        y = HEADER_HEIGHT + 14;
        // Redibujar encabezado de tabla en la nueva página
        x = MARGIN;
        doc.rect(x, y, USABLE_WIDTH, HEADER_ROW_HEIGHT).fill(PRIMARY_COLOR);
        doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF');
        x = MARGIN;
        for (const col of COLS) {
          doc.text(col.label, x + 3, y + 7, {
            width: col.width - 6,
            align: 'left',
          });
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
        doc.text(cells[c] ?? '-', x + 3, y + 6, {
          width: COLS[c].width - 6,
          lineBreak: false,
        });
        x += COLS[c].width;
      }

      // Borde inferior de cada fila
      doc
        .moveTo(MARGIN, y + ROW_HEIGHT)
        .lineTo(MARGIN + USABLE_WIDTH, y + ROW_HEIGHT)
        .strokeColor('#E0E0E0')
        .lineWidth(0.5)
        .stroke();

      y += ROW_HEIGHT;
    }

    doc.fillColor('#000000');
  }

  private drawFooter(
    doc: PDFKit.PDFDocument,
    pageNum: number,
    totalPages: number,
  ) {
    const pageHeight = doc.page.height;
    const footerY = pageHeight - FOOTER_HEIGHT + 4;
    const lineSpacing = 9;

    // Suprimir la auto-paginación para que el texto del footer
    // dibujado debajo del área de contenido no genere páginas nuevas
    const savedBottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;

    // Línea separadora
    doc
      .moveTo(MARGIN, footerY - 4)
      .lineTo(MARGIN + USABLE_WIDTH, footerY - 4)
      .strokeColor('#BBBBBB')
      .lineWidth(0.8)
      .stroke();

    // Información de la empresa — alineada a la derecha
    doc
      .font('Helvetica-Bold')
      .fontSize(7.5)
      .fillColor('#1A1A1A')
      .text(FOOTER_LINES[0], MARGIN, footerY, {
        width: USABLE_WIDTH,
        align: 'right',
      });

    doc.font('Helvetica').fontSize(6.5).fillColor('#444444');
    for (let i = 1; i < FOOTER_LINES.length; i++) {
      doc.text(FOOTER_LINES[i], MARGIN, footerY + i * lineSpacing, {
        width: USABLE_WIDTH,
        align: 'right',
      });
    }

    // Número de página — lado izquierdo
    doc
      .font('Helvetica')
      .fontSize(7)
      .fillColor('#888888')
      .text(`Página ${pageNum} de ${totalPages}`, MARGIN, footerY, {
        width: USABLE_WIDTH / 2,
      });

    // Restaurar el margen inferior original
    doc.page.margins.bottom = savedBottom;
    doc.fillColor('#000000');
  }

  // ─── Consultas: fetch de datos ───────────────────────────────────────────────

  private async fetchConsultationRows(
    filters: ConsultationReportDto,
  ): Promise<ReportRow[]> {
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

    const whereClause =
      conditions.length > 0 ? and(...conditions) : undefined;

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
      result:
        row.consultationResult ?? row.psychologicalResult ?? 'Pendiente',
    }));
  }

  // ─── Vigilancia: fetch de datos por sección ──────────────────────────────────

  private buildVigilanciaConditions(filters: VigilanciaReportDto): SQL[] {
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
    return conditions;
  }

  // Sección I: Trabajadores evaluados por motivo de evaluación
  private async fetchWorkersByReason(
    filters: VigilanciaReportDto,
  ): Promise<SectionIRow[]> {
    const conditions = this.buildVigilanciaConditions(filters);
    const whereClause =
      conditions.length > 0 ? and(...conditions) : undefined;

    const data = await this.db
      .select({
        reason: requests.evaluationReason,
        count: count(),
      })
      .from(consultations)
      .innerJoin(requests, eq(consultations.requestId, requests.id))
      .innerJoin(patients, eq(requests.patientId, patients.cedula))
      .where(whereClause)
      .groupBy(requests.evaluationReason)
      .orderBy(requests.evaluationReason);

    const total = data.reduce((acc, r) => acc + Number(r.count), 0);

    return data.map((r) => ({
      reason: r.reason,
      count: Number(r.count),
      percentage:
        total > 0
          ? `${((Number(r.count) / total) * 100).toFixed(1)}%`
          : '0%',
    }));
  }

  // Sección II: Accidentes laborales y enfermedades por sexo
  private async fetchAccidentsDiseaseBySex(
    filters: VigilanciaReportDto,
  ): Promise<SectionIIRow[]> {
    const conditions = this.buildVigilanciaConditions(filters);
    // Filtrar solo motivos de reposo por accidente o enfermedad laboral
    const laboralReasons = ['Accidente Laboral', 'Enfermedad Laboral'];

    const whereClause =
      conditions.length > 0 ? and(...conditions) : undefined;

    const data = await this.db
      .select({
        reason: restPeriods.reason,
        sex: patients.sex,
        count: count(),
      })
      .from(restPeriods)
      .innerJoin(
        consultations,
        eq(restPeriods.consultationId, consultations.id),
      )
      .innerJoin(requests, eq(consultations.requestId, requests.id))
      .innerJoin(patients, eq(requests.patientId, patients.cedula))
      .where(
        whereClause
          ? and(whereClause, inArray(restPeriods.reason, laboralReasons))
          : inArray(restPeriods.reason, laboralReasons),
      )
      .groupBy(restPeriods.reason, patients.sex);

    // Pivotear los datos por motivo
    const map = new Map<
      string,
      { femenino: number; masculino: number }
    >();

    for (const row of data) {
      const key = row.reason ?? 'Sin especificar';
      if (!map.has(key)) map.set(key, { femenino: 0, masculino: 0 });
      const entry = map.get(key)!;
      if (row.sex === 'Femenino') entry.femenino += Number(row.count);
      else entry.masculino += Number(row.count);
    }

    return Array.from(map.entries()).map(([category, vals]) => ({
      category,
      femenino: vals.femenino,
      masculino: vals.masculino,
      total: vals.femenino + vals.masculino,
    }));
  }

  // Sección III: Resultados de exámenes (normales vs anormales)
  private async fetchExamResults(
    filters: VigilanciaReportDto,
  ): Promise<SectionIIIRow[]> {
    const conditions = this.buildVigilanciaConditions(filters);
    const whereClause =
      conditions.length > 0 ? and(...conditions) : undefined;

    const data = await this.db
      .select({
        examName: exams.name,
        result: examResults.result,
        count: count(),
      })
      .from(examResults)
      .innerJoin(exams, eq(examResults.examId, exams.id))
      .innerJoin(
        consultations,
        eq(examResults.consultationId, consultations.id),
      )
      .innerJoin(requests, eq(consultations.requestId, requests.id))
      .innerJoin(patients, eq(requests.patientId, patients.cedula))
      .where(whereClause)
      .groupBy(exams.name, examResults.result)
      .orderBy(exams.name);

    // Pivotear por nombre de examen
    const map = new Map<string, { normales: number; anormales: number }>();

    for (const row of data) {
      const key = row.examName;
      if (!map.has(key)) map.set(key, { normales: 0, anormales: 0 });
      const entry = map.get(key)!;
      if (row.result === 'Normal') entry.normales += Number(row.count);
      else if (row.result === 'Anormal') entry.anormales += Number(row.count);
    }

    return Array.from(map.entries()).map(([examName, vals]) => ({
      examName,
      normales: vals.normales,
      anormales: vals.anormales,
    }));
  }

  // Sección IV: Motivos de reposo médico
  private async fetchRestPeriodReasons(
    filters: VigilanciaReportDto,
  ): Promise<SectionIVRow[]> {
    const conditions = this.buildVigilanciaConditions(filters);
    const whereClause =
      conditions.length > 0 ? and(...conditions) : undefined;

    const data = await this.db
      .select({
        reason: restPeriods.reason,
        count: count(),
      })
      .from(restPeriods)
      .innerJoin(
        consultations,
        eq(restPeriods.consultationId, consultations.id),
      )
      .innerJoin(requests, eq(consultations.requestId, requests.id))
      .innerJoin(patients, eq(requests.patientId, patients.cedula))
      .where(whereClause)
      .groupBy(restPeriods.reason)
      .orderBy(restPeriods.reason);

    return data.map((r) => ({
      reason: r.reason ?? 'Sin especificar',
      count: Number(r.count),
    }));
  }

  // Sección V: Referencias médicas por especialidad
  private async fetchReferrals(
    filters: VigilanciaReportDto,
  ): Promise<SectionVRow[]> {
    const conditions = this.buildVigilanciaConditions(filters);
    const whereClause =
      conditions.length > 0 ? and(...conditions) : undefined;

    const data = await this.db
      .select({
        specialty: medicalSpecialties.name,
        count: count(),
      })
      .from(consultationReferrals)
      .leftJoin(
        medicalSpecialties,
        eq(consultationReferrals.specialtyId, medicalSpecialties.id),
      )
      .innerJoin(
        consultations,
        eq(consultationReferrals.consultationId, consultations.id),
      )
      .innerJoin(requests, eq(consultations.requestId, requests.id))
      .innerJoin(patients, eq(requests.patientId, patients.cedula))
      .where(
        whereClause
          ? and(whereClause, eq(consultationReferrals.requiresReferral, true))
          : eq(consultationReferrals.requiresReferral, true),
      )
      .groupBy(medicalSpecialties.name)
      .orderBy(medicalSpecialties.name);

    const total = data.reduce((acc, r) => acc + Number(r.count), 0);

    return data.map((r) => ({
      specialty: r.specialty ?? 'Sin especificar',
      count: Number(r.count),
      percentage:
        total > 0
          ? `${((Number(r.count) / total) * 100).toFixed(1)}%`
          : '0%',
    }));
  }

  // Sección VII: Factores de riesgo con efectos en la salud
  private async fetchRiskFactors(
    filters: VigilanciaReportDto,
  ): Promise<SectionVIIRow[]> {
    // Los factores de riesgo no están filtrados por fecha/empresa,
    // sino que muestran el catálogo completo de categorías de exposición
    const data = await this.db
      .select({
        riskType: riskExposureCategories.riskType,
        name: riskExposureCategories.name,
        conditions: riskExposureCategories.conditions,
        healthEffects: riskExposureCategories.healthEffects,
      })
      .from(riskExposureCategories)
      .orderBy(riskExposureCategories.riskType);

    return data.map((r) => ({
      riskType: r.riskType,
      name: r.name,
      conditions: r.conditions ?? '-',
      healthEffects: r.healthEffects ?? '-',
    }));
  }

  // ─── Patologías: fetch y generación de PDF ───────────────────────────────────

  private async fetchPathologyData(
    filters: PathologiesReportDto,
  ): Promise<PathologyRow[]> {
    const conditions: SQL[] = [];
    if (filters.dateFrom) conditions.push(gte(requests.requestDate, filters.dateFrom));
    if (filters.dateTo) conditions.push(lte(requests.requestDate, filters.dateTo));
    if (filters.companyId) conditions.push(eq(patients.companyId, filters.companyId));
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await this.db
      .select({
        diseaseId: diseases.id,
        diseaseName: diseases.name,
        sex: patients.sex,
        restDays: restPeriods.days,
        restReason: restPeriods.reason,
      })
      .from(consultationDiagnostics)
      .innerJoin(diseases, eq(consultationDiagnostics.diseaseId, diseases.id))
      .innerJoin(consultations, eq(consultationDiagnostics.consultationId, consultations.id))
      .innerJoin(requests, eq(consultations.requestId, requests.id))
      .innerJoin(patients, eq(requests.patientId, patients.cedula))
      .leftJoin(restPeriods, eq(restPeriods.consultationId, consultations.id))
      .where(whereClause)
      .orderBy(diseases.name);

    // Agregar por enfermedad
    const map = new Map<string, PathologyRow>();
    for (const r of rows) {
      if (!map.has(r.diseaseId)) {
        map.set(r.diseaseId, {
          diseaseId: r.diseaseId,
          diseaseName: r.diseaseName,
          totalCases: 0,
          totalRestDays: 0,
          maleCases: 0,
          femaleCases: 0,
          commonOrigin: 0,
          laborOrigin: 0,
        });
      }
      const entry = map.get(r.diseaseId)!;
      entry.totalCases++;
      if (r.restDays) entry.totalRestDays += r.restDays;
      if (r.sex === 'Masculino') entry.maleCases++;
      else if (r.sex === 'Femenino') entry.femaleCases++;
      const reason = r.restReason ?? '';
      if (reason === 'Enfermedad Comun' || reason === 'Accidente Comun') entry.commonOrigin++;
      else if (reason === 'Enfermedad Laboral' || reason === 'Accidente Laboral') entry.laborOrigin++;
    }

    return Array.from(map.values()).sort((a, b) => b.totalCases - a.totalCases);
  }

  private async fetchBodySystemData(
    filters: BodySystemsReportDto,
  ): Promise<BodySystemRow[]> {
    const conditions: SQL[] = [];
    if (filters.dateFrom) conditions.push(gte(requests.requestDate, filters.dateFrom));
    if (filters.dateTo) conditions.push(lte(requests.requestDate, filters.dateTo));
    if (filters.companyId) conditions.push(eq(patients.companyId, filters.companyId));

    const rows = await this.db
      .select({
        systemId: bodySystems.id,
        systemName: bodySystems.name,
        sex: patients.sex,
        restDays: restPeriods.days,
        restReason: restPeriods.reason,
      })
      .from(consultationDiagnostics)
      .innerJoin(bodySystems, eq(consultationDiagnostics.bodySystemId, bodySystems.id))
      .innerJoin(consultations, eq(consultationDiagnostics.consultationId, consultations.id))
      .innerJoin(requests, eq(consultations.requestId, requests.id))
      .innerJoin(patients, eq(requests.patientId, patients.cedula))
      .leftJoin(restPeriods, eq(restPeriods.consultationId, consultations.id))
      .where(
        conditions.length > 0
          ? and(and(...conditions), isNotNull(consultationDiagnostics.bodySystemId))
          : isNotNull(consultationDiagnostics.bodySystemId),
      )
      .orderBy(bodySystems.name);

    // Agregar por sistema corporal
    const map = new Map<string, BodySystemRow>();
    for (const r of rows) {
      if (!map.has(r.systemId)) {
        map.set(r.systemId, {
          systemId: r.systemId,
          systemName: r.systemName,
          totalCases: 0,
          totalRestDays: 0,
          maleCases: 0,
          femaleCases: 0,
          commonOrigin: 0,
          laborOrigin: 0,
        });
      }
      const entry = map.get(r.systemId)!;
      entry.totalCases++;
      if (r.restDays) entry.totalRestDays += r.restDays;
      if (r.sex === 'Masculino') entry.maleCases++;
      else if (r.sex === 'Femenino') entry.femaleCases++;
      const reason = r.restReason ?? '';
      if (reason === 'Enfermedad Comun' || reason === 'Accidente Comun') entry.commonOrigin++;
      else if (reason === 'Enfermedad Laboral' || reason === 'Accidente Laboral') entry.laborOrigin++;
    }

    return Array.from(map.values()).sort((a, b) => b.totalCases - a.totalCases);
  }

  // Dibuja la tabla compartida para los reportes de patologías y sistemas corporales
  private drawPathologyTable(
    doc: PDFKit.PDFDocument,
    rows: Array<{ label: string; totalCases: number; totalRestDays: number; maleCases: number; femaleCases: number; commonOrigin: number; laborOrigin: number }>,
    labelColumn: string,
    grandTotal: number,
  ) {
    // Anchos de columna: suma = 515
    const widths = [130, 42, 38, 50, 62, 62, 55, 76];
    const headers = [labelColumn, 'Total', '%', 'Días Rep.', 'Masculino', 'Femenino', 'Orig. Común', 'Orig. Lab.'];

    let y = doc.y + 4;

    // Fila de encabezado
    doc.rect(MARGIN, y, USABLE_WIDTH, HEADER_ROW_HEIGHT).fill(PRIMARY_COLOR);
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#FFFFFF');
    let x = MARGIN;
    for (let i = 0; i < headers.length; i++) {
      doc.text(headers[i], x + 3, y + 7, { width: widths[i] - 6, align: 'left', lineBreak: false });
      x += widths[i];
    }
    y += HEADER_ROW_HEIGHT;

    doc.font('Helvetica').fontSize(7.5).fillColor('#000000');

    if (rows.length === 0) {
      doc
        .font('Helvetica-Oblique')
        .fontSize(8)
        .fillColor('#888888')
        .text('Sin datos para el período seleccionado.', MARGIN, y + 6, {
          width: USABLE_WIDTH,
          align: 'center',
        });
      doc.fillColor('#000000');
      doc.moveDown(1);
      return;
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const isAlt = i % 2 === 1;

      if (y + ROW_HEIGHT > doc.page.height - FOOTER_HEIGHT - 20) {
        doc.addPage();
        y = HEADER_HEIGHT + 14;
        // Redibujar encabezado en nueva página
        doc.rect(MARGIN, y, USABLE_WIDTH, HEADER_ROW_HEIGHT).fill(PRIMARY_COLOR);
        doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#FFFFFF');
        x = MARGIN;
        for (let h = 0; h < headers.length; h++) {
          doc.text(headers[h], x + 3, y + 7, { width: widths[h] - 6, align: 'left', lineBreak: false });
          x += widths[h];
        }
        y += HEADER_ROW_HEIGHT;
        doc.font('Helvetica').fontSize(7.5).fillColor('#000000');
      }

      if (isAlt) {
        doc.rect(MARGIN, y, USABLE_WIDTH, ROW_HEIGHT).fill(ALT_ROW_COLOR);
      }

      const pct = grandTotal > 0 ? `${((row.totalCases / grandTotal) * 100).toFixed(1)}%` : '0%';
      const malePct = row.totalCases > 0 ? `${((row.maleCases / row.totalCases) * 100).toFixed(0)}%` : '0%';
      const femalePct = row.totalCases > 0 ? `${((row.femaleCases / row.totalCases) * 100).toFixed(0)}%` : '0%';

      const cells = [
        row.label,
        String(row.totalCases),
        pct,
        row.totalRestDays > 0 ? String(row.totalRestDays) : '—',
        `${row.maleCases} (${malePct})`,
        `${row.femaleCases} (${femalePct})`,
        row.commonOrigin > 0 ? String(row.commonOrigin) : '—',
        row.laborOrigin > 0 ? String(row.laborOrigin) : '—',
      ];

      x = MARGIN;
      doc.fillColor('#1A1A1A');
      for (let c = 0; c < headers.length; c++) {
        doc.text(cells[c], x + 3, y + 6, { width: widths[c] - 6, lineBreak: false });
        x += widths[c];
      }

      doc
        .moveTo(MARGIN, y + ROW_HEIGHT)
        .lineTo(MARGIN + USABLE_WIDTH, y + ROW_HEIGHT)
        .strokeColor('#E0E0E0')
        .lineWidth(0.5)
        .stroke();

      y += ROW_HEIGHT;
    }

    doc.fillColor('#000000');
    doc.y = y + 12;
  }

  // Dibuja caja resumen al final de los reportes de patologías/sistemas
  private drawPathologySummary(
    doc: PDFKit.PDFDocument,
    totalCases: number,
    maleCases: number,
    femaleCases: number,
    totalRestDays: number,
    commonOrigin: number,
    laborOrigin: number,
  ) {
    this.ensureSpace(doc, 90);
    const y = doc.y + 6;
    const boxHeight = 72;

    doc.rect(MARGIN, y, USABLE_WIDTH, boxHeight).fill('#EEF4FB');

    doc
      .font('Helvetica-Bold')
      .fontSize(8.5)
      .fillColor(PRIMARY_COLOR)
      .text('Resumen del Reporte', MARGIN + 8, y + 8, { width: USABLE_WIDTH - 16 });

    doc.font('Helvetica').fontSize(8).fillColor('#1A1A1A');
    doc.text(`Total de casos registrados: ${totalCases}`, MARGIN + 8, y + 24, { width: USABLE_WIDTH - 16 });
    doc.text(`Masculino: ${maleCases}   |   Femenino: ${femaleCases}`, MARGIN + 8, y + 36, { width: USABLE_WIDTH - 16 });
    doc.text(`Total días de reposo: ${totalRestDays}`, MARGIN + 8, y + 48, { width: USABLE_WIDTH - 16 });
    doc.text(`Origen Común: ${commonOrigin}   |   Origen Laboral: ${laborOrigin}`, MARGIN + 8, y + 60, { width: USABLE_WIDTH - 16 });

    doc.fillColor('#000000');
    doc.y = y + boxHeight + 10;
  }

  async generatePathologiesReport(
    filters: PathologiesReportDto,
  ): Promise<Buffer> {
    const data = await this.fetchPathologyData(filters);
    const grandTotal = data.reduce((s, r) => s + r.totalCases, 0);
    const totalRestDays = data.reduce((s, r) => s + r.totalRestDays, 0);
    const maleCases = data.reduce((s, r) => s + r.maleCases, 0);
    const femaleCases = data.reduce((s, r) => s + r.femaleCases, 0);
    const commonOrigin = data.reduce((s, r) => s + r.commonOrigin, 0);
    const laborOrigin = data.reduce((s, r) => s + r.laborOrigin, 0);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: HEADER_HEIGHT + 10,
          bottom: FOOTER_HEIGHT + 10,
          left: MARGIN,
          right: MARGIN,
        },
        bufferPages: true,
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      this.drawHeader(doc);
      doc.on('pageAdded', () => this.drawHeader(doc));

      // Título
      const titleY = HEADER_HEIGHT + 14;
      doc
        .font('Helvetica-Bold')
        .fontSize(13)
        .fillColor(PRIMARY_COLOR)
        .text('Reporte de Patologías', MARGIN, titleY, { width: USABLE_WIDTH, align: 'center' });

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
      doc.moveDown(0.8);

      // Tabla
      const tableRows = data.map((r) => ({
        label: r.diseaseName,
        totalCases: r.totalCases,
        totalRestDays: r.totalRestDays,
        maleCases: r.maleCases,
        femaleCases: r.femaleCases,
        commonOrigin: r.commonOrigin,
        laborOrigin: r.laborOrigin,
      }));
      this.drawPathologyTable(doc, tableRows, 'Enfermedad', grandTotal);

      // Resumen
      this.drawPathologySummary(doc, grandTotal, maleCases, femaleCases, totalRestDays, commonOrigin, laborOrigin);

      // Footer en todas las páginas
      const range = doc.bufferedPageRange();
      for (let i = 0; i < range.count; i++) {
        doc.switchToPage(range.start + i);
        this.drawFooter(doc, i + 1, range.count);
      }

      doc.flushPages();
      doc.end();
    });
  }

  async generateBodySystemsReport(
    filters: BodySystemsReportDto,
  ): Promise<Buffer> {
    const data = await this.fetchBodySystemData(filters);
    const grandTotal = data.reduce((s, r) => s + r.totalCases, 0);
    const totalRestDays = data.reduce((s, r) => s + r.totalRestDays, 0);
    const maleCases = data.reduce((s, r) => s + r.maleCases, 0);
    const femaleCases = data.reduce((s, r) => s + r.femaleCases, 0);
    const commonOrigin = data.reduce((s, r) => s + r.commonOrigin, 0);
    const laborOrigin = data.reduce((s, r) => s + r.laborOrigin, 0);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: HEADER_HEIGHT + 10,
          bottom: FOOTER_HEIGHT + 10,
          left: MARGIN,
          right: MARGIN,
        },
        bufferPages: true,
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      this.drawHeader(doc);
      doc.on('pageAdded', () => this.drawHeader(doc));

      // Título
      const titleY = HEADER_HEIGHT + 14;
      doc
        .font('Helvetica-Bold')
        .fontSize(13)
        .fillColor(PRIMARY_COLOR)
        .text('Reporte de Aparatos y Sistemas', MARGIN, titleY, { width: USABLE_WIDTH, align: 'center' });

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
      doc.moveDown(0.8);

      // Tabla
      const tableRows = data.map((r) => ({
        label: r.systemName,
        totalCases: r.totalCases,
        totalRestDays: r.totalRestDays,
        maleCases: r.maleCases,
        femaleCases: r.femaleCases,
        commonOrigin: r.commonOrigin,
        laborOrigin: r.laborOrigin,
      }));
      this.drawPathologyTable(doc, tableRows, 'Aparato / Sistema', grandTotal);

      // Resumen
      this.drawPathologySummary(doc, grandTotal, maleCases, femaleCases, totalRestDays, commonOrigin, laborOrigin);

      // Footer en todas las páginas
      const range = doc.bufferedPageRange();
      for (let i = 0; i < range.count; i++) {
        doc.switchToPage(range.start + i);
        this.drawFooter(doc, i + 1, range.count);
      }

      doc.flushPages();
      doc.end();
    });
  }

  // ─── Morbilidad: fetch de datos ──────────────────────────────────────────────

  private async fetchMorbidityData(filters: MorbidityReportDto): Promise<MorbidityRow[]> {
    const conditions: SQL[] = [];
    if (filters.dateFrom) conditions.push(gte(requests.requestDate, filters.dateFrom));
    if (filters.dateTo) conditions.push(lte(requests.requestDate, filters.dateTo));
    if (filters.companyId) conditions.push(eq(patients.companyId, filters.companyId));
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await this.db
      .select({
        evaluationReason: requests.evaluationReason,
        consultationResult: consultations.consultationResult,
        psychologicalAptitude: consultations.psychologicalAptitude,
      })
      .from(consultations)
      .innerJoin(requests, eq(consultations.requestId, requests.id))
      .innerJoin(patients, eq(requests.patientId, patients.cedula))
      .leftJoin(companies, eq(patients.companyId, companies.id))
      .where(whereClause)
      .orderBy(requests.evaluationReason);

    // Agregar por motivo de evaluación
    const map = new Map<string, MorbidityRow>();
    for (const r of rows) {
      const key = r.evaluationReason;
      if (!map.has(key)) {
        map.set(key, {
          reason: key,
          total: 0,
          medicalApto: 0,
          medicalNoApto: 0,
          medicalAptoCondicionado: 0,
          psychApto: 0,
          psychNoApto: 0,
          psychAptoCondicionado: 0,
        });
      }
      const entry = map.get(key)!;
      entry.total++;
      if (r.consultationResult === 'Apto') entry.medicalApto++;
      else if (r.consultationResult === 'No Apto') entry.medicalNoApto++;
      else if (r.consultationResult === 'Apto Condicionado') entry.medicalAptoCondicionado++;
      if (r.psychologicalAptitude === 'Apto') entry.psychApto++;
      else if (r.psychologicalAptitude === 'No Apto') entry.psychNoApto++;
      else if (r.psychologicalAptitude === 'Apto Condicionado') entry.psychAptoCondicionado++;
    }

    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }

  private drawMorbidityTable(
    doc: PDFKit.PDFDocument,
    rows: MorbidityRow[],
    grandTotal: number,
  ) {
    // Anchos de columna que suman 515
    const widths = [115, 45, 40, 105, 105, 105];
    const headers = ['Tipo de Solicitud', 'Total', '%', 'Aptos', 'No Aptos', 'Aptos Cond.'];

    let y = doc.y + 4;

    // Fila de encabezado principal
    doc.rect(MARGIN, y, USABLE_WIDTH, HEADER_ROW_HEIGHT).fill(PRIMARY_COLOR);
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#FFFFFF');
    let x = MARGIN;
    for (let i = 0; i < headers.length; i++) {
      doc.text(headers[i], x + 3, y + 7, { width: widths[i] - 6, align: 'left', lineBreak: false });
      x += widths[i];
    }
    y += HEADER_ROW_HEIGHT;

    // Sub-encabezado: "Méd. / Psic." bajo las 3 columnas de aptitud
    doc.rect(MARGIN + 200, y, 315, 14).fill('#D0D9EF');
    doc.font('Helvetica-Oblique').fontSize(6.5).fillColor('#333333');
    x = MARGIN + 200;
    for (let i = 0; i < 3; i++) {
      doc.text('Méd. / Psic.', x + 3, y + 3, { width: widths[3 + i] - 6, align: 'left', lineBreak: false });
      x += widths[3 + i];
    }
    y += 14;

    doc.font('Helvetica').fontSize(7.5).fillColor('#000000');

    if (rows.length === 0) {
      doc
        .font('Helvetica-Oblique')
        .fontSize(8)
        .fillColor('#888888')
        .text('Sin datos para el período seleccionado.', MARGIN, y + 6, {
          width: USABLE_WIDTH,
          align: 'center',
        });
      doc.fillColor('#000000');
      doc.moveDown(1);
      return;
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const isAlt = i % 2 === 1;

      if (y + ROW_HEIGHT > doc.page.height - FOOTER_HEIGHT - 20) {
        doc.addPage();
        y = HEADER_HEIGHT + 14;
        // Redibujar encabezado en nueva página
        doc.rect(MARGIN, y, USABLE_WIDTH, HEADER_ROW_HEIGHT).fill(PRIMARY_COLOR);
        doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#FFFFFF');
        x = MARGIN;
        for (let h = 0; h < headers.length; h++) {
          doc.text(headers[h], x + 3, y + 7, { width: widths[h] - 6, align: 'left', lineBreak: false });
          x += widths[h];
        }
        y += HEADER_ROW_HEIGHT;
        doc.rect(MARGIN + 200, y, 315, 14).fill('#D0D9EF');
        doc.font('Helvetica-Oblique').fontSize(6.5).fillColor('#333333');
        x = MARGIN + 200;
        for (let j = 0; j < 3; j++) {
          doc.text('Méd. / Psic.', x + 3, y + 3, { width: widths[3 + j] - 6, align: 'left', lineBreak: false });
          x += widths[3 + j];
        }
        y += 14;
        doc.font('Helvetica').fontSize(7.5).fillColor('#000000');
      }

      if (isAlt) {
        doc.rect(MARGIN, y, USABLE_WIDTH, ROW_HEIGHT).fill(ALT_ROW_COLOR);
      }

      const pct = grandTotal > 0 ? `${((row.total / grandTotal) * 100).toFixed(1)}%` : '0%';

      const cells = [
        row.reason,
        String(row.total),
        pct,
        `${row.medicalApto} / ${row.psychApto}`,
        `${row.medicalNoApto} / ${row.psychNoApto}`,
        `${row.medicalAptoCondicionado} / ${row.psychAptoCondicionado}`,
      ];

      x = MARGIN;
      doc.fillColor('#1A1A1A');
      for (let c = 0; c < headers.length; c++) {
        doc.text(cells[c], x + 3, y + 6, { width: widths[c] - 6, lineBreak: false });
        x += widths[c];
      }

      doc
        .moveTo(MARGIN, y + ROW_HEIGHT)
        .lineTo(MARGIN + USABLE_WIDTH, y + ROW_HEIGHT)
        .strokeColor('#E0E0E0')
        .lineWidth(0.5)
        .stroke();

      y += ROW_HEIGHT;
    }

    // Fila de totales
    if (y + ROW_HEIGHT > doc.page.height - FOOTER_HEIGHT - 20) {
      doc.addPage();
      y = HEADER_HEIGHT + 14;
    }
    doc.rect(MARGIN, y, USABLE_WIDTH, ROW_HEIGHT).fill('#C8D8F0');
    const totals = rows.reduce(
      (acc, r) => ({
        total: acc.total + r.total,
        medicalApto: acc.medicalApto + r.medicalApto,
        medicalNoApto: acc.medicalNoApto + r.medicalNoApto,
        medicalAptoCondicionado: acc.medicalAptoCondicionado + r.medicalAptoCondicionado,
        psychApto: acc.psychApto + r.psychApto,
        psychNoApto: acc.psychNoApto + r.psychNoApto,
        psychAptoCondicionado: acc.psychAptoCondicionado + r.psychAptoCondicionado,
      }),
      { total: 0, medicalApto: 0, medicalNoApto: 0, medicalAptoCondicionado: 0, psychApto: 0, psychNoApto: 0, psychAptoCondicionado: 0 },
    );
    const totalCells = [
      'TOTAL',
      String(totals.total),
      '100%',
      `${totals.medicalApto} / ${totals.psychApto}`,
      `${totals.medicalNoApto} / ${totals.psychNoApto}`,
      `${totals.medicalAptoCondicionado} / ${totals.psychAptoCondicionado}`,
    ];
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#1A1A1A');
    x = MARGIN;
    for (let c = 0; c < headers.length; c++) {
      doc.text(totalCells[c], x + 3, y + 6, { width: widths[c] - 6, lineBreak: false });
      x += widths[c];
    }
    doc.fillColor('#000000');
    y += ROW_HEIGHT;
    doc.y = y + 12;
  }

  async generateMorbidityReport(filters: MorbidityReportDto): Promise<Buffer> {
    const data = await this.fetchMorbidityData(filters);
    const grandTotal = data.reduce((s, r) => s + r.total, 0);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: HEADER_HEIGHT + 10,
          bottom: FOOTER_HEIGHT + 10,
          left: MARGIN,
          right: MARGIN,
        },
        bufferPages: true,
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      this.drawHeader(doc);
      doc.on('pageAdded', () => this.drawHeader(doc));

      const titleY = HEADER_HEIGHT + 14;
      doc
        .font('Helvetica-Bold')
        .fontSize(13)
        .fillColor(PRIMARY_COLOR)
        .text('Reporte de Morbilidad', MARGIN, titleY, { width: USABLE_WIDTH, align: 'center' });

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
      doc.moveDown(0.8);

      this.drawMorbidityTable(doc, data, grandTotal);

      const range = doc.bufferedPageRange();
      for (let i = 0; i < range.count; i++) {
        doc.switchToPage(range.start + i);
        this.drawFooter(doc, i + 1, range.count);
      }

      doc.flushPages();
      doc.end();
    });
  }
}
