import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, KeyboardAvoidingView,
  Platform, Animated, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api/api';

const BLUE = '#2563EB';
const BAR_COUNT = 28;

// ── Animated waveform bars ────────────────────────────────────────────────────
function WaveformBars({ active, color = BLUE, height = 56, barCount = BAR_COUNT }) {
  const anims = useRef(
    Array.from({ length: barCount }, () => new Animated.Value(0.15))
  ).current;
  const loopRef = useRef(null);

  useEffect(() => {
    if (active) {
      const anim = Animated.loop(
        Animated.parallel(
          anims.map((a, i) =>
            Animated.sequence([
              Animated.delay(i * 35),
              Animated.loop(
                Animated.sequence([
                  Animated.timing(a, { toValue: Math.random() * 0.7 + 0.3, duration: 220, useNativeDriver: false }),
                  Animated.timing(a, { toValue: Math.random() * 0.2 + 0.1, duration: 220, useNativeDriver: false }),
                ])
              ),
            ])
          )
        )
      );
      anim.start();
      loopRef.current = anim;
    } else {
      loopRef.current?.stop();
      anims.forEach(a => Animated.timing(a, { toValue: 0.15, duration: 200, useNativeDriver: false }).start());
    }
    return () => loopRef.current?.stop();
  }, [active]);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', height, gap: 2.5 }}>
      {anims.map((a, i) => (
        <Animated.View
          key={i}
          style={{
            width: 3,
            borderRadius: 2,
            backgroundColor: color,
            opacity: 0.75 + (i % 3) * 0.08,
            height: a.interpolate({ inputRange: [0, 1], outputRange: [4, height] }),
          }}
        />
      ))}
    </View>
  );
}

// ── Voice message bubble waveform (static) ────────────────────────────────────
function VoiceBubble({ duration, isUser }) {
  const bars = Array.from({ length: 22 }, (_, i) => 4 + Math.abs(Math.sin(i * 0.7)) * 18);
  return (
    <View style={[styles.voiceBubble, isUser ? styles.voiceBubbleUser : styles.voiceBubbleAI]}>
      <TouchableOpacity style={styles.playBtn}>
        <Text style={[styles.playIcon, !isUser && { color: BLUE }]}>▶</Text>
      </TouchableOpacity>
      <View style={styles.staticBars}>
        {bars.map((h, i) => (
          <View
            key={i}
            style={[styles.staticBar, { height: h, backgroundColor: isUser ? 'rgba(255,255,255,0.7)' : BLUE }]}
          />
        ))}
      </View>
      <Text style={[styles.voiceDuration, !isUser && { color: '#64748B' }]}>
        {duration || '0:10'}
      </Text>
    </View>
  );
}

