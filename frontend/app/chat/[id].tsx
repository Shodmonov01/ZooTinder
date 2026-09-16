import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fonts, radius, shadow } from '@/constants/theme';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Message } from '@/lib/types';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');

  async function load() {
    setMessages(await api<Message[]>(`/chats/${id}/messages`));
  }

  useEffect(() => {
    load();
  }, [id]);

  return (
    <View style={styles.screen}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.senderId === user?.id ? styles.mine : styles.theirs]}>
            <Text style={{ color: item.senderId === user?.id ? colors.white : colors.ink, fontFamily: fonts.semibold }}>
              {item.text}
            </Text>
          </View>
        )}
      />
      <View style={styles.composer}>
        <TextInput
          value={text}
          onChangeText={setText}
          style={styles.input}
          placeholder="Напиши сообщение"
          placeholderTextColor={colors.muted}
        />
        <Pressable
          style={styles.send}
          onPress={async () => {
            if (!text.trim()) return;
            await api(`/chats/${id}/messages`, { method: 'POST', body: JSON.stringify({ text }) });
            setText('');
            await load();
          }}>
          <Text style={styles.sendText}>➤</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bgTop },
  bubble: { maxWidth: '78%', padding: 12, borderRadius: 20 },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.primary, borderBottomRightRadius: 6 },
  theirs: { alignSelf: 'flex-start', backgroundColor: colors.white, borderBottomLeftRadius: 6, ...shadow.card },
  composer: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    backgroundColor: colors.bg,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: fonts.semibold,
    color: colors.ink,
  },
  send: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: { color: colors.white, fontSize: 18 },
});
