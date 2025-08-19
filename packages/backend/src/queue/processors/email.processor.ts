import { Process, Processor } from '@nestjs/bull';
import { Logger, Inject, forwardRef } from '@nestjs/common';
import { Job } from 'bull';

import { EmailService } from '../../auth/email.service';
import { EmailJob } from '../services/email-queue.service';

@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(
    @Inject(forwardRef(() => EmailService))
    private readonly emailService: EmailService,
  ) { }

  @Process('send-verification-email')
  async handleVerificationEmail(job: Job<EmailJob>) {
    const { to, token, metadata } = job.data;

    this.logger.log(`Processing verification email job for ${to}`, {
      jobId: job.id,
      metadata
    });

    try {
      await this.emailService.sendVerificationEmail(to, token);

      this.logger.log(`Verification email sent successfully for ${to}`, {
        jobId: job.id
      });

      return { success: true, to, timestamp: new Date() };
    } catch (error) {
      this.logger.error(`Failed to send verification email for ${to}`, {
        jobId: job.id,
        error: error.message,
        stack: error.stack,
      });

      throw error;
    }
  }

}