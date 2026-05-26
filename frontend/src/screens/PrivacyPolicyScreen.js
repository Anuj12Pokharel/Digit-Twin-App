import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function PrivacyPolicyScreen({ navigation }) {
  const { colors: theme, isDarkMode } = useTheme();

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
          <Text style={[styles.headerTitle, { color: theme.text }]}>Privacy & Policy</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={true} indicatorStyle={isDarkMode ? 'white' : 'black'}>
          <Text style={[styles.date, { color: theme.text }]}>Effective Date: January 27, 2025</Text>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>1. Information Collection</Text>
            <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
              We collect essential information to enhance your experience. This includes details you provide directly, such as account data, as well as information gathered through usage analytics and cookies.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>2. Information Usage</Text>
            <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
              The information collected is used to improve our services, provide personalized recommendations, and ensure a seamless experience. We do not share your data without your explicit consent.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>3. Information Setting</Text>
            <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
              You have full control over your data. Manage your privacy preferences, update personal details, and customize your settings to match your needs.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>4. Security Measures</Text>
            <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
              We prioritize your data's safety with advanced security protocols, encryption methods, and regular audits to protect against unauthorized access or breaches.
            </Text>
          </View>
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

  scroll: { paddingHorizontal: 24, paddingBottom: 40 },

  date: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 24 },
  
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 8 },
  paragraph: { fontSize: 14, color: '#64748B', lineHeight: 22 },
});
