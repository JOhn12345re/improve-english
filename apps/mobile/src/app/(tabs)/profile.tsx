import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from '@/components/ui/Button';
import { useProfileStore } from '@/stores/profile.store';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { profile } = useProfileStore();

  const initials = `${profile?.firstName?.charAt(0) ?? ''}${profile?.lastName?.charAt(0) ?? ''}`.toUpperCase();
  const fullName = profile ? `${profile.firstName} ${profile.lastName}` : '';

  async function handleReset() {
    Alert.alert(t('profile.logoutConfirm.title'), t('profile.logoutConfirm.message'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('profile.logout'),
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('@englishflow/profile');
          router.replace('/(onboarding)/welcome');
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>{t('profile.title')}</Text>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials || '?'}</Text>
        </View>

        <Text style={styles.name}>{fullName}</Text>
        <Text style={styles.level}>{t('profile.level', { level: profile?.level ?? 'A1' })}</Text>
        <Text style={styles.xp}>⭐ {profile?.xp ?? 0} XP • 🔥 {profile?.streak ?? 0} jours</Text>

        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <Text style={styles.menuItemText}>{t('profile.privacyPolicy')}</Text>
            <Text style={styles.menuItemArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => router.push('/credits')}
            accessibilityLabel="View content sources and credits"
          >
            <Text style={styles.menuItemText}>Sources & Credits</Text>
            <Text style={styles.menuItemArrow}>→</Text>
          </TouchableOpacity>
        </View>

        <Button
          label={t('profile.logout')}
          variant="outline"
          size="md"
          fullWidth
          onPress={handleReset}
          style={styles.logoutButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 20, gap: 12, alignItems: 'center' },
  title: { fontSize: 26, fontWeight: '800', color: '#1E1B4B', alignSelf: 'flex-start' },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#fff' },
  name: { fontSize: 20, fontWeight: '700', color: '#1E1B4B' },
  level: { fontSize: 14, color: '#6366F1', fontWeight: '600' },
  xp: { fontSize: 13, color: '#9CA3AF' },
  menu: { width: '100%', marginTop: 8 },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemText: { fontSize: 15, color: '#374151' },
  menuItemArrow: { fontSize: 16, color: '#9CA3AF' },
  logoutButton: { marginTop: 'auto', marginBottom: 16 },
});
