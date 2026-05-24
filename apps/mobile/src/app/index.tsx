import { Redirect } from 'expo-router';
import { useProfileStore } from '@/stores/profile.store';

export default function Index() {
  const { isOnboarded, isLoading } = useProfileStore();

  if (isLoading) return null;

  return <Redirect href={isOnboarded ? '/(tabs)/dashboard' : '/(onboarding)/welcome'} />;
}
