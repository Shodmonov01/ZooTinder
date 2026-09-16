import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '@/constants/theme';

export function Chip({
  label,
  tone = 'lilac',
}: {
  label: string;
  tone?: 'lilac' | 'mint' | 'coral' | 'glass';
}) {
  return (
    <View
      style={[
        styles.chip,
        tone === 'lilac' && { backgroundColor: colors.lilacSoft },
        tone === 'mint' && { backgroundColor: colors.mintSoft },
        tone === 'coral' && { backgroundColor: colors.primarySoft },
        tone === 'glass' && { backgroundColor: 'rgba(255,255,255,0.22)' },
      ]}>
      <Text
        style={[
          styles.text,
          tone === 'mint' && { color: '#0F8A64' },
          tone === 'coral' && { color: colors.primaryDark },
          tone === 'glass' && { color: colors.white },
        ]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  text: {
    color: colors.lilac,
    fontSize: 12,
    fontFamily: fonts.bold,
    fontWeight: '700',
  },
});
