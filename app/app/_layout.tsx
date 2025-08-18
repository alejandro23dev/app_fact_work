import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from '@/components/useColorScheme';
import { Alert, View, Text, Button, StyleSheet } from 'react-native';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const colorScheme = useColorScheme();

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  const checkSecurity = async () => {
    setCheckingAuth(true);
    try {
      const storedSecurity = await AsyncStorage.getItem('security');
      if (!storedSecurity) {
        setAuthenticated(true);
        return;
      }

      if (storedSecurity === "1") {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (hasHardware && isEnrolled) {
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: "Autenticación requerida",
            fallbackLabel: "Usa tu PIN",
          });

          if (result.success) {
            setAuthenticated(true);
          } else {
            Alert.alert("Acceso denegado", "No se pudo autenticar");
            setAuthenticated(false);
          }
        } else {
          setAuthenticated(true);
        }
      } else {
        setAuthenticated(true);
      }
    } catch (e) {
      console.error("Error verificando seguridad:", e);
      setAuthenticated(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  useEffect(() => {
    checkSecurity();
  }, []);

  useEffect(() => {
    if (loaded && !checkingAuth) SplashScreen.hideAsync();
  }, [loaded, checkingAuth]);

  if (!loaded || checkingAuth) return null;

  if (!authenticated) {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <View style={styles.lockedContainer}>
          <Text style={styles.lockedText}>🔒 Acceso Bloqueado</Text>
          <Text style={styles.lockedSubText}>Autenticación requerida para continuar</Text>
          <Button title="Reintentar" onPress={checkSecurity} />
        </View>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modalIndex" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="modalInvoice" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="modalInvoiceHistory" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="modalSettings" options={{ presentation: 'modal', headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  lockedText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  lockedSubText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
});
