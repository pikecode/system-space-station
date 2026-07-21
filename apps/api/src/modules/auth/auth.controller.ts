import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('wechat-login')
  wechatLogin(@Body('code') code: string) {
    return this.authService.wechatLogin(code);
  }

  @Post('wechat-bind')
  bindWechat(
    @Body('code') code: string,
    @Body('account') account: string,
    @Body('password') password: string,
  ) {
    return this.authService.bindWechat(code, account, password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: any) {
    return this.authService.me(user.id);
  }
}
