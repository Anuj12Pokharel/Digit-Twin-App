import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BLUE = '#2563EB';

export default function MicrophonePermissionScreen({ onPermissionDone }) {
  const pulseOuter = useRef(new Animated.Value(1)).current;
  const pulseInner = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = (anim, toVal, dur) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: toVal, duration: dur, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 1, duration: dur, useNativeDriver: true }),
        ])
      );
    pulse(pulseOuter, 1.14, 1400).start();
    pulse(pulseInner, 1.08, 1100).start();
  }, []);

  const done = async () => {
    await AsyncStorage.setItem('micPermissionAsked', 'true');
    onPermissionDone();
  };

  return (
    <LinearGradient colors={['#F8FBFF', '#EBF4FF', '#D6EAFF']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          {/* Pulsing rings */}
          <View style={styles.circleWrap}>
            <Animated.View style={[styles.ringOuter, { transform: [{ scale: pulseOuter }] }]} />
            <Animated.View style={[styles.ringInner, { transform: [{ scale: pulseInner }] }]} />
            <View style={styles.micBtn}>
              <Text style={styles.micIcon}>🎤</Text>
            </View>
          </View>

          <Text style={styles.title}>Enable Voice Access</Text>
          <Text style={styles.subtitle}>
            Allow microphone to use voice assistant{'\n'}features and dictate tasks.
          </Text>

          <TouchableOpacity style={styles.allowBtn} onPress={done} activeOpacity={0.85}>
            <Text style={styles.allowText}>Allow Microphone</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipBtn} onPress={done} activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingBottom: 30 },

  circleWrap: { width: 220, height: 220, justifyContent: 'center', alignItems: 'center', marginBottom: 44 },
  ringOuter: { position: 'absolute', width: 216, height: 216, borderRadius: 108, backgroundColor: 'rgba(37,99,235,0.07)' },
  ringInner: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(37,99,235,0.12)' },
  micBtn: {
    width: 104, height: 104, borderRadius: 52, backgroundColor: BLUE,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: BLUE, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 12,
  },
  micIcon: { fontSize: 42 },

  title: { fontSize: 24, fontWeight: '800', color: '#0F172A', letterSpacing: -0.3, marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: 48 },

  allowBtn: {
    width: '100%', height: 54, backgroundColor: BLUE, borderRadius: 27,
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
    shadowColor: BLUE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 7,
  },
  allowText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  skipBtn: { width: '100%', height: 54, backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 27, justifyContent: 'center', alignItems: 'center' },
  skipText: { color: '#64748B', fontSize: 16, fontWeight: '600' },
});
