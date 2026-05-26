import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  StatusBar,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/api';

const { width, height } = Dimensions.get('window');
const PURPLE = '#184E68';
const CYAN = '#00F0FF';
const INDIGO = '#0A2D3F';
const BLUE = '#2563EB';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good Morning!' : h < 17 ? 'Good Afternoon!' : 'Good Evening!';
}

// ── Animated Header Title (Digit App & Welcome Message) ──
const AnimatedHeaderTitle = ({ isDarkMode }) => {
  const [index, setIndex] = useState(0);
  const messages = ['Digit App', 'Welcome!', 'Digital Twin'];
  
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Move left and fade out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -30,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Change text
        setIndex((prevIndex) => (prevIndex + 1) % messages.length);
        // Reset slide position to the right
        slideAnim.setValue(30);
        // 2. Move in from the right to the center and fade in
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={{ flex: 2, alignItems: 'center', justifyContent: 'center', height: 44 }}>
      <Animated.Text
        style={{
          fontSize: 16,
          fontWeight: '900',
          letterSpacing: 0.8,
          color: isDarkMode ? '#00F0FF' : '#0F172A',
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
          textTransform: 'uppercase',
          textAlign: 'center',
          textShadowColor: isDarkMode ? 'rgba(0, 240, 255, 0.4)' : 'rgba(0, 0, 0, 0.05)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 6,
        }}
      >
        {messages[index]}
      </Animated.Text>
    </View>
  );
};

// ── Typewriter Text Component with Stochastic Delay and Punctuation Pauses ──
const TypewriterText = ({ text, style }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    let index = 0;
    let isMounted = true;
    setDisplayedText('');
    
    const typeNextChar = () => {
      if (!isMounted) return;
      
      setDisplayedText((prev) => {
        if (index < text.length) {
          const nextChar = text.charAt(index);
          index++;
          
          // Stochastic keypress delay (15ms to 35ms)
          let nextDelay = 15 + Math.random() * 20;
          
          // Syntactic punctuation pausing for natural breathing room
          if (['.', '!', '?'].includes(nextChar)) {
            nextDelay = 450; 
          } else if ([',', ';', ':'].includes(nextChar)) {
            nextDelay = 220;
          }
          
          setTimeout(typeNextChar, nextDelay);
          return prev + nextChar;
        } else {
          return prev;
        }
      });
    };
    
    typeNextChar();

    const cursorInterval = setInterval(() => {
      if (isMounted) setCursorVisible((v) => !v);
    }, 500);

    return () => {
      isMounted = false;
      clearInterval(cursorInterval);
    };
  }, [text]);

  return (
    <Text style={style}>
      {displayedText}
      <Text style={{ color: '#00F0FF', fontWeight: 'bold', opacity: cursorVisible ? 1 : 0 }}>▋</Text>
    </Text>
  );
};

