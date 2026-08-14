import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { entities, User } from './database/entities';
import { UsersModule } from './users/users.module';
import { MediaModule } from './media/media.module';
import { ProgramsModule } from './programs/programs.module';
import { CoursesModule } from './courses/courses.module';
import { CommunityModule } from './community/community.module';
import { EventsModule } from './events/events.module';
import { FitnessModule } from './fitness/fitness.module';
import { BillingModule } from './billing/billing.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { ScheduleModule } from '@nestjs/schedule';

import { AdminModule } from '@adminjs/nestjs';
import * as AdminJSTypeorm from '@adminjs/typeorm';
import AdminJS from 'adminjs';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

AdminJS.registerAdapter({
  Database: AdminJSTypeorm.Database,
  Resource: AdminJSTypeorm.Resource,
});

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
    AdminModule.createAdminAsync({
      inject: [ConfigService, DataSource],
      useFactory: async (config: ConfigService, dataSource: DataSource) => {
        const adminJsOptions = {
          rootPath: '/admin',
          resources: entities,
        };

        return {
          adminJsOptions,
          auth: {
            authenticate: async (email, password) => {
              const superEmail = config.get<string>('SUPERADMIN_EMAIL', 'admin@example.com');
              const superUsername = config.get<string>('SUPERADMIN_USERNAME', superEmail);
              const superPassword = config.get<string>('SUPERADMIN_PASSWORD', '');

              const userRepository = dataSource.getRepository(User);
              
              if (superPassword && (email === superEmail || email === superUsername) && password === superPassword) {
                let user = await userRepository.findOne({
                  where: [{ email: superEmail }, { username: superUsername }]
                });

                if (!user) {
                  const passwordHash = await bcrypt.hash(superPassword, 10);
                  user = userRepository.create({
                    email: superEmail,
                    username: superUsername,
                    firstName: config.get<string>('SUPERADMIN_FIRST_NAME', 'Super'),
                    lastName: config.get<string>('SUPERADMIN_LAST_NAME', 'Admin'),
                    passwordHash,
                    role: 'superadmin',
                    isVerified: true
                  });
                  await userRepository.save(user);
                }
              }

              const user = await userRepository.findOne({
                where: [{ email }, { username: email }]
              });

              if (user && (user.role === 'admin' || user.role === 'superadmin')) {
                const isMatch = await bcrypt.compare(password, user.passwordHash);
                if (isMatch) {
                  return {
                    email: user.email,
                    title: `${user.firstName} ${user.lastName}`,
                    avatarUrl: user.avatarUrl,
                    role: user.role,
                  };
                }
              }

              return null;
            },
            cookieName: 'tc_admin_session',
            cookiePassword: config.get<string>('SESSION_SECRET') || config.get<string>('JWT_SECRET') || 'fallback_secret_must_be_at_least_32_characters_long_for_cookie',
          },
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
    NewsletterModule,
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}
