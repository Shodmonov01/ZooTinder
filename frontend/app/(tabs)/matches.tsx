import { useEffect, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Screen } from '@/components/Screen';
import { colors, fonts, radius, shadow } from '@/constants/theme';
import { api } from '@/lib/api';
import { ChatItem, MatchItem } from '@/lib/types';

export default function Matches() {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [chats, setChats] = useState<ChatItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    Promise.all([api<MatchItem[]>('/matches'), api<ChatItem[]>('/chats')]).then(
      ([nextMatches, nextChats]) => {
        setMatches(nextMatches);
        setChats(nextChats);
      },
    );
  }, []);

  const list = chats.length
    ? chats
    : matches.map((item) => ({
        id: item.chatId,
        matchId: item.id,
        otherPet: item.otherPet,
        lastMessage: null,
      }));

  return (
    <Screen>
      <Text style={styles.title}>Твои Match</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.stories}>
        {matches.map((item) => (
          <Pressable key={item.id} style={styles.story} onPress={() => router.push(`/chat/${item.chatId}`)}>
            <Image source={{ uri: item.otherPet.photos[0]?.url }} style={styles.storyImg} />
            <Text style={styles.storyName} numberOfLines={1}>
              {item.otherPet.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 120 }}
        ListEmptyComponent={<Text style={styles.empty}>Поставь взаимный Like — здесь появится чат</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => router.push(`/chat/${item.id}`)}>
            <Image source={{ uri: item.otherPet.photos[0]?.url }} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.otherPet.name}</Text>
              <Text style={styles.sub} numberOfLines={1}>
                {item.lastMessage?.text || item.otherPet.breed?.nameRu}
              </Text>
            </View>
            <Text style={styles.chev}>›</Text>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 30,
    fontFamily: fonts.extra,
    fontWeight: '800',
    paddingHorizontal: 20,
    paddingTop: 4,
    color: colors.ink,
  },
  stories: { paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  story: { width: 74, alignItems: 'center' },
  storyImg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.line,
  },
  storyName: { marginTop: 6, fontSize: 12, fontFamily: fonts.bold, color: colors.ink, fontWeight: '700' },
  row: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: radius.lg,
    alignItems: 'center',
    ...shadow.card,
  },
  avatar: { width: 56, height: 56, borderRadius: 20, backgroundColor: colors.line },
  name: { fontFamily: fonts.extra, fontWeight: '800', fontSize: 16, color: colors.ink },
  sub: { color: colors.muted, marginTop: 4, fontFamily: fonts.semibold },
  chev: { color: colors.muted, fontSize: 24 },
  empty: { color: colors.muted, textAlign: 'center', marginTop: 40, fontFamily: fonts.semibold },
});
