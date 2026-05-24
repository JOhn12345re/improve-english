import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeLanguage } from '@englishflow/shared-types';
import ProgressBar from '@/components/ui/ProgressBar';
import Screen from '@/components/ui/Screen';
import { applyRTL } from '@/services/i18n';
import { useOnboardingStore } from '@/stores/onboarding.store';
import i18n from '@/services/i18n';

interface LanguageOption {
  code: NativeLanguage;
  nativeName: string;
  flag: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: NativeLanguage.FR, nativeName: 'Français', flag: '🇫🇷' },
  { code: NativeLanguage.ES, nativeName: 'Español', flag: '🇪🇸' },
  { code: NativeLanguage.IT, nativeName: 'Italiano', flag: '🇮🇹' },
  { code: NativeLanguage.AR, nativeName: 'العربية', flag: '🇸🇦' },
  { code: NativeLanguage.PT, nativeName: 'Português', flag: '🇵🇹' },
  { code: NativeLanguage.DE, nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: NativeLanguage.EN, nativeName: 'English', flag: '🇬🇧' },
];

export default function NativeLanguageScreen() {
  const { t } = useTranslation();
  const { nativeLanguage, setNativeLanguage } = useOnboardingStore();

  function handleSelect(lang: NativeLanguage) {
    setNativeLanguage(lang);
    applyRTL(lang);
    i18n.changeLanguage(lang);
  }

  function handleNext() {
    router.push('/(onboarding)/level-assessment');
  }

  return (
    <Screen padding={false}>
      <View style={styles.header}>
        <ProgressBar progress={0.25} />
        <Text style={styles.step}>{t('onboarding.step', { current: 1, total: 4 })}</Text>
        <Text style={styles.title}>{t('onboarding.nativeLanguage.title')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.nativeLanguage.subtitle')}</Text>
      </View>

      <FlatList
        data={LANGUAGE_OPTIONS}
        keyExtractor={(item) => item.code}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.languageItem, nativeLanguage === item.code && styles.languageItemSelected]}
            onPress={() => handleSelect(item.code)}
            activeOpacity={0.7}
          >
            <Text style={styles.flag}>{item.flag}</Text>
            <Text style={[styles.languageName, nativeLanguage === item.code && styles.languageNameSelected]}>
              {item.nativeName}
            </Text>
            {nativeLanguage === item.code && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>{t('common.continue')}</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    gap: 12,
  },
  step: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
    marginTop: 4,
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
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 10,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageItemSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  flag: {
    fontSize: 28,
  },
  languageName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#374151',
  },
  languageNameSelected: {
    color: '#4F46E5',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 8,
  },
  nextButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
