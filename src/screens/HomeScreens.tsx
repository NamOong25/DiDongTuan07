import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  NavigationProp,
  useNavigation,
} from '@react-navigation/native';

import { getErrorMessage } from '../api';
import { BookCard, Button, s } from '../components/Common';
import { bookService } from '../services';
import { Book, RootStackParamList } from '../types';

export default function HomeScreen({
  categoryMode = false,
}: {
  categoryMode?: boolean;
}) {
  const navigation =
    useNavigation<NavigationProp<RootStackParamList>>();

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('Tất cả');

  async function load() {
    setLoading(true);
    setError('');

    try {
      setBooks(await bookService.getAll());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setKeyword(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const categories = [
    'Tất cả',
    ...new Set(books.map((book) => book.category)),
  ];

  const filtered = books.filter((book) => {
    const text = `${book.title} ${book.author}`.toLowerCase();

    return (
      text.includes(keyword.trim().toLowerCase()) &&
      (category === 'Tất cả' || book.category === category)
    );
  });

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }

  if (error) {
    return (
      <View style={s.content}>
        <Text style={s.error}>{error}</Text>
        <Button title="Thử lại" onPress={() => void load()} />
      </View>
    );
  }

  return (
    <FlatList
      style={s.page}
      contentContainerStyle={s.content}
      data={filtered}
      numColumns={2}
      keyExtractor={(item) => String(item.id)}
      columnWrapperStyle={{ gap: 12 }}
      ListHeaderComponent={
        <>
          <Text style={s.title}>
            {categoryMode ? 'Danh mục sách' : 'Khám phá sách hay'}
          </Text>

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Tìm tên sách hoặc tác giả..."
            style={[s.input, { marginBottom: 14 }]}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 14 }}
          >
            {categories.map((item) => (
              <Pressable
                key={item}
                onPress={() => setCategory(item)}
                style={[
                  s.chip,
                  category === item && {
                    backgroundColor: '#4f46e5',
                  },
                ]}
              >
                <Text
                  style={{
                    color: category === item ? '#fff' : '#334155',
                  }}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {(search !== '' || category !== 'Tất cả') && (
            <Button
              title="Xóa bộ lọc"
              secondary
              onPress={() => {
                setSearch('');
                setKeyword('');
                setCategory('Tất cả');
              }}
            />
          )}
        </>
      }
      renderItem={({ item }) => (
        <View style={{ flex: 1, maxWidth: '50%', marginBottom: 12 }}>
          <BookCard
            book={item}
            onPress={() =>
              navigation.navigate('BookDetail', {
                bookId: item.id,
              })
            }
          />
        </View>
      )}
      ListEmptyComponent={
        <Text style={s.empty}>Không tìm thấy sách phù hợp.</Text>
      }
    />
  );
}