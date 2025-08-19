import { Injectable, Logger } from '@nestjs/common';

import { EmailService } from './email.service';
import { EmailQueueService } from '../queue/services/email-queue.service';

@Injectable()
export class AuthEmailService {
  private readonly logger = new Logger(AuthEmailService.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly emailQueueService: EmailQueueService,
  ) { }

  async sendVerificationEmail(to: string, token: string) {
    try {
      await this.emailQueueService.addVerificationEmailJob(to, token, {
        requestedAt: new Date(),
        source: 'auth-service',
      });

      this.logger.log(`Verification email queued for ${to}`);
    } catch (error) {
      this.logger.error(`Failed to queue verification email for ${to}`, error);
      throw error;
    }
  }


  async sendVerificationEmailImmediate(to: string, token: string) {
    return this.emailService.sendVerificationEmail(to, token);
  }

  async getQueueStatus() {
    return this.emailQueueService.getQueueStatus();
  }

  async retryFailedJobs() {
    return this.emailQueueService.retryFailedJobs();
  }

  async cleanQueue() {
    return this.emailQueueService.cleanQueue();
  }
}