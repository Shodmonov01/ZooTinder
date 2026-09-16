import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { CircleButton } from '@/components/CircleButton';
import { PetCard } from '@/components/PetCard';
import { Screen } from '@/components/Screen';
import { colors, fonts, radius, shadow } from '@/constants/theme';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Pet } from '@/lib/types';

export default function Discover() {
  const [items, setItems] = useState<Pet[]>([]);
  const [sourcePetId, setSourcePetId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [matchBanner, setMatchBanner] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const current = items[0];

  const load = useCallback(async () => {
    try {
      setError('');
      const data = await api<{ items: Pet[]; sourcePetId: string }>('/discover');
      setItems(data.items);
      setSourcePetId(data.sourcePetId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить ленту');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function swipe(action: 'LIKE' | 'PASS') {
    if (!current || !sourcePetId || busy) return;
    setBusy(true);
    try {
      const result = await api<{ match: { id: string } | null }>('/likes', {
        method: 'POST',
        body: JSON.stringify({ sourcePetId, targetPetId: current.id, action }),
      });
      setItems((prev) => prev.slice(1));
      if (result.match) setMatchBanner(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.hello}>
          <Avatar name={user?.displayName} uri={user?.avatarUrl} size={46} />
          <View>
            <Text style={styles.hi}>Привет, {user?.displayName || 'друг'}</Text>
            <Text style={styles.hiSub}>Кто сегодня понравится?</Text>
          </View>
        </View>
        <Pressable onPress={() => router.push('/filters')} style={styles.filterBtn}>
          <Text style={{ fontSize: 18 }}>⚙</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>{error}</Text>
          <Button
            title={error.includes('питомца') ? 'Создать питомца' : 'Повторить'}
            onPress={() => (error.includes('питомца') ? router.push('/pet/new') : load())}
          />
        </View>
      ) : !current ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Пока тихо</Text>
          <Text style={styles.emptyBody}>Расширь радиус или зайди позже — лента растёт вместе с городом.</Text>
          <Button title="Обновить" onPress={load} />
        </View>
      ) : (
        <View style={styles.deck}>
          <Pressable style={{ flex: 1 }} onPress={() => router.push(`/pet/${current.id}`)}>
            <PetCard pet={current} />
          </Pressable>
          <View style={styles.actions}>
            <CircleButton label="✕" variant="white" onPress={() => swipe('PASS')} />
            <CircleButton label="♥" variant="coral" size={78} onPress={() => swipe('LIKE')} />
          </View>
        </View>
      )}

      {matchBanner ? (
        <Pressable style={styles.modal} onPress={() => setMatchBanner(false)}>
          <View style={styles.sheet}>
            <Text style={styles.modalEmoji}>💞</Text>
            <Text style={styles.modalTitle}>Это взаимно!</Text>
            <Text style={styles.modalBody}>Можно открыть чат и аккуратно обсудить вязку.</Text>
            <Button title="К чатам" onPress={() => router.push('/(tabs)/matches')} />
          </View>
        </Pressable>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hello: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  hi: { fontFamily: fonts.extra, fontWeight: '800', fontSize: 18, color: colors.ink },
  hiSub: { color: colors.muted, fontFamily: fonts.semibold, fontSize: 13 },
  filterBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  deck: { flex: 1, paddingHorizontal: 18, paddingBottom: 108 },
  actions: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 124,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 22,
  },
  empty: { flex: 1, justifyContent: 'center', padding: 24, gap: 12, paddingBottom: 120 },
  emptyTitle: { fontSize: 26, fontFamily: fonts.extra, fontWeight: '800', color: colors.ink },
  emptyBody: { color: colors.muted, fontFamily: fonts.semibold, lineHeight: 22 },
  modal: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 36,
    alignItems: 'center',
    gap: 8,
  },
  modalEmoji: { fontSize: 48 },
  modalTitle: { fontSize: 26, fontFamily: fonts.extra, fontWeight: '800', color: colors.ink },
  modalBody: { color: colors.muted, textAlign: 'center', fontFamily: fonts.semibold, marginBottom: 8 },
});
