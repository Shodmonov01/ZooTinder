import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '@/constants/theme';

export function Avatar({
  uri,
  name,
  size = 44,
  ring,
}: {
  uri?: string | null;
  name?: string | null;
  size?: number;
  ring?: boolean;
}) {
  const initial = (name ?? '?').slice(0, 1).toUpperCase();
  return (
    <View
      style={[
        styles.wrap,
        { width: size, height: size, borderRadius: size / 2 },
        ring && styles.ring,
      ]}>
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
      ) : (
        <View style={[styles.fallback, { borderRadius: size / 2 }]}>
          <Text style={[styles.letter, { fontSize: size * 0.4 }]}>{initial}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden', backgroundColor: colors.secondarySoft },
  ring: { borderWidth: 2, borderColor: colors.primary, padding: 2 },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
  },
  letter: { color: colors.white, fontFamily: fonts.extra, fontWeight: '800' },
});
