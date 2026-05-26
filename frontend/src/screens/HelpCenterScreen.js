import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, LayoutAnimation, Platform, UIManager, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQS = [
  { q: 'What is Personal Mode and Work Mode?', a: 'Personal Mode activates your digital twin persona — it focuses on your hobbies, wellness, lifestyle, and private document knowledge base. Work Mode turns you into an executive office assistant, syncing with Jira and Google Calendar to manage tasks and meetings.' },
  { q: 'How do I switch between Personal and Work Mode?', a: 'You can toggle modes directly inside the Chat screen using the toggle bar at the top. You can also say things like "switch to work mode" and the AI will suggest a mode change automatically.' },
  { q: 'How does the AI chat work?', a: 'The chat uses OpenAI GPT-4o-mini with integrated tool-calling. In Work Mode, it queries Jira and Google Calendar. In Personal Mode, it searches your AI knowledge base and performs web searches to give you personalised, grounded answers.' },
  { q: 'How do I connect Jira or Google Calendar?', a: 'Go to Settings → Integrations Hub. From there you can connect Jira (via API Token) or Google Calendar (via OAuth). Once connected, the AI in Work Mode can list tasks, create issues, and schedule meetings.' },
  { q: 'What is the AI Brain / Knowledge Base?', a: 'The AI Brain is your personal RAG (Retrieval-Augmented Generation) knowledge store. You can upload documents or notes and the AI in Personal Mode will use those documents as context to answer your questions intelligently.' },
  { q: 'How does Voice Mode work?', a: 'Tap the microphone button on the Chat screen to dictate messages. Long-press the mic to record a voice note. The realtime voice mode uses OpenAI Realtime API for live two-way conversation with your digital twin.' },
  { q: 'How do I reset my password?', a: 'Tap "Forgot Password" on the login screen. You will receive a 6-digit OTP via email. After verifying, you can set a new password securely.' },
  { q: 'How do I update my profile or avatar?', a: 'Go to Settings → Edit Profile. You can update your full name, address, and upload a profile photo directly from your device gallery.' },
];

export default function HelpCenterScreen({ navigation }) {
  const { colors: theme, isDarkMode } = useTheme();
  const [expanded, setExpanded] = useState('How do I contact support?');

  const stars = useRef(
    Array.from({ length: 15 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * (height * 0.75),
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

  const toggleExpand = (q) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(expanded === q ? null : q);
  };

  return (
    <LinearGradient colors={theme.gradient} style={styles.gradient}>
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
            <Text style={[styles.backIcon, { color: isDarkMode ? '#FFFFFF' : '#0A0A0A' }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Help Center</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={[styles.searchWrap, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput 
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search..."
            placeholderTextColor="#A0AABF"
          />
          <TouchableOpacity style={[styles.filterBtn, { borderLeftColor: theme.border }]}>
            <Text style={styles.filterIcon}>⎘</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {FAQS.map(faq => {
            const isExpanded = expanded === faq.q;
            return (
              <TouchableOpacity
                key={faq.q}
                style={[styles.faqCard, { backgroundColor: theme.card }, isExpanded && styles.faqCardExpanded]}
                onPress={() => toggleExpand(faq.q)}
                activeOpacity={0.8}
              >
                <View style={styles.faqHeader}>
                  <Text style={[styles.faqQ, { color: theme.text }]}>{faq.q}</Text>
                  <Text style={[styles.faqChevron, { color: theme.textSecondary }]}>{isExpanded ? '⌃' : '›'}</Text>
                </View>
                {isExpanded && (
                  <Text style={[styles.faqA, { color: theme.textSecondary }]}>{faq.a}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>
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
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },

  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', marginHorizontal: 20, height: 50, borderRadius: 25, paddingHorizontal: 16, marginBottom: 20, shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  searchIcon: { fontSize: 16, marginRight: 10, color: '#94A3B8' },
  searchInput: { flex: 1, fontSize: 15, color: '#1E293B' },
  filterBtn: { paddingLeft: 10, borderLeftWidth: 1, borderLeftColor: '#E2E8F0' },
  filterIcon: { fontSize: 18, color: '#94A3B8', transform: [{ rotate: '90deg' }] },

  scroll: { paddingHorizontal: 20, paddingBottom: 30, gap: 12 },

  faqCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  faqCardExpanded: { paddingBottom: 24 },
  faqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  faqQ: { flex: 1, fontSize: 15, color: '#1E293B', fontWeight: '500', paddingRight: 10 },
  faqChevron: { fontSize: 24, color: '#64748B', lineHeight: 24 },
  faqA: { marginTop: 12, fontSize: 13, color: '#64748B', lineHeight: 20 },
});
