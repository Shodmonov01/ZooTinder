import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '@/components/Button';
import { colors, fonts } from '@/constants/theme';
import { api } from '@/lib/api';
import { Breed, Pet, Species } from '@/lib/types';

export default function NewPet() {
  const [species, setSpecies] = useState<Species[]>([]);
  const [name, setName] = useState('');
  const [breedId, setBreedId] = useState('');
  const [sex, setSex] = useState<'MALE' | 'FEMALE'>('FEMALE');
  const [birthDate, setBirthDate] = useState('2023-01-01');
  const [city, setCity] = useState('Toshkent');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const breeds: Breed[] = species[0]?.breeds ?? [];

  useEffect(() => {
    api<Species[]>('/species', { auth: false }).then((data) => {
      setSpecies(data);
      setBreedId(data[0]?.breeds[0]?.id ?? '');
    });
  }, []);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20, gap: 12 }}>
      <Text style={styles.label}>Имя</Text>
      <TextInput value={name} onChangeText={setName} style={styles.input} />
      <Text style={styles.label}>Порода</Text>
      <View style={styles.wrap}>
        {breeds.map((breed) => (
          <Button
            key={breed.id}
            title={breed.nameRu}
            variant={breedId === breed.id ? 'primary' : 'ghost'}
            onPress={() => setBreedId(breed.id)}
          />
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button title="Девочка" variant={sex === 'FEMALE' ? 'forest' : 'ghost'} onPress={() => setSex('FEMALE')} />
        <Button title="Мальчик" variant={sex === 'MALE' ? 'forest' : 'ghost'} onPress={() => setSex('MALE')} />
      </View>
      <Text style={styles.label}>Дата рождения (YYYY-MM-DD)</Text>
      <TextInput value={birthDate} onChangeText={setBirthDate} style={styles.input} />
      <Text style={styles.label}>Город</Text>
      <TextInput value={city} onChangeText={setCity} style={styles.input} />
      <Text style={styles.label}>О себе</Text>
      <TextInput value={bio} onChangeText={setBio} style={[styles.input, { height: 100 }]} multiline />
      {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
      <Button
        title="Создать и загрузить фото"
        onPress={async () => {
          try {
            setError('');
            const pet = await api<Pet>('/pets', {
              method: 'POST',
              body: JSON.stringify({
                name,
                speciesId: species[0].id,
                breedId,
                sex,
                birthDate,
                city,
                bio,
                latitude: 41.2995,
                longitude: 69.2401,
              }),
            });
            const picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'] });
            if (!picked.canceled) {
              const asset = picked.assets[0];
              const form = new FormData();
              form.append('file', {
                uri: asset.uri,
                name: 'photo.jpg',
                type: 'image/jpeg',
              } as unknown as Blob);
              await api(`/pets/${pet.id}/photos`, { method: 'POST', body: form });
              await api(`/pets/${pet.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ isPublished: true }),
              });
            }
            router.replace('/(tabs)/pets');
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка');
          }
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bgTop },
  label: { fontFamily: fonts.bold, fontWeight: '700', color: colors.ink },
  input: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 14,
    fontFamily: fonts.semibold,
    color: colors.ink,
  },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
