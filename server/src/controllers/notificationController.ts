import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

const toAscii = (str?: string) => (str ? str.replace(/[^\x00-\x7F]/g, '').trim() : '');

/**
 * Helper to dispatch in-app notifications
 */
export async function sendNotification(params: {
  userId: string;
  title: string;
  message: string;
  link?: string;
}) {
  try {
    return await prisma.notification.create({
      data: {
        userId: params.userId,
        title: toAscii(params.title),
        message: toAscii(params.message),
        link: params.link ? toAscii(params.link) : null,
      },
    });
  } catch (err) {
    console.error('Failed to dispatch notification:', err);
    return null;
  }
}

/**
 * Get current user's notifications
 */
export const getMyNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    res.json({
      notifications,
      unreadCount,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch notifications.' });
  }
};

/**
 * Mark a single notification as read
 */
export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.id;

    const notif = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notif || notif.userId !== userId) {
      res.status(404).json({ message: 'Notification not found.' });
      return;
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to mark notification as read.' });
  }
};

/**
 * Mark all notifications as read for current user
 */
export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    res.json({ message: 'All notifications marked as read.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to mark all notifications as read.' });
  }
};
