import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;

          if (value.length < 8) return false;

          if (!/[a-z]/.test(value)) return false;

          if (!/[A-Z]/.test(value)) return false;

          if (!/\d/.test(value)) return false;

          if (!/[@$!%*?&]/.test(value)) return false;

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
        },
      },
    });
  };
}