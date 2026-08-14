import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard, Roles, RolesGuard } from '../common/auth';
import { Payment, Program, Subscription, User } from '../database/entities';

@Controller('stats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'superadmin')
export class StatsController {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(Subscription) private readonly subsRepo: Repository<Subscription>,
    @InjectRepository(Payment) private readonly paymentsRepo: Repository<Payment>,
    @InjectRepository(Program) private readonly programsRepo: Repository<Program>,
  ) {}

  @Get('overview')
  async getOverview() {
    const totalUsers = await this.usersRepo.count();
    const activeSubscriptions = await this.subsRepo.count({ where: { status: 'active' } });
    const totalPrograms = await this.programsRepo.count();

    // Total revenue sum of payments where status is paid/completed
    const payments = await this.paymentsRepo.find({ where: [{ status: 'paid' }, { status: 'completed' }] });
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    return {
      totalUsers,
      activeSubscriptions,
      totalPrograms,
      totalRevenue,
      monthlyRevenue: totalRevenue,
    };
  }
}
