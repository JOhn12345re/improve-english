import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
  );
}

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          borderTopColor: '#F3F4F6',
          paddingBottom: 8,
          height: 60,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label={t('tabs.home')} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="lessons"
        options={{
          title: t('tabs.lessons'),
          tabBarIcon: ({ focused }) => <TabIcon emoji="📚" label={t('tabs.lessons')} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="vocabulary"
        options={{
          title: t('tabs.vocabulary'),
          tabBarIcon: ({ focused }) => <TabIcon emoji="🃏" label={t('tabs.vocabulary')} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label={t('tabs.profile')} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
