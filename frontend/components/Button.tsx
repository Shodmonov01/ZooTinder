import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, fonts, radius } from '@/constants/theme';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'ghost' | 'secondary' | 'danger' | 'forest';
  disabled?: boolean;
  style?: ViewStyle;
};

export function Button({ title, onPress, variant = 'primary', disabled, style }: Props) {
  const ghost = variant === 'ghost' || variant === 'danger';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'forest' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        variant === 'danger' && styles.ghost,
        pressed && { transform: [{ scale: 0.98 }] },
        disabled && { opacity: 0.5 },
        style,
      ]}>
      <Text
        style={[
          styles.text,
          ghost && { color: variant === 'danger' ? colors.danger : colors.ink },
        ]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    paddingVertical: 16,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.secondary },
  ghost: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  text: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fonts.bold,
    fontWeight: '700',
  },
});
