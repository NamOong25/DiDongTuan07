import { api } from './api';
import { Book, Review, Session, User } from './types';

type AuthResponse = {
  accessToken: string;
  user: User & { password?: string };
};

function publicUser(user: User): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

// Chỉ đọc thời điểm hết hạn.
// Việc xác minh chữ ký JWT được thực hiện bởi server.
export function getJwtExpiry(token: string): number {
  try {
    const payload = token.split('.')[1];

    if (!payload) return 0;

    const alphabet =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    const encoded = payload
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    let buffer = 0;
    let bits = 0;
    let decoded = '';

    for (const char of encoded) {
      if (char === '=') break;

      const value = alphabet.indexOf(char);

      if (value < 0) return 0;

      buffer = (buffer << 6) | value;
      bits += 6;

      if (bits >= 8) {
        bits -= 8;
        decoded += String.fromCharCode((buffer >> bits) & 255);
      }
    }

    const data = JSON.parse(decoded) as { exp?: number };

    return typeof data.exp === 'number' ? data.exp * 1000 : 0;
  } catch {
    return 0;
  }
}

function toSession(data: AuthResponse): Session {
  const expiresAt = getJwtExpiry(data.accessToken);

  if (expiresAt <= Date.now()) {
    throw new Error('Token không hợp lệ hoặc đã hết hạn.');
  }

  return {
    token: data.accessToken,
    user: publicUser(data.user),
    expiresAt,
  };
}

export const authService = {
  async login(email: string, password: string): Promise<Session> {
    const { data } = await api.post<AuthResponse>('/login', {
      email: email.trim().toLowerCase(),
      password,
    });

    return toSession(data);
  },

  async register(
    name: string,
    email: string,
    password: string,
  ): Promise<Session> {
    const { data } = await api.post<AuthResponse>('/register', {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    });

    return toSession(data);
  },

  async getMe(id: number): Promise<User> {
    const { data } = await api.get<User>(`/users/${id}`);
    return publicUser(data);
  },
};

export const bookService = {
  async getAll(): Promise<Book[]> {
    const { data } = await api.get<Book[]>('/books');
    return data;
  },

  async getById(id: number): Promise<Book> {
    const { data } = await api.get<Book>(`/books/${id}`);
    return data;
  },

  async getRelated(book: Book): Promise<Book[]> {
    const { data } = await api.get<Book[]>('/books', {
      params: {
        category: book.category,
        id_ne: book.id,
        _limit: 10,
      },
    });

    return data;
  },
};

export const reviewService = {
  async getByBook(bookId: number): Promise<Review[]> {
    const { data } = await api.get<Review[]>('/reviews', {
      params: {
        bookId,
        _sort: 'createdAt',
        _order: 'desc',
      },
    });

    return data;
  },

  async create(
    input: Omit<Review, 'id' | 'createdAt'>,
  ): Promise<Review> {
    const { data } = await api.post<Review>('/reviews', {
      ...input,
      createdAt: new Date().toISOString(),
    });

    return data;
  },
};