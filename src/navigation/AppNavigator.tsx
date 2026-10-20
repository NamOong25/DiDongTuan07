import React from 'react';

import { Pressable, Text, View } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';

import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

import { createNativeStackNavigator } from
  '@react-navigation/native-stack';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../screens/HomeScreens';
import AuthScreen from '../screens/AuthScreen';
import BookDetailScreen from '../screens/BookDetailScreen';

import {
  AccountScreen,
  CartScreen,
  CheckoutScreen,
} from '../screens/OtherScreens';

import { selectCartCount, useAppSelector } from '../store';
import { RootStackParamList, TabParamList } from '../types';


const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function CategoryScreen() {
  return <HomeScreen categoryMode />;
}

function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const count = useAppSelector(selectCartCount);
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingBottom: insets.bottom,
      }}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const title =
          descriptors[route.key].options.title ?? route.name;

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: 18,
            }}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            }}
            onLongPress={() =>
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              })
            }
          >
            <Text
              style={{
                fontSize: 12,
                color: focused ? '#4f46e5' : '#64748b',
                fontWeight: focused ? '700' : '400',
              }}
            >
              {title}
              {route.name === 'Cart' ? ` (${count})` : ''}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: '#3730a3' },
        headerTintColor: '#fff',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Trang chủ', headerTitle: 'BookStore' }}
      />

      <Tab.Screen
        name="Categories"
        component={CategoryScreen}
        options={{ title: 'Danh mục' }}
      />

      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{ title: 'Giỏ hàng' }}
      />

      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{ title: 'Tài khoản' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#3730a3' },
          headerTintColor: '#fff',
        }}
      >
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="BookDetail"
          component={BookDetailScreen}
          options={{ title: 'Chi tiết sách' }}
        />

        <Stack.Screen
          name="Login"
          component={AuthScreen}
          options={{ title: 'Đăng nhập / Đăng ký' }}
        />

        <Stack.Screen
          name="Checkout"
          component={CheckoutScreen}
          options={{ title: 'Thanh toán' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}