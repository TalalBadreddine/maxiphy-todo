import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Logger,
  ValidationPipe,
  UsePipes,
  Res,
  Get,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { ApiAuth } from '../common/decorators/api-auth.decorator';
import { ApiThrottle } from '../common/decorators/throttle.decorator';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';
import {
  LoginDto,
  RegisterDto,
  VerifyEmailDto,
} from './dto/auth.dto';
import { Response } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @ApiThrottle(5, 60) // 5 attempts per minute
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async login(@Request() req, @Res() res: Response, @Body() loginDto: LoginDto): Promise<Response> {
    const result = await this.authService.login(loginDto, req.ip, req.get('User-Agent'));

    res.cookie('auth-token', result.data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 20 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: result.success,
      message: result.message,
      data: { user: result.data.user, accessToken: result.data.accessToken }
    });
  }

  @Post('register')
  @ApiThrottle(3, 60) // 3  per minute
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async register(@Body() registerDto: RegisterDto, @Request() req) {
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    this.logger.log('Registration request', { email: registerDto.email, ip: ipAddress });
    return this.authService.register(registerDto, ipAddress, userAgent);
  }

  @Get('logout')
  @ApiAuth()
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(
    @CurrentUser() user: CurrentUserPayload,
    @Request() req,
    @Res() res: Response,
  ): Promise<Response> {
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    this.logger.log('Logout request', { userId: user.id, ip: ipAddress });
    const result = await this.authService.logout(user.id, ipAddress, userAgent);

    res.clearCookie('auth-token');

    return res.json(result);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email address' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or expired verification token' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    this.logger.log('Email verification request');
    return this.authService.verifyEmail(verifyEmailDto.token);
  }

  @Get('me')
  @ApiAuth()
  @ApiOperation({ summary: 'Get current user information' })
  @ApiResponse({ status: 200, description: 'User information retrieved successfully' })
  async getCurrentUser(@CurrentUser() user: CurrentUserPayload) {
    return {
      success: true,
      message: 'User information retrieved successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified,
        },
      },
    };
  }
}