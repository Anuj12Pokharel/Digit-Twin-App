import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api/api';

const BLUE = '#2563EB';
const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

// ── Step indicator ─────────────────────────────────────────────────────────────
const STEPS = ['email', 'otp', 'newPassword', 'success'];

// ── Animated page wrapper ─────────────────────────────────────────────────────
function Page({ children }) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(24)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 380, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, tension: 90, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={{ flex: 1, opacity: fade, transform: [{ translateY: slide }] }}>
      {children}
    </Animated.View>
  );
}

// ── Back button ───────────────────────────────────────────────────────────────
function BackBtn({ onPress }) {
  return (
    <TouchableOpacity style={styles.backBtn} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.backBtnText}>←</Text>
    </TouchableOpacity>
  );
}

// ── Error banner ──────────────────────────────────────────────────────────────
function ErrorBanner({ msg }) {
  if (!msg) return null;
  return (
    <View style={styles.errorBanner}>
      <Text style={styles.errorText}>⚠️  {msg}</Text>
    </View>
  );
}

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep] = useState('email');          // 'email' | 'otp' | 'newPassword' | 'success'
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [successModal, setSuccessModal] = useState(false);

  // OTP input refs (one per digit)
  const otpRefs = useRef(Array.from({ length: OTP_LENGTH }, () => React.createRef()));

  // Countdown timer for "Resend Code"
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const startCountdown = () => setCountdown(RESEND_SECONDS);

  // ── Step 1: Send OTP ────────────────────────────────────────────────────────
  const handleSendOTP = async () => {
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      startCountdown();
      setStep('otp');
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: OTP digit handling ──────────────────────────────────────────────
  const handleOTPChange = (text, index) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    setError('');

    if (digit && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.current?.focus();
    }
  };

  const handleOTPKeyPress = ({ nativeEvent }, index) => {
    if (nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.current?.focus();
    }
  };

  const fullOTP = otpDigits.join('');

  const handleVerifyOTP = async () => {
    if (fullOTP.length < OTP_LENGTH) { setError('Enter the full 6-digit code.'); return; }
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { email: email.trim(), code: fullOTP });
      setStep('newPassword');
    } catch (e) {
      setError(e.response?.data?.detail || 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setError('');
    setOtpDigits(Array(OTP_LENGTH).fill(''));
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      startCountdown();
    } catch (e) {
      setError('Failed to resend. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Set new password ────────────────────────────────────────────────
  const handleResetPassword = async () => {
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email: email.trim(),
        code: fullOTP,
        new_password: password,
      });
      setStep('success');
    } catch (e) {
      setError(e.response?.data?.detail || 'Reset failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Shared UI ───────────────────────────────────────────────────────────────
  const goBack = () => {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
    else navigation.goBack();
  };

  const renderHeader = (title, subtitle) => (
    <View style={styles.headerSection}>
      <BackBtn onPress={goBack} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );

  const renderPrimaryBtn = (label, onPress) => (
    <TouchableOpacity
      style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.85}
    >
      {loading
        ? <ActivityIndicator color="#fff" />
        : <Text style={styles.primaryBtnText}>{label}</Text>
      }
    </TouchableOpacity>
  );

  // ── Step renders ────────────────────────────────────────────────────────────

  const renderEmail = () => (
    <Page key="email">
      {renderHeader(
        'Forgot Password',
        'Enter your email address and we will help you\nto restore your account.',
      )}
      <ErrorBanner msg={error} />
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Email</Text>
        <View style={styles.inputCard}>
          <TextInput
            style={styles.input}
            placeholder="wilson@09gmail.com"
            placeholderTextColor="#A0AABF"
            value={email}
            onChangeText={v => { setEmail(v); setError(''); }}
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="done"
            onSubmitEditing={handleSendOTP}
          />
        </View>
      </View>
      {renderPrimaryBtn('Send OTP', handleSendOTP)}
    </Page>
  );

  const renderOTP = () => (
    <Page key="otp">
      {renderHeader(
        'Enter Verification Code',
        'Check your email for the code and enter it to\nfinish.',
      )}
      <ErrorBanner msg={error} />

      {/* OTP digit boxes */}
      <View style={styles.otpRow}>
        {otpDigits.map((digit, i) => (
          <View
            key={i}
            style={[styles.otpBox, digit ? styles.otpBoxFilled : styles.otpBoxEmpty]}
          >
            <TextInput
              ref={otpRefs.current[i]}
              style={styles.otpInput}
              value={digit}
              onChangeText={t => handleOTPChange(t, i)}
              onKeyPress={e => handleOTPKeyPress(e, i)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              returnKeyType="next"
            />
          </View>
        ))}
      </View>

      {/* Countdown + Resend */}
      <View style={styles.resendRow}>
        {countdown > 0 ? (
          <Text style={styles.countdownText}>
            You can resend the code in{' '}
            <Text style={styles.countdownHighlight}>{countdown} seconds</Text>
          </Text>
        ) : null}
        <TouchableOpacity onPress={handleResend} disabled={countdown > 0 || loading}>
          <Text style={[styles.resendText, countdown > 0 && styles.resendTextDisabled]}>
            Resend Code
          </Text>
        </TouchableOpacity>
      </View>

      {renderPrimaryBtn('Verify Code', handleVerifyOTP)}
    </Page>
  );

  const renderNewPassword = () => (
    <Page key="newPassword">
      {renderHeader(
        'Create New Password',
        'Create a strong, unique, and memorable\npassword.',
      )}
      <ErrorBanner msg={error} />

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.inputCard}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="••••••••••••"
            placeholderTextColor="#A0AABF"
            value={password}
            onChangeText={v => { setPassword(v); setError(''); }}
            secureTextEntry={!showPassword}
            returnKeyType="next"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
            <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '🙈'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.fieldGroup, { marginTop: 16 }]}>
        <Text style={styles.label}>Confirm Password</Text>
        <View style={styles.inputCard}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="••••••••••••"
            placeholderTextColor="#A0AABF"
            value={confirmPassword}
            onChangeText={v => { setConfirmPassword(v); setError(''); }}
            secureTextEntry={!showConfirm}
            returnKeyType="done"
            onSubmitEditing={handleResetPassword}
          />
          <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
            <Text style={styles.eyeIcon}>{showConfirm ? '👁️' : '🙈'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ marginTop: 40 }}>
        {renderPrimaryBtn('Create New Password', handleResetPassword)}
      </View>
    </Page>
  );

  const renderSuccess = () => (
    <Page key="success">
      {/* Dimmed background */}
      <View style={styles.successOverlay}>
        {/* Success card */}
        <View style={styles.successCard}>
          {/* App icon */}
          <View style={styles.successIconWrap}>
            <View style={styles.successIconBg}>
              <View style={styles.stackIcon}>
                {[0, 12, 24].map((top, i) => (
                  <View key={i} style={[styles.stackLayer, { top, opacity: 1 - i * 0.25 }]} />
                ))}
              </View>
            </View>
          </View>

          <Text style={styles.successTitle}>Password Changed!</Text>
          <Text style={styles.successSubtitle}>
            Your password has been successfully updated.{'\n'}
            You can now log in with your new password.
          </Text>

          <TouchableOpacity
            style={styles.loginNowBtn}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.85}
          >
            <Text style={styles.loginNowText}>Login Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Faded background content */}
      <View style={[StyleSheet.absoluteFill, { opacity: 0.15 }]} pointerEvents="none">
        {renderHeader('Create New Password', 'Create a strong, unique, and memorable password.')}
      </View>
    </Page>
  );

  const stepMap = {
    email: renderEmail,
    otp: renderOTP,
    newPassword: renderNewPassword,
    success: renderSuccess,
  };

  return (
    <LinearGradient colors={['#EBF4FF', '#D6EAFF', '#C2DDFF']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {stepMap[step]?.()}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },

  // Header
  headerSection: { marginBottom: 32 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  backBtnText: { fontSize: 18, color: '#1E293B', fontWeight: '600' },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
    marginBottom: 10,
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
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  errorText: { fontSize: 13, color: '#991B1B', fontWeight: '500', lineHeight: 20 },

  // Form fields
  fieldGroup: {},
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
    marginBottom: 8,
  },
  input: { flex: 1, fontSize: 15, color: '#1E293B' },
  eyeBtn: { paddingLeft: 10 },
  eyeIcon: { fontSize: 18 },

  // Primary button
  primaryBtn: {
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
    marginTop: 24,
  },
  primaryBtnDisabled: { opacity: 0.7 },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: 0.2 },

  // OTP boxes
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 10,
  },
  otpBox: {
    flex: 1,
    height: 58,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  otpBoxEmpty: { borderColor: '#CBD5E1' },
  otpBoxFilled: { borderColor: BLUE },
  otpInput: {
    width: '100%',
    height: '100%',
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },

  // Resend
  resendRow: { alignItems: 'center', marginBottom: 8, gap: 6 },
  countdownText: { fontSize: 13, color: '#64748B', textAlign: 'center' },
  countdownHighlight: { color: BLUE, fontWeight: '700' },
  resendText: { fontSize: 14, color: BLUE, fontWeight: '700' },
  resendTextDisabled: { color: '#94A3B8' },

  // Success overlay
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    zIndex: 10,
    minHeight: 500,
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 16,
  },
  successIconWrap: {
    marginBottom: 20,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  successIconBg: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: BLUE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stackIcon: { width: 36, height: 30, position: 'relative' },
  stackLayer: {
    position: 'absolute',
    left: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 14,
    borderRightWidth: 14,
    borderBottomWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFFFFF',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 28,
  },
  loginNowBtn: {
    width: '100%',
    height: 52,
    backgroundColor: BLUE,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  loginNowText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
