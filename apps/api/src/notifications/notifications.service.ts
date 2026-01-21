import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as webpush from 'web-push';

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService) {
        const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        const privateKey = process.env.VAPID_PRIVATE_KEY;
        const subject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';

        if (publicKey && privateKey) {
            webpush.setVapidDetails(subject, publicKey, privateKey);
        }
    }

    async create(userId: string, title: string, message: string, type: string, link?: string) {
        const notification = await this.prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                link,
            },
        });

        // Send Web Push (Fire and forget)
        this.sendPushToUser(userId, { title, body: message, url: link }).catch(err =>
            console.error(`Error sending push to user ${userId}`, err)
        );

        return notification;
    }

    async saveSubscription(userId: string, subscription: any) {
        // Check if exists
        const existing = await this.prisma.pushSubscription.findFirst({
            where: {
                userId,
                endpoint: subscription.endpoint
            }
        });

        if (existing) return existing;

        return this.prisma.pushSubscription.create({
            data: {
                userId,
                endpoint: subscription.endpoint,
                keys: subscription.keys,
            },
        });
    }

    private async sendPushToUser(userId: string, payload: any) {
        const subscriptions = await this.prisma.pushSubscription.findMany({
            where: { userId }
        });

        if (subscriptions.length === 0) return;

        const notificationPayload = JSON.stringify({
            title: payload.title,
            body: payload.body,
            icon: '/icon-192x192.png',
            data: {
                url: payload.url || '/'
            }
        });

        const promises = subscriptions.map(sub => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: sub.keys as any
            };
            return webpush.sendNotification(pushSubscription, notificationPayload)
                .catch(error => {
                    if (error.statusCode === 410 || error.statusCode === 404) {
                        console.log(`Subscription expired for user ${userId}, deleting...`);
                        return this.prisma.pushSubscription.delete({ where: { id: sub.id } });
                    }
                    console.error('Error sending push:', error);
                });
        });

        await Promise.all(promises);
    }

    async findAll(userId: string) {
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async markAsRead(id: string, userId: string) {
        // Verify ownership to be safe
        const notification = await this.prisma.notification.findUnique({ where: { id } });
        if (!notification || notification.userId !== userId) {
            throw new Error('Notification not found or access denied');
        }

        return this.prisma.notification.update({
            where: { id },
            data: { read: true },
        });
    }
}
