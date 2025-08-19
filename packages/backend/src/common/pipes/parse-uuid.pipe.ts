import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { validate as validateUuid } from 'uuid';

@Injectable()
export class ParseUUIDPipe implements PipeTransform<string, string> {
  private readonly logger = new Logger(ParseUUIDPipe.name);

  transform(value: string, metadata: ArgumentMetadata): string {
    if (!value) {
      this.logger.warn('UUID validation failed: empty value', {
        metadata,
      });
      throw new BadRequestException('UUID is required');
    }

    if (!validateUuid(value)) {
      this.logger.warn('UUID validation failed: invalid format', {
        value,
        metadata,
      });
      throw new BadRequestException('Invalid UUID format');
    }

    return value;
  }
}