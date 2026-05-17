import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const BLUE = '#2563EB';

export default function NotificationsScreen({ navigation }) {
  const [settings, setSettings] = useState({
    notifications: true,
    sound: false,
    vibrate: false,
    specialOffers: true,
    payments: false,
    cashback: false,
    appUpdates: true,
  });

  const toggle = (key) => setSettings(s => ({ ...s, [key]: !s[key] }));

  const ToggleItem = ({ label, valueKey }) => (
    <View style={styles.itemCard}>
      <Text style={styles.itemLabel}>{label}</Text>
      <Switch
        value={settings[valueKey]}
        onValueChange={() => toggle(valueKey)}
        trackColor={{ false: '#E2E8F0', true: BLUE }}
        thumbColor="#fff"
      />
    </View>
  );

  return (
    <LinearGradient colors={['#F8FBFF', '#EBF4FF', '#D6EAFF']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.listGroup}>
            <ToggleItem label="Notifications" valueKey="notifications" />
            <ToggleItem label="Sound" valueKey="sound" />
            <ToggleItem label="Vibrate" valueKey="vibrate" />
            <ToggleItem label="Special Offers" valueKey="specialOffers" />
            <ToggleItem label="Payments" valueKey="payments" />
            <ToggleItem label="Cashback" valueKey="cashback" />
            <ToggleItem label="App Updates" valueKey="appUpdates" />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.saveBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 18, color: '#0F172A' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },

  scroll: { paddingHorizontal: 20, paddingBottom: 20 },

  listGroup: { gap: 12 },
  itemCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', paddingHorizontal: 20, height: 60, borderRadius: 16, shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  itemLabel: { fontSize: 15, color: '#1E293B', fontWeight: '500' },

  footer: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10 },
  saveBtn: { height: 56, backgroundColor: BLUE, borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowColor: BLUE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
