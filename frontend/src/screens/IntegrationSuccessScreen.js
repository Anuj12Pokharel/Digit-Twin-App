import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../components/BottomNavBar';

const BLUE = '#2563EB';

export default function IntegrationSuccessScreen({ navigation }) {
  const handleNav = (tab) => {
    if (tab === 'Home') navigation.navigate('Home');
    if (tab === 'Profile') navigation.navigate('Settings');
    if (tab === 'Integrations') navigation.navigate('IntegrationsHub');
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#F8FBFF', '#EBF4FF', '#D6EAFF']} style={StyleSheet.absoluteFillObject} />
      
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}><Text style={styles.avatarText}>J</Text></View>
            <Text style={styles.headerTitle}>UI Digit App</Text>
          </View>
          <TouchableOpacity style={styles.headerSettings} onPress={() => navigation.navigate('Settings')}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          
          {/* Success Checkmark */}
          <View style={styles.iconContainer}>
            <View style={styles.circleOuter}>
              <View style={styles.circleInner}>
                <Text style={styles.checkText}>✓</Text>
              </View>
            </View>
          </View>

          <Text style={styles.pageTitle}>Successfully Connected</Text>
          <Text style={styles.pageSubtitle}>
            Your integration is now active. All data streams are synchronized and ready for use.
          </Text>

          {/* System Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusIconWrap}>
              <Text style={styles.statusSyncIcon}>↻</Text>
            </View>
            <View style={styles.statusTextGroup}>
              <Text style={styles.statusLabel}>SYSTEM STATUS</Text>
              <View style={styles.statusLiveRow}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Live connection active</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.continueBtn} onPress={() => navigation.navigate('IntegrationsHub')}>
            <Text style={styles.continueBtnText}>Continue</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.detailsLink} onPress={() => navigation.goBack()}>
            <Text style={styles.detailsLinkText}>View Integration Details</Text>
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

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: BLUE },
  headerSettings: { padding: 4 },
  settingsIcon: { fontSize: 20, color: BLUE },

  scroll: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 30, alignItems: 'center' },

  iconContainer: { marginBottom: 30 },
  circleOuter: { width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(34,197,94,0.15)', justifyContent: 'center', alignItems: 'center' },
  circleInner: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#15803D', justifyContent: 'center', alignItems: 'center', shadowColor: '#15803D', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  checkText: { fontSize: 44, color: '#FFFFFF', fontWeight: '800' },

  pageTitle: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginBottom: 12, textAlign: 'center' },
  pageSubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22, paddingHorizontal: 20, marginBottom: 40 },

  statusCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 20, padding: 20, width: '100%', marginBottom: 32 },
  statusIconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginRight: 16, shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  statusSyncIcon: { fontSize: 20, color: '#15803D', fontWeight: '800' },
  statusTextGroup: { flex: 1 },
  statusLabel: { fontSize: 10, fontWeight: '800', color: '#64748B', letterSpacing: 1, marginBottom: 4 },
  statusLiveRow: { flexDirection: 'row', alignItems: 'center' },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E', marginRight: 8 },
  liveText: { fontSize: 14, fontWeight: '700', color: '#0F172A' },

  continueBtn: { width: '100%', height: 56, borderRadius: 28, backgroundColor: BLUE, justifyContent: 'center', alignItems: 'center', shadowColor: BLUE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6, marginBottom: 24 },
  continueBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  detailsLink: { paddingVertical: 10 },
  detailsLinkText: { fontSize: 14, fontWeight: '600', color: '#475569' },
});
