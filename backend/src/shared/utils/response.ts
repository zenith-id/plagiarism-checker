export function successResponse<T extends object>(message: string, data?: T) {
  return data ? { message, ...data } : { message };
}
