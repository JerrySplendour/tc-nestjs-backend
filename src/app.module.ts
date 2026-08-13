import { Module } from '@nestjs/common'; import { ConfigModule, ConfigService } from '@nestjs/config'; import { TypeOrmModule } from '@nestjs/typeorm'; import { AuthModule } from './auth/auth.module'; import { entities } from './database/entities'; import { UsersModule } from './users/users.module'; import { MediaModule } from './media/media.module'; import { ProgramsModule } from './programs/programs.module'; import { CoursesModule } from './courses/courses.module'; import { CommunityModule } from './community/community.module'; import { EventsModule } from './events/events.module'; import { FitnessModule } from './fitness/fitness.module'; import { BillingModule } from './billing/billing.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbType = config.get<string>('DB_TYPE', 'sqlite');
        const nodeEnv = config.get<string>('NODE_ENV', 'development');

        if (dbType === 'postgres') {
          return {
            type: 'postgres',
            url: config.get<string>('DATABASE_URL'),
            entities,
            synchronize: config.get<string>('DB_SYNCHRONIZE', 'false') === 'true' || nodeEnv === 'development',
            logging: false,
            ssl: nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
          };
        }

        return {
          type: 'sqlite',
          database: config.get<string>('DATABASE_URL', './tc-academy.sqlite'),
          entities,
          synchronize: config.get('NODE_ENV') !== 'production',
        };
      },
    }),
    AuthModule,
    UsersModule,
    MediaModule,
    ProgramsModule,
    CoursesModule,
    CommunityModule,
    EventsModule,
    FitnessModule,
    BillingModule,
  ],
})
export class AppModule {}
