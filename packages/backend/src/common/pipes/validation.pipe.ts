import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CustomValidationPipe implements PipeTransform<any> {
  private readonly logger = new Logger(CustomValidationPipe.name);

  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object, {
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      validateCustomDecorators: true,
    });

    if (errors.length > 0) {
      const errorMessages = this.formatErrors(errors);

      this.logger.warn('Validation failed', {
        errors: errorMessages,
        value: this.sanitizeValue(value),
        metatype: metatype.name,
      });

      throw new BadRequestException({
        message: 'Validation failed',
        errors: errorMessages,
        statusCode: 400,
      });
    }

    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatErrors(errors: any[]): Record<string, string[]> {
    const result: Record<string, string[]> = {};

    errors.forEach((error) => {
      const field = error.property;
      const constraints = error.constraints;

      if (constraints) {
        result[field] = Object.values(constraints);
      }

      if (error.children && error.children.length > 0) {
        const nestedErrors = this.formatNestedErrors(error.children, field);
        Object.assign(result, nestedErrors);
      }
    });

    return result;
  }

  private formatNestedErrors(
    errors: any[],
    parentField: string,
  ): Record<string, string[]> {
    const result: Record<string, string[]> = {};

    errors.forEach((error) => {
      const field = `${parentField}.${error.property}`;
      const constraints = error.constraints;

      if (constraints) {
        result[field] = Object.values(constraints);
      }

      if (error.children && error.children.length > 0) {
        const nestedErrors = this.formatNestedErrors(error.children, field);
        Object.assign(result, nestedErrors);
      }
    });

    return result;
  }

  private sanitizeValue(value: any): any {
    if (typeof value === 'object' && value !== null) {
      const sanitized = { ...value };

      const sensitiveFields = ['password', 'token', 'secret', 'key'];
      sensitiveFields.forEach((field) => {
        if (sanitized[field]) {
          sanitized[field] = '[REDACTED]';
        }
      });

      return sanitized;
    }

    return value;
  }
}