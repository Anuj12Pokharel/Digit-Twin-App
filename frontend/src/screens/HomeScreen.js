import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Animated, StatusBar, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/api';

const BLUE = '#2563EB';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good Morning!' : h < 17 ? 'Good Afternoon!' : 'Good Evening!';
}

const MODES = [
  {
    id: 'personal',
    label: 'Personal Mode',
    desc: 'Generate complex algorithms and clean code with ease.',
    icon: '🤖',
    bg: '#DCFCE7',
  },
  {
    id: 'work',
    label: 'Work Mode',
    desc: 'Transform your imagination into stunning digital creations.',
    icon: '💎',
    bg: '#0F172A',
    dark: true,
  },
];

export default function HomeScreen({ navigation, onLogout }) {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('personal');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Fetch user every time this screen comes into focus
  // (ensures profile picture updates after editing)
  useFocusEffect(
    useCallback(() => {
      api.get('/me')
        .then(r => {
          setUser(r.data);
          if (r.data.current_mode) setMode(r.data.current_mode);
        })
        .catch(() => {});
    }, [])
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    if (onLogout) onLogout();
  };

  const initial = user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?';

  return (
    <LinearGradient colors={['#F8FBFF', '#EBF4FF', '#D6EAFF']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

            {/* ── Header ── */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <TouchableOpacity
                  style={styles.avatar}
                  onPress={() => navigation.navigate('Settings')}
                  activeOpacity={0.8}
                >
                  {user?.avatar_url ? (
                    <Image
                      source={{ uri: user.avatar_url }}
                      style={{ width: 46, height: 46, borderRadius: 23 }}
                    />
                  ) : (
                    <Text style={styles.avatarText}>{initial}</Text>
                  )}
                </TouchableOpacity>
                <View>
                  <Text style={styles.greetText}>{greeting()}</Text>
                  <Text style={styles.nameText}>{user?.full_name || user?.email || 'Welcome'}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.bellWrap} activeOpacity={0.7}>
                <Text style={styles.bellIcon}>🔔</Text>
              </TouchableOpacity>
            </View>

            {/* ── Mode section ── */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Choose Your Mode</Text>
            </View>

            <View style={styles.modeRow}>
              {MODES.map(m => (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.modeCard, mode === m.id && styles.modeCardActive]}
                  onPress={() => {
                    setMode(m.id);
                    api.patch('/users/me', { current_mode: m.id }).catch(() => {});
                  }}
                  activeOpacity={0.85}
                >
                  <View style={[styles.modeIconWrap, { backgroundColor: m.bg }]}>
                    <Text style={styles.modeIcon}>{m.icon}</Text>
                  </View>
                  <Text style={styles.modeLabel}>{m.label}</Text>
                  <Text style={styles.modeDesc}>{m.desc}</Text>
                  {mode === m.id && <View style={styles.activeDot} />}
                </TouchableOpacity>
              ))}
            </View>



          </Animated.View>
        </ScrollView>

        {/* ── Start New Chat ── */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => navigation.navigate('Chat', { mode, user })}
            activeOpacity={0.88}
          >
            <Text style={styles.startBtnText}>Start New Chat  →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, paddingTop: 8 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: BLUE, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  greetText: { fontSize: 12, color: '#64748B', fontWeight: '500', marginBottom: 2 },
  nameText: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  bellWrap: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6, elevation: 3 },
  bellIcon: { fontSize: 18 },

  // Section
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  seeAll: { fontSize: 14, color: BLUE, fontWeight: '600' },

  // Mode cards
  modeRow: { flexDirection: 'row', gap: 14, marginBottom: 28 },
  modeCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16,
    shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.10, shadowRadius: 10, elevation: 3,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  modeCardActive: { borderColor: BLUE },
  modeIconWrap: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  modeIcon: { fontSize: 24 },
  modeLabel: { fontSize: 14, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
  modeDesc: { fontSize: 12, color: '#64748B', lineHeight: 17 },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: BLUE, marginTop: 10 },


  // Bottom
  bottomBar: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10 },
  startBtn: {
    height: 56, backgroundColor: BLUE, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: BLUE, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
  startBtnText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.2 },
});
