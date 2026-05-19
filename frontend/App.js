import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider } from './src/context/ThemeContext';

// ── Onboarding ────────────────────────────────────────────────────────────────
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import GetStartedScreen from './src/screens/GetStartedScreen';

// ── Auth ──────────────────────────────────────────────────────────────────────
import SignUpScreen from './src/screens/SignUpScreen';
import LoginScreen from './src/screens/LoginScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';

// ── Permissions ───────────────────────────────────────────────────────────────
import MicrophonePermissionScreen from './src/screens/MicrophonePermissionScreen';

// ── App ───────────────────────────────────────────────────────────────────────
import HomeScreen from './src/screens/HomeScreen';
import ChatScreen from './src/screens/ChatScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import IntegrationsScreen from './src/screens/IntegrationsScreen';
import LanguageScreen from './src/screens/LanguageScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import HelpCenterScreen from './src/screens/HelpCenterScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import IntegrationsHubScreen from './src/screens/IntegrationsHubScreen';
import IntegrationDetailScreen from './src/screens/IntegrationDetailScreen';
import IntegrationSuccessScreen from './src/screens/IntegrationSuccessScreen';
import DocumentEditor from './src/screens/DocumentEditor';

const Stack = createStackNavigator();

const fadeInterpolator = ({ current }) => ({
  cardStyle: { opacity: current.progress },
});

// appState: 'loading' | 'onboarding' | 'auth' | 'mic' | 'app'
export default function App() {
  const [appState, setAppState] = useState('loading');

  useEffect(() => { bootstrap(); }, []);

  const bootstrap = async () => {
    try {
      const [token, onboardingSeen, micAsked] = await Promise.all([
        AsyncStorage.getItem('userToken'),
        AsyncStorage.getItem('onboardingSeen'),
        AsyncStorage.getItem('micPermissionAsked'),
      ]);

      if (token) {
        setAppState(micAsked ? 'app' : 'mic');
      } else if (onboardingSeen === 'true') {
        setAppState('auth');
      } else {
        setAppState('onboarding');
      }
    } catch {
      setAppState('onboarding');
    }
  };

  const finishOnboarding = async () => {
    await AsyncStorage.setItem('onboardingSeen', 'true');
    setAppState('auth');
  };

  const handleLoginSuccess = async () => {
    const micAsked = await AsyncStorage.getItem('micPermissionAsked');
    setAppState(micAsked ? 'app' : 'mic');
  };

  const handleMicDone = () => setAppState('app');

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    setAppState('auth');
  };

  if (appState === 'loading') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#EBF4FF' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  // ── Mic Permission (shown once, right after first login) ──────────────────
  if (appState === 'mic') {
    return <MicrophonePermissionScreen onPermissionDone={handleMicDone} />;
  }

  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyleInterpolator: fadeInterpolator,
          animationEnabled: true,
        }}
      >
        {/* ── Onboarding ── */}
        {appState === 'onboarding' && (
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="GetStarted">
              {p => <GetStartedScreen {...p} onOnboardingComplete={finishOnboarding} />}
            </Stack.Screen>
            <Stack.Screen name="SignUp">
              {p => <SignUpScreen {...p} onLoginSuccess={handleLoginSuccess} />}
            </Stack.Screen>
            <Stack.Screen name="Login">
              {p => <LoginScreen {...p} onLoginSuccess={handleLoginSuccess} />}
            </Stack.Screen>
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        )}

        {/* ── Auth ── */}
        {appState === 'auth' && (
          <>
            <Stack.Screen name="Login">
              {p => <LoginScreen {...p} onLoginSuccess={handleLoginSuccess} />}
            </Stack.Screen>
            <Stack.Screen name="SignUp">
              {p => <SignUpScreen {...p} onLoginSuccess={handleLoginSuccess} />}
            </Stack.Screen>
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        )}

        {/* ── Authenticated App ── */}
        {appState === 'app' && (
          <>
            <Stack.Screen name="Home">
              {p => <HomeScreen {...p} onLogout={handleLogout} />}
            </Stack.Screen>
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="Settings">
              {p => <SettingsScreen {...p} onLogout={handleLogout} />}
            </Stack.Screen>
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="IntegrationsHub" component={IntegrationsHubScreen} />
            <Stack.Screen name="IntegrationDetail" component={IntegrationDetailScreen} />
            <Stack.Screen name="IntegrationSuccess" component={IntegrationSuccessScreen} />
            <Stack.Screen name="Integrations" component={IntegrationsScreen} />
            <Stack.Screen name="Language" component={LanguageScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
            <Stack.Screen name="DocumentEditor" component={DocumentEditor} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
    </ThemeProvider>
  );
}
