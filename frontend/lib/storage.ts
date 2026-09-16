import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const memory = new Map<string, string>();

async function nativeStore() {
  try {
    return await import('expo-secure-store');
  } catch {
    return null;
  }
}

export async function setItem(key: string, value: string) {
  memory.set(key, value);
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(key, value);
    return;
  }
  const secure = await nativeStore();
  if (secure) {
    await secure.setItemAsync(key, value);
    return;
  }
  await AsyncStorage.setItem(key, value);
}

export async function getItem(key: string) {
  if (memory.has(key)) return memory.get(key) ?? null;
  if (Platform.OS === 'web') {
    return AsyncStorage.getItem(key);
  }
  const secure = await nativeStore();
  if (secure) {
    return secure.getItemAsync(key);
  }
  return AsyncStorage.getItem(key);
}

export async function removeItem(key: string) {
  memory.delete(key);
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(key);
    return;
  }
  const secure = await nativeStore();
  if (secure) {
    await secure.deleteItemAsync(key);
    return;
  }
  await AsyncStorage.removeItem(key);
}
