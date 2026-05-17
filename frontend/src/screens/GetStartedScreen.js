import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const BLUE = '#2563EB';

// Reusable icon matching the brand
function AppIcon() {
  return (
    <View style={styles.iconShadowWrapper}>
      <View style={styles.iconBgBlue}>
        <View style={styles.stackIcon}>
          <View style={[styles.stackLayer, styles.stackTop]} />
          <View style={[styles.stackLayer, styles.stackMid]} />
          <View style={[styles.stackLayer, styles.stackBot]} />
        </View>
      </View>
    </View>
  );
}

// Google Icon SVG-like using text
function GoogleIcon() {
  return (
    <View style={styles.socialIconWrapper}>
      <Text style={styles.googleG}>G</Text>
    </View>
  );
}

// Apple Icon
function AppleIcon() {
  return (
    <View style={styles.socialIconWrapper}>
      <Text style={styles.appleA}></Text>
    </View>
  );
}

export default function GetStartedScreen({ navigation, onOnboardingComplete }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideUp, {
        toValue: 0,
        tension: 70,
        friction: 9,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <LinearGradient colors={['#EBF4FF', '#D6EAFF', '#C2DDFF']} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideUp }] }]}>
          {/* Top section: icon + title */}
          <View style={styles.topSection}>
            <AppIcon />
            <Text style={styles.mainTitle}>Lets Get Started</Text>
            <Text style={styles.subtitle}>Experience smarter conversations{'\n'}with ChatiFi.</Text>
          </View>

          {/* Buttons section */}
          <View style={styles.buttonsSection}>
            {/* Sign Up Email */}
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.85}
              onPress={() => {
                if (onOnboardingComplete) onOnboardingComplete();
                navigation.navigate('SignUp');
              }}
            >
              <Text style={styles.primaryButtonText}>Sign Up Email</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or Use Instant Sign Up</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google */}
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
              <GoogleIcon />
              <Text style={styles.socialButtonText}>Sign Up with Google</Text>
            </TouchableOpacity>

            {/* Apple */}
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
              <AppleIcon />
              <Text style={styles.socialButtonText}>Sign Up with Apple</Text>
            </TouchableOpacity>
          </View>

          {/* Footer sign in link */}
          <TouchableOpacity
            style={styles.signInRow}
            onPress={() => {
              if (onOnboardingComplete) onOnboardingComplete();
              navigation.navigate('Login');
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.signInText}>
              Already Have an Account?{' '}
              <Text style={styles.signInLink}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  topSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  iconShadowWrapper: {
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
    marginBottom: 24,
  },
  iconBgBlue: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: BLUE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stackIcon: {
    width: 42,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stackLayer: {
    position: 'absolute',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderStyle: 'solid',
  },
  stackTop: {
    width: 0,
    height: 0,
    borderLeftWidth: 17,
    borderRightWidth: 17,
    borderBottomWidth: 10,
    borderBottomColor: 'rgba(255,255,255,0.95)',
    top: 0,
  },
  stackMid: {
    width: 0,
    height: 0,
    borderLeftWidth: 17,
    borderRightWidth: 17,
    borderBottomWidth: 10,
    borderBottomColor: 'rgba(255,255,255,0.65)',
    top: 13,
  },
  stackBot: {
    width: 0,
    height: 0,
    borderLeftWidth: 17,
    borderRightWidth: 17,
    borderBottomWidth: 10,
    borderBottomColor: 'rgba(255,255,255,0.40)',
    top: 26,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 21,
  },
  buttonsSection: {
    gap: 12,
  },
  primaryButton: {
    height: 54,
    backgroundColor: BLUE,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 7,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#CBD5E1',
  },
  dividerText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  socialButton: {
    height: 54,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  socialIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleG: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4285F4',
    fontStyle: 'italic',
  },
  appleA: {
    fontSize: 20,
    color: '#000000',
  },
  signInRow: {
    alignItems: 'center',
    paddingTop: 12,
  },
  signInText: {
    fontSize: 14,
    color: '#64748B',
  },
  signInLink: {
    color: BLUE,
    fontWeight: '700',
  },
});
