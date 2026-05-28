import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as webpush from 'web-push';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationsService {
    constructor(
        private prisma: PrismaService,
        private configService: ConfigService
    ) {
        // Web Push Setup
        const publicKey = this.configService.get('NEXT_PUBLIC_VAPID_PUBLIC_KEY');
        const privateKey = this.configService.get('VAPID_PRIVATE_KEY');
        const subject = this.configService.get('VAPID_SUBJECT') || 'mailto:admin@example.com';

        if (publicKey && privateKey) {
            webpush.setVapidDetails(subject, publicKey, privateKey);
        }

        // Firebase Admin Setup
        if (!admin.apps.length) {
            const serviceAccountPath = this.configService.get('FIREBASE_SERVICE_ACCOUNT_PATH');
            if (serviceAccountPath) {
                try {
                    admin.initializeApp({
                        credential: admin.credential.cert(serviceAccountPath),
                    });
                    console.log('[NOTIFICATIONS] Firebase Admin inicializado com sucesso.');
                } catch (error) {
                    console.error('[NOTIFICATIONS] Erro ao inicializar Firebase Admin:', error);
                }
            }
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

        // Send Web Push (PWA)
        this.sendPushToUser(userId, { title, body: message, url: link }).catch(err =>
            console.error(`Error sending PWA push to user ${userId}`, err)
        );

        // Send FCM (Native App)
        this.sendFcmToUser(userId, { title, body: message, url: link }).catch(err =>
            console.error(`Error sending FCM push to user ${userId}`, err)
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

    async saveFcmToken(userId: string, token: string, deviceType?: string) {
        // Check if exists
        const existing = await this.prisma.fcmToken.findUnique({
            where: { token }
        });

        if (existing) {
            if (existing.userId === userId) return existing;
            // Token re-assigned to new user
            return this.prisma.fcmToken.update({
                where: { id: existing.id },
                data: { userId, deviceType }
            });
        }

        return this.prisma.fcmToken.create({
            data: {
                userId,
                token,
                deviceType
            },
        });
    }

    private async sendFcmToUser(userId: string, payload: any) {
        if (!admin.apps.length) return;

        const tokens = await this.prisma.fcmToken.findMany({
            where: { userId }
        });

        if (tokens.length === 0) return;

        const registrationTokens = tokens.map(t => t.token);

        const message: admin.messaging.MulticastMessage = {
            tokens: registrationTokens,
            notification: {
                title: payload.title,
                body: payload.body,
            },
            data: {
                url: payload.url || '/',
                click_action: 'FLUTTER_NOTIFICATION_CLICK', // Manter compatibilidade se necessário
            },
            android: {
                priority: 'high',
                notification: {
                    channelId: 'default',
                    clickAction: 'OPEN_ACTIVITY_1',
                }
            }
        };

        try {
            const response = await admin.messaging().sendEachForMulticast(message);
            
            // Cleanup invalid tokens
            if (response.failureCount > 0) {
                const tokensToDelete = [];
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        const error = resp.error as any;
                        if (error.code === 'messaging/invalid-registration-token' ||
                            error.code === 'messaging/registration-token-not-registered') {
                            tokensToDelete.push(registrationTokens[idx]);
                        }
                    }
                });

                if (tokensToDelete.length > 0) {
                    await this.prisma.fcmToken.deleteMany({
                        where: { token: { in: tokensToDelete } }
                    });
                }
            }
        } catch (error) {
            console.error('[FCM] Error sending multicast message:', error);
        }
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
