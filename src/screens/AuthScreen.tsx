import React, { useState } from 'react';
import { ScrollView, Text } from 'react-native';

import { NativeStackScreenProps } from
  '@react-navigation/native-stack';

import { getErrorMessage } from '../api';
import { Button, Field, s } from '../components/Common';
import { authService } from '../services';
import { saveSession, useAppDispatch } from '../store';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Login'
>;

type FormErrors = {
  name?: string;
  email?: string;
  password?: string;
};

export default function AuthScreen({
  navigation,
  route,
}: Props) {
  const dispatch = useAppDispatch();

  const [registering, setRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    const next: FormErrors = {};

    if (registering && !name.trim()) {
      next.name = 'Vui lòng nhập họ tên.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = 'Email không đúng định dạng.';
    }

    if (password.length < 6) {
      next.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
    }

    setErrors(next);
    setServerError('');

    if (Object.keys(next).length > 0) return;

    setBusy(true);

    try {
      const session = registering
        ? await authService.register(name, email, password)
        : await authService.login(email, password);

      await dispatch(saveSession(session)).unwrap();

      const redirect = route.params?.redirect;

      // Xóa Login khỏi lịch sử, trở lại đúng nơi cần đến.
      if (redirect?.name === 'Checkout') {
        navigation.reset({
          index: 1,
          routes: [
            { name: 'Main' },
            { name: 'Checkout' },
          ],
        });
      } else if (redirect?.name === 'BookDetail') {
        navigation.reset({
          index: 1,
          routes: [
            { name: 'Main' },
            {
              name: 'BookDetail',
              params: { bookId: redirect.bookId },
            },
          ],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      }
    } catch (error) {
      setServerError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView
      style={s.page}
      contentContainerStyle={s.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={s.title}>
        {registering ? 'Tạo tài khoản' : 'Chào mừng trở lại'}
      </Text>

      {registering && (
        <Field
          label="Họ tên"
          value={name}
          onChangeText={setName}
          error={errors.name}
          placeholder="Nguyễn Văn Nam"
        />
      )}

      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="test@gmail.com"
      />

      <Field
        label="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        secureTextEntry
        placeholder="Ít nhất 6 ký tự"
      />

      {!!serverError && (
        <Text style={s.error}>{serverError}</Text>
      )}

      <Button
        title={
          busy
            ? 'Đang xử lý...'
            : registering
              ? 'Đăng ký'
              : 'Đăng nhập'
        }
        disabled={busy}
        onPress={() => void submit()}
      />

      <Button
        secondary
        disabled={busy}
        title={
          registering
            ? 'Đã có tài khoản? Đăng nhập'
            : 'Chưa có tài khoản? Đăng ký'
        }
        onPress={() => {
          setRegistering(!registering);
          setErrors({});
          setServerError('');
        }}
      />
    </ScrollView>
  );
}