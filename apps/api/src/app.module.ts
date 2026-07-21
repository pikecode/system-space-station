import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { PositionsModule } from './modules/positions/positions.module';
import { UsersModule } from './modules/users/users.module';
import { CustomersModule } from './modules/customers/customers.module';
import { MemberLevelsModule } from './modules/member-levels/member-levels.module';
import { MembershipsModule } from './modules/memberships/memberships.module';
import { AppConfigModule } from './modules/config/config.module';
import { CommissionsModule } from './modules/commissions/commissions.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => {
        if (!config.DATABASE_URL) throw new Error('缺少 DATABASE_URL 环境变量');
        if (!config.JWT_SECRET || String(config.JWT_SECRET).length < 32) {
          throw new Error('JWT_SECRET 必须配置且长度至少为32个字符');
        }
        if (!/^[a-fA-F0-9]{64}$/.test(String(config.PII_ENCRYPTION_KEY ?? ''))) {
          throw new Error('PII_ENCRYPTION_KEY 必须配置为64位十六进制字符串');
        }
        return config;
      },
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    DepartmentsModule,
    PositionsModule,
    UsersModule,
    CustomersModule,
    MemberLevelsModule,
    MembershipsModule,
    AppConfigModule,
    CommissionsModule,
    SchedulerModule,
  ],
})
export class AppModule {}
