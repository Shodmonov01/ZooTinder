import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, shadow } from '@/constants/theme';
import { Chip } from '@/components/Chip';
import { Pet } from '@/lib/types';

export function PetCard({ pet }: { pet: Pet }) {
  const photo = pet.photos[0]?.url;
  return (
    <View style={styles.card}>
      {photo ? (
        <Image source={{ uri: photo }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <LinearGradient colors={['#B9C9FF', '#FFD3C6']} style={StyleSheet.absoluteFill} />
      )}
      <LinearGradient
        colors={['transparent', 'rgba(18,12,40,0.15)', 'rgba(18,12,40,0.78)']}
        style={styles.gradient}
      />
      <View style={styles.topRow}>
        {pet.distanceKm != null ? (
          <View style={styles.loc}>
            <Text style={styles.locText}>📍 {pet.distanceKm} км · {pet.city}</Text>
          </View>
        ) : (
          <View style={styles.loc}>
            <Text style={styles.locText}>📍 {pet.city}</Text>
          </View>
        )}
      </View>
      <View style={styles.meta}>
        <Text style={styles.name}>
          {pet.name}
          <Text style={styles.age}>  {Math.floor(pet.ageYears)}</Text>
        </Text>
        <Text style={styles.sub}>
          {pet.breed?.nameRu ?? 'Порода не указана'} · {pet.sex === 'FEMALE' ? 'девочка' : 'мальчик'}
        </Text>
        <View style={styles.badges}>
          {pet.badges.healthVerified ? <Chip label="Health" tone="glass" /> : null}
          {pet.badges.pedigreeVerified ? <Chip label="Pedigree" tone="glass" /> : null}
          {pet.badges.dnaTested ? <Chip label="DNA" tone="glass" /> : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.secondarySoft,
    ...shadow.card,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 260,
  },
  topRow: { position: 'absolute', top: 16, left: 16, right: 16 },
  loc: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  locText: { color: colors.ink, fontFamily: fonts.bold, fontWeight: '700', fontSize: 12 },
  meta: { position: 'absolute', left: 18, right: 18, bottom: 86 },
  name: {
    color: colors.white,
    fontSize: 34,
    fontFamily: fonts.extra,
    fontWeight: '800',
  },
  age: { fontSize: 26, fontFamily: fonts.semibold, fontWeight: '600' },
  sub: { color: 'rgba(255,255,255,0.86)', marginTop: 4, fontSize: 15, fontFamily: fonts.semibold },
  badges: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
});
