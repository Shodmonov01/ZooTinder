import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { colors } from '@/constants/theme';
import { api } from '@/lib/api';

type Doc = {
  id: string;
  type: string;
  status: string;
  issuer?: string;
};

export default function Documents() {
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const [items, setItems] = useState<Doc[]>([]);

  async function load() {
    setItems(await api<Doc[]>(`/pets/${petId}/documents`));
  }

  useEffect(() => {
    load();
  }, [petId]);

  return (
    <View style={styles.screen}>
      <Text style={styles.body}>
        После загрузки документ получает статус Pending. Badge появится только после Verified.
      </Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.name}>{item.type}</Text>
            <Text style={styles.sub}>{item.status}</Text>
          </View>
        )}
      />
      <Button
        title="Загрузить документ"
        onPress={async () => {
          const picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'] });
          if (picked.canceled) return;
          const form = new FormData();
          form.append('type', 'VACCINATION');
          form.append('issuer', 'Ветклиника');
          form.append('file', {
            uri: picked.assets[0].uri,
            name: 'document.jpg',
            type: 'image/jpeg',
          } as unknown as Blob);
          await api(`/pets/${petId}/documents`, { method: 'POST', body: form });
          await load();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: 16, gap: 12 },
  body: { color: colors.muted, lineHeight: 22 },
  row: { backgroundColor: colors.white, padding: 14, borderRadius: 14, marginBottom: 8 },
  name: { fontWeight: '800', color: colors.ink },
  sub: { color: colors.muted, marginTop: 4 },
});
