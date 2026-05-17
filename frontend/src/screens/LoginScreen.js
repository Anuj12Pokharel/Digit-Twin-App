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
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { loginUser } from '../api/api';

const BLUE = '#2563EB';

export default function LoginScreen({ navigation, onLoginSuccess }) {
  const [email, setEmail] = useState('anuj@gmail.com');
  const [password, setPassword] = useState('Hello@2468');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 9, useNativeDriver: true }),
    ]).start();
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
    <LinearGradient colors={['#EBF4FF', '#D6EAFF', '#C2DDFF']} style={styles.gradient}>
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
                <Text style={styles.title}>Welcome Back! 👋</Text>
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
                      placeholderTextColor="#A0AABF"
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
                      placeholderTextColor="#A0AABF"
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
                style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.primaryButtonText}>Sign In</Text>
                }
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
                  <Text style={styles.appleIcon}></Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.socialIconBtn, styles.facebookBtn]} activeOpacity={0.8}>
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
    color: '#0F172A',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 21,
  },

  // Error
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    fontSize: 13,
    color: '#991B1B',
    fontWeight: '500',
    lineHeight: 20,
  },

  // Form
  form: { marginBottom: 8 },
  fieldGroup: { marginBottom: 16 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
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
    fontSize: 14,
    color: BLUE,
    fontWeight: '600',
  },

  // Primary Button
  primaryButton: {
    height: 54,
    backgroundColor: BLUE,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 7,
    marginBottom: 28,
  },
  primaryButtonDisabled: { opacity: 0.7 },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#CBD5E1' },
  dividerText: { fontSize: 13, color: '#94A3B8', fontWeight: '500' },

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
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  facebookBtn: { backgroundColor: '#1877F2', borderColor: '#1877F2' },
  googleG: { fontSize: 22, fontWeight: '900', color: '#4285F4', fontStyle: 'italic' },
  appleIcon: { fontSize: 22, color: '#000' },
  facebookF: { fontSize: 24, fontWeight: '900', color: '#FFFFFF' },

  // Footer
  bottomLinkRow: { alignItems: 'center' },
  bottomLinkText: { fontSize: 14, color: '#64748B' },
  bottomLinkBold: { color: BLUE, fontWeight: '700' },
});
