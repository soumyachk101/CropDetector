import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ReportService } from '../services/report.service';

export class ReportController {
  static async getByScanId(req: AuthenticatedRequest, res: Response) {
    const { scanId } = req.params;

    try {
      const report = await ReportService.getOrCreateReport(scanId);
      return res.json(report);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}
