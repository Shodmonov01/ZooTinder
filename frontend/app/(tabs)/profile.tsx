import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '@/components/Avatar';
import { Screen } from '@/components/Screen';
import { colors, fonts, radius, shadow } from '@/constants/theme';
import { useAuth } from '@/lib/auth';

export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <Screen>
      <View style={styles.hero}>
        <Avatar name={user?.displayName} uri={user?.avatarUrl} size={86} />
        <Text style={styles.name}>{user?.displayName || 'Владелец'}</Text>
        <Text style={styles.sub}>{user?.city ?? 'Toshkent'} · телефон подтверждён</Text>
      </View>
      <View style={styles.card}>
        <Row title="Уведомления" hint="Match, сообщения, проверка" onPress={() => router.push('/notifications')} />
        {user?.role === 'ADMIN' || user?.role === 'MODERATOR' ? (
          <Row title="Админка" hint="Очередь документов" onPress={() => router.push('/admin')} />
        ) : null}
        <Row title="Выйти" hint={user?.phone ?? ''} danger onPress={logout} />
      </View>
      <Text style={styles.disclaimer}>
        BreedMatch не ветеринар. Бейджи значат только то, что документ проверил модератор.
      </Text>
    </Screen>
  );
}

function Row({
  title,
  hint,
  onPress,
  danger,
}: {
  title: string;
  hint: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowTitle, danger && { color: colors.danger }]}>{title}</Text>
        <Text style={styles.rowHint}>{hint}</Text>
      </View>
      <Text style={styles.chev}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingTop: 12, gap: 8 },
  name: { fontSize: 28, fontFamily: fonts.extra, fontWeight: '800', color: colors.ink },
  sub: { color: colors.muted, fontFamily: fonts.semibold },
  card: {
    margin: 16,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 6,
    ...shadow.card,
  },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  rowTitle: { fontFamily: fonts.bold, fontWeight: '700', color: colors.ink, fontSize: 16 },
  rowHint: { color: colors.muted, marginTop: 2, fontFamily: fonts.semibold, fontSize: 13 },
  chev: { color: colors.muted, fontSize: 22 },
  disclaimer: {
    color: colors.muted,
    lineHeight: 20,
    marginHorizontal: 24,
    fontFamily: fonts.semibold,
    fontSize: 13,
  },
});
