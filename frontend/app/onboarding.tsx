import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { colors, fonts, radius, shadow } from '@/constants/theme';
import { useAuth } from '@/lib/auth';

export default function Onboarding() {
  const router = useRouter();
  const { markOnboarded } = useAuth();

  return (
    <Screen>
      <View style={styles.heroWrap}>
        <View style={styles.photoCard}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&w=900' }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
          <LinearGradient colors={['transparent', 'rgba(27,22,51,0.35)']} style={StyleSheet.absoluteFill} />
        </View>
        <View style={styles.floatChip}>
          <Text style={styles.floatText}>🐾  Match с проверкой здоровья</Text>
        </View>
      </View>
      <View style={styles.sheet}>
        <Text style={styles.kicker}>BreedMatch</Text>
        <Text style={styles.title}>Найди пару{'\n'}для своего питомца</Text>
        <Text style={styles.body}>
          Карточки, взаимный Match и безопасный чат. Родословная, прививки и DNA — как бейджи доверия, не как диагноз.
        </Text>
        <Button
          title="Начать"
          onPress={async () => {
            await markOnboarded();
            router.replace('/login');
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroWrap: { flex: 1, paddingHorizontal: 22, paddingTop: 12, justifyContent: 'center' },
  photoCard: {
    height: 320,
    borderRadius: 40,
    overflow: 'hidden',
    ...shadow.card,
  },
  floatChip: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 28,
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    ...shadow.float,
  },
  floatText: { fontFamily: fonts.bold, color: colors.ink, fontWeight: '700' },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    padding: 24,
    paddingBottom: 32,
    gap: 10,
  },
  kicker: {
    color: colors.primary,
    fontFamily: fonts.extra,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    color: colors.ink,
    fontFamily: fonts.extra,
    fontWeight: '800',
  },
  body: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.semibold,
    marginBottom: 8,
  },
});
