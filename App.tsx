import React, { useEffect } from 'react';

import {
  ActivityIndicator,
  Text,
  View,
} from 'react-native';

import { Provider } from 'react-redux';

import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

import AppNavigator from './src/navigation/AppNavigator';

import {
  continueAsGuest,
  restoreSession,
  store,
  useAppDispatch,
  useAppSelector,
} from './src/store';

import { Button, s } from './src/components/Common';

function AppContent() {
  const dispatch = useAppDispatch();

  const { restoring, restoreError } = useAppSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    void dispatch(restoreSession());
  }, [dispatch]);

  if (restoring) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f8fafc',
        }}
      >
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={{ marginTop: 12 }}>
          Đang kiểm tra phiên đăng nhập...
        </Text>
      </SafeAreaView>
    );
  }

  if (restoreError) {
    return (
      <SafeAreaView style={[s.page, { justifyContent: 'center' }]}>
        <View style={s.content}>
          <Text style={s.error}>{restoreError}</Text>

          <Button
            title="Thử lại"
            onPress={() => void dispatch(restoreSession())}
          />

          <Button
            secondary
            title="Tiếp tục với tư cách khách"
            onPress={() => dispatch(continueAsGuest())}
          />
        </View>
      </SafeAreaView>
    );
  }

  return <AppNavigator />;
}

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </Provider>
  );
}