import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import Screen from '@/components/ui/Screen';
import { useOnboardingStore } from '@/stores/onboarding.store';

export default function NameScreen() {
  const { t } = useTranslation();
  const { firstName, lastName, setFirstName, setLastName } = useOnboardingStore();

  const canContinue = firstName.trim().length > 0 && lastName.trim().length > 0;

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.progressRow}>
          <ProgressBar progress={0.25} />
          <Text style={styles.step}>{t('onboarding.step', { current: 1, total: 4 })}</Text>
        </View>

        <Text style={styles.title}>{t('onboarding.name.title')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.name.subtitle')}</Text>

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('onboarding.name.firstName')}</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder={t('onboarding.name.firstNamePlaceholder')}
              autoCapitalize="words"
              autoFocus
              returnKeyType="next"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('onboarding.name.lastName')}</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder={t('onboarding.name.lastNamePlaceholder')}
              autoCapitalize="words"
              returnKeyType="done"
            />
          </View>
        </View>

        <Button
          label={t('common.continue')}
          variant="primary"
          size="lg"
          fullWidth
          disabled={!canContinue}
          onPress={() => router.push('/(onboarding)/native-language')}
          style={styles.button}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
    gap: 20,
  },
  progressRow: {
    gap: 8,
  },
  step: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1E1B4B',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    marginTop: -8,
  },
  form: {
    gap: 16,
    marginTop: 8,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  button: {
    marginTop: 'auto',
  },
});
