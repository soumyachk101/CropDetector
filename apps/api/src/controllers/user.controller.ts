import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export class UserController {
  static async getProfile(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
        role: user.role,
        language: user.language,
        isVerified: user.isVerified,
        isPro: user.isPro,
        createdAt: user.createdAt.toISOString(),
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { name, phone, language, isPro } = req.body;

    try {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          name,
          phone,
          language,
          isPro,
        },
      });

      return res.json({
        id: updated.id,
        email: updated.email,
        name: updated.name,
        avatarUrl: updated.avatarUrl,
        phone: updated.phone,
        role: updated.role,
        language: updated.language,
        isVerified: updated.isVerified,
        isPro: updated.isPro,
        createdAt: updated.createdAt.toISOString(),
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async getFields(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const fields = await prisma.field.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      return res.json(fields);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async createField(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { name, location, areaAcres, cropType, notes } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Field name is required' });
    }

    try {
      const field = await prisma.field.create({
        data: {
          userId,
          name,
          location,
          areaAcres: areaAcres ? Number(areaAcres) : null,
          cropType,
          notes,
        },
      });
      return res.status(201).json(field);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}
