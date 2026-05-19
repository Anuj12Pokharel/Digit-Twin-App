import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../components/BottomNavBar';

const BLUE = '#2563EB';

import { useTheme } from '../context/ThemeContext';

export default function IntegrationDetailScreen({ navigation }) {
  const { colors: theme, isDarkMode } = useTheme();

  const handleNav = (tab) => {
    if (tab === 'Home') navigation.navigate('Home');
    if (tab === 'Profile') navigation.navigate('Settings');
    if (tab === 'Integrations') navigation.navigate('IntegrationsHub');
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.gradient} style={StyleSheet.absoluteFillObject} />
      
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={[styles.backBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)' }]} onPress={() => navigation.goBack()}>
            <Text style={[styles.backIcon, { color: theme.text }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Integrations</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={[styles.logoWrap, { backgroundColor: theme.card }]}>
              <Text style={[styles.slackText, { color: theme.text }]}>slack</Text>
              <View style={[styles.syncBadge, { backgroundColor: theme.primary, borderColor: theme.gradient[0] }]}>
                <Text style={[styles.syncIcon, { color: isDarkMode ? '#05141E' : '#FFFFFF' }]}>↻</Text>
              </View>
            </View>
            <Text style={[styles.pageTitle, { color: theme.text }]}>Slack</Text>
            <Text style={[styles.pageSubtitle, { color: theme.textSecondary }]}>
              Connect your workspace to automate status updates and sync UI Digit notifications directly to channels.
            </Text>
          </View>

          {/* Connect Card */}
          <View style={[styles.connectCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>CURRENT STATUS: NOT CONNECTED</Text>
            <TouchableOpacity 
              style={[styles.connectBtn, { backgroundColor: theme.primary }]} 
              onPress={() => navigation.navigate('IntegrationSuccess')}
            >
              <Text style={[styles.connectBtnText, { color: isDarkMode ? '#05141E' : '#fff' }]}>Connect Slack</Text>
            </TouchableOpacity>
            <Text style={styles.disclaimer}>Requires Admin access to your Slack workspace.</Text>
          </View>

          {/* How it works */}
          <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>How it works</Text>
            
            <View style={styles.featureRow}>
              <View style={[styles.featureIconWrap, {backgroundColor: isDarkMode ? 'rgba(34,197,94,0.1)' : '#DCFCE7'}]}>
                <Text style={styles.featureIcon}>🔔</Text>
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: theme.text }]}>Instant Notifications</Text>
                <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>Get pings for critical app changes and deployment statuses directly in Slack.</Text>
              </View>
            </View>

            <View style={styles.featureRow}>
              <View style={[styles.featureIconWrap, {backgroundColor: isDarkMode ? 'rgba(37,99,235,0.1)' : '#DBEAFE'}]}>
                <Text style={styles.featureIcon}>⌘</Text>
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: theme.text }]}>Slash Commands</Text>
                <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>Query your UI Digit dashboard analytics using /digit-status inside any channel.</Text>
              </View>
            </View>
          </View>

          {/* Permissions */}
          <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
            <View style={styles.permHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Permissions</Text>
              <View style={styles.securedBadge}>
                <Text style={styles.securedText}>SECURED</Text>
              </View>
            </View>

            {['Read public channels', 'Post messages to channels', 'View member profiles'].map((perm, idx) => (
              <View key={idx} style={[styles.permRow, { backgroundColor: isDarkMode ? '#030A0F' : '#FFFFFF' }]}>
                <View style={styles.permLeft}>
                  <Text style={styles.permIcon}>👁️</Text>
                  <Text style={[styles.permText, { color: theme.text }]}>{perm}</Text>
                </View>
                <View style={styles.checkWrap}><Text style={styles.checkIcon}>✓</Text></View>
              </View>
            ))}

            <Text style={styles.permDisclaimer}>
              By clicking "Connect Slack", you agree to UI Digit App's Data Privacy Policy regarding integration webhooks and OAuth tokens.
            </Text>
          </View>

          <TouchableOpacity style={styles.docsLink}>
            <Text style={[styles.docsLinkText, { color: theme.primary }]}>❓ Read full integration documentation</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      <BottomNavBar activeTab="Integrations" onNavigate={handleNav} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 18, color: '#0F172A' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },

  scroll: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 20 },

  logoSection: { alignItems: 'center', marginBottom: 24 },
  logoWrap: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4, marginBottom: 16 },
  slackText: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  syncBadge: { position: 'absolute', bottom: -6, right: -6, width: 28, height: 28, borderRadius: 14, backgroundColor: BLUE, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#F8FBFF' },
  syncIcon: { color: '#fff', fontSize: 14, fontWeight: '800' },
  pageTitle: { fontSize: 26, fontWeight: '800', color: '#0F172A', marginBottom: 12 },
  pageSubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22, paddingHorizontal: 10 },

  connectCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, alignItems: 'center', shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4, marginBottom: 20 },
  statusLabel: { fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 1, marginBottom: 16 },
  connectBtn: { width: '100%', height: 52, borderRadius: 12, backgroundColor: BLUE, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  connectBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  disclaimer: { fontSize: 11, color: '#94A3B8', textAlign: 'center' },

  sectionCard: { backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 24, padding: 24, marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 16 },
  featureRow: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  featureIconWrap: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  featureIcon: { fontSize: 18 },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  featureDesc: { fontSize: 13, color: '#64748B', lineHeight: 18 },

  permHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  securedBadge: { backgroundColor: '#86EFAC', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  securedText: { fontSize: 9, fontWeight: '800', color: '#14532D', letterSpacing: 0.5 },
  permRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', paddingHorizontal: 16, height: 50, borderRadius: 12, marginBottom: 10 },
  permLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  permIcon: { fontSize: 16 },
  permText: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  checkWrap: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#22C55E', justifyContent: 'center', alignItems: 'center' },
  checkIcon: { color: '#fff', fontSize: 10, fontWeight: '800' },
  permDisclaimer: { fontSize: 11, color: '#94A3B8', textAlign: 'center', lineHeight: 16, marginTop: 12 },

  docsLink: { alignSelf: 'center', paddingVertical: 10 },
  docsLinkText: { fontSize: 13, fontWeight: '700', color: BLUE },
});
