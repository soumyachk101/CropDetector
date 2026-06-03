import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { env } from '../config/env';
import { ReportResponse } from '@crop-detector/types';

const prisma = new PrismaClient();

export class ReportService {
  static async getOrCreateReport(scanId: string): Promise<ReportResponse> {
    // Check if report already exists
    const existing = await prisma.report.findUnique({
      where: { scanId },
    });

    if (existing) {
      return this.mapReportToResponse(existing);
    }

    // Fetch scan details
    const scan = await prisma.scan.findUnique({
      where: { id: scanId },
      include: { user: true },
    });

    if (!scan) {
      throw new Error('Scan not found');
    }

    // Try to get data from DiseaseKB
    const kbEntry = scan.diseaseId
      ? await prisma.diseaseKB.findUnique({ where: { id: scan.diseaseId } })
      : null;

    let overview = kbEntry?.overview || 'No overview available.';
    let cause = kbEntry?.causativeAgent || 'Unknown cause';
    let causeType: any = kbEntry?.causeType || 'UNKNOWN';
    let progressionRisk = kbEntry?.progressionInfo || 'No risk information.';
    let symptoms = kbEntry?.symptoms || [];
    let organicTreatments = kbEntry?.organicTreatments || [];
    let chemicalTreatments = kbEntry?.chemicalTreatments || [];
    let preventiveMeasures = kbEntry?.preventiveMeasures || [];
    let bestPractices = ['Avoid continuous crop monoculture.', 'Practice proper sanitation in fields.'];
    let affectedCropStage = ['Vegetative', 'Flowering'];

    // If Anthropic API key is present, generate a dynamic weather-aware report using Claude
    if (env.ANTHROPIC_API_KEY && scan.diseaseId && !scan.isHealthy) {
      try {
        console.log('🤖 Invoking Claude Sonnet for custom report...');
        const response = await axios.post(
          'https://api.anthropic.com/v1/messages',
          {
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1200,
            temperature: 0.3,
            system: `You are AgriDoc — an expert agricultural scientist and plant pathologist with deep knowledge of Indian crop diseases.
RULES:
1. Always write in clear, simple language. Avoid jargon.
2. Provide BOTH organic and chemical treatment options. Organic options first.
3. Include dosage/concentration recommendations.
4. Output ONLY valid JSON, adhering to the requested schema. No markdown formatting, no code blocks.`,
            messages: [
              {
                role: 'user',
                content: `Generate a detailed disease report for:
Crop: ${scan.cropName}
Condition: ${scan.diseaseName}
Confidence: ${scan.confidence}%
Severity: ${scan.severity}
Location: ${scan.user.language === 'HI' ? 'North India' : 'India'}
User's Preferred Language: EN

Output this JSON structure:
{
  "overview": "2-3 sentence overview of the condition",
  "cause": "What causes this disease",
  "causeType": "FUNGAL | BACTERIAL | VIRAL | PEST | NUTRIENT_DEFICIENCY | ENVIRONMENTAL",
  "progressionRisk": "What happens if untreated",
  "symptoms": ["symptom 1", "symptom 2"],
  "organicTreatments": ["treatment 1", "treatment 2"],
  "chemicalTreatments": ["treatment 1 (chemical name, dosage)", "treatment 2"],
  "preventiveMeasures": ["measure 1", "measure 2"],
  "bestPractices": ["tip 1", "tip 2"],
  "affectedCropStage": ["seedling", "vegetative", "flowering"]
}`,
              },
            ],
          },
          {
            headers: {
              'x-api-key': env.ANTHROPIC_API_KEY,
              'anthropic-version': '2023-06-01',
              'content-type': 'application/json',
            },
          }
        );

        const text = response.data.content[0].text;
        const cleaned = text.trim().replace(/^```json/, '').replace(/```$/, '').trim();
        const json = JSON.parse(cleaned);

        overview = json.overview || overview;
        cause = json.cause || cause;
        causeType = (json.causeType || causeType) as any;
        progressionRisk = json.progressionRisk || progressionRisk;
        symptoms = json.symptoms || symptoms;
        organicTreatments = json.organicTreatments || organicTreatments;
        chemicalTreatments = json.chemicalTreatments || chemicalTreatments;
        preventiveMeasures = json.preventiveMeasures || preventiveMeasures;
        bestPractices = json.bestPractices || bestPractices;
        affectedCropStage = json.affectedCropStage || affectedCropStage;

      } catch (err: any) {
        console.error('Claude API failed, falling back to static KB:', err.message);
      }
    }

    // Save to database
    const created = await prisma.report.create({
      data: {
        scanId,
        diseaseId: scan.diseaseId,
        overview,
        cause,
        causeType,
        progressionRisk,
        symptoms,
        organicTreatments,
        chemicalTreatments,
        preventiveMeasures,
        bestPractices,
        affectedCropStage,
      },
    });

    return this.mapReportToResponse(created);
  }

  private static mapReportToResponse(report: any): ReportResponse {
    return {
      id: report.id,
      scanId: report.scanId,
      diseaseId: report.diseaseId,
      overview: report.overview,
      cause: report.cause,
      causeType: report.causeType,
      progressionRisk: report.progressionRisk,
      symptoms: report.symptoms,
      organicTreatments: report.organicTreatments,
      chemicalTreatments: report.chemicalTreatments,
      preventiveMeasures: report.preventiveMeasures,
      bestPractices: report.bestPractices,
      affectedCropStage: report.affectedCropStage,
      generatedAt: report.generatedAt.toISOString(),
    };
  }
}
