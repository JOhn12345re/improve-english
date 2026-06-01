import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>{'\u2715'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 30 }} />
      </View>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.updated}>Last updated: June 1, 2026</Text>

        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.paragraph}>
          EnglishFlow ("we", "our", "the app") is an English learning application. We respect your privacy and are committed to protecting your personal data. This policy explains how we collect, use, and safeguard your information.
        </Text>

        <Text style={styles.sectionTitle}>2. Data We Collect</Text>
        <Text style={styles.paragraph}>
          {'\u2022'} <Text style={styles.bold}>Profile data:</Text> First name, last name, native language, English level, and learning goals. This data is stored locally on your device.
        </Text>
        <Text style={styles.paragraph}>
          {'\u2022'} <Text style={styles.bold}>Learning progress:</Text> Lesson scores, vocabulary mastery, XP, and streak data. Stored locally on your device.
        </Text>
        <Text style={styles.paragraph}>
          {'\u2022'} <Text style={styles.bold}>No account required:</Text> The app works without creating an account. We do not collect email addresses or passwords unless you choose to create an account.
        </Text>

        <Text style={styles.sectionTitle}>3. How We Use Your Data</Text>
        <Text style={styles.paragraph}>
          Your data is used solely to personalize your learning experience: adapting lesson difficulty, tracking your progress, and scheduling vocabulary reviews. We do not sell, share, or transfer your personal data to third parties.
        </Text>

        <Text style={styles.sectionTitle}>4. Data Storage</Text>
        <Text style={styles.paragraph}>
          All personal data is stored locally on your device using AsyncStorage. If you create an account, anonymized progress data may be synced to our servers hosted on Railway (PostgreSQL database in the United States) to enable cross-device access.
        </Text>

        <Text style={styles.sectionTitle}>5. Third-Party Services</Text>
        <Text style={styles.paragraph}>
          {'\u2022'} <Text style={styles.bold}>Expo / EAS:</Text> Used for app distribution and over-the-air updates. Subject to Expo's privacy policy.
        </Text>
        <Text style={styles.paragraph}>
          {'\u2022'} <Text style={styles.bold}>AI explanations:</Text> When you request an AI explanation for an exercise, your answer and the exercise content are sent to our server for processing. No personal data is included.
        </Text>

        <Text style={styles.sectionTitle}>6. Your Rights (GDPR)</Text>
        <Text style={styles.paragraph}>
          Under the General Data Protection Regulation (GDPR), you have the right to:
        </Text>
        <Text style={styles.paragraph}>
          {'\u2022'} Access your personal data{'\n'}
          {'\u2022'} Rectify inaccurate data{'\n'}
          {'\u2022'} Delete your data ("right to be forgotten"){'\n'}
          {'\u2022'} Export your data in a portable format{'\n'}
          {'\u2022'} Withdraw consent at any time
        </Text>
        <Text style={styles.paragraph}>
          You can delete all your local data at any time from the Profile screen using "Delete my data".
        </Text>

        <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
        <Text style={styles.paragraph}>
          EnglishFlow does not knowingly collect data from children under 13. The app is designed for users aged 13 and above.
        </Text>

        <Text style={styles.sectionTitle}>8. Changes to This Policy</Text>
        <Text style={styles.paragraph}>
          We may update this policy from time to time. The updated version will be available within the app.
        </Text>

        <Text style={styles.sectionTitle}>9. Contact</Text>
        <Text style={styles.paragraph}>
          For questions about this privacy policy or to exercise your rights, contact us at: englishflow.app@gmail.com
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { padding: 4, width: 30 },
  backText: { fontSize: 18, color: '#9CA3AF', fontWeight: '600' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1E1B4B' },
  body: { paddingHorizontal: 24, paddingTop: 8 },
  updated: { fontSize: 12, color: '#9CA3AF', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E1B4B', marginTop: 20, marginBottom: 8 },
  paragraph: { fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 8 },
  bold: { fontWeight: '700' },
});
