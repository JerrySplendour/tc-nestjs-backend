import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Subscription, Payment, Program } from '../database/entities';
import { UsersController } from './users.controller';
import { StatsController } from './stats.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Subscription, Payment, Program])],
  controllers: [UsersController, StatsController],
  providers: [],
  exports: [],
})
export class UsersModule {}
