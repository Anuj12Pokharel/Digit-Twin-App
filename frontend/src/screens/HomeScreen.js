import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  KeyboardAvoidingView, Platform, FlatList, Animated, Keyboard,
  StatusBar, ActivityIndicator, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CYAN = '#0cdbbc';

export default function HomeScreen({ navigation }) {
  const [mode, setMode] = useState('work'); 
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [switchingMessage, setSwitchingMessage] = useState('');

  // Separated chat histories for seamless context switching
  const [messages, setMessages] = useState({
    work: [
      { id: 'w1', text: 'Hello! I am your Digit Twin. I am currently synched to your Work context.', sender: 'twin' }
    ],
    personal: [
      { id: 'p1', text: 'Hello! I am your Digit Twin. Your private Personal space is actively isolated and ready.', sender: 'twin' }
    ]
  });

  const [integrations, setIntegrations] = useState({ jira: false, calendly: false });
  const [connecting, setConnecting] = useState({ jira: false, calendly: false });
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const blinkAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const transcriptionTimer = useRef(null);

  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true })
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  const handleConnect = (service) => {
    setConnecting(prev => ({ ...prev, [service]: true }));
    setTimeout(() => {
      setConnecting(prev => ({ ...prev, [service]: false }));
      setIntegrations(prev => ({ ...prev, [service]: true }));
      
      setMessages(prev => ({
        ...prev,
        work: [...prev.work, { 
          id: Date.now().toString(), 
          text: `Authentication successful! I am now heavily integrated with ${service === 'jira' ? 'Jira' : 'Calendly'}. I can read your tickets and manage your calendar workflow directly.`, 
          sender: 'twin' 
        }]
      }));
    }, 1500);
  };

  const switchMode = (newMode) => {
    if (mode === newMode) return;
    
    // Stop any active listening on the old mode
    if (isListening) {
      stopMockTranscription();
    }
    
    setMode(newMode);
    
    const msg = newMode === 'work' ? '> Connecting Work Integration...' : '> Syncing Personal Brain...';
    setSwitchingMessage(msg);
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 0.2, duration: 400, useNativeDriver: true })
      ]),
      { iterations: 3 }
    ).start(({ finished }) => {
      if (finished) {
        setSwitchingMessage('');
        setTimeout(() => {
          setMessages(prev => ({
            ...prev,
            [newMode]: [...prev[newMode], { 
              id: Date.now().toString(), 
              text: newMode === 'work' ? 'Work context successfully loaded.' : 'Personal context successfully loaded.', 
              sender: 'twin' 
            }]
          }));
        }, 500);
      }
    });
  };

  const sendMessage = (text) => {
    if (!text.trim()) return;
    
    const userMsg = { id: Date.now().toString(), text, sender: 'user' };
    setMessages(prev => ({ ...prev, [mode]: [...prev[mode], userMsg] }));
    setInputText('');
    Keyboard.dismiss();

    setTimeout(() => {
      setMessages(prev => ({ 
        ...prev, 
        [mode]: [...prev[mode], { id: (Date.now() + 1).toString(), text: `Processing request via ${mode} protocol...`, sender: 'twin' }] 
      }));
    }, 1000);
  };

  const startMockTranscription = () => {
    setIsListening(true);
    setMessages(prev => ({
      ...prev,
      [mode]: [...prev[mode], { 
        id: 'transcription', 
        text: '...', 
        sender: 'user', 
        isTranscription: true 
      }]
    }));

    const words = mode === 'work' 
      ? ["Schedule", " a", " meeting", " with", " my", " team", " via", " Calendly."]
      : ["Update", " my", " personal", " journal", " entry", " for", " today", " please."];
    
    let currentText = "";
    let i = 0;
    
    transcriptionTimer.current = setInterval(() => {
      if (i < words.length) {
        currentText += words[i];
        setMessages(current => ({
          ...current,
          [mode]: current[mode].map(m => 
            m.id === 'transcription' ? { ...m, text: currentText } : m
          )
        }));
        i++;
      } else {
        clearInterval(transcriptionTimer.current);
      }
    }, 400); 
  };

  const stopMockTranscription = () => {
    setIsListening(false);
    clearInterval(transcriptionTimer.current);
    
    setMessages(prev => {
      const transMsg = prev[mode].find(m => m.id === 'transcription');
      const filtered = prev[mode].filter(m => m.id !== 'transcription');
      const finalText = transMsg && transMsg.text !== '...' ? transMsg.text : 'Voice command captured.';
      
      return {
        ...prev,
        [mode]: [...filtered, { id: Date.now().toString(), text: finalText, sender: 'user' }]
      };
    });
    
    setTimeout(() => {
      setMessages(prev => ({
        ...prev,
        [mode]: [...prev[mode], { 
          id: (Date.now() + 1).toString(), 
          text: integrations.calendly && mode === 'work' 
            ? `Scheduling your meeting via Calendly integration right now...` 
            : `Analyzing voice command in ${mode} mode...`, 
          sender: 'twin' 
        }]
      }));
    }, 1000);
  };

  const toggleVoice = () => {
    if (isListening) {
      stopMockTranscription();
    } else {
      startMockTranscription();
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    alert("Logged out. Please reload (R) to view Login screen.");
  };

  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.messageWrapper, isUser ? styles.messageUserWrapper : styles.messageTwinWrapper]}>
        {!isUser && (
          <View style={styles.avatarMini}>
            <Text style={{ fontSize: 13 }}>♾️</Text>
          </View>
        )}
        <View style={[
          styles.messageBubble, 
          isUser ? styles.bubbleUser : styles.bubbleTwin,
          item.isTranscription && styles.bubbleTranscription
        ]}>
          <Text style={[styles.messageText, isUser && styles.messageTextUser, item.isTranscription && styles.textTranscription]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header & Mode Switcher */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Digit <Text style={{color: CYAN}}>.</Text></Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.segmentedControl}>
          <TouchableOpacity 
            style={[styles.segment, mode === 'personal' && styles.segmentActive]}
            onPress={() => switchMode('personal')}
            disabled={!!switchingMessage}
          >
            <Text style={[styles.segmentText, mode === 'personal' && styles.segmentTextActive]}>Personal</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.segment, mode === 'work' && styles.segmentActive]}
            onPress={() => switchMode('work')}
            disabled={!!switchingMessage}
          >
            <Text style={[styles.segmentText, mode === 'work' && styles.segmentTextActive]}>Work</Text>
          </TouchableOpacity>
        </View>

        {/* Blinking Switch Status Area */}
        <View style={styles.statusBarContainer}>
          {!!switchingMessage && (
            <Animated.Text style={[styles.statusTextBlinking, { opacity: blinkAnim }]}>
              {switchingMessage}
            </Animated.Text>
          )}
        </View>
      </View>

      {/* Static Integrations Strip (Only visible in Work) */}
      {mode === 'work' && (
        <View style={styles.staticIntegrationsWrap}>
          <Text style={styles.intTitle}>Available Plugins</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.intScroll}>
            {/* Jira Integration */}
            <TouchableOpacity 
              style={[styles.intCard, integrations.jira && styles.intCardConnected]} 
              onPress={() => !integrations.jira && handleConnect('jira')}
              disabled={integrations.jira || connecting.jira}
              activeOpacity={0.7}
            >
              {connecting.jira ? <ActivityIndicator color={CYAN}/> : (
                <>
                  <Text style={styles.intIcon}>🔷</Text>
                  <Text style={[styles.intText, integrations.jira && {color:'#000'}]}>{integrations.jira ? 'Jira Active' : 'Connect Jira'}</Text>
                </>
              )}
            </TouchableOpacity>
            
            {/* Calendly Integration */}
            <TouchableOpacity 
              style={[styles.intCard, integrations.calendly && styles.intCardConnected]} 
              onPress={() => !integrations.calendly && handleConnect('calendly')}
              disabled={integrations.calendly || connecting.calendly}
              activeOpacity={0.7}
            >
              {connecting.calendly ? <ActivityIndicator color={CYAN}/> : (
                <>
                  <Text style={styles.intIcon}>📅</Text>
                  <Text style={[styles.intText, integrations.calendly && {color:'#000'}]}>{integrations.calendly ? 'Calendly Active' : 'Connect Calendly'}</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Chat Interface */}
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          key={mode} 
          ref={flatListRef}
          data={messages[mode]}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatScroll}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Input Area + Voice Model Toggle */}
        <View style={styles.inputArea}>
          
          <Animated.View style={[styles.voiceButtonContainer, { transform: [{ scale: pulseAnim }] }]}>
            <TouchableOpacity 
              style={[styles.voiceButton, isListening && styles.voiceButtonActive]}
              onPress={toggleVoice}
            >
               <Animated.Text style={[styles.voiceIcon, isListening && { color: '#000' }]}>
                 {isListening ? '🛑' : '🎙️'}
               </Animated.Text>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.textInputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder={`Send message to ${mode} twin...`}
              placeholderTextColor="#666"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => sendMessage(inputText)}
            />
            <TouchableOpacity 
              style={styles.sendButton}
              onPress={() => sendMessage(inputText)}
            >
              <Text style={styles.sendIcon}>➤</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 5, backgroundColor: 'rgba(5, 12, 18, 1)' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  logoutBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)' },
  logoutText: { color: '#A0A0A5', fontSize: 12, fontWeight: '600' },
  segmentedControl: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 4 },
  segment: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  segmentActive: { backgroundColor: 'rgba(12, 219, 188, 0.15)' },
  segmentText: { color: '#A0A0A5', fontWeight: '600', fontSize: 14 },
  segmentTextActive: { color: CYAN, fontWeight: '700' },
  statusBarContainer: { height: 20, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  statusTextBlinking: { color: CYAN, fontSize: 12, fontWeight: '700', fontStyle: 'italic', letterSpacing: 1 },
  
  staticIntegrationsWrap: { paddingLeft: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  intTitle: { color: '#A0A0A5', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12, marginLeft: 2 },
  intScroll: { paddingRight: 20 },
  intCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#121214', paddingHorizontal: 18, paddingVertical: 14, borderRadius: 12, marginRight: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', minWidth: 160, justifyContent: 'center' },
  intCardConnected: { backgroundColor: CYAN, borderColor: CYAN },
  intIcon: { fontSize: 18, marginRight: 8 },
  intText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  
  chatScroll: { padding: 20, flexGrow: 1, justifyContent: 'flex-end' },
  messageWrapper: { flexDirection: 'row', marginBottom: 15, alignItems: 'flex-end' },
  messageUserWrapper: { justifyContent: 'flex-end' },
  messageTwinWrapper: { justifyContent: 'flex-start' },
  avatarMini: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(12, 219, 188, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 8, borderWidth: 1, borderColor: 'rgba(12, 219, 188, 0.3)' },
  messageBubble: { maxWidth: '80%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
  bubbleTwin: { backgroundColor: '#121214', borderTopLeftRadius: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  bubbleUser: { backgroundColor: 'rgba(12, 219, 188, 0.15)', borderTopRightRadius: 4 },
  bubbleTranscription: { backgroundColor: 'rgba(255,255,255,0.03)', borderStyle: 'dashed', borderWidth: 1, borderColor: CYAN },
  messageText: { fontSize: 15, color: '#E0E0E0', lineHeight: 22 },
  messageTextUser: { color: '#ffffff' },
  textTranscription: { fontStyle: 'italic', color: CYAN, fontWeight: '600' },
  inputArea: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 30 : 20, backgroundColor: 'rgba(5, 12, 18, 0.95)', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  voiceButtonContainer: { alignItems: 'center', marginBottom: 15, marginTop: -30 },
  voiceButton: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#121214', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10, borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)' },
  voiceButtonActive: { borderColor: CYAN, backgroundColor: CYAN, shadowColor: CYAN },
  voiceIcon: { fontSize: 24 },
  textInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 25, paddingHorizontal: 15 },
  textInput: { flex: 1, height: 50, color: '#fff', fontSize: 15 },
  sendButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: CYAN, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  sendIcon: { color: '#000', fontSize: 16, fontWeight: '900', marginTop: Platform.OS === 'ios' ? 2 : 0, marginLeft: 2 }
});
