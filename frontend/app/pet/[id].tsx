import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { colors, fonts, radius, shadow } from '@/constants/theme';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Pet } from '@/lib/types';

export default function PetDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [pet, setPet] = useState<Pet | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    api<Pet>(`/pets/${id}`).then(setPet);
  }, [id]);

  if (!pet) return null;
  const mine = pet.ownerId === user?.id;

  return (
    <ScrollView style={styles.screen} bounces={false}>
      <LinearGradient colors={['#9EC5FF', '#EEF3FF']} style={styles.sky}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <Image source={{ uri: pet.photos[0]?.url }} style={styles.hero} contentFit="cover" />
      </LinearGradient>
      <View style={styles.sheet}>
        <Text style={styles.name}>{pet.name}</Text>
        <Text style={styles.sub}>
          {pet.breed?.nameRu} · {pet.sex === 'FEMALE' ? 'девочка' : 'мальчик'} · {Math.floor(pet.ageYears)} лет
        </Text>
        <View style={styles.chips}>
          {pet.badges.healthVerified ? <Chip label="Health" tone="mint" /> : null}
          {pet.badges.pedigreeVerified ? <Chip label="Pedigree" tone="lilac" /> : null}
          {pet.badges.dnaTested ? <Chip label="DNA" tone="coral" /> : null}
          <Chip label={pet.city} tone="lilac" />
        </View>
        <Text style={styles.bio}>{pet.bio}</Text>
        <Text style={styles.disclaimer}>
          Данные о здоровье проверяет модератор. Это не ветеринарное заключение.
        </Text>
        {mine ? (
          <Button title="Документы" variant="ghost" onPress={() => router.push(`/documents/${pet.id}`)} />
        ) : (
          <Button
            title="Пожаловаться"
            variant="danger"
            onPress={() =>
              api('/reports', {
                method: 'POST',
                body: JSON.stringify({ targetType: 'pet', targetId: pet.id, reason: 'other' }),
              })
            }
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  sky: { height: 390, alignItems: 'center', justifyContent: 'flex-end' },
  back: {
    position: 'absolute',
    top: 54,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  backText: { fontSize: 24, color: colors.ink },
  hero: { width: 260, height: 260, borderRadius: 130, marginBottom: -36, ...shadow.float },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingTop: 48,
    gap: 10,
    minHeight: 420,
  },
  name: { fontSize: 36, fontFamily: fonts.extra, fontWeight: '800', color: colors.ink },
  sub: { color: colors.muted, fontFamily: fonts.semibold },
  chips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  bio: { fontSize: 16, lineHeight: 24, color: colors.ink, fontFamily: fonts.semibold, marginTop: 8 },
  disclaimer: { color: colors.muted, fontSize: 13, lineHeight: 18, fontFamily: fonts.semibold },
});
