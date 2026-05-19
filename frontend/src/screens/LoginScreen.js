import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { loginUser } from '../api/api';

const { width, height } = Dimensions.get('window');
const BLUE_GLOW = '#00F0FF';
const BLUE_COBALT = '#184E68';
const BLUE_INDIGO = '#0A2D3F';

export default function LoginScreen({ navigation, onLoginSuccess }) {
  const [email, setEmail] = useState('anuj@gmail.com');
  const [password, setPassword] = useState('Hello@2468');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Twinkling stars backdrop
  const stars = useRef(
    Array.from({ length: 15 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * (height * 0.75),
      size: Math.random() * 2.5 + 1.2,
      opacity: new Animated.Value(Math.random() * 0.4 + 0.1),
    }))
  ).current;

  // Sweeping metallic shine overlay
  const shineX = useRef(new Animated.Value(-150)).current;

  useEffect(() => {
    // 1. Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 9, useNativeDriver: true }),
    ]).start();

    // 2. Twinkle stars loop
    stars.forEach((star) => {
      const twinkle = () => {
        Animated.sequence([
          Animated.timing(star.opacity, {
            toValue: Math.random() * 0.8 + 0.2,
            duration: Math.random() * 2000 + 1000,
            useNativeDriver: true,
          }),
          Animated.timing(star.opacity, {
            toValue: Math.random() * 0.25 + 0.05,
            duration: Math.random() * 2000 + 1000,
            useNativeDriver: true,
          }),
        ]).start(() => twinkle());
      };
      twinkle();
    });

    // 3. Shiny loop sweeper
    const runShine = () => {
      shineX.setValue(-150);
      Animated.sequence([
        Animated.delay(2200),
        Animated.timing(shineX, {
          toValue: width * 0.7,
          duration: 900,
          useNativeDriver: true,
        }),
      ]).start(() => runShine());
    };
    runShine();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await loginUser({ email: email.trim(), password });
      await AsyncStorage.setItem('userToken', data.access_token);
      onLoginSuccess();
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        'Login failed. Please check your credentials.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#081E2D', '#05141E', '#030A0F']} style={styles.gradient}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Twinkling Starfield */}
      {stars.map((star, i) => (
        <Animated.View
          key={i}
          style={[
            styles.star,
            {
              left: star.x,
              top: star.y,
              width: star.size,
              height: star.size,
              borderRadius: star.size / 2,
              opacity: star.opacity,
            },
          ]}
        />
      ))}

      {/* Futuristic Ambient Glow Circles */}
      <View style={[styles.ambientCircle1, { backgroundColor: 'rgba(0, 240, 255, 0.12)' }]} />
      <View style={[styles.ambientCircle2, { backgroundColor: 'rgba(37, 99, 235, 0.12)' }]} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

              {/* ── Title ── */}
              <View style={styles.titleSection}>
                <Text style={styles.title}>Welcome Back!</Text>
                <Text style={styles.subtitle}>
                  Glad to have you here again. Let's get started!
                </Text>
              </View>

              {/* ── Error Banner ── */}
              {!!error && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>⚠️  {error}</Text>
                </View>
              )}

              {/* ── Form ── */}
              <View style={styles.form}>
                {/* Email */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Email</Text>
                  <View style={styles.inputCard}>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email"
                      placeholderTextColor="rgba(255, 255, 255, 0.35)"
                      value={email}
                      onChangeText={(v) => { setEmail(v); setError(''); }}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      returnKeyType="next"
                    />
                  </View>
                </View>

                {/* Password */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Password</Text>
                  <View style={styles.inputCard}>
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      placeholder="Enter your password"
                      placeholderTextColor="rgba(255, 255, 255, 0.35)"
                      value={password}
                      onChangeText={(v) => { setPassword(v); setError(''); }}
                      secureTextEntry={!showPassword}
                      returnKeyType="done"
                      onSubmitEditing={handleLogin}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '🙈'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Forgot Password */}
                <TouchableOpacity
                  style={styles.forgotRow}
                  onPress={() => navigation.navigate('ForgotPassword')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              {/* ── Sign In Button ── */}
              <TouchableOpacity
                style={styles.primaryButtonWrapper}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[BLUE_COBALT, BLUE_INDIGO]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.primaryButton}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Sign In</Text>
                  )}

                  {/* Sweeping metallic shimmer overlay */}
                  <Animated.View
                    style={[
                      styles.shineOverlay,
                      { transform: [{ translateX: shineX }, { skewX: '-28deg' }] },
                    ]}
                  />
                </LinearGradient>
              </TouchableOpacity>

              {/* ── Divider ── */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* ── Social Icons ── */}
              <View style={styles.socialRow}>
                <TouchableOpacity style={styles.socialIconBtn} activeOpacity={0.8}>
                  <Text style={styles.googleG}>G</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialIconBtn} activeOpacity={0.8}>
                  <Text style={styles.appleIcon}></Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialIconBtn} activeOpacity={0.8}>
                  <Text style={styles.facebookF}>f</Text>
                </TouchableOpacity>
              </View>

              {/* ── Footer ── */}
              <TouchableOpacity
                style={styles.bottomLinkRow}
                onPress={() => navigation.navigate('SignUp')}
                activeOpacity={0.7}
              >
                <Text style={styles.bottomLinkText}>
                  Don't have an account?{' '}
                  <Text style={styles.bottomLinkBold}>Sign Up</Text>
                </Text>
              </TouchableOpacity>

            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
  ambientCircle1: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    top: -60,
    right: -60,
  },
  ambientCircle2: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    bottom: '25%',
    left: -60,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 32,
  },

  // Title
  titleSection: { marginBottom: 28 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14.5,
    color: '#94A3B8',
    lineHeight: 21,
    fontWeight: '500',
  },

  // Error
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    fontSize: 13.5,
    color: '#F87171',
    fontWeight: '600',
    lineHeight: 20,
  },

  // Form
  form: { marginBottom: 8 },
  fieldGroup: { marginBottom: 16 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 8,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 54,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
  },
  eyeButton: {
    paddingLeft: 10,
    justifyContent: 'center',
  },
  eyeIcon: { fontSize: 18 },

  // Forgot
  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: 4,
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 14.5,
    color: BLUE_GLOW,
    fontWeight: '700',
  },

  // Primary Button
  primaryButtonWrapper: {
    height: 54,
    marginBottom: 28,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: BLUE_COBALT,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  shineOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 65,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  dividerText: { fontSize: 13, color: 'rgba(255, 255, 255, 0.4)', fontWeight: '600' },

  // Social
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 40,
  },
  socialIconBtn: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  googleG: { fontSize: 20, fontWeight: '900', color: BLUE_GLOW },
  appleIcon: { fontSize: 22, color: '#FFFFFF' },
  facebookF: { fontSize: 22, fontWeight: '900', color: BLUE_COBALT },

  // Footer
  bottomLinkRow: { alignItems: 'center' },
  bottomLinkText: { fontSize: 14.5, color: '#94A3B8' },
  bottomLinkBold: { color: BLUE_GLOW, fontWeight: '700' },
});
