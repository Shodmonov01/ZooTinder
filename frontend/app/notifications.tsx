import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import { colors } from '@/constants/theme';
import { api } from '@/lib/api';

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
};

export default function Notifications() {
  const [items, setItems] = useState<NotificationItem[]>([]);

  useEffect(() => {
    api<NotificationItem[]>('/notifications').then(setItems);
  }, []);

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16, gap: 10 }}
      data={items}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={<Text style={{ color: colors.muted }}>Пока нет уведомлений</Text>}
      renderItem={({ item }) => (
        <>
          <Text style={{ fontWeight: '800', color: colors.ink }}>{item.title}</Text>
          <Text style={{ color: colors.muted, marginBottom: 8 }}>{item.body}</Text>
        </>
      )}
    />
  );
}
