import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { colors, fonts, radius, shadow } from '@/constants/theme';
import { useAuth } from '@/lib/auth';

const DEMOS = ['+998901111111', '+998902222222'];

export default function Login() {
  const [phone, setPhone] = useState('+998');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { requestOtp } = useAuth();
  const router = useRouter();

  return (
    <Screen>
      <View style={styles.body}>
        <Text style={styles.hello}>С возвращением 👋</Text>
        <Text style={styles.title}>Войди по номеру</Text>
        <Text style={styles.sub}>Код придёт в SMS. В dev-режиме всегда 111111.</Text>
        <View style={styles.field}>
          <Text style={styles.prefix}>☎</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="+998901111111"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          title={loading ? 'Отправляем…' : 'Получить код'}
          disabled={loading}
          onPress={async () => {
            try {
              setLoading(true);
              setError('');
              await requestOtp(phone);
              router.push({ pathname: '/otp', params: { phone } });
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Ошибка');
            } finally {
              setLoading(false);
            }
          }}
        />
        <Text style={styles.hint}>Быстрый вход в демо</Text>
        <View style={styles.demos}>
          {DEMOS.map((item) => (
            <Pressable key={item} onPress={() => setPhone(item)} style={styles.demo}>
              <Text style={styles.demoText}>{item}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, justifyContent: 'center', padding: 24, gap: 12 },
  hello: { color: colors.secondary, fontFamily: fonts.bold, fontWeight: '700' },
  title: { fontSize: 34, color: colors.ink, fontFamily: fonts.extra, fontWeight: '800' },
  sub: { color: colors.muted, fontFamily: fonts.semibold, lineHeight: 22 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    ...shadow.card,
  },
  prefix: { fontSize: 18, marginRight: 8 },
  input: { flex: 1, paddingVertical: 16, fontSize: 18, fontFamily: fonts.bold, color: colors.ink },
  hint: { textAlign: 'center', color: colors.muted, fontFamily: fonts.semibold, marginTop: 8 },
  demos: { flexDirection: 'row', gap: 8, justifyContent: 'center', flexWrap: 'wrap' },
  demo: {
    backgroundColor: colors.secondarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  demoText: { color: colors.secondary, fontFamily: fonts.bold, fontWeight: '700', fontSize: 12 },
  error: { color: colors.danger, fontFamily: fonts.bold },
});
