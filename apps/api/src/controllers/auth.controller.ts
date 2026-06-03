import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

const prisma = new PrismaClient();

export class AuthController {
  static async register(req: Request, res: Response) {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    try {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name,
          role: 'FARMER',
          language: 'HI',
        },
      });

      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN as any }
      );

      const refreshToken = jwt.sign(
        { id: user.id },
        env.JWT_SECRET,
        { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as any }
      );

      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: refreshToken,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });

      return res.status(201).json({
        user: {
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
        },
        accessToken,
        refreshToken,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async login(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN as any }
      );

      const refreshToken = jwt.sign(
        { id: user.id },
        env.JWT_SECRET,
        { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as any }
      );

      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: refreshToken,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });

      return res.json({
        user: {
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
        },
        accessToken,
        refreshToken,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}
