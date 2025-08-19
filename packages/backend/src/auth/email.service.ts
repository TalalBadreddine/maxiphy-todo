import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

import { LoggerService } from '../common/services/logger.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private fromEmail: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly loggerService: LoggerService,
  ) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpConfig = this.configService.get('email.smtp') || {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: this.configService.get<string>('email.from') || 'talalbadreddine@gmail.com',
        pass: this.configService.get<string>('email.password') || 'xkok nlvo ehch tvhd',
      },
    };
    this.fromEmail = this.configService.get<string>('email.from') || 'talalbadreddine@gmail.com';

    this.logger.log('SMTP Config Debug:', JSON.stringify(smtpConfig, null, 2));
    this.logger.log('From Email:', this.fromEmail);

    if (!smtpConfig?.auth?.user || !smtpConfig?.auth?.pass) {
      this.logger.warn('SMTP credentials not configured. Email functionality will be disabled.');
      this.logger.warn('Missing user:', !smtpConfig?.auth?.user);
      this.logger.warn('Missing pass:', !smtpConfig?.auth?.pass);
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.auth.user,
        pass: smtpConfig.auth.pass,
      },
    });

    this.logger.log('SMTP transporter initialized successfully');
  }

  async sendVerificationEmail(to: string, token: string) {
    if (!this.transporter) {
      this.logger.warn('SMTP transporter not configured. Skipping verification email.');
      return;
    }

    const frontendUrl = this.configService.get<string>('app.frontendUrl') || 'http://localhost:3000';
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

    const subject = 'Verify your email address';
    const htmlContent = this.getVerificationEmailTemplate(verificationUrl);
    const textContent = `Welcome to Maxiphy! Please verify your email address by visiting: ${verificationUrl}`;

    const mailOptions = {
      from: this.fromEmail,
      to,
      subject,
      text: textContent,
      html: htmlContent,
    };

    try {
      await this.transporter.sendMail(mailOptions);

      this.logger.log('Verification email sent successfully', { to });
    } catch (error) {
      this.logger.error('Failed to send verification email', { to, error: error.message });
      throw error;
    }
  }


  private getVerificationEmailTemplate(verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verify Your Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #007bff; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; }
          .button { display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Maxiphy!</h1>
          </div>
          <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Thank you for registering with Maxiphy. To complete your registration, please verify your email address by clicking the button below:</p>
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
            <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
            <p><a href="${verificationUrl}">${verificationUrl}</a></p>
            <p>This verification link will expire in 1 hour for security reasons.</p>
            <p>If you didn't create an account with Maxiphy, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2024 Maxiphy. All rights reserved.</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

}