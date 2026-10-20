import React from 'react';

import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import { Book } from '../types';

export const money = (value: number): string =>
  `${value.toLocaleString('vi-VN')} đ`;

type ButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
};

export function Button({
  title,
  onPress,
  disabled,
  secondary,
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        s.button,
        secondary && { backgroundColor: '#e0e7ff' },
        disabled && { opacity: 0.5 },
      ]}
    >
      <Text
        style={{
          color: secondary ? '#3730a3' : '#fff',
          fontWeight: '700',
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}

type FieldProps = TextInputProps & {
  label: string;
  error?: string;
};

export function Field({
  label,
  error,
  ...props
}: FieldProps) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.label}>{label}</Text>

      <TextInput
        {...props}
        style={[s.input, error ? { borderColor: '#dc2626' } : null]}
      />

      {!!error && <Text style={s.error}>{error}</Text>}
    </View>
  );
}

type RatingProps = {
  value: number;
  size?: number;
  onChange?: (value: number) => void;
};

export function RatingStars({
  value,
  size = 22,
  onChange,
}: RatingProps) {
  return (
    <View
      style={s.row}
      accessibilityLabel={`${value} trên 5 sao`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable
          key={star}
          disabled={!onChange}
          onPress={() => onChange?.(star)}
        >
          <Text
            style={{
              fontSize: size,
              color:
                star <= Math.round(value)
                  ? '#f59e0b'
                  : '#cbd5e1',
            }}
          >
            ★
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export function BookCard({
  book,
  onPress,
}: {
  book: Book;
  onPress: () => void;
}) {
  return (
    <Pressable style={s.card} onPress={onPress}>
      <Image source={{ uri: book.image }} style={s.cover} />

      <Text style={s.label} numberOfLines={2}>
        {book.title}
      </Text>

      <Text style={s.muted} numberOfLines={1}>
        {book.author}
      </Text>

      <Text style={s.price}>{money(book.price)}</Text>
    </Pressable>
  );
}

export const s = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  content: {
    padding: 16,
    paddingBottom: 32,
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
  },

  section: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 22,
    marginBottom: 12,
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 7,
  },

  muted: {
    color: '#64748b',
    fontSize: 13,
  },

  text: {
    color: '#475569',
    fontSize: 15,
    lineHeight: 24,
    marginVertical: 8,
  },

  error: {
    color: '#dc2626',
    lineHeight: 22,
    marginVertical: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 13,
    fontSize: 15,
    color: '#0f172a',
  },

  button: {
    backgroundColor: '#4f46e5',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 6,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 10,
    flex: 1,
  },

  cover: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
    marginBottom: 10,
  },

  price: {
    fontSize: 17,
    fontWeight: '700',
    color: '#dc2626',
    marginVertical: 9,
  },

  panel: {
    padding: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    marginVertical: 8,
  },

  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
    marginRight: 8,
  },

  empty: {
    textAlign: 'center',
    color: '#64748b',
    marginVertical: 30,
  },
});