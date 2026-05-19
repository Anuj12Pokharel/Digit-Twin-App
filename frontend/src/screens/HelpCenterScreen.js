import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../context/ThemeContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQS = [
  { q: 'How do I reset my password?', a: 'You can reset your password from the login screen by tapping "Forgot Password".' },
  { q: 'How do I contact support?', a: 'You can reach our support team via the "Contact Us" option available in the app.' },
  { q: 'How can I update my information?', a: 'Go to Profile settings to update your personal details and preferences.' },
  { q: 'How do I report an issue?', a: 'Please shake your device to bring up the issue reporter or contact support directly.' },
  { q: 'How do I manage notifications?', a: 'You can turn specific notifications on or off in the Notifications section of your Settings.' },
];

export default function HelpCenterScreen({ navigation }) {
  const { colors: theme, isDarkMode } = useTheme();
  const [expanded, setExpanded] = useState('How do I contact support?');

  const toggleExpand = (q) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(expanded === q ? null : q);
  };

  return (
    <LinearGradient colors={theme.gradient} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity style={[styles.backBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)' }]} onPress={() => navigation.goBack()}>
            <Text style={[styles.backIcon, { color: theme.text }]}>←</Text>
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
  
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 18, color: '#0F172A' },
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
