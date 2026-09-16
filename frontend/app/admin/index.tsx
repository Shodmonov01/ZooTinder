import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { colors } from '@/constants/theme';
import { api } from '@/lib/api';

type Dashboard = {
  users: number;
  pets: number;
  matches: number;
  openReports: number;
  pendingVerifications: number;
};

type DocumentItem = {
  id: string;
  type: string;
  status: string;
  pet: { name: string };
};

export default function AdminScreen() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [queue, setQueue] = useState<DocumentItem[]>([]);

  async function load() {
    const [nextDashboard, nextQueue] = await Promise.all([
      api<Dashboard>('/admin/dashboard'),
      api<DocumentItem[]>('/admin/verifications'),
    ]);
    setDashboard(nextDashboard);
    setQueue(nextQueue);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={styles.title}>Модерация</Text>
      {dashboard ? (
        <Text style={styles.body}>
          Пользователи {dashboard.users} · питомцы {dashboard.pets} · match {dashboard.matches} · жалобы{' '}
          {dashboard.openReports} · на проверке {dashboard.pendingVerifications}
        </Text>
      ) : null}
      {queue.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.name}>{item.pet.name} · {item.type}</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <Button
              title="Approve"
              variant="forest"
              onPress={async () => {
                await api(`/admin/verifications/${item.id}`, {
                  method: 'PATCH',
                  body: JSON.stringify({ status: 'VERIFIED' }),
                });
                await load();
              }}
            />
            <Button
              title="Reject"
              variant="ghost"
              onPress={async () => {
                await api(`/admin/verifications/${item.id}`, {
                  method: 'PATCH',
                  body: JSON.stringify({ status: 'REJECTED', reason: 'Недостаточно данных' }),
                });
                await load();
              }}
            />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  title: { fontSize: 28, fontWeight: '800', color: colors.ink },
  body: { color: colors.muted, lineHeight: 22 },
  card: { backgroundColor: colors.white, padding: 14, borderRadius: 16 },
  name: { fontWeight: '800', color: colors.ink },
});
