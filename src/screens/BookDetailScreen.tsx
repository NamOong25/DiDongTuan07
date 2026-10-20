import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { NativeStackScreenProps } from
  '@react-navigation/native-stack';

import { getErrorMessage, getStatus } from '../api';

import {
  BookCard,
  Button,
  money,
  RatingStars,
  s,
} from '../components/Common';

import { bookService, reviewService } from '../services';

import {
  addToCart,
  logout,
  useAppDispatch,
  useAppSelector,
} from '../store';

import {
  Book,
  Review,
  RootStackParamList,
} from '../types';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'BookDetail'
>;

export default function BookDetailScreen({
  route,
  navigation,
}: Props) {
  const { bookId } = route.params;

  const dispatch = useAppDispatch();
  const session = useAppSelector((state) => state.auth.session);

  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      setRelated([]);

      try {
        const [nextBook, nextReviews] = await Promise.all([
          bookService.getById(bookId),
          reviewService.getByBook(bookId),
        ]);

        if (cancelled) return;

        setBook(nextBook);
        setReviews(nextReviews);

        // Lỗi sách liên quan không làm hỏng trang chi tiết.
        const list = await bookService
          .getRelated(nextBook)
          .catch(() => [] as Book[]);

        if (!cancelled) setRelated(list);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [bookId, retry]);

  const average = reviews.length
    ? reviews.reduce((sum, item) => sum + item.rating, 0) /
      reviews.length
    : 0;

  async function submitReview() {
    if (!session || sending) return;

    if (!comment.trim()) {
      setReviewError('Vui lòng nhập bình luận.');
      return;
    }

    setSending(true);
    setReviewError('');

    try {
      const created = await reviewService.create({
        bookId,
        userId: session.user.id,
        userName: session.user.name,
        rating,
        comment: comment.trim(),
      });

      setReviews((previous) => [created, ...previous]);
      setComment('');
      setRating(5);
    } catch (err) {
      if (getStatus(err) === 401) {
        await dispatch(logout());
      }

      setReviewError(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }

  if (error || !book) {
    return (
      <View style={s.content}>
        <Text style={s.error}>
          {error || 'Không tìm thấy sách.'}
        </Text>

        <Button
          title="Thử lại"
          onPress={() => setRetry((value) => value + 1)}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={s.page}
      contentContainerStyle={s.content}
      keyboardShouldPersistTaps="handled"
    >
      <Image
        source={{ uri: book.image }}
        style={{
          width: 160,
          height: 230,
          borderRadius: 12,
          alignSelf: 'center',
          marginBottom: 20,
        }}
      />

      <Text style={s.title}>{book.title}</Text>
      <Text style={s.muted}>
        {book.author} · {book.category}
      </Text>

      <Text style={s.price}>{money(book.price)}</Text>
      <Text style={s.text}>{book.description}</Text>

      <Button
        title="Thêm vào giỏ hàng"
        onPress={() => {
          dispatch(addToCart(book));
          Alert.alert('Thành công', 'Đã thêm sách vào giỏ hàng.');
        }}
      />

      <Text style={s.section}>Đánh giá sách</Text>

      <View style={s.row}>
        <Text style={{ fontSize: 38, fontWeight: '800' }}>
          {average.toFixed(1)}
        </Text>

        <View>
          <RatingStars value={average} />
          <Text style={s.muted}>
            {reviews.length} đánh giá
          </Text>
        </View>
      </View>

      {session ? (
        <View style={s.panel}>
          <Text style={s.label}>Đánh giá của bạn</Text>

          <RatingStars
            value={rating}
            size={32}
            onChange={setRating}
          />

          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Chia sẻ cảm nhận về sách..."
            multiline
            style={[
              s.input,
              {
                minHeight: 100,
                textAlignVertical: 'top',
                marginTop: 12,
              },
            ]}
          />

          <Button
            title={sending ? 'Đang gửi...' : 'Gửi đánh giá'}
            disabled={sending}
            onPress={() => void submitReview()}
          />
        </View>
      ) : (
        <Button
          title="Đăng nhập để viết đánh giá"
          onPress={() =>
            navigation.navigate('Login', {
              redirect: {
                name: 'BookDetail',
                bookId,
              },
            })
          }
        />
      )}

      {!!reviewError && (
        <Text style={s.error}>{reviewError}</Text>
      )}

      {reviews.length === 0 && (
        <Text style={s.empty}>Chưa có đánh giá nào.</Text>
      )}

      {reviews.map((review) => (
        <View key={review.id} style={s.panel}>
          <Text style={s.label}>{review.userName}</Text>
          <RatingStars value={review.rating} size={18} />
          <Text style={s.text}>{review.comment}</Text>
          <Text style={s.muted}>
            {new Date(review.createdAt).toLocaleDateString('vi-VN')}
          </Text>
        </View>
      ))}

      {related.length > 0 && (
        <>
          <Text style={s.section}>Sách liên quan</Text>

          <FlatList
            horizontal
            data={related}
            keyExtractor={(item) => String(item.id)}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={{ width: 165, marginRight: 12 }}>
                <BookCard
                  book={item}
                  onPress={() =>
                    navigation.push('BookDetail', {
                      bookId: item.id,
                    })
                  }
                />
              </View>
            )}
          />
        </>
      )}
    </ScrollView>
  );
}