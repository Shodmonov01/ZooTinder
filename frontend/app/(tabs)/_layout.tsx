import { Tabs } from 'expo-router';
import { FloatingTabBar } from '@/components/FloatingTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar state={props.state} navigation={props.navigation} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen name="index" options={{ title: 'Поиск' }} />
      <Tabs.Screen name="matches" options={{ title: 'Match' }} />
      <Tabs.Screen name="pets" options={{ title: 'Питомцы' }} />
      <Tabs.Screen name="profile" options={{ title: 'Профиль' }} />
    </Tabs>
  );
}
