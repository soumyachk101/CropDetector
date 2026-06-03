import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { ScanController } from '../controllers/scan.controller';
import { ReportController } from '../controllers/report.controller';
import { UserController } from '../controllers/user.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';

const router = Router();

// Authentication
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);

// Scan & Detection
router.post('/scan/upload', requireAuth, uploadMiddleware.single('image'), ScanController.upload);
router.get('/scan/history', requireAuth, ScanController.getHistory);
router.get('/scan/:scanId', requireAuth, ScanController.getById);
router.delete('/scan/:scanId', requireAuth, ScanController.delete);

// Reports
router.get('/report/:scanId', requireAuth, ReportController.getByScanId);

// User Profile & Fields
router.get('/user/profile', requireAuth, UserController.getProfile);
router.patch('/user/profile', requireAuth, UserController.updateProfile);
router.get('/user/fields', requireAuth, UserController.getFields);
router.post('/user/fields', requireAuth, UserController.createField);

// Weather widget mock (Home Dashboard requirement)
router.get('/weather/advisory', requireAuth, (req, res) => {
  return res.json({
    temp: 31,
    condition: 'Partly Cloudy',
    icon: 'cloud-sun',
    advisory: 'Heavy rain expected tomorrow. Fungal infection risks are high for Tomato & Potato crop varieties. Apply preventive copper spray if not done already.',
    riskLevel: 'HIGH',
  });
});

export default router;
