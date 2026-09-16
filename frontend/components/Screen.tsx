import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/theme';

export function AppShell({ children }: { children: ReactNode }) {
  if (Platform.OS !== 'web') {
    return <View style={{ flex: 1 }}>{children}</View>;
  }
  return (
    <View style={styles.desk}>
      <View style={styles.phone}>{children}</View>
    </View>
  );
}

export function Screen({
  children,
  style,
  edges = ['top'],
}: {
  children: ReactNode;
  style?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}) {
  return (
    <LinearGradient colors={[colors.bgTop, colors.bgBottom]} style={styles.fill}>
      <View pointerEvents="none" style={[styles.blob, styles.blobA]} />
      <View pointerEvents="none" style={[styles.blob, styles.blobB]} />
      <SafeAreaView style={[styles.fill, style]} edges={edges}>
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  desk: {
    flex: 1,
    backgroundColor: '#B9C9EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phone: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    overflow: 'hidden',
    backgroundColor: colors.bgTop,
    shadowColor: '#31406E',
    shadowOpacity: 0.28,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 18 },
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  blobA: {
    width: 240,
    height: 240,
    top: -80,
    right: -60,
    backgroundColor: 'rgba(107,140,255,0.28)',
  },
  blobB: {
    width: 200,
    height: 200,
    top: 180,
    left: -90,
    backgroundColor: 'rgba(255,107,87,0.16)',
  },
});
