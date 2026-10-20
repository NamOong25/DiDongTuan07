import axios from 'axios';
import { Platform } from 'react-native';

const USE_REAL_DEVICE = false;
const LAN_IP = '192.168.1.10';

const host =
  Platform.OS === 'web'
    ? 'localhost'
    : USE_REAL_DEVICE
      ? LAN_IP
      : Platform.OS === 'android'
        ? '10.0.2.2'
        : 'localhost';

export const BASE_URL = `http://${host}:3000`;

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

let token: string | null = null;

export function setAuthToken(value: string | null): void {
  token = value;
}

api.interceptors.request.use((config) => {
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function getStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error)
    ? error.response?.status
    : undefined;
}

export function getErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error
      ? error.message
      : 'Có lỗi xảy ra. Vui lòng thử lại.';
  }

  if (error.response?.status === 401) {
    return 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.';
  }

  if (error.response?.status === 403) {
    return 'Bạn không có quyền thực hiện thao tác này.';
  }

  const messages: Record<string, string> = {
    'Cannot find user': 'Email hoặc mật khẩu không đúng.',
    'Incorrect password': 'Email hoặc mật khẩu không đúng.',
    'Email already exists': 'Email đã được sử dụng.',
    'Email format is invalid': 'Email không đúng định dạng.',
    'Password is too short': 'Mật khẩu quá ngắn.',
  };

  const data: unknown = error.response?.data;

  if (typeof data === 'string') {
    return messages[data] ?? 'Yêu cầu thất bại. Vui lòng thử lại.';
  }

  if (!error.response) {
    return `Không kết nối được server tại ${BASE_URL}`;
  }

  return 'Yêu cầu thất bại. Vui lòng thử lại.';
}