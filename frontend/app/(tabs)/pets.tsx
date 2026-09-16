import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Screen } from '@/components/Screen';
import { colors, fonts, radius, shadow } from '@/constants/theme';
import { api } from '@/lib/api';
import { Pet } from '@/lib/types';

export default function Pets() {
  const [pets, setPets] = useState<Pet[]>([]);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      api<Pet[]>('/pets').then(setPets).catch(() => setPets([]));
    }, []),
  );

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Моя стая</Text>
        <Button title="+ Добавить" onPress={() => router.push('/pet/new')} style={{ paddingVertical: 10 }} />
      </View>
      <FlatList
        data={pets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 120 }}
        ListEmptyComponent={<Text style={styles.empty}>Добавь первого питомца — и Discover оживёт</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => router.push(`/pet/${item.id}`)}>
            <Image source={{ uri: item.photos[0]?.url }} style={styles.photo} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.sub}>{item.breed?.nameRu}</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
                <Chip label={item.isPublished ? 'В поиске' : 'Черновик'} tone={item.isPublished ? 'mint' : 'coral'} />
                <Chip label={`${item.completeness}%`} tone="lilac" />
              </View>
            </View>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 30, fontFamily: fonts.extra, fontWeight: '800', color: colors.ink },
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 12,
    ...shadow.card,
  },
  photo: { width: 78, height: 78, borderRadius: 24, backgroundColor: colors.line },
  name: { fontFamily: fonts.extra, fontWeight: '800', fontSize: 18, color: colors.ink },
  sub: { color: colors.muted, marginTop: 4, fontFamily: fonts.semibold },
  empty: { color: colors.muted, textAlign: 'center', marginTop: 24, fontFamily: fonts.semibold },
});
