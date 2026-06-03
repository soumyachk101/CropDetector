import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { AIService } from '../services/ai.service';
import { ReportService } from '../services/report.service';

const prisma = new PrismaClient();

export class ScanController {
  static async upload(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    // Generate a temporary mock URL or base64 representation for database
    // In production we would upload to S3, but for local prototype let's encode as base64
    const originalImageBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // 1. Create Scan record in PENDING / PROCESSING state
    const scan = await prisma.scan.create({
      data: {
        userId,
        originalImageUrl: originalImageBase64,
        status: 'PROCESSING',
      },
    });

    try {
      // 2. Call FastAPI AI engine
      const prediction = await AIService.predict(req.file.buffer, req.file.originalname);

      // 3. Update Scan record with predictions
      const updatedScan = await prisma.scan.update({
        where: { id: scan.id },
        data: {
          status: 'COMPLETED',
          cropName: prediction.cropName,
          diseaseName: prediction.diseaseName,
          diseaseId: prediction.diseaseId,
          confidence: prediction.confidence,
          severity: prediction.severity as any,
          isHealthy: prediction.isHealthy,
          heatmapImageUrl: prediction.heatmapImageUrl,
          inferenceTimeMs: prediction.inferenceTimeMs,
        },
      });

      // 4. Trigger report generation
      await ReportService.getOrCreateReport(scan.id);

      // Fetch final scan with report included
      const finalScan = await prisma.scan.findUnique({
        where: { id: scan.id },
        include: { report: true },
      });

      return res.status(201).json(finalScan);
    } catch (error: any) {
      console.error('Scan processing failed:', error.message);
      
      // Update scan to FAILED
      await prisma.scan.update({
        where: { id: scan.id },
        data: {
          status: 'FAILED',
        },
      });

      return res.status(500).json({
        message: error.message || 'Error occurred during AI analysis.',
        scanId: scan.id
      });
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response) {
    const { scanId } = req.params;
    try {
      const scan = await prisma.scan.findUnique({
        where: { id: scanId },
        include: { report: true },
      });
      if (!scan) {
        return res.status(404).json({ message: 'Scan not found' });
      }
      return res.json(scan);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async getHistory(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const history = await prisma.scan.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: { report: true },
      });
      return res.json(history);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response) {
    const { scanId } = req.params;
    try {
      await prisma.scan.delete({ where: { id: scanId } });
      return res.json({ success: true, message: 'Scan deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}
