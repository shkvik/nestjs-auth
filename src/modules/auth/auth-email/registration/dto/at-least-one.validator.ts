import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class AtLeastOneFieldConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments): boolean {
    const object = args.object as any;
    const [fields] = args.constraints;
    return fields.some((field: string) => object[field]);
  }

  defaultMessage(args: ValidationArguments): string {
    const [fields] = args.constraints;
    return `At least one of the following fields must be provided: ${fields.join(', ')}`;
  }
}

export function AtLeastOneField(
  fields: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [fields],
      validator: AtLeastOneFieldConstraint,
    });
  };
}
