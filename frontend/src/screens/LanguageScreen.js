import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const BLUE = '#2563EB';

import { useTheme } from '../context/ThemeContext';

const SUGGESTED = [
  { id: 'en-US', label: 'English (US)' },
  { id: 'en-UK', label: 'English (UK)' },
];

const OTHERS = [
  { id: 'zh', label: 'Mandarin' },
  { id: 'hi', label: 'Hindi' },
  { id: 'es', label: 'Spanish' },
  { id: 'ar', label: 'Arabic' },
  { id: 'fr', label: 'French' },
];

export default function LanguageScreen({ navigation }) {
  const { colors: theme, isDarkMode } = useTheme();
  const [selected, setSelected] = useState('en-US');

  const RadioItem = ({ item }) => {
    const isActive = selected === item.id;
    return (
      <TouchableOpacity 
        style={[styles.itemCard, { backgroundColor: theme.card }]} 
        onPress={() => setSelected(item.id)}
        activeOpacity={0.7}
      >
        <Text style={[styles.itemLabel, { color: theme.text }]}>{item.label}</Text>
        <View style={[styles.radioOuter, { borderColor: theme.border }, isActive && { borderColor: theme.primary, backgroundColor: theme.primary }]}>
          {isActive && <View style={[styles.radioInner, { backgroundColor: isDarkMode ? '#05141E' : '#FFFFFF' }]} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={theme.gradient} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity style={[styles.backBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)' }]} onPress={() => navigation.goBack()}>
            <Text style={[styles.backIcon, { color: theme.text }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Language</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Suggested</Text>
          <View style={styles.listGroup}>
            {SUGGESTED.map(item => <RadioItem key={item.id} item={item} />)}
          </View>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>Others</Text>
          <View style={styles.listGroup}>
            {OTHERS.map(item => <RadioItem key={item.id} item={item} />)}
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
  
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 18, color: '#0F172A' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },

  scroll: { paddingHorizontal: 20, paddingBottom: 20 },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginTop: 24, marginBottom: 12 },
  listGroup: { gap: 10 },
  
  itemCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', paddingHorizontal: 20, height: 60, borderRadius: 16, shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  itemLabel: { fontSize: 15, color: '#1E293B', fontWeight: '500' },
  
  radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center' },
  radioOuterActive: { borderColor: BLUE, backgroundColor: BLUE },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFFFFF' }, // This simulates the checkmark inside the blue circle

  footer: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10 },
  saveBtn: { height: 56, backgroundColor: BLUE, borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowColor: BLUE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
