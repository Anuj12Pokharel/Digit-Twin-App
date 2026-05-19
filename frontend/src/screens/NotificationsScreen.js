import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

export default function NotificationsScreen({ navigation }) {
  const { colors: theme, isDarkMode } = useTheme();
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
    <View style={[styles.itemCard, { backgroundColor: theme.card }]}>
      <Text style={[styles.itemLabel, { color: theme.text }]}>{label}</Text>
      <Switch
        value={settings[valueKey]}
        onValueChange={() => toggle(valueKey)}
        trackColor={{ false: isDarkMode ? '#1E293B' : '#E2E8F0', true: theme.primary }}
        thumbColor="#fff"
      />
    </View>
  );

  return (
    <LinearGradient colors={theme.gradient} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity style={[styles.backBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)' }]} onPress={() => navigation.goBack()}>
            <Text style={[styles.backIcon, { color: theme.text }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Notifications</Text>
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
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary, shadowColor: theme.primary }]} onPress={() => navigation.goBack()}>
            <Text style={[styles.saveBtnText, { color: isDarkMode ? '#05141E' : '#fff' }]}>Save Changes</Text>
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
  saveBtn: { height: 56, backgroundColor: '#2563EB', borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
