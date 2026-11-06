import type { AxiosError } from 'axios';

export interface ApiEnvelope<T> {
  status?: number;
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PageQueryParams {
  page?: number;
  size?: number;
  sort?: string;
}

export function unwrapApiData<T>(response: { data: ApiEnvelope<T> }): T {
  const envelope = response.data;
  if (envelope.data === undefined || envelope.data === null) {
    throw new Error(envelope.message || envelope.error || 'API không trả về dữ liệu');
  }
  return envelope.data;
}

export function unwrapPageContent<T>(page: { content?: T[] } | undefined | null): T[] {
  return page?.content ?? [];
}

export function formatApiError(error: unknown, fallback = 'Lỗi khi gọi API'): string {
  const axiosErr = error as AxiosError<ApiEnvelope<unknown>>;
  const body = axiosErr.response?.data;
  if (body?.message) return body.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function toIsoStartOfDay(date: string): string | undefined {
  if (!date) return undefined;
  return `${date}T00:00:00`;
}

export function toIsoEndOfDay(date: string): string | undefined {
  if (!date) return undefined;
  return `${date}T23:59:59`;
}