// ── Message reactions row ─────────────────────────────────────────────────────
function Reactions() {
  const [liked, setLiked] = useState(null);
  return (
    <View style={styles.reactionRow}>
      {[['👍', 'up'], ['👎', 'down'], ['🔊', 'speak'], ['🔄', 'regen']].map(([icon, key]) => (
        <TouchableOpacity
          key={key}
          style={[styles.reactionBtn, liked === key && styles.reactionBtnActive]}
          onPress={() => setLiked(liked === key ? null : key)}
        >
          <Text style={styles.reactionIcon}>{icon}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── Date chip ─────────────────────────────────────────────────────────────────
function DateChip({ label }) {
  return (
    <View style={styles.dateChip}>
      <Text style={styles.dateChipText}>{label}</Text>
    </View>
  );
}

// ── Quick action pill ─────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { icon: '🖼️', label: 'Photos' },
  { icon: '📄', label: 'Document' },
  { icon: '📷', label: 'Scan' },
  { icon: '☁️', label: 'Drive' },
  { icon: '📸', label: 'Camera' },
];

// ── Main ChatScreen ───────────────────────────────────────────────────────────
export default function ChatScreen({ route, navigation }) {
  const { mode = 'personal', user } = route.params || {};

  const [messages, setMessages] = useState([
    { id: '0', role: 'assistant', type: 'text', content: `Hi! I'm your ${mode} AI twin. Ask me anything!` },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [isVoiceNote, setIsVoiceNote] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [voiceTime, setVoiceTime] = useState(0);

  const listRef = useRef(null);
  const inputRef = useRef(null);
  const voiceTimerRef = useRef(null);

  const scrollToEnd = () => setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);

  // Format today date label
  const todayLabel = (() => {
    const d = new Date();
    return `Today, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  })();

  // ── Send text message ──────────────────────────────────────────────────────
  const sendText = useCallback(async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setInput('');
    setShowActions(false);

    const userMsg = { id: Date.now().toString(), role: 'user', type: 'text', content: trimmed };
    setMessages(prev => [...prev, userMsg]);
    scrollToEnd();
    setLoading(true);

    try {
      const res = await api.post('/chat-completions', { query: trimmed });
      const aiMsg = { id: Date.now().toString() + 'ai', role: 'assistant', type: 'text', content: res.data.response };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now().toString() + 'err', role: 'assistant', type: 'text', content: '⚠️ Could not reach the server. Please try again.' }]);
    } finally {
      setLoading(false);
      scrollToEnd();
    }
  }, []);

  // ── Toggle full-screen dictation ──────────────────────────────────────────
  const toggleDictation = () => {
    if (isDictating) {
      // Send the transcribed text
      sendText("What are the advantages of online education compared to traditional classroom learning?");
      setIsDictating(false);
    } else {
      setIsDictating(true);
      setShowActions(false);
    }
  };

  // ── Toggle inline voice note ───────────────────────────────────────────────
  const startVoiceNote = () => {
    setIsVoiceNote(true);
    setVoiceTime(0);
    setShowActions(false);
    voiceTimerRef.current = setInterval(() => setVoiceTime(v => v + 1), 1000);
  };

  const cancelVoiceNote = () => {
    setIsVoiceNote(false);
    clearInterval(voiceTimerRef.current);
  };

  const sendVoiceNote = () => {
    clearInterval(voiceTimerRef.current);
    const secs = voiceTime;
    const mm = Math.floor(secs / 60);
    const ss = (secs % 60).toString().padStart(2, '0');
    
    setIsVoiceNote(false);
    const voiceMsg = { id: Date.now().toString(), role: 'user', type: 'voice', duration: `${mm}:${ss}` };
    setMessages(prev => [...prev, voiceMsg]);
    scrollToEnd();
    
    // AI text reply to voice
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now().toString() + 'ai',
        role: 'assistant',
        type: 'text',
        content: 'I received your voice note! For full speech-to-text, connect me to the realtime audio API.',
      }]);
      scrollToEnd();
    }, 1200);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // ── Render a single message ────────────────────────────────────────────────
  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.msgWrapper, isUser ? styles.msgWrapperUser : styles.msgWrapperAI]}>
        {item.type === 'voice' ? (
          <VoiceBubble duration={item.duration} isUser={isUser} />
        ) : (
          <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
            <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>{item.content}</Text>
          </View>
        )}
        {!isUser && <Reactions />}
      </View>
    );
  };

  return (
    <LinearGradient colors={['#F8FBFF', '#EBF4FF', '#D6EAFF']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.headerBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{mode === 'work' ? '💼 Work Twin' : '🌿 Personal Twin'}</Text>
          <TouchableOpacity style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>⋮</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

          {/* ── VOICE DICTATION VIEW (Mockup 3) ── */}
          {isDictating ? (
            <View style={styles.voiceScreen}>
              <DateChip label={todayLabel} />
              <View style={styles.waveformFull}>
                <WaveformBars active={true} height={120} barCount={40} color="#3B82F6" />
                <Text style={styles.dictationText}>
                  What are the advantages of online education compared to traditional classroom learning.....
                </Text>
              </View>
              <View style={styles.voiceControls}>
                <TouchableOpacity style={styles.voiceCtrlBtn} onPress={() => { setIsDictating(false); inputRef.current?.focus(); }}>
                  <Text style={styles.voiceCtrlIcon}>⌨️</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.voiceCtrlBtn, styles.voiceMicBtn]} onPress={toggleDictation}>
                  <Text style={[styles.voiceCtrlIcon, {color: '#fff'}]}>🎤</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.voiceCtrlBtn} onPress={() => setIsDictating(false)}>
                  <Text style={styles.voiceCtrlIcon}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              {/* ── Messages list ── */}
              <FlatList
                ref={listRef}
                data={messages}
                keyExtractor={item => item.id}
                renderItem={renderMessage}
                contentContainerStyle={styles.msgList}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={<DateChip label={todayLabel} />}
                onContentSizeChange={scrollToEnd}
              />

              {loading && (
                <View style={styles.typingRow}>
                  <ActivityIndicator size="small" color={BLUE} />
                  <Text style={styles.typingText}>Twin is thinking…</Text>
                </View>
              )}

              {/* ── Quick Actions ── */}
              {showActions && (
                <View style={styles.quickActionsBar}>
                  {QUICK_ACTIONS.map(a => (
                    <TouchableOpacity key={a.label} style={styles.actionItem} activeOpacity={0.7}>
                      <Text style={styles.actionIcon}>{a.icon}</Text>
                      <Text style={styles.actionLabel}>{a.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* ── Input bar (Mockup 4 & 5) ── */}
              <View style={styles.inputBar}>
                <TouchableOpacity
                  style={styles.inputSideBtn}
                  onPress={() => setShowActions(!showActions)}
                >
                  <Text style={styles.inputSideBtnText}>+</Text>
                </TouchableOpacity>

                {isVoiceNote ? (
                  <View style={styles.inlineVoiceBox}>
                    <TouchableOpacity onPress={cancelVoiceNote} style={styles.inlineVoiceCancel}>
                      <Text style={styles.inlineVoiceCancelText}>✕</Text>
                    </TouchableOpacity>
                    <View style={{ flex: 1, paddingHorizontal: 10 }}>
                      <WaveformBars active={true} height={24} barCount={20} color={BLUE} />
                    </View>
                    <Text style={styles.inlineVoiceTime}>{formatTime(voiceTime)}</Text>
                  </View>
                ) : (
                  <View style={styles.inputWrap}>
                    <TextInput
                      ref={inputRef}
                      style={styles.textInput}
                      placeholder="Type a message.."
                      placeholderTextColor="#A0AABF"
                      value={input}
                      onChangeText={setInput}
                      returnKeyType="send"
                      onSubmitEditing={() => sendText(input)}
                      multiline
                    />
                    <TouchableOpacity 
                      style={styles.inputMicBtn} 
                      onPress={toggleDictation}
                      onLongPress={startVoiceNote}
                    >
                      <Text style={styles.inputMicIcon}>🎤</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.sendBtn}
                  onPress={() => isVoiceNote ? sendVoiceNote() : sendText(input)}
                  disabled={!isVoiceNote && (!input.trim() || loading)}
                >
                  <Text style={styles.sendBtnIcon}>➤</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)' },
  headerBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center' },
  headerBtnText: { fontSize: 18, color: '#1E293B', fontWeight: '600' },
  headerTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },

  // Date chip
  dateChip: { alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.05)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 12, marginVertical: 14 },
  dateChipText: { fontSize: 12, color: '#64748B', fontWeight: '500' },

  // Messages
  msgList: { paddingHorizontal: 16, paddingBottom: 16 },
  msgWrapper: { marginBottom: 8 },
  msgWrapperUser: { alignItems: 'flex-end' },
  msgWrapperAI: { alignItems: 'flex-start' },
  bubble: { maxWidth: '80%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
  bubbleUser: { backgroundColor: BLUE, borderTopRightRadius: 4 },
  bubbleAI: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 4, shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 2 },
  bubbleText: { fontSize: 15, color: '#1E293B', lineHeight: 22 },
  bubbleTextUser: { color: '#FFFFFF' },

  // Voice bubble
  voiceBubble: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 20, gap: 10, maxWidth: '75%' },
  voiceBubbleUser: { backgroundColor: BLUE, borderTopRightRadius: 4 },
  voiceBubbleAI: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 4, shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 2 },
  playBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  playIcon: { fontSize: 12, color: '#fff', marginLeft: 2 },
  staticBars: { flexDirection: 'row', alignItems: 'center', gap: 2, flex: 1 },
  staticBar: { width: 3, borderRadius: 2 },
  voiceDuration: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },

  // Reactions
  reactionRow: { flexDirection: 'row', gap: 8, marginTop: 6, marginLeft: 4 },
  reactionBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  reactionBtnActive: { backgroundColor: '#DBEAFE' },
  reactionIcon: { fontSize: 14 },

  // Typing
  typingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 8, gap: 8 },
  typingText: { fontSize: 13, color: '#64748B', fontStyle: 'italic' },

  // Quick actions
  quickActionsBar: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: 'rgba(255,255,255,0.9)', borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)' },
  actionItem: { alignItems: 'center', gap: 4 },
  actionIcon: { fontSize: 24 },
  actionLabel: { fontSize: 11, color: '#64748B', fontWeight: '500' },

  // Input bar
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)',
  },
  inputSideBtn: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', marginBottom: 2 },
  inputSideBtnText: { fontSize: 28, color: '#1E293B', fontWeight: '300', marginTop: -4 },
  inputWrap: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#F8FAFC', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', minHeight: 42, maxHeight: 100 },
  textInput: { flex: 1, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, fontSize: 15, color: '#1E293B' },
  inputMicBtn: { width: 40, height: 42, justifyContent: 'center', alignItems: 'center' },
  inputMicIcon: { fontSize: 20, color: '#64748B' },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3 },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnIcon: { fontSize: 18, color: '#1E293B', marginLeft: 2 },

  // Inline voice note
  inlineVoiceBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', height: 42, paddingHorizontal: 6 },
  inlineVoiceCancel: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  inlineVoiceCancelText: { fontSize: 14, color: '#64748B' },
  inlineVoiceTime: { fontSize: 14, color: '#64748B', fontWeight: '600', marginRight: 6 },

  // Voice recording screen
  voiceScreen: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20 },
  waveformFull: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  dictationText: { fontSize: 22, color: '#0F172A', fontWeight: '500', textAlign: 'center', marginTop: 40, lineHeight: 32 },
  voiceControls: { flexDirection: 'row', alignItems: 'center', gap: 32, paddingBottom: Platform.OS === 'ios' ? 24 : 12 },
  voiceCtrlBtn: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  voiceMicBtn: { width: 72, height: 72, borderRadius: 36, backgroundColor: BLUE },
  voiceCtrlIcon: { fontSize: 22 },
});
