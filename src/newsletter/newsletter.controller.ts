import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../common/auth';

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Get('subscribers')
  async getSubscribers() {
    return this.newsletterService.getAllSubscribers();
  }

  @Post('subscribe')
  async subscribe(@Body() body: { email: string; firstName?: string; lastName?: string }) {
    return this.newsletterService.subscribe(body.email, body.firstName, body.lastName);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Put('subscribers/:id')
  async updateSubscriber(@Param('id') id: string, @Body() data: any) {
    return this.newsletterService.updateSubscriber(Number(id), data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Delete('subscribers/:id')
  async deleteSubscriber(@Param('id') id: string) {
    return this.newsletterService.deleteSubscriber(Number(id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Get('broadcasts')
  async getBroadcasts() {
    return this.newsletterService.getAllBroadcasts();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Post('broadcasts')
  async saveBroadcast(@Body() body: any) {
    return this.newsletterService.saveBroadcast(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Post('broadcasts/:id/send')
  async sendBroadcast(@Param('id') id: string) {
    return this.newsletterService.sendBroadcast(Number(id));
  }

  // --- Templates Endpoints ---
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Get('templates')
  async getTemplates() {
    return this.newsletterService.getTemplates();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Post('templates')
  async saveTemplate(@Body() body: any) {
    return this.newsletterService.saveTemplate(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Delete('templates/:id')
  async deleteTemplate(@Param('id') id: string) {
    return this.newsletterService.deleteTemplate(Number(id));
  }

  @Post('webhooks')
  async handleWebhook(@Body() payload: any) {
    return this.newsletterService.handleWebhook(payload);
  }
}
