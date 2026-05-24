import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';

export default function WelcomeScreen() {
  const { t } = useTranslation();

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.hero}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>EF</Text>
          </View>
          <Text style={styles.appName}>EnglishFlow</Text>
          <Text style={styles.tagline}>{t('onboarding.welcome.tagline')}</Text>
        </View>

        <View style={styles.actions}>
          <Button
            label={t('onboarding.welcome.start')}
            variant="primary"
            size="lg"
            fullWidth
            onPress={() => router.push('/(onboarding)/name')}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 80,
    paddingBottom: 40,
  },
  hero: {
    alignItems: 'center',
    gap: 16,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '800',
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E1B4B',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 17,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  actions: {
    gap: 8,
  },
});
