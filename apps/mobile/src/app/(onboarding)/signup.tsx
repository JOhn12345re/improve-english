import { Redirect } from 'expo-router';

// L'inscription est desactivee - l'app fonctionne sans compte
export default function SignupScreen() {
  return <Redirect href="/(onboarding)/welcome" />;
}
