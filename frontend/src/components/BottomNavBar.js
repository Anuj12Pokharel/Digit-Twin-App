import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native'; // We'll just pass navigation & activeTab as props for simplicity

const BLUE = '#2563EB';

export default function BottomNavBar({ activeTab, onNavigate }) {
  const tabs = [
    { id: 'Home', icon: '🏠', label: 'HOME' },
    { id: 'Integrations', icon: '🔌', label: 'INTEGRATIONS' },
    { id: 'Profile', icon: '👤', label: 'PROFILE' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onNavigate(tab.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.icon, isActive && styles.iconActive]}>{tab.icon}</Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 10,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 34 : 14,
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  tabActive: {
    backgroundColor: '#EFF6FF',
  },
  icon: {
    fontSize: 20,
    color: '#94A3B8',
    marginBottom: 4,
    opacity: 0.6,
  },
  iconActive: {
    opacity: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  labelActive: {
    color: BLUE,
  },
});
