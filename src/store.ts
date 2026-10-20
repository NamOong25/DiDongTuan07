import {
  configureStore,
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';

import {
  TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from 'react-redux';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { getStatus, setAuthToken } from './api';
import { authService, getJwtExpiry } from './services';
import { Book, CartItem, Session } from './types';

const AUTH_KEY = 'bookstore_auth_ts_v1';

type AuthState = {
  session: Session | null;
  restoring: boolean;
  restoreError: string | null;
};

const initialAuthState: AuthState = {
  session: null,
  restoring: true,
  restoreError: null,
};

export const saveSession = createAsyncThunk(
  'auth/saveSession',
  async (session: Session) => {
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(session));
    setAuthToken(session.token);
    return session;
  },
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    setAuthToken(null);
    await AsyncStorage.removeItem(AUTH_KEY);
  },
);

export const restoreSession = createAsyncThunk<Session | null>(
  'auth/restoreSession',
  async () => {
    setAuthToken(null);

    const raw = await AsyncStorage.getItem(AUTH_KEY);

    if (!raw) return null;

    let saved: Session;

    try {
      saved = JSON.parse(raw) as Session;
    } catch {
      await AsyncStorage.removeItem(AUTH_KEY);
      return null;
    }

    const expiresAt =
      typeof saved?.token === 'string'
        ? getJwtExpiry(saved.token)
        : 0;

    if (!saved?.user?.id || expiresAt <= Date.now()) {
      await AsyncStorage.removeItem(AUTH_KEY);
      return null;
    }

    setAuthToken(saved.token);

    try {
      const user = await authService.getMe(saved.user.id);

      return {
        token: saved.token,
        user,
        expiresAt,
      };
    } catch (error) {
      setAuthToken(null);

      if ([401, 403, 404].includes(getStatus(error) ?? 0)) {
        await AsyncStorage.removeItem(AUTH_KEY);
        return null;
      }

      throw new Error(
        'Chưa xác minh được phiên. Kiểm tra server và kết nối mạng.',
      );
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,

  reducers: {
    continueAsGuest(state) {
      state.session = null;
      state.restoreError = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(saveSession.fulfilled, (state, action) => {
        state.session = action.payload;
      })
      .addCase(logout.pending, (state) => {
        state.session = null;
      })
      .addCase(restoreSession.pending, (state) => {
        state.restoring = true;
        state.restoreError = null;
        state.session = null;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.restoring = false;
        state.session = action.payload;
      })
      .addCase(restoreSession.rejected, (state, action) => {
        state.restoring = false;
        state.restoreError =
          action.error.message ?? 'Không khôi phục được phiên.';
      });
  },
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: [] as CartItem[],

  reducers: {
    addToCart(state, action: PayloadAction<Book>) {
      const existing = state.find(
        (item) => item.id === action.payload.id,
      );

      if (existing) {
        existing.quantity += 1;
      } else {
        state.push({ ...action.payload, quantity: 1 });
      }
    },

    changeQuantity(
      state,
      action: PayloadAction<{ id: number; delta: number }>,
    ) {
      const item = state.find(
        (row) => row.id === action.payload.id,
      );

      if (item) {
        item.quantity = Math.max(
          1,
          item.quantity + action.payload.delta,
        );
      }
    },

    removeFromCart(state, action: PayloadAction<number>) {
      return state.filter((item) => item.id !== action.payload);
    },
  },
});

export const { continueAsGuest } = authSlice.actions;

export const {
  addToCart,
  changeQuantity,
  removeFromCart,
} = cartSlice.actions;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    cart: cartSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> =
  useSelector;

export const selectCartTotal = (state: RootState): number =>
  state.cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

export const selectCartCount = (state: RootState): number =>
  state.cart.reduce((sum, item) => sum + item.quantity, 0);