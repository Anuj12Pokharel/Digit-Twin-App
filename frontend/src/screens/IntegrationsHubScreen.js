import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../components/BottomNavBar';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/api';
import { useTheme } from '../context/ThemeContext';

const BLUE = '#2563EB';
const TOOLS_CONFIG = [
  { id: 'jira', name: 'Jira', logo: 'J', db_field: 'jira_connected' },
  { id: 'slack', name: 'Slack', logo: 'S', db_field: 'slack_connected' },
  { id: 'calendar', name: 'Google Calendar', logo: '📅', db_field: 'calendar_connected' },
  { id: 'github', name: 'GitHub', logo: '>', db_field: 'github_connected' },
];

export default function IntegrationsHubScreen({ navigation }) {
  const { colors: theme, isDarkMode } = useTheme();
  const [user, setUser] = useState(null);
  const [tools, setTools] = useState([]);

  const syncToolsWithUser = (userData) => {
    if (!userData) return;
    const mappedTools = TOOLS_CONFIG.map(t => ({
      ...t,
      connected: !!userData[t.db_field]
    }));
    setTools(mappedTools);
  };

  useFocusEffect(
    useCallback(() => {
      api.get('/me').then(res => {
        setUser(res.data);
        syncToolsWithUser(res.data);
      }).catch(() => {});
    }, [])
  );

  const initial = user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?';

  const handleNav = (tab) => {
    if (tab === 'Home') navigation.navigate('Home');
    if (tab === 'Profile') navigation.navigate('Settings');
  };

  const handleToolAction = (tool) => {
    if (tool.connected) {
      Alert.alert(
        'Manage Integration',
        `Do you want to disconnect ${tool.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Disconnect', 
            style: 'destructive',
            onPress: async () => {
              try {
                const res = await api.patch('/users/me', { [tool.db_field]: false });
                setUser(res.data);
                syncToolsWithUser(res.data);
              } catch (e) {
                Alert.alert('Error', 'Failed to disconnect. Please try again.');
              }
            }
          }
        ]
      );
    } else {
      Alert.alert(
        'Connect Integration',
        `You will be redirected to ${tool.name} to authorize access via OAuth.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Authorize', 
            onPress: async () => {
              // Simulate OAuth redirect and network delay
              setTimeout(async () => {
                try {
                  const res = await api.patch('/users/me', { [tool.db_field]: true });
                  setUser(res.data);
                  syncToolsWithUser(res.data);
                  Alert.alert('Success', `${tool.name} is now connected!`);
                } catch (e) {
                  Alert.alert('Error', 'Failed to connect. Please try again.');
                }
              }, 500);
            }
          }
        ]
      );
    }
  };

  const ToolCard = ({ tool }) => (
    <View style={[styles.toolCard, { backgroundColor: theme.card }]}>
      <View style={styles.toolLeft}>
        <View style={[styles.logoWrap, { backgroundColor: isDarkMode ? '#030A0F' : '#F1F5F9' }]}>
          <Text style={[styles.logoText, { color: theme.text }]}>{tool.logo}</Text>
        </View>
        <View>
          <Text style={[styles.toolName, { color: theme.text }]}>{tool.name}</Text>
          <View style={[styles.statusBadge, tool.connected ? styles.statusBadgeConnected : { backgroundColor: isDarkMode ? '#1E293B' : '#E2E8F0' }]}>
            <Text style={[styles.statusText, tool.connected ? styles.statusTextConnected : { color: theme.textSecondary }]}>
              {tool.connected ? 'CONNECTED' : 'NOT CONNECTED'}
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity 
        style={[styles.actionBtn, tool.connected ? { backgroundColor: isDarkMode ? '#1E293B' : '#E2E8F0' } : { backgroundColor: theme.primary }]}
        onPress={() => handleToolAction(tool)}
      >
        <Text style={[styles.actionBtnText, tool.connected ? { color: theme.text } : { color: isDarkMode ? '#05141E' : '#FFFFFF' }]}>
          {tool.connected ? 'Manage' : 'Connect'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.gradient} style={StyleSheet.absoluteFillObject} />
      
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.navigate('Settings')} activeOpacity={0.8}>
              {user?.avatar_url ? (
                <Image
                  source={{ uri: user.avatar_url }}
                  style={{ width: 36, height: 36, borderRadius: 18, overflow: 'hidden' }}
                />
              ) : (
                <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                  <Text style={[styles.avatarText, { color: isDarkMode ? '#05141E' : '#FFFFFF' }]}>{initial}</Text>
                </View>
              )}
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.primary }]}>Integrations</Text>
          </View>
          <TouchableOpacity style={styles.headerSettings} onPress={() => navigation.navigate('Settings')}>
            <Text style={[styles.settingsIcon, { color: theme.primary }]}>⚙️</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={[styles.pageTitle, { color: theme.text }]}>Connect Your Tools</Text>
          <Text style={[styles.pageSubtitle, { color: theme.textSecondary }]}>
            Streamline your workflow by syncing your favorite productivity tools directly with your dashboard.
          </Text>

          <View style={styles.toolsList}>
            {tools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
          </View>

          {/* Build Your Own */}
          <LinearGradient colors={isDarkMode ? ['#081E2D', '#0A2D3F'] : ['#E0F2FE', '#BAE6FD']} style={styles.buildCard} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
            <Text style={[styles.buildTitle, { color: theme.primary }]}>Build Your Own{'\n'}Integration</Text>
            <Text style={[styles.buildSub, { color: theme.textSecondary }]}>Access our developer API to create custom tools for your team.</Text>
            <TouchableOpacity style={styles.docsLink}>
              <Text style={[styles.docsLinkText, { color: theme.primary }]}>View API Docs  →</Text>
            </TouchableOpacity>
          </LinearGradient>
        </ScrollView>
      </SafeAreaView>

      <BottomNavBar activeTab="Integrations" onNavigate={handleNav} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: BLUE },
  headerSettings: { padding: 4 },
  settingsIcon: { fontSize: 20, color: BLUE },

  scroll: { paddingHorizontal: 20, paddingBottom: 30, paddingTop: 10 },
  pageTitle: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  pageSubtitle: { fontSize: 14, color: '#64748B', lineHeight: 20, marginBottom: 24 },

  toolsList: { gap: 12, marginBottom: 24 },
  toolCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  toolLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  logoWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  logoText: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  toolName: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  statusBadgeConnected: { backgroundColor: '#15803D' },
  statusBadgeNot: { backgroundColor: '#E2E8F0' },
  statusText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  statusTextConnected: { color: '#FFFFFF' },
  statusTextNot: { color: '#94A3B8' },

  actionBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  actionBtnConnect: { backgroundColor: BLUE },
  actionBtnManage: { backgroundColor: '#E2E8F0' },
  actionBtnText: { fontSize: 13, fontWeight: '700' },
  actionBtnTextConnect: { color: '#FFFFFF' },
  actionBtnTextManage: { color: '#475569' },

  buildCard: { borderRadius: 20, padding: 24, overflow: 'hidden' },
  buildTitle: { fontSize: 18, fontWeight: '800', color: BLUE, marginBottom: 8, lineHeight: 24 },
  buildSub: { fontSize: 13, color: '#475569', lineHeight: 18, marginBottom: 16, paddingRight: 40 },
  docsLinkText: { fontSize: 14, fontWeight: '700', color: BLUE },
});
