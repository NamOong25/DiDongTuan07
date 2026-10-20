export type Book = {
  id: number;
  title: string;
  author: string;
  category: string;
  price: number;
  image: string;
  description: string;
};

export type User = {
  id: number;
  name: string;
  email: string;
};

export type Review = {
  id: number;
  bookId: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type Session = {
  token: string;
  user: User;
  expiresAt: number;
};

export type CartItem = Book & {
  quantity: number;
};

export type LoginRedirect =
  | { name: 'Checkout' }
  | { name: 'BookDetail'; bookId: number };

export type RootStackParamList = {
  Main: undefined;
  BookDetail: { bookId: number };
  Login: { redirect?: LoginRedirect } | undefined;
  Checkout: undefined;
};

export type TabParamList = {
  Home: undefined;
  Categories: undefined;
  Cart: undefined;
  Account: undefined;
};