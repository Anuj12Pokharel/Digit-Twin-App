import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import { Theme } from '../constants/Theme';
import api from '../api/api';

export default function SettingsScreen({ navigation }) {
  const [jira, setJira] = useState({ domain: '', email: '', token: '', isConnected: false });
  const [google, setGoogle] = useState({ isConnected: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/me');
      if (res.data.jira_config) {
        setJira({ 
          domain: res.data.jira_config.domain, 
          email: res.data.jira_config.email, 
          token: '********', 
          isConnected: true 
        });
      }
      if (res.data.google_calendar_config) {
        setGoogle({ isConnected: true });
      }
    } catch (err) {
      console.error('Settings fetch error:', err);
    }
  };

  const handleJiraConnect = async () => {
    if (!jira.domain || !jira.email || !jira.token) {
      Alert.alert('Incomplete Info', 'Please provide all Jira credentials to link your account.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/jira/connect', { domain: jira.domain, email: jira.email, api_token: jira.token });
      Alert.alert('Linked', 'Jira Cloud has been successfully connected to your Digital Twin.');
      setJira(prev => ({ ...prev, isConnected: true }));
    } catch (err) {
      Alert.alert('Connection Failed', 'Verified that your API token and domain are correct.');
    } finally { setLoading(false); }
  };

  const handleGoogleConnect = () => {
    Alert.alert('Google Integration', 'Redirecting to secure authorization flow...');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Modern Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Done</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionLabel}>PROFESSIONAL ECOSYSTEM</Text>
          
          <View style={[styles.card, styles.jiraCard]}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>Atlassian Jira</Text>
              <Text style={styles.cardDesc}>Coordinate enterprise projects and map task dependencies via voice.</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Domain</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="name.atlassian.net" 
                  value={jira.domain} 
                  onChangeText={(v) => setJira({...jira, domain: v})}
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="your-email@jira.com" 
                  value={jira.email} 
                  onChangeText={(v) => setJira({...jira, email: v})}
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>API Token</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="Paste Token" 
                  value={jira.token} 
                  onChangeText={(v) => setJira({...jira, token: v})}
                  secureTextEntry={jira.token !== '********'}
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.actionBtn, jira.isConnected ? styles.btnLinked : styles.btnConnect]} 
              onPress={handleJiraConnect} 
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionBtnText}>{jira.isConnected ? 'Refresh Link' : 'Link Connection'}</Text>}
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionLabel}>PERSONAL & AVAILABILITY</Text>

          <View style={[styles.card, styles.googleCard]}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>Google Calendar</Text>
              <Text style={styles.cardDesc}>Enable real-time availability checking and conflict resolution.</Text>
            </View>

            <TouchableOpacity 
              style={[styles.actionBtn, google.isConnected ? styles.btnLinked : styles.btnGoogle]} 
              onPress={handleGoogleConnect}
            >
              <Text style={styles.actionBtnText}>{google.isConnected ? 'Calendar Linked' : 'Connect Calendar'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
             <Text style={styles.versionText}>Digital Twin v1.2 • Standard Professional Edition</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  scroll: { paddingBottom: 40 },
  header: { height: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 },
  backBtn: { backgroundColor: '#E3E3E8', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },
  backBtnText: { color: Theme.colors.primary, fontWeight: '700', fontSize: 13 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Theme.colors.text },
  content: { padding: 20 },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: Theme.colors.textSecondary, letterSpacing: 1.5, marginBottom: 15, marginTop: 10 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 30, ...Theme.shadows.medium },
  jiraCard: { borderLeftWidth: 4, borderLeftColor: '#0052cc' },
  googleCard: { borderLeftWidth: 4, borderLeftColor: '#ea4335' },
  cardTitle: { fontSize: 19, fontWeight: '800', color: Theme.colors.text, marginBottom: 5 },
  cardDesc: { fontSize: 13, color: Theme.colors.textSecondary, lineHeight: 18, marginBottom: 20 },
  form: { marginBottom: 10 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F2F2F7', paddingVertical: 12 },
  inputLabel: { width: 80, fontSize: 13, fontWeight: '700', color: Theme.colors.text },
  input: { flex: 1, fontSize: 14, color: Theme.colors.text, fontWeight: '500' },
  actionBtn: { padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 15 },
  btnConnect: { backgroundColor: Theme.colors.primary },
  btnLinked: { backgroundColor: Theme.colors.text },
  btnGoogle: { backgroundColor: '#ea4335' },
  actionBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  footer: { alignItems: 'center', marginTop: 10 },
  versionText: { fontSize: 11, color: Theme.colors.textSecondary, fontWeight: '600' }
});
