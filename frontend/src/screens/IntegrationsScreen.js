import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/api';
import { useTheme } from '../context/ThemeContext';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const BLUE = '#2563EB';
const BLUE_LIGHT = '#EBF4FF';

// ── Animated section card ─────────────────────────────────────────────────────
function SectionCard({ children, delay = 0, style }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 10, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }, style]}
    >
      <View style={styles.card}>{children}</View>
    </Animated.View>
  );
}

// ── Status pill ───────────────────────────────────────────────────────────────
function StatusPill({ connected }) {
  return (
    <View style={[styles.statusPill, connected ? styles.pillConnected : styles.pillDisconnected]}>
      <View style={[styles.pillDot, connected ? styles.dotConnected : styles.dotDisconnected]} />
      <Text style={[styles.pillText, connected ? styles.pillTextConnected : styles.pillTextDisconnected]}>
        {connected ? 'Connected' : 'Not connected'}
      </Text>
    </View>
  );
}

export default function IntegrationsScreen({ navigation }) {
  const { colors: theme, isDarkMode } = useTheme();
  const [user, setUser] = useState(null);
  const [jira, setJira] = useState({ domain: '', email: '', token: '', isConnected: false });
  const [google, setGoogle] = useState({ isConnected: false });
  const [loading, setLoading] = useState(false);
  const [jiraExpanded, setJiraExpanded] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const stars = useRef(
    Array.from({ length: 15 }).map(() => ({
      x: Math.random() * SCREEN_W,
      y: Math.random() * (SCREEN_H * 0.75),
      size: Math.random() * 2.5 + 1.2,
      opacity: new Animated.Value(Math.random() * 0.4 + 0.1),
    }))
  ).current;

  useEffect(() => {
    if (isDarkMode) {
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
    }
  }, [isDarkMode]);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/me');
      setUser(res.data);
      if (res.data.jira_config) {
        setJira({
          domain: res.data.jira_config.domain,
          email: res.data.jira_config.email,
          token: '••••••••••••',
          isConnected: true,
        });
      }
      if (res.data.google_calendar_config) {
        setGoogle({ isConnected: true });
      }
    } catch (err) {
      console.error('Settings fetch error:', err);
    } finally {
      setInitializing(false);
    }
  };

  const handleJiraConnect = async () => {
    if (!jira.domain.trim() || !jira.email.trim() || !jira.token.trim() || jira.token === '••••••••••••') {
      Alert.alert('Missing Info', 'Please enter your Jira domain, email, and a fresh API token.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/jira/connect', {
        domain: jira.domain.trim(),
        email: jira.email.trim(),
        api_token: jira.token.trim(),
      });
      Alert.alert('✅ Jira Connected', 'Your Jira account has been linked successfully.');
      setJira(prev => ({ ...prev, isConnected: true }));
      setJiraExpanded(false);
    } catch (err) {
      Alert.alert('Connection Failed', err.response?.data?.detail || 'Check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('userToken');
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  if (initializing) {
    return (
      <LinearGradient colors={theme.gradient} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={theme.gradient} style={styles.gradient}>
      {isDarkMode && stars.map((star, i) => (
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
      {isDarkMode && (
        <>
          <View style={[styles.ambientCircle1, { backgroundColor: 'rgba(0, 240, 255, 0.12)' }]} />
          <View style={[styles.ambientCircle2, { backgroundColor: 'rgba(37, 99, 235, 0.12)' }]} />
        </>
      )}
      <SafeAreaView style={styles.safeArea}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[
              styles.backBtn,
              {
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.12)' : '#FFFFFF',
                borderColor: isDarkMode ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.08)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 3,
              },
            ]}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[styles.backBtnText, { color: isDarkMode ? '#FFFFFF' : '#0A0A0A' }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFFFFF' : '#0F172A' }]}>Settings</Text>
          <View style={{ width: 64 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Profile Card ── */}
          <SectionCard delay={0}>
            <View style={styles.profileRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarLetter}>
                  {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user?.full_name || 'No name set'}</Text>
                <Text style={styles.profileEmail}>{user?.email}</Text>
              </View>
            </View>
            <View style={styles.modeBadgeRow}>
              <View style={[styles.modeBadge, user?.current_mode === 'work' ? styles.modeBadgeWork : styles.modeBadgePersonal]}>
                <Text style={styles.modeBadgeText}>
                  {user?.current_mode === 'work' ? '💼 Work Mode' : '🌿 Personal Mode'}
                </Text>
              </View>
            </View>
          </SectionCard>

          {/* ── Section Label ── */}
          <Text style={styles.sectionLabel}>INTEGRATIONS</Text>

          {/* ── Jira Card ── */}
          <SectionCard delay={80}>
            <View style={styles.integrationHeader}>
              <View style={styles.integrationIconWrap}>
                <Text style={styles.integrationIcon}>🔷</Text>
              </View>
              <View style={styles.integrationTitleGroup}>
                <Text style={styles.integrationTitle}>Atlassian Jira</Text>
                <Text style={styles.integrationSubtitle}>
                  Manage tasks and issues via voice
                </Text>
              </View>
              <StatusPill connected={jira.isConnected} />
            </View>

            <TouchableOpacity
              style={styles.expandToggle}
              onPress={() => setJiraExpanded(!jiraExpanded)}
              activeOpacity={0.7}
            >
              <Text style={styles.expandToggleText}>
                {jiraExpanded ? '▲ Hide credentials' : '▼ ' + (jira.isConnected ? 'Update credentials' : 'Enter credentials')}
              </Text>
            </TouchableOpacity>

            {jiraExpanded && (
              <View style={styles.credForm}>
                <View style={styles.credField}>
                  <Text style={styles.credLabel}>Domain</Text>
                  <View style={styles.credInputCard}>
                    <TextInput
                      style={styles.credInput}
                      placeholder="yourcompany.atlassian.net"
                      placeholderTextColor="#A0AABF"
                      value={jira.domain}
                      onChangeText={v => setJira(p => ({ ...p, domain: v }))}
                      autoCapitalize="none"
                      keyboardType="url"
                    />
                  </View>
                </View>
                <View style={styles.credField}>
                  <Text style={styles.credLabel}>Email</Text>
                  <View style={styles.credInputCard}>
                    <TextInput
                      style={styles.credInput}
                      placeholder="you@company.com"
                      placeholderTextColor="#A0AABF"
                      value={jira.isConnected ? '' : jira.email}
                      onChangeText={v => setJira(p => ({ ...p, email: v }))}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                </View>
                <View style={styles.credField}>
                  <Text style={styles.credLabel}>API Token</Text>
                  <View style={styles.credInputCard}>
                    <TextInput
                      style={styles.credInput}
                      placeholder="Paste your Atlassian API token"
                      placeholderTextColor="#A0AABF"
                      value={jira.token === '••••••••••••' ? '' : jira.token}
                      onChangeText={v => setJira(p => ({ ...p, token: v }))}
                      secureTextEntry
                    />
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.connectBtn, loading && { opacity: 0.7 }]}
                  onPress={handleJiraConnect}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={styles.connectBtnText}>
                        {jira.isConnected ? 'Update Connection' : 'Connect Jira'}
                      </Text>
                  }
                </TouchableOpacity>
              </View>
            )}
          </SectionCard>

          {/* ── Google Calendar Card ── */}
          <SectionCard delay={140}>
            <View style={styles.integrationHeader}>
              <View style={[styles.integrationIconWrap, { backgroundColor: '#FEF2F2' }]}>
                <Text style={styles.integrationIcon}>📅</Text>
              </View>
              <View style={styles.integrationTitleGroup}>
                <Text style={styles.integrationTitle}>Google Calendar</Text>
                <Text style={styles.integrationSubtitle}>
                  Real-time availability & scheduling
                </Text>
              </View>
              <StatusPill connected={google.isConnected} />
            </View>
            <TouchableOpacity
              style={[styles.connectBtn, { backgroundColor: '#EA4335' }]}
              onPress={() => Alert.alert('Google Calendar', 'OAuth flow coming soon.')}
              activeOpacity={0.85}
            >
              <Text style={styles.connectBtnText}>
                {google.isConnected ? '✓ Calendar Linked' : 'Connect Google Calendar'}
              </Text>
            </TouchableOpacity>
          </SectionCard>

          {/* ── Section Label ── */}
          <Text style={styles.sectionLabel}>ACCOUNT</Text>

          {/* ── Sign Out ── */}
          <SectionCard delay={200}>
            <TouchableOpacity style={styles.signOutBtn} onPress={handleLogout} activeOpacity={0.8}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </SectionCard>

          {/* ── Version ── */}
          <Text style={styles.versionText}>Digit Twin v1.2 · Standard Edition</Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  star: { position: 'absolute', backgroundColor: '#FFFFFF' },
  ambientCircle1: { position: 'absolute', width: 250, height: 250, borderRadius: 125, top: -50, left: -50, opacity: 0.8 },
  ambientCircle2: { position: 'absolute', width: 300, height: 300, borderRadius: 150, bottom: -50, right: -50, opacity: 0.8 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  backBtnText: { color: '#0A0A0A', fontWeight: '800', fontSize: 26 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },

  // Scroll
  scrollContent: { paddingHorizontal: 20, paddingBottom: 48 },

  // Section labels
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 24,
    marginLeft: 4,
  },

  // Cards
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },

  // Profile
  profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarLetter: { color: '#fff', fontSize: 22, fontWeight: '800' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 17, fontWeight: '800', color: '#0F172A', marginBottom: 3 },
  profileEmail: { fontSize: 13, color: '#64748B' },
  modeBadgeRow: { flexDirection: 'row' },
  modeBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  modeBadgeWork: { backgroundColor: '#EFF6FF' },
  modeBadgePersonal: { backgroundColor: '#F0FDF4' },
  modeBadgeText: { fontSize: 13, fontWeight: '600', color: '#1E293B' },

  // Integration cards
  integrationHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  integrationIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  integrationIcon: { fontSize: 22 },
  integrationTitleGroup: { flex: 1 },
  integrationTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  integrationSubtitle: { fontSize: 12, color: '#64748B' },

  // Status pill
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 5,
  },
  pillConnected: { backgroundColor: '#DCFCE7' },
  pillDisconnected: { backgroundColor: '#F1F5F9' },
  pillDot: { width: 7, height: 7, borderRadius: 4 },
  dotConnected: { backgroundColor: '#22C55E' },
  dotDisconnected: { backgroundColor: '#94A3B8' },
  pillText: { fontSize: 11, fontWeight: '700' },
  pillTextConnected: { color: '#15803D' },
  pillTextDisconnected: { color: '#64748B' },

  // Expand toggle
  expandToggle: { marginBottom: 4 },
  expandToggleText: { fontSize: 13, color: BLUE, fontWeight: '600' },

  // Credential form
  credForm: { marginTop: 14, gap: 12 },
  credField: {},
  credLabel: { fontSize: 13, fontWeight: '600', color: '#1E293B', marginBottom: 6 },
  credInputCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  credInput: { fontSize: 14, color: '#1E293B' },

  // Connect button
  connectBtn: {
    marginTop: 16,
    height: 48,
    backgroundColor: BLUE,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  connectBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // Sign out
  signOutBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  signOutText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  // Version
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 20,
    marginBottom: 8,
  },
});
