import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius, shadow } from '@/constants/theme';

type TabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: { navigate: (name: string) => void };
};

const ICONS: Record<string, { on: string; off: string; title: string }> = {
  index: { on: '🐾', off: '🐾', title: 'Поиск' },
  matches: { on: '♥', off: '♡', title: 'Match' },
  pets: { on: '✦', off: '✧', title: 'Питомцы' },
  profile: { on: '☺', off: '○', title: 'Профиль' },
};

export function FloatingTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const icon = ICONS[route.name] ?? { on: '•', off: '•', title: route.name };
          return (
            <Pressable
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={[styles.item, focused && styles.itemOn]}>
              <Text style={styles.glyph}>{focused ? icon.on : icon.off}</Text>
              <Text style={[styles.label, focused && styles.labelOn]}>{icon.title}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: radius.xl,
    padding: 6,
    ...shadow.float,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: radius.lg,
  },
  itemOn: { backgroundColor: colors.primarySoft },
  glyph: { fontSize: 18 },
  label: {
    marginTop: 2,
    fontSize: 11,
    color: colors.muted,
    fontFamily: fonts.bold,
    fontWeight: '700',
  },
  labelOn: { color: colors.primaryDark },
});
