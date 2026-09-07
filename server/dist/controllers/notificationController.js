"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllAsRead = exports.markAsRead = exports.getMyNotifications = void 0;
exports.sendNotification = sendNotification;
const db_1 = __importDefault(require("../config/db"));
const toAscii = (str) => (str ? str.replace(/[^\x00-\x7F]/g, '').trim() : '');
/**
 * Helper to dispatch in-app notifications
 */
async function sendNotification(params) {
    try {
        return await db_1.default.notification.create({
            data: {
                userId: params.userId,
                title: toAscii(params.title),
                message: toAscii(params.message),
                link: params.link ? toAscii(params.link) : null,
            },
        });
    }
    catch (err) {
        console.error('Failed to dispatch notification:', err);
        return null;
    }
}
/**
 * Get current user's notifications
 */
const getMyNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await db_1.default.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 30,
        });
        const unreadCount = await db_1.default.notification.count({
            where: { userId, isRead: false },
        });
        res.json({
            notifications,
            unreadCount,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch notifications.' });
    }
};
exports.getMyNotifications = getMyNotifications;
/**
 * Mark a single notification as read
 */
const markAsRead = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user.id;
        const notif = await db_1.default.notification.findUnique({
            where: { id },
        });
        if (!notif || notif.userId !== userId) {
            res.status(404).json({ message: 'Notification not found.' });
            return;
        }
        const updated = await db_1.default.notification.update({
            where: { id },
            data: { isRead: true },
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to mark notification as read.' });
    }
};
exports.markAsRead = markAsRead;
/**
 * Mark all notifications as read for current user
 */
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await db_1.default.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
        res.json({ message: 'All notifications marked as read.' });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to mark all notifications as read.' });
    }
};
exports.markAllAsRead = markAllAsRead;
