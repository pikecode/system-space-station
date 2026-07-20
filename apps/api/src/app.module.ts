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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    DepartmentsModule,
    PositionsModule,
    UsersModule,
    CustomersModule,
    MemberLevelsModule,
    MembershipsModule,
  ],
})
export class AppModule {}
