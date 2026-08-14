import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscriber, Broadcast, BroadcastAnalytics } from '../database/entities';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NewsletterService {
  private readonly logger = new Logger(NewsletterService.name);
  private resend: Resend | null = null;

  constructor(
    @InjectRepository(Subscriber)
    private readonly subscriberRepo: Repository<Subscriber>,
    @InjectRepository(Broadcast)
    private readonly broadcastRepo: Repository<Broadcast>,
    @InjectRepository(BroadcastAnalytics)
    private readonly analyticsRepo: Repository<BroadcastAnalytics>,
    private readonly configService: ConfigService,
  ) {
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');
    if (resendApiKey) {
      this.resend = new Resend(resendApiKey);
    } else {
      this.logger.warn('RESEND_API_KEY is not set. Newsletter service will simulate sending emails.');
    }
  }

  async getAllSubscribers() {
    return this.subscriberRepo.find({ order: { createdAt: 'DESC' } });
  }

  async subscribe(email: string, firstName?: string, lastName?: string) {
    let sub = await this.subscriberRepo.findOne({ where: { email } });
    if (!sub) {
      sub = this.subscriberRepo.create({ email, firstName, lastName });
    } else {
      sub.status = 'active';
      if (firstName) sub.firstName = firstName;
      if (lastName) sub.lastName = lastName;
    }
    return this.subscriberRepo.save(sub);
  }

  async updateSubscriber(id: number, data: Partial<Subscriber>) {
    await this.subscriberRepo.update(id, data);
    return this.subscriberRepo.findOne({ where: { id } });
  }

  async deleteSubscriber(id: number) {
    return this.subscriberRepo.delete(id);
  }

  async saveBroadcast(data: Partial<Broadcast>) {
    let broadcast: Broadcast;
    if (data.id) {
      broadcast = await this.broadcastRepo.findOne({ where: { id: data.id } });
      if (broadcast) {
        Object.assign(broadcast, data);
      } else {
        broadcast = this.broadcastRepo.create(data);
      }
    } else {
      broadcast = this.broadcastRepo.create(data);
    }
    return this.broadcastRepo.save(broadcast);
  }

  async getAllBroadcasts() {
    return this.broadcastRepo.find({ order: { createdAt: 'DESC' } });
  }

  async getTemplates() {
    return this.broadcastRepo.find({ order: { createdAt: 'DESC' } });
  }

  async saveTemplate(data: any) {
    const subject = data.subject || data.name || data.title || 'Untitled Template';
    return this.saveBroadcast({
      id: data.id ? Number(data.id) : undefined,
      subject,
      contentHtml: data.contentHtml || '',
      contentJson: data.contentJson || null,
      status: 'draft',
    });
  }

  async deleteTemplate(id: number) {
    const broadcast = await this.broadcastRepo.findOne({ where: { id } });
    if (!broadcast) throw new NotFoundException('Template not found');
    return this.broadcastRepo.delete(id);
  }

  async sendBroadcast(id: number) {
    const broadcast = await this.broadcastRepo.findOne({ where: { id } });
    if (!broadcast) throw new NotFoundException('Broadcast not found');

    const subscribers = await this.subscriberRepo.find({ where: { status: 'active' } });
    if (subscribers.length === 0) throw new BadRequestException('No active subscribers found');

    if (!this.resend) {
      this.logger.warn('Simulating send: RESEND_API_KEY missing.');
      broadcast.status = 'sent';
      broadcast.sentAt = new Date();
      return this.broadcastRepo.save(broadcast);
    }

    try {
      broadcast.status = 'sending';
      await this.broadcastRepo.save(broadcast);

      const emails = subscribers.map((sub) => ({
        from: 'The Transformation Collective <noreply@thetransformationcollective.org>',
        to: sub.email,
        subject: broadcast.subject,
        html: broadcast.contentHtml,
      }));

      const chunkSize = 50;
      for (let i = 0; i < emails.length; i += chunkSize) {
        const chunk = emails.slice(i, i + chunkSize);
        await this.resend.batch.send(chunk);
      }

      broadcast.status = 'sent';
      broadcast.sentAt = new Date();
      await this.broadcastRepo.save(broadcast);

      return broadcast;
    } catch (error: any) {
      this.logger.error('Failed to send broadcast', error);
      broadcast.status = 'draft';
      await this.broadcastRepo.save(broadcast);
      throw new BadRequestException(`Failed to send broadcast: ${error?.message || error}`);
    }
  }

  async handleWebhook(payload: any) {
    const type = payload.type;
    const email = payload.data?.to?.[0];
    this.logger.log(`Received webhook: ${type} for ${email}`);
  }
}
