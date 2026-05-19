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
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const PURPLE = '#184E68';
const CYAN = '#00F0FF';
const INDIGO = '#0A2D3F';

// Reusable icon matching the brand with enhanced styling
function AppIcon() {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.12, duration: 1800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.0, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.iconContainer}>
      {/* Dynamic pulsing glow wrapper */}
      <Animated.View style={[styles.pulseGlow, { transform: [{ scale: pulse }] }]} />
      <View style={styles.iconShadowWrapper}>
        <LinearGradient
          colors={[PURPLE, CYAN]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconBgBlue}
        >
          <View style={styles.stackIcon}>
            <View style={[styles.stackLayer, styles.stackTop]} />
            <View style={[styles.stackLayer, styles.stackMid]} />
            <View style={[styles.stackLayer, styles.stackBot]} />
          </View>
        </LinearGradient>
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
      <Text style={styles.appleA}></Text>
    </View>
  );
}

export default function GetStartedScreen({ navigation, onOnboardingComplete }) {
  // Staggered animated values
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.3)).current;
  
  const textFade = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(25)).current;

  const btn1Slide = useRef(new Animated.Value(40)).current;
  const btn1Opacity = useRef(new Animated.Value(0)).current;

  const btn2Slide = useRef(new Animated.Value(40)).current;
  const btn2Opacity = useRef(new Animated.Value(0)).current;

  const btn3Slide = useRef(new Animated.Value(40)).current;
  const btn3Opacity = useRef(new Animated.Value(0)).current;

  const footerFade = useRef(new Animated.Value(0)).current;

  // Metallic sweep shiny animation
  const shineX = useRef(new Animated.Value(-150)).current;

  useEffect(() => {
    // Loop shiny shine sweep every 2.8 seconds
    const runShine = () => {
      shineX.setValue(-150);
      Animated.sequence([
        Animated.delay(2200),
        Animated.timing(shineX, {
          toValue: width * 0.6,
          duration: 900,
          useNativeDriver: true,
        }),
      ]).start(() => runShine());
    };
    runShine();
  }, []);

  useEffect(() => {
    // Silently mark onboarding as completed so next launch goes straight to Login
    AsyncStorage.setItem('onboardingSeen', 'true').catch(() => {});

    // Shifting background fade
    Animated.timing(bgOpacity, { toValue: 1, duration: 800, useNativeDriver: true }).start();

    // Sequence for clean, staggered, high-end feels
    Animated.sequence([
      // 1. Brand Logo pops and bounces slightly
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      // 2. Title & Subtitle slide up smoothly
      Animated.parallel([
        Animated.timing(textFade, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(textSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      // 3. Stagger buttons entering
      Animated.stagger(150, [
        Animated.parallel([
          Animated.timing(btn1Opacity, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.spring(btn1Slide, { toValue: 0, tension: 70, friction: 8, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(btn2Opacity, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.spring(btn2Slide, { toValue: 0, tension: 70, friction: 8, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(btn3Opacity, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.spring(btn3Slide, { toValue: 0, tension: 70, friction: 8, useNativeDriver: true }),
        ]),
      ]),
      // 4. Finally fade footer in
      Animated.timing(footerFade, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <LinearGradient colors={['#081E2D', '#05141E', '#030A0F']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Decorative ambient blurred geometry */}
      <View style={styles.ambientCircle1} />
      <View style={styles.ambientCircle2} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Top section: animated icon + title */}
          <View style={styles.topSection}>
            <Animated.View style={{ transform: [{ scale: logoScale }] }}>
              <AppIcon />
            </Animated.View>
            <Animated.View style={{ opacity: textFade, transform: [{ translateY: textSlide }], alignItems: 'center' }}>
              <Text style={styles.mainTitle}>Let's Get Started</Text>
              <Text style={styles.subtitle}>Experience smarter conversations{'\n'}and automated curation.</Text>
            </Animated.View>
          </View>

          {/* Buttons section */}
          <View style={styles.buttonsSection}>
            {/* Sign Up Email */}
            <Animated.View style={{ opacity: btn1Opacity, transform: [{ translateY: btn1Slide }] }}>
              <TouchableOpacity
                style={styles.primaryButtonWrapper}
                activeOpacity={0.85}
                onPress={() => {
                  if (onOnboardingComplete) onOnboardingComplete();
                  navigation.navigate('SignUp');
                }}
              >
                <LinearGradient
                  colors={[PURPLE, INDIGO]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.primaryButton}
                >
                  <Text style={styles.primaryButtonText}>Sign Up with Email</Text>

                  {/* Sweeping metallic shimmer overlay */}
                  <Animated.View
                    style={[
                      styles.shineOverlay,
                      { transform: [{ translateX: shineX }, { skewX: '-28deg' }] },
                    ]}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Divider */}
            <Animated.View style={[styles.dividerRow, { opacity: btn1Opacity }]}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or Use Instant Sign Up</Text>
              <View style={styles.dividerLine} />
            </Animated.View>

            {/* Google */}
            <Animated.View style={{ opacity: btn2Opacity, transform: [{ translateY: btn2Slide }] }}>
              <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
                <GoogleIcon />
                <Text style={styles.socialButtonText}>Continue with Google</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Apple */}
            <Animated.View style={{ opacity: btn3Opacity, transform: [{ translateY: btn3Slide }] }}>
              <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
                <AppleIcon />
                <Text style={styles.socialButtonText}>Continue with Apple</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Footer sign in link */}
          <Animated.View style={{ opacity: footerFade }}>
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
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  ambientCircle1: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    top: -50,
    right: -50,
  },
  ambientCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(12, 221, 188, 0.12)',
    bottom: '35%',
    left: -50,
  },
  safeArea: {
    flex: 1,
    zIndex: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  topSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 30,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  pulseGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: 'rgba(12, 221, 188, 0.18)',
  },
  iconShadowWrapper: {
    shadowColor: CYAN,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 12,
  },
  iconBgBlue: {
    width: 84,
    height: 84,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stackIcon: {
    width: 44,
    height: 38,
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
    borderLeftWidth: 18,
    borderRightWidth: 18,
    borderBottomWidth: 10,
    borderBottomColor: 'rgba(255,255,255,0.98)',
    top: 0,
  },
  stackMid: {
    width: 0,
    height: 0,
    borderLeftWidth: 18,
    borderRightWidth: 18,
    borderBottomWidth: 10,
    borderBottomColor: 'rgba(255,255,255,0.72)',
    top: 13,
  },
  stackBot: {
    width: 0,
    height: 0,
    borderLeftWidth: 18,
    borderRightWidth: 18,
    borderBottomWidth: 10,
    borderBottomColor: 'rgba(255,255,255,0.44)',
    top: 26,
  },
  mainTitle: {
    fontSize: 27,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.6,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14.5,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  buttonsSection: {
    gap: 12,
    marginBottom: 16,
  },
  primaryButtonWrapper: {
    height: 54,
  },
  primaryButton: {
    flex: 1,
    height: '100%',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden', // Clips sweep shiny shine
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  shineOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 65,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 6,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: '600',
  },
  socialButton: {
    height: 54,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  socialIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleG: {
    fontSize: 18,
    fontWeight: '900',
    color: CYAN,
  },
  appleA: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  signInRow: {
    alignItems: 'center',
    paddingTop: 10,
  },
  signInText: {
    fontSize: 14,
    color: '#64748B',
  },
  signInLink: {
    color: CYAN,
    fontWeight: '700',
  },
});
