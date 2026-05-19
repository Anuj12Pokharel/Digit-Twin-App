import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Switch, Modal, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import api from '../api/api';

const BLUE = '#2563EB';

export default function SettingsScreen({ navigation, onLogout }) {
  const [user, setUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { isDarkMode, toggleTheme, colors: theme } = useTheme();

  useFocusEffect(
    useCallback(() => {
      api.get('/me').then(res => setUser(res.data)).catch(() => {});
    }, [])
  );

  const confirmLogout = () => {
    setShowLogoutModal(false);
    if (onLogout) onLogout();
  };

  const initial = user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?';

  const menuItems = [
    { icon: '👤', label: 'Profile', route: 'EditProfile' },
    { icon: '🔔', label: 'Notification', route: 'Notifications' },
    { icon: '🌐', label: 'Language', route: 'Language' },
    { icon: '🔌', label: 'Integrations', route: 'IntegrationsHub' },
    { icon: '❓', label: 'Help Center', route: 'HelpCenter' },
    { icon: '📄', label: 'Privacy & Policy', route: 'PrivacyPolicy' },
  ];

  return (
    <LinearGradient colors={theme.gradient} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity style={[styles.backBtn, { backgroundColor: theme.backBtnBg }]} onPress={() => navigation.goBack()}>
            <Text style={[styles.backIcon, { color: theme.text }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* User Card */}
          <View style={styles.userCard}>
            <TouchableOpacity onPress={() => navigation.navigate('EditProfile')} activeOpacity={0.8}>
              {user?.avatar_url ? (
                <Image
                  source={{ uri: user.avatar_url }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initial}</Text>
                </View>
              )}
            </TouchableOpacity>
            <View>
              <Text style={[styles.userName, { color: theme.text }]}>{user?.full_name || 'Your Name'}</Text>
              <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{user?.email || ''}</Text>
            </View>
          </View>

          {/* Menu Items */}
          <View style={styles.menuContainer}>
            {menuItems.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.menuItem, { backgroundColor: theme.card }]}
                onPress={() => item.route && navigation.navigate(item.route)}
                activeOpacity={0.7}
              >
                <View style={styles.menuLeft}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                  <Text style={[styles.menuLabel, { color: theme.cardText }]}>{item.label}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))}

            {/* Dark Mode Toggle */}
            <View style={[styles.menuItem, { backgroundColor: theme.card }]}>
              <View style={styles.menuLeft}>
                <Text style={styles.menuIcon}>👁️</Text>
                <Text style={[styles.menuLabel, { color: theme.cardText }]}>Dark Mode</Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: '#E2E8F0', true: BLUE }}
                thumbColor="#fff"
              />
            </View>
          </View>

          {/* Sign Out */}
          <TouchableOpacity style={[styles.signOutBtn, { backgroundColor: theme.dangerBg }]} onPress={() => setShowLogoutModal(true)}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Are you sure you want{'\n'}to logout?</Text>
            <Text style={[styles.modalDesc, { color: theme.textSecondary }]}>
              Make sure you've saved your work or completed any ongoing tasks before logging out.
            </Text>
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowLogoutModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalLogoutBtn, { borderColor: theme.border }]} onPress={confirmLogout}>
                <Text style={[styles.modalLogoutText, { color: theme.text }]}>Log Out</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.modalCloseIcon, { backgroundColor: theme.card }]} onPress={() => setShowLogoutModal(false)}>
              <Text style={{fontSize: 20, color: theme.textSecondary }}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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

  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  userCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 30, paddingHorizontal: 10 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#94A3B8', justifyContent: 'center', alignItems: 'center', marginRight: 16, overflow: 'hidden' },
  avatarText: { fontSize: 24, fontWeight: '700', color: '#fff' },
  userName: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  userEmail: { fontSize: 14, color: '#64748B' },

  menuContainer: { gap: 12, marginBottom: 30 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', paddingHorizontal: 20, height: 64, borderRadius: 16, shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  menuIcon: { fontSize: 20 },
  menuLabel: { fontSize: 15, fontWeight: '500', color: '#1E293B' },
  chevron: { fontSize: 22, color: '#94A3B8', marginBottom: 2 },

  signOutBtn: { height: 56, borderRadius: 28, borderWidth: 1.5, borderColor: '#EF4444', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FEF2F2' },
  signOutText: { color: '#EF4444', fontSize: 16, fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, width: '100%', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', textAlign: 'center', marginBottom: 12, lineHeight: 28 },
  modalDesc: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 28, lineHeight: 22, paddingHorizontal: 10 },
  modalActions: { flexDirection: 'row', gap: 12, width: '100%' },
  modalCancelBtn: { flex: 1, height: 50, borderRadius: 12, backgroundColor: BLUE, justifyContent: 'center', alignItems: 'center' },
  modalCancelText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  modalLogoutBtn: { flex: 1, height: 50, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },
  modalLogoutText: { color: '#1E293B', fontSize: 15, fontWeight: '600' },
  modalCloseIcon: { position: 'absolute', bottom: -50, width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
});
