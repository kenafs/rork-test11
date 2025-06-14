import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function IndexScreen() {
  const { isAuthenticated } = useAuth();
  
  // Always redirect to tabs - the landing page is now in the tabs
  return <Redirect href="/(tabs)" />;
}