import React, { useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import {
  NavigationProp,
  useNavigation,
} from '@react-navigation/native';

import { Button, money, s } from '../components/Common';

import {
  changeQuantity,
  logout,
  removeFromCart,
  selectCartTotal,
  useAppDispatch,
  useAppSelector,
} from '../store';

import { RootStackParamList } from '../types';

function useRootNavigation() {
  return useNavigation<NavigationProp<RootStackParamList>>();
}

export function CartScreen() {
  const navigation = useRootNavigation();
  const dispatch = useAppDispatch();

  const cart = useAppSelector((state) => state.cart);
  const session = useAppSelector((state) => state.auth.session);
  const total = useAppSelector(selectCartTotal);

  return (
    <ScrollView style={s.page} contentContainerStyle={s.content}>
      <Text style={s.title}>Giỏ hàng</Text>

      {cart.length === 0 ? (
        <Text style={s.empty}>Giỏ hàng đang trống.</Text>
      ) : (
        <>
          {cart.map((item) => (
            <View key={item.id} style={s.panel}>
              <Text style={s.label}>{item.title}</Text>
              <Text style={s.price}>{money(item.price)}</Text>

              <View style={s.row}>
                <Button
                  secondary
                  title="−"
                  onPress={() =>
                    dispatch(
                      changeQuantity({ id: item.id, delta: -1 }),
                    )
                  }
                />

                <Text>{item.quantity}</Text>

                <Button
                  secondary
                  title="+"
                  onPress={() =>
                    dispatch(
                      changeQuantity({ id: item.id, delta: 1 }),
                    )
                  }
                />

                <Pressable
                  onPress={() => dispatch(removeFromCart(item.id))}
                >
                  <Text style={{ color: '#dc2626' }}>Xóa</Text>
                </Pressable>
              </View>

              <Text style={s.text}>
                Thành tiền: {money(item.price * item.quantity)}
              </Text>
            </View>
          ))}

          <Text style={s.section}>Tổng: {money(total)}</Text>

          <Button
            title="Thanh toán"
            onPress={() => {
              if (session) {
                navigation.navigate('Checkout');
              } else {
                navigation.navigate('Login', {
                  redirect: { name: 'Checkout' },
                });
              }
            }}
          />
        </>
      )}
    </ScrollView>
  );
}

export function AccountScreen() {
  const navigation = useRootNavigation();
  const dispatch = useAppDispatch();

  const session = useAppSelector((state) => state.auth.session);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    setBusy(true);
    setError('');

    try {
      await dispatch(logout()).unwrap();
    } catch {
      setError(
        'Không xóa được phiên đã lưu. Vui lòng bấm Đăng xuất lại.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={[s.page, s.content]}>
      <Text style={s.title}>Tài khoản</Text>

      {session ? (
        <>
          <Text style={s.section}>{session.user.name}</Text>
          <Text style={s.text}>{session.user.email}</Text>
        </>
      ) : (
        <>
          <Text style={s.empty}>Bạn chưa đăng nhập.</Text>
          <Button
            title="Đăng nhập / Đăng ký"
            onPress={() => navigation.navigate('Login')}
          />
        </>
      )}

      {(session || error) && (
        <Button
          title={busy ? 'Đang đăng xuất...' : 'Đăng xuất'}
          disabled={busy}
          onPress={() => void handleLogout()}
        />
      )}

      {!!error && <Text style={s.error}>{error}</Text>}
    </View>
  );
}

export function CheckoutScreen() {
 const navigation =
  useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const session = useAppSelector((state) => state.auth.session);
  const total = useAppSelector(selectCartTotal);

  // Bảo vệ ngay tại màn hình, không chỉ ở nút Thanh toán.
  if (!session) {
    return (
      <View style={[s.page, s.content]}>
        <Text style={s.title}>Cần đăng nhập</Text>

        <Button
          title="Đăng nhập để tiếp tục"
          onPress={() =>
            navigation.replace('Login', {
              redirect: { name: 'Checkout' },
            })
          }
        />
      </View>
    );
  }

  return (
    <View style={[s.page, s.content]}>
      <Text style={s.title}>Thanh toán</Text>
      <Text style={s.text}>Khách hàng: {session.user.name}</Text>
      <Text style={s.text}>{session.user.email}</Text>
      <Text style={s.price}>Tổng tiền: {money(total)}</Text>


    </View>
  );
}