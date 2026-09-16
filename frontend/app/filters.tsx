import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { colors, fonts } from '@/constants/theme';
import { api } from '@/lib/api';
import { Pet } from '@/lib/types';

export default function Filters() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [radiusKm, setRadiusKm] = useState(40);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api<Pet[]>('/pets').then(setPets);
  }, []);

  const pet = pets[0];

  return (
    <Screen edges={[]}>
      <View style={styles.body}>
        <Text style={styles.title}>Поиск для {pet?.name ?? 'питомца'}</Text>
        <Text style={styles.copy}>Радиус вокруг тебя. Вид и пол — жёсткие фильтры.</Text>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {[15, 40, 80].map((value) => (
            <Button
              key={value}
              title={`${value} км`}
              variant={radiusKm === value ? 'primary' : 'ghost'}
              onPress={() => setRadiusKm(value)}
            />
          ))}
        </View>
        <Button
          title={saved ? 'Сохранено' : 'Сохранить'}
          disabled={!pet}
          onPress={async () => {
            if (!pet) return;
            await api(`/pets/${pet.id}/preferences`, {
              method: 'PATCH',
              body: JSON.stringify({ radiusKm }),
            });
            setSaved(true);
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, padding: 20, gap: 16 },
  title: { fontSize: 26, fontFamily: fonts.extra, fontWeight: '800', color: colors.ink },
  copy: { color: colors.muted, lineHeight: 22, fontFamily: fonts.semibold },
});
