import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Switch, Modal, Image, Animated, Dimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/api';

export default function SettingsScreen({ navigation, onLogout }) {
  const [user, setUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { colors: theme, isDarkMode, toggleTheme } = useTheme();

  const { width, height } = Dimensions.get('window');
  const BLUE_COBALT = '#184E68';
  const BLUE_INDIGO = '#0A2D3F';

  useFocusEffect(
    useCallback(() => {
      api.get('/me').then(res => setUser(res.data)).catch(() => {});
    }, [])
  );

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    await AsyncStorage.removeItem('onboardingSeen');
    if (onLogout) onLogout();
  };

  const initial = user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?';

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
    if (isDarkMode) {
      // Twinkle stars loop
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

    const runShine = () => {
      shineX.setValue(-150);
      Animated.sequence([
        Animated.delay(2400),
        Animated.timing(shineX, {
          toValue: width * 0.8,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => runShine());
    };
    runShine();
  }, [isDarkMode]);

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
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Twinkling Starfield */}
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

      {/* Futuristic Ambient Glow Circles */}
      {isDarkMode && (
        <>
          <View style={[styles.ambientCircle1, { backgroundColor: 'rgba(0, 240, 255, 0.12)' }]} />
          <View style={[styles.ambientCircle2, { backgroundColor: 'rgba(37, 99, 235, 0.12)' }]} />
        </>
      )}

      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity
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
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[styles.backIcon, { color: theme.text }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* User Card */}
          <View style={[styles.userCard, styles.glassCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <TouchableOpacity onPress={() => navigation.navigate('EditProfile')} activeOpacity={0.8}>
              {user?.avatar_url ? (
                <Image
                  source={{ uri: user.avatar_url }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                  <Text style={[styles.avatarText, { color: isDarkMode ? '#05141E' : '#FFFFFF' }]}>{initial}</Text>
                </View>
              )}
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={[styles.userName, { color: theme.text }]}>{user?.full_name || 'Your Name'}</Text>
              <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{user?.email || ''}</Text>
              {!!user?.address && (
                <Text style={[styles.userAddress, { color: theme.textSecondary }]}>📍 {user.address}</Text>
              )}
              {!!user?.mobile_number && (
                <Text style={[styles.userMobile, { color: theme.textSecondary }]}>📞 {user.mobile_number}</Text>
              )}
            </View>
          </View>

          {/* Menu Items */}
          <View style={styles.menuContainer}>
            {menuItems.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.menuItem, styles.glassCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => item.route && navigation.navigate(item.route)}
                activeOpacity={0.7}
              >
                <View style={styles.menuLeft}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                  <Text style={[styles.menuLabel, { color: theme.text }]}>{item.label}</Text>
                </View>
                <Text style={[styles.chevron, { color: theme.textSecondary }]}>›</Text>
              </TouchableOpacity>
            ))}

            {/* Light Mode Toggle */}
            <View style={[styles.menuItem, styles.glassCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.menuLeft}>
                <Text style={styles.menuIcon}>👁️</Text>
                <Text style={[styles.menuLabel, { color: theme.text }]}>Light Mode</Text>
              </View>
              <Switch
                value={!isDarkMode}
                onValueChange={(val) => toggleTheme(!val)}
                trackColor={{ false: '#1E293B', true: theme.primary }}
                thumbColor="#fff"
              />
            </View>
          </View>

          {/* Sign Out */}
          <TouchableOpacity
            style={styles.signOutBtnWrapper}
            onPress={() => setShowLogoutModal(true)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={isDarkMode ? [BLUE_COBALT, BLUE_INDIGO] : [theme.primary, '#1D4ED8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.signOutBtn}
            >
              <Text style={styles.signOutText}>Sign Out</Text>
              
              {/* Sweeping metallic shimmer overlay */}
              <Animated.View
                style={[
                  styles.shineOverlay,
                  { transform: [{ translateX: shineX }, { skewX: '-28deg' }] },
                ]}
              />
            </LinearGradient>
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
          <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Are you sure you want{"\n"}to logout?</Text>
            <Text style={[styles.modalDesc, { color: theme.textSecondary }]}>
              Make sure you've saved your work or completed any ongoing tasks before logging out.
            </Text>
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalCancelBtn, { backgroundColor: theme.primary }]} onPress={() => setShowLogoutModal(false)}>
                <Text style={[styles.modalCancelText, { color: isDarkMode ? '#05141E' : '#FFFFFF' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalLogoutBtn, { borderColor: theme.border, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#F1F5F9' }]} onPress={confirmLogout}>
                <Text style={[styles.modalLogoutText, { color: theme.text }]}>Log Out</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.modalCloseIcon, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => setShowLogoutModal(false)}>
              <Text style={{ fontSize: 20, color: theme.textSecondary }}>✕</Text>
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
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
  ambientCircle1: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    top: -50,
    left: -50,
    opacity: 0.8,
  },
  ambientCircle2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    bottom: -50,
    right: -50,
    opacity: 0.8,
  },
  
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  backBtn: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5 },
  backIcon: { fontSize: 26, fontWeight: '800' },
  headerTitle: { fontSize: 18, fontWeight: '700' },

  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  userCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 30, padding: 18 },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
  },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#94A3B8', justifyContent: 'center', alignItems: 'center', marginRight: 16, overflow: 'hidden' },
  avatarText: { fontSize: 24, fontWeight: '700', color: '#fff' },
  userName: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  userEmail: { fontSize: 14, color: '#8FA0AF', marginBottom: 4 },
  userAddress: { fontSize: 13, color: '#8FA0AF', marginBottom: 2 },
  userMobile: { fontSize: 13, color: '#8FA0AF' },

  menuContainer: { gap: 12, marginBottom: 30 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 64 },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  menuIcon: { fontSize: 20 },
  menuLabel: { fontSize: 15, fontWeight: '500', color: '#FFFFFF' },
  chevron: { fontSize: 22, color: '#8FA0AF', marginBottom: 2 },

  signOutBtnWrapper: {
    height: 56,
    marginBottom: 20,
    marginTop: 10,
  },
  signOutBtn: {
    flex: 1,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#184E68',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  signOutText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.2 },
  shineOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 65,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  modalContent: {
    backgroundColor: '#081E2D',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', textAlign: 'center', marginBottom: 12, lineHeight: 28 },
  modalDesc: { fontSize: 14, color: '#8FA0AF', textAlign: 'center', marginBottom: 28, lineHeight: 22, paddingHorizontal: 10 },
  modalActions: { flexDirection: 'row', gap: 12, width: '100%' },
  modalCancelBtn: { flex: 1, height: 50, borderRadius: 12, backgroundColor: '#184E68', justifyContent: 'center', alignItems: 'center' },
  modalCancelText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  modalLogoutBtn: { flex: 1, height: 50, borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.08)', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)' },
  modalLogoutText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  modalCloseIcon: { position: 'absolute', bottom: -50, width: 40, height: 40, borderRadius: 20, backgroundColor: '#081E2D', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.08)' },
});
