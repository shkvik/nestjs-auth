import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";

export function validateObj<T extends object>(params: {
  type: new (...args: any[]) => T,
  obj: any
}): T {
  const { type, obj } = params;
  const validatedObj = plainToInstance(type, obj, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedObj, {
    whitelist: true,
    skipMissingProperties: false,
    forbidNonWhitelisted: true,
  });
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedObj;
}