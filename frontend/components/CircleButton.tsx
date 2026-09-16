import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, shadow } from '@/constants/theme';

export function CircleButton({
  label,
  onPress,
  variant = 'white',
  size = 68,
  style,
}: {
  label: string;
  onPress?: () => void;
  variant?: 'white' | 'coral' | 'soft';
  size?: number;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.base,
        { width: size, height: size, borderRadius: size / 2 },
        variant === 'white' && styles.white,
        variant === 'coral' && styles.coral,
        variant === 'soft' && styles.soft,
        pressed && { transform: [{ scale: 0.94 }] },
        style,
      ]}>
      <Text style={[styles.icon, variant === 'coral' && { color: colors.white }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.float,
  },
  white: { backgroundColor: colors.white },
  coral: { backgroundColor: colors.primary },
  soft: { backgroundColor: colors.secondarySoft },
  icon: { fontSize: 26, color: colors.ink },
});
