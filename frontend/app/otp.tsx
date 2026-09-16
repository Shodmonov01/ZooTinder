import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { colors, fonts, radius, shadow } from '@/constants/theme';
import { useAuth } from '@/lib/auth';

export default function Otp() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [code, setCode] = useState('111111');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { verifyOtp } = useAuth();
  const router = useRouter();

  return (
    <Screen>
      <View style={styles.body}>
        <Text style={styles.kicker}>Почти внутри</Text>
        <Text style={styles.title}>Код из SMS</Text>
        <Text style={styles.sub}>Отправили на {phone}</Text>
        <TextInput
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          style={styles.input}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          title={loading ? 'Проверяем…' : 'Войти'}
          disabled={loading}
          onPress={async () => {
            try {
              setLoading(true);
              await verifyOtp(phone, code);
              router.replace('/(tabs)');
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Ошибка');
            } finally {
              setLoading(false);
            }
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, justifyContent: 'center', padding: 24, gap: 12 },
  kicker: { color: colors.primary, fontFamily: fonts.extra, fontWeight: '800' },
  title: { fontSize: 34, color: colors.ink, fontFamily: fonts.extra, fontWeight: '800' },
  sub: { color: colors.muted, fontFamily: fonts.semibold },
  input: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 18,
    fontSize: 28,
    letterSpacing: 10,
    textAlign: 'center',
    fontFamily: fonts.extra,
    color: colors.ink,
    ...shadow.card,
  },
  error: { color: colors.danger, fontFamily: fonts.bold },
});
