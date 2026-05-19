import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Animated, StatusBar, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/api';

const BLUE = '#2563EB';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good Morning!' : h < 17 ? 'Good Afternoon!' : 'Good Evening!';
}

// ── Custom Toggle Switch ──
const ModeToggle = ({ mode, onToggle }) => {
  const isWork = mode === 'work';
  const anim = useRef(new Animated.Value(isWork ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: isWork ? 1 : 0,
      duration: 250,
      useNativeDriver: false
    }).start();
  }, [isWork]);

  const bg = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#DCFCE7', '#0F172A']
  });
  
  const circleX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 38]
  });

  return (
    <View style={{ alignItems: 'center' }}>
      <TouchableOpacity activeOpacity={0.9} onPress={() => onToggle(isWork ? 'personal' : 'work')}>
        <Animated.View style={[styles.toggleWrap, { backgroundColor: bg }]}>
          <Animated.View style={[styles.toggleCircle, { transform: [{ translateX: circleX }] }]}>
            <Text style={{fontSize: 14}}>{isWork ? '💼' : '🌿'}</Text>
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
      <Text style={{ fontSize: 10, color: '#64748B', marginTop: 4, fontWeight: '700', letterSpacing: 0.5 }}>
        {isWork ? 'WORK MODE' : 'PERSONAL MODE'}
      </Text>
    </View>
  );
};

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
  const { colors: theme, isDarkMode } = useTheme();
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('personal');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const [showModePopup, setShowModePopup] = useState(false);
  const [suggestedMode, setSuggestedMode] = useState(null);

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

    // 4.2 Mode Switching Intelligence
    // Contextual Mode Detection based on Time and Location (Mock Location for now)
    const checkContextualMode = async () => {
      const h = new Date().getHours();
      // Assume work hours are 9 to 17
      const shouldBeWork = h >= 9 && h < 17;
      const targetMode = shouldBeWork ? 'work' : 'personal';
      
      // Load user preferences for work hours from AsyncStorage (if set up)
      const setupComplete = await AsyncStorage.getItem('workSetupComplete');
      if (setupComplete) {
         // Custom logic could be applied here
      }

      if (mode !== targetMode) {
        setSuggestedMode(targetMode);
        setShowModePopup(true);
      }
    };

    // Delay the popup slightly for better UX
    setTimeout(checkContextualMode, 1500);
  }, []);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    api.patch('/users/me', { current_mode: newMode }).catch(() => {});
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    if (onLogout) onLogout();
  };

  const initial = user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?';

  return (
    <LinearGradient colors={theme.gradient} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

            {/* ── Header ── */}
            <View style={styles.header}>
              <View style={styles.headerSide}>
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
              </View>

              <ModeToggle mode={mode} onToggle={handleModeChange} />

              <View style={[styles.headerSide, { alignItems: 'flex-end' }]}>
                <TouchableOpacity style={[styles.bellWrap, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#fff' }]} activeOpacity={0.7}>
                  <Text style={styles.bellIcon}>🔔</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ── Welcome Area ── */}
            <View style={styles.welcomeArea}>
              <Text style={[styles.greetText, { color: theme.textSecondary }]}>{greeting()}</Text>
              <Text style={[styles.nameText, { color: theme.text }]}>{user?.full_name || user?.email || 'Welcome'}</Text>
              
              <View style={styles.modeHighlightCard}>
                 <Text style={styles.modeHighlightTitle}>
                   {mode === 'work' ? 'Productivity at its Peak 🚀' : 'Relax & Create ✨'}
                 </Text>
                 <Text style={styles.modeHighlightDesc}>
                   {mode === 'work' 
                     ? 'Work mode is active. Ready to manage tasks, schedule meetings, and boost your workflow.' 
                     : 'Personal mode is active. Let’s explore ideas, generate creative content, and organize your day.'}
                 </Text>
              </View>
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

        {/* ── Mode Switch Popup ── */}
        {showModePopup && (
          <View style={styles.popupOverlay}>
            <View style={styles.popupCard}>
              <View style={styles.popupIconWrap}>
                <Text style={styles.popupIcon}>{suggestedMode === 'work' ? '🏢' : '🏠'}</Text>
              </View>
              <Text style={styles.popupTitle}>Contextual Mode Detected</Text>
              <Text style={styles.popupDesc}>
                It looks like you're at {suggestedMode === 'work' ? 'work' : 'home'} based on your current time and location. 
                Switch to {suggestedMode === 'work' ? 'Work' : 'Personal'} Mode?
              </Text>
              <View style={styles.popupBtnRow}>
                <TouchableOpacity style={styles.popupBtnNo} onPress={() => setShowModePopup(false)}>
                  <Text style={styles.popupBtnNoText}>No, thanks</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.popupBtnYes} onPress={() => {
                  handleModeChange(suggestedMode);
                  setShowModePopup(false);
                }}>
                  <Text style={styles.popupBtnYesText}>Yes, Switch</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
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
  headerSide: { flex: 1, alignItems: 'flex-start' },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: BLUE, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  bellWrap: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6, elevation: 3 },
  bellIcon: { fontSize: 18 },

  // Toggle
  toggleWrap: {
    width: 72,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  toggleCircle: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  // Welcome Area
  welcomeArea: { marginTop: 10, alignItems: 'center', paddingHorizontal: 10 },
  greetText: { fontSize: 14, color: '#64748B', fontWeight: '500', marginBottom: 6 },
  nameText: { fontSize: 26, fontWeight: '800', color: '#0F172A', textAlign: 'center', marginBottom: 30 },
  
  modeHighlightCard: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  modeHighlightTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 10 },
  modeHighlightDesc: { fontSize: 14, color: '#475569', textAlign: 'center', lineHeight: 22 },

  // Bottom
  bottomBar: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10 },
  startBtn: {
    height: 56, backgroundColor: BLUE, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: BLUE, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
  startBtnText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.2 },

  // Popup
  popupOverlay: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    paddingHorizontal: 16,
    paddingBottom: 30,
    zIndex: 100,
  },
  popupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  popupIconWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  popupIcon: { fontSize: 28 },
  popupTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  popupDesc: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  popupBtnRow: { flexDirection: 'row', gap: 12, width: '100%' },
  popupBtnNo: { flex: 1, height: 48, borderRadius: 24, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  popupBtnNoText: { fontSize: 15, fontWeight: '600', color: '#475569' },
  popupBtnYes: { flex: 1, height: 48, borderRadius: 24, backgroundColor: BLUE, justifyContent: 'center', alignItems: 'center' },
  popupBtnYesText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
});
