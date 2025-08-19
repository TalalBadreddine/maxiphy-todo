import { Injectable } from '@nestjs/common';
import { appConfig } from './app.config';
import { databaseConfig } from './database.config';
import { authConfig } from './auth.config';
import { emailConfig } from './email.config';
import { queueConfig } from './queue.config';

@Injectable()
export class AppConfigService {
  private readonly _appConfig = appConfig();
  private readonly _databaseConfig = databaseConfig();
  private readonly _authConfig = authConfig();
  private readonly _emailConfig = emailConfig();
  private readonly _queueConfig = queueConfig();

  get app() {
    return this._appConfig;
  }

  get database() {
    return this._databaseConfig;
  }

  get auth() {
    return this._authConfig;
  }

  get email() {
    return this._emailConfig;
  }

  get queue() {
    return this._queueConfig;
  }
}