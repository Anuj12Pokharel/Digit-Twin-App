import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Switch, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

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

  scroll: { paddingHorizontal: 20, paddingBottom: 20 },

  listGroup: { gap: 12 },
  itemCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', paddingHorizontal: 20, height: 60, borderRadius: 16, shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  itemLabel: { fontSize: 15, color: '#1E293B', fontWeight: '500' },

  footer: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10 },
  saveBtn: { height: 56, backgroundColor: '#2563EB', borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
