import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { InvestmentsService } from './investments.service';
import { CreateInvestmentProductDto } from './dto/create-investment-product.dto';
import { CreateCustomerInvestmentDto } from './dto/create-customer-investment.dto';
import { CreateProductYieldDto } from './dto/create-product-yield.dto';
import { CreateProfitShareConfigDto } from './dto/create-profit-share-config.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller()
export class InvestmentsController {
  constructor(private service: InvestmentsService) {}

  @Get('investment-products')
  findProducts(@Query() query: { status?: string }) {
    return this.service.findProducts(query);
  }

  @Post('investment-products')
  createProduct(@Body() dto: CreateInvestmentProductDto, @CurrentUser() user: any) {
    return this.service.createProduct(dto, user.id);
  }

  @Get('customer-investments')
  findCustomerInvestments(@Query() query: { customerId?: string; productId?: string; status?: string }) {
    return this.service.findCustomerInvestments(query);
  }

  @Post('customer-investments')
  createCustomerInvestment(@Body() dto: CreateCustomerInvestmentDto, @CurrentUser() user: any) {
    return this.service.createCustomerInvestment(dto, user);
  }

  @Get('product-yields')
  findYieldPeriods(@Query() query: { productId?: string; status?: string }) {
    return this.service.findYieldPeriods(query);
  }

  @Post('product-yields')
  createYieldPeriod(@Body() dto: CreateProductYieldDto, @CurrentUser() user: any) {
    return this.service.createYieldPeriod(dto, user.id);
  }

  @Post('product-yields/:id/confirm')
  confirmYieldPeriod(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.confirmYieldPeriod(id, user.id);
  }

  @Get('customer-profits')
  findProfitRecords(@Query() query: { customerId?: string; productId?: string; status?: string }) {
    return this.service.findProfitRecords(query);
  }

  @Post('customer-profits/:id/settle')
  settleProfitRecord(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.settleProfitRecord(id, user.id);
  }

  @Get('profit-share-configs')
  getProfitShareConfigs() {
    return this.service.getProfitShareConfigs();
  }

  @Get('profit-share-configs/current')
  getCurrentProfitShareConfig() {
    return this.service.getCurrentProfitShareConfig();
  }

  @Post('profit-share-configs')
  createProfitShareConfig(@Body() dto: CreateProfitShareConfigDto, @CurrentUser() user: any) {
    return this.service.createProfitShareConfig(dto, user.id);
  }
}
