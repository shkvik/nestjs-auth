export function MockMethod<Result>(params: {
  mockFn?: () => Result | undefined,
  condition: () => boolean
}): Function {
  return (_: any, __: string, descriptor: PropertyDescriptor): PropertyDescriptor => {
    const { mockFn, condition } = params;
    let originalMethod = descriptor.value;
    if (condition()) {
      originalMethod = mockFn || ((...args: unknown[]) => { });
    }
    descriptor.value = async function (...args: unknown[]): Promise<Result> {
      return originalMethod.apply(this, args);
    }
    return descriptor;
  };
};