import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function PrivacyPolicyScreen({ navigation }) {
  return (
    <LinearGradient colors={['#F8FBFF', '#EBF4FF', '#D6EAFF']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy & Policy</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={true} indicatorStyle="black">
          <Text style={styles.date}>Effective Date: January 27, 2025</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Information Collection</Text>
            <Text style={styles.paragraph}>
              We collect essential information to enhance your experience. This includes details you provide directly, such as account data, as well as information gathered through usage analytics and cookies.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Information Usage</Text>
            <Text style={styles.paragraph}>
              The information collected is used to improve our services, provide personalized recommendations, and ensure a seamless experience. We do not share your data without your explicit consent.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Information Setting</Text>
            <Text style={styles.paragraph}>
              You have full control over your data. Manage your privacy preferences, update personal details, and customize your settings to match your needs.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Security Measures</Text>
            <Text style={styles.paragraph}>
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
  
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 18, color: '#0F172A' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },

  scroll: { paddingHorizontal: 24, paddingBottom: 40 },

  date: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 24 },
  
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 8 },
  paragraph: { fontSize: 14, color: '#64748B', lineHeight: 22 },
});