export default function HomeScreen({ navigation, onLogout }) {
  const { colors: theme, isDarkMode } = useTheme();
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('personal');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  
  const [showModePopup, setShowModePopup] = useState(false);
  const [suggestedMode, setSuggestedMode] = useState(null);

  // Twinkling stars for Dark Mode Parallax
  const stars = useRef(
    Array.from({ length: 12 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * (height * 0.7),
      size: Math.random() * 2.5 + 1.2,
      opacity: new Animated.Value(Math.random() * 0.4 + 0.1),
    }))
  ).current;

  // Sweeping metallic shine for Start Chat button
  const shineX = useRef(new Animated.Value(-150)).current;

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

    const checkContextualMode = async () => {
      const h = new Date().getHours();
      let targetMode = 'neutral';
      if (h >= 9 && h < 17) {
        targetMode = 'work';
      } else if (h >= 21 || h < 6) {
        targetMode = 'personal';
      } else {
        targetMode = 'neutral';
      }

      if (mode !== targetMode) {
        setSuggestedMode(targetMode);
        setShowModePopup(true);
      }
    };

    setTimeout(checkContextualMode, 1500);
  }, []);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    api.patch('/users/me', { current_mode: newMode }).catch(() => {});
  };

  const getButtonColors = () => {
    if (mode === 'work') {
      return isDarkMode ? [PURPLE, INDIGO] : [BLUE, '#3B82F6'];
    }
    if (mode === 'neutral') {
      return isDarkMode ? ['#082F49', '#0284C7'] : ['#06B6D4', '#0284C7'];
    }
    return isDarkMode ? ['#064E3B', '#022C22'] : ['#10B981', '#059669'];
  };

  const initial = user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?';

  return (
    <LinearGradient
      colors={isDarkMode ? ['#081E2D', '#05141E', '#030A0F'] : theme.gradient}
      style={styles.gradient}
    >
      {/* Absolute twinkling star backdrop for high-end dark mode */}
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

      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

            {/* ── Header ── */}
            <View style={styles.header}>
              <View style={styles.headerSide}>
                <TouchableOpacity
                  style={[styles.avatar, { borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)' }]}
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
              <AnimatedHeaderTitle isDarkMode={isDarkMode} />

              <View style={[styles.headerSide, { alignItems: 'flex-end' }]}>
                <TouchableOpacity
                  style={[styles.bellWrap, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : '#fff', borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
                  onPress={() => navigation.navigate('Notifications')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.bellIcon}>🔔</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ── Welcome Area ── */}
            <View style={styles.welcomeArea}>
              <Text style={[styles.greetText, { color: isDarkMode ? '#94A3B8' : theme.textSecondary }]}>
                {greeting()}
              </Text>
              <Text style={[styles.nameText, { color: isDarkMode ? '#FFFFFF' : theme.text }]}>
                {user?.full_name || user?.email || 'Welcome'}
              </Text>
              
              <View style={[styles.modeHighlightCard, isDarkMode && styles.modeHighlightCardDark]}>
                 <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                   <Image 
                     source={require('../../assets/digit_mascot_3d.png')} 
                     style={{ width: 28, height: 28, marginRight: 8, borderRadius: 6 }} 
                   />
                   <Text style={[styles.modeHighlightTitle, { color: isDarkMode ? '#FFFFFF' : '#0F172A', marginBottom: 0 }]}>
                     Hey! I am Digit App
                   </Text>
                 </View>
                  <TypewriterText
                    text={
                      "Welcome to the Digit App! I am your friendly companion designed to make your daily life easier. On this screen, you can access three main modes:\n\n1. 🌿 Personal Mode: Focuses on your wellness, personal habits, health, hobbies, and secure notes. Tap below to brainstorm creative projects, manage your journals, or talk about your lifestyle routines in a private, secure environment.\n\n2. 💼 Work Mode: Acts as your digital office assistant. Syncs directly with Jira and Google Calendar to organize meetings, view tasks, coordinate deadlines, and write professional messages to skyrocket your productivity.\n\n3. ⚖️ Neutral Mode: The balanced default active when both specific modes are turned off. Perfect for general queries, casual search topics, daily scheduling, and tracking standard daily activities smoothly.\n\nClick 'Start New Chat' below to open the conversation terminal and start chatting with me in your preferred mode!"
                    }
                    style={[styles.modeHighlightDesc, { color: isDarkMode ? '#94A3B8' : '#475569' }]}
                  />
              </View>
            </View>

          </Animated.View>
        </ScrollView>

        {/* ── Start New Chat ── */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.startBtnWrapper}
            onPress={() => navigation.navigate('Chat', { mode, user })}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={getButtonColors()}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.startBtn}
            >
              <Text style={styles.startBtnText}>Start New Chat  →</Text>

              {/* Sweeping metallic shine overlay */}
              <Animated.View
                style={[
                  styles.shineOverlay,
                  { transform: [{ translateX: shineX }, { skewX: '-28deg' }] },
                ]}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ── Mode Switch Popup ── */}
        {showModePopup && (
          <View style={styles.popupOverlay}>
            <View style={[styles.popupCard, isDarkMode && styles.popupCardDark]}>
              <View style={[styles.popupIconWrap, { backgroundColor: isDarkMode ? 'rgba(12, 221, 188, 0.12)' : '#EFF6FF' }]}>
                <Text style={styles.popupIcon}>{suggestedMode === 'work' ? '🏢' : '🏠'}</Text>
              </View>
              <Text style={[styles.popupTitle, { color: isDarkMode ? '#FFFFFF' : '#0F172A' }]}>
                Contextual Mode Detected
              </Text>
              <Text style={[styles.popupDesc, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>
                It looks like you're at {suggestedMode === 'work' ? 'work' : 'home'} based on your current time and location. 
                Switch to {suggestedMode === 'work' ? 'Work' : 'Personal'} Mode?
              </Text>
              <View style={styles.popupBtnRow}>
                <TouchableOpacity
                  style={[styles.popupBtnNo, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }]}
                  onPress={() => setShowModePopup(false)}
                >
                  <Text style={[styles.popupBtnNoText, { color: isDarkMode ? '#94A3B8' : '#475569' }]}>
                    No, thanks
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.popupBtnYes, { backgroundColor: isDarkMode ? CYAN : BLUE }]}
                  onPress={() => {
                    handleModeChange(suggestedMode);
                    setShowModePopup(false);
                  }}
                >
                  <Text style={[styles.popupBtnYesText, { color: isDarkMode ? '#070A13' : '#FFFFFF' }]}>
                    Yes, Switch
                  </Text>
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
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
  ambientCircle1: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    top: -60,
    right: -60,
  },
  ambientCircle2: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    bottom: '25%',
    left: -60,
  },


  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, paddingTop: 8 },
  headerSide: { flex: 1, alignItems: 'flex-start' },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: PURPLE, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  bellWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
  },
  bellIcon: { fontSize: 18 },

  // Toggle
  toggleWrap: {
    width: 72,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  toggleCircle: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
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
  greetText: { fontSize: 14.5, fontWeight: '600', marginBottom: 6 },
  nameText: { fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 30 },
  
  modeHighlightCard: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  modeHighlightCardDark: {
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  modeHighlightTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  modeHighlightDesc: { fontSize: 14, textAlign: 'center', lineHeight: 22, fontWeight: '500' },

  // Bottom
  bottomBar: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10 },
  startBtnWrapper: {
    height: 56,
  },
  startBtn: {
    flex: 1,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  startBtnText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.2 },
  shineOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },

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
  popupCardDark: {
    backgroundColor: 'rgba(15, 23, 42, 0.96)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  popupIconWrap: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  popupIcon: { fontSize: 28 },
  popupTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
  popupDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24, fontWeight: '500' },
  popupBtnRow: { flexDirection: 'row', gap: 12, width: '100%' },
  popupBtnNo: { flex: 1, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  popupBtnNoText: { fontSize: 15, fontWeight: '600' },
  popupBtnYes: { flex: 1, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  popupBtnYesText: { fontSize: 15, fontWeight: '600' },
});
