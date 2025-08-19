import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

export interface EmailJob {
  type: 'verification' | 'password-reset';
  to: string;
  token: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class EmailQueueService {
  private readonly logger = new Logger(EmailQueueService.name);

  constructor(@InjectQueue('email') private emailQueue: Queue) { }

  async addVerificationEmailJob(to: string, token: string, metadata?: Record<string, any>) {
    const job: EmailJob = {
      type: 'verification',
      to,
      token,
      metadata,
    };

    try {
      const queueJob = await this.emailQueue.add('send-verification-email', job, {
        priority: 1,
        delay: 0,
      });

      this.logger.log(`Verification email job queued for ${to}`, { jobId: queueJob.id });
      return queueJob;
    } catch (error) {
      this.logger.error(`Failed to queue verification email for ${to}`, error);
      throw error;
    }
  }

  async getQueueStatus() {
    const waiting = await this.emailQueue.getWaiting();
    const active = await this.emailQueue.getActive();
    const completed = await this.emailQueue.getCompleted();
    const failed = await this.emailQueue.getFailed();

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
    };
  }

  async retryFailedJobs() {
    const failedJobs = await this.emailQueue.getFailed();

    for (const job of failedJobs) {
      await job.retry();
    }

    this.logger.log(`Retried ${failedJobs.length} failed email jobs`);
    return failedJobs.length;
  }

  async cleanQueue() {
    await this.emailQueue.clean(5000, 'completed');
    await this.emailQueue.clean(10000, 'failed');

    this.logger.log('Email queue cleaned');
  }
}