import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { TransferCustomerDto } from './dto/transfer-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Get()
  findAll(@CurrentUser() user: any, @Query() query: QueryCustomerDto) {
    return this.customersService.findAll(user, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.customersService.findOne(id, user);
  }

  @Post()
  create(@Body() dto: CreateCustomerDto, @CurrentUser() user: any) {
    return this.customersService.create(dto, user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCustomerDto, @CurrentUser() user: any) {
    return this.customersService.update(id, dto, user);
  }

  @Patch(':id/transfer')
  transfer(@Param('id') id: string, @Body() dto: TransferCustomerDto, @CurrentUser() user: any) {
    return this.customersService.transfer(id, dto, user);
  }

  @Delete(':id')
  disable(@Param('id') id: string, @CurrentUser() user: any) {
    return this.customersService.disable(id, user);
  }
}
