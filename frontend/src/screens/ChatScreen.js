import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, KeyboardAvoidingView,
  Platform, Animated, ActivityIndicator, Image, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { Audio } from 'expo-av';
import api from '../api/api';

const { width, height } = Dimensions.get('window');
const PURPLE = '#184E68';
const CYAN = '#00F0FF';
const INDIGO = '#0A2D3F';
const BLUE = '#2563EB';
const BAR_COUNT = 28;

// ── Animated waveform bars ────────────────────────────────────────────────────
function WaveformBars({ active, color = CYAN, height = 56, barCount = BAR_COUNT }) {
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
function VoiceBubble({ duration, isUser, isDarkMode }) {
  const bars = Array.from({ length: 22 }, (_, i) => 4 + Math.abs(Math.sin(i * 0.7)) * 18);
  const bubbleBg = isUser
    ? [PURPLE, INDIGO]
    : isDarkMode
    ? ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.05)']
    : ['#FFFFFF', '#FFFFFF'];

  return (
    <LinearGradient
      colors={bubbleBg}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.voiceBubble,
        isUser ? styles.voiceBubbleUser : styles.voiceBubbleAI,
        !isUser && isDarkMode && { borderColor: 'rgba(255, 255, 255, 0.08)', borderWidth: 1.5 }
      ]}
    >
      <TouchableOpacity style={styles.playBtn}>
        <Text style={[styles.playIcon, !isUser && { color: isDarkMode ? CYAN : PURPLE }]}>▶</Text>
      </TouchableOpacity>
      <View style={styles.staticBars}>
        {bars.map((h, i) => (
          <View
            key={i}
            style={[
              styles.staticBar,
              { height: h, backgroundColor: isUser ? 'rgba(255,255,255,0.75)' : isDarkMode ? CYAN : PURPLE }
            ]}
          />
        ))}
      </View>
      <Text style={[styles.voiceDuration, !isUser && { color: '#94A3B8' }]}>
        {duration || '0:10'}
      </Text>
    </LinearGradient>
  );
}

// ── Message reactions row ─────────────────────────────────────────────────────
function Reactions({ isDarkMode }) {
  const [liked, setLiked] = useState(null);
  return (
    <View style={styles.reactionRow}>
      {[['👍', 'up'], ['👎', 'down'], ['🔊', 'speak'], ['🔄', 'regen']].map(([icon, key]) => (
        <TouchableOpacity
          key={key}
          style={[
            styles.reactionBtn,
            isDarkMode && { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
            liked === key && (isDarkMode ? { backgroundColor: 'rgba(12, 221, 188, 0.2)' } : styles.reactionBtnActive)
          ]}
          onPress={() => setLiked(liked === key ? null : key)}
        >
          <Text style={styles.reactionIcon}>{icon}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── Date chip ─────────────────────────────────────────────────────────────────
function DateChip({ label, isDarkMode }) {
  return (
    <View style={[styles.dateChip, isDarkMode && { backgroundColor: 'rgba(255, 255, 255, 0.06)' }]}>
      <Text style={[styles.dateChipText, isDarkMode && { color: '#94A3B8' }]}>{label}</Text>
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

export default function ChatScreen({ route, navigation }) {
  const { mode = 'personal', user } = route.params || {};
  const { isDarkMode, colors: theme } = useTheme();

  const [messages, setMessages] = useState([
    { id: '0', role: 'assistant', type: 'text', content: `Hi! I'm your ${mode} AI twin. Ask me anything!` },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [isVoiceNote, setIsVoiceNote] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [voiceTime, setVoiceTime] = useState(0);

  const [showModePopup, setShowModePopup] = useState(false);
  const [suggestedMode, setSuggestedMode] = useState(null);
  // null = Neutral, 'personal' = Personal ON, 'work' = Work ON
  const [chatMode, setChatMode] = useState(mode === 'work' ? 'work' : mode === 'personal' ? 'personal' : null);

  const listRef = useRef(null);
  const inputRef = useRef(null);
  const voiceTimerRef = useRef(null);

  // Background Starfield stars for Chat backdrop
  const stars = useRef(
    Array.from({ length: 12 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * (height * 0.7),
      size: Math.random() * 2.5 + 1.2,
      opacity: new Animated.Value(Math.random() * 0.4 + 0.1),
    }))
  ).current;

  // Stargazing twinkle effects
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

  const scrollToEnd = () => setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);

  const todayLabel = (() => {
    const d = new Date();
    return `Today, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  })();

  const handleModeChange = async (newMode) => {
    try {
      await api.patch('/users/me', { current_mode: newMode });
    } catch {}
    setMessages(prev => [...prev, {
      id: Date.now().toString() + 'sys',
      role: 'assistant',
      type: 'text',
      content: `🔄 Switched to ${newMode === 'work' ? 'Work' : 'Personal'} Mode.`
    }]);
    setShowModePopup(false);
  };

  const toggleChatMode = async (tapped) => {
    const next = chatMode === tapped ? null : tapped;
    setChatMode(next);
    try {
      await api.patch('/users/me', { current_mode: next || 'personal' });
    } catch {}
  };

  const sendText = useCallback((text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    processSendText(trimmed);
  }, [chatMode]);

  const processSendText = async (trimmed) => {
    setInput('');
    setShowActions(false);

    const effectiveMode = chatMode || 'neutral';
    const userMsg = { id: Date.now().toString(), role: 'user', type: 'text', content: trimmed };
    setMessages(prev => [...prev, userMsg]);
    scrollToEnd();
    setLoading(true);

    try {
      const res = await api.post('/chat-completions', { query: trimmed, mode: effectiveMode });
      let aiText = res.data.response;
      
      const switchMatch = aiText.match(/\[SUGGEST_MODE_SWITCH:\s*(work|personal)\s*\]/i);
      if (switchMatch) {
         const newMode = switchMatch[1].toLowerCase();
         aiText = aiText.replace(/\[SUGGEST_MODE_SWITCH:\s*(work|personal)\s*\]/i, '').trim();
         
         if (newMode !== mode) {
             setSuggestedMode(newMode);
             setShowModePopup(true);
         }
      }

      if (aiText) {
          const aiMsg = { id: Date.now().toString() + 'ai', role: 'assistant', type: 'text', content: aiText };
          setMessages(prev => [...prev, aiMsg]);
      }
    } catch {
      setMessages(prev => [...prev, { id: Date.now().toString() + 'err', role: 'assistant', type: 'text', content: '⚠️ Could not reach the server. Please try again.' }]);
    } finally {
      setLoading(false);
      scrollToEnd();
    }
  };

  const toggleDictation = async () => {
    if (isDictating) {
      sendText("What are the advantages of online education compared to traditional classroom learning?");
      setIsDictating(false);
    } else {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access microphone was denied');
        return;
      }
      setIsDictating(true);
      setShowActions(false);
    }
  };

  const startVoiceNote = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access microphone was denied');
      return;
    }
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

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.msgWrapper, isUser ? styles.msgWrapperUser : styles.msgWrapperAI]}>
        {item.type === 'voice' ? (
          <VoiceBubble duration={item.duration} isUser={isUser} isDarkMode={isDarkMode} />
        ) : isUser ? (
          <LinearGradient
            colors={[PURPLE, INDIGO]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.bubble, styles.bubbleUser]}
          >
            <Text style={[styles.bubbleText, styles.bubbleTextUser]}>{item.content}</Text>
          </LinearGradient>
        ) : (
          <View
            style={[
              styles.bubble,
              styles.bubbleAI,
              isDarkMode ? styles.bubbleAIDark : { backgroundColor: theme.card }
            ]}
          >
            <Text style={[styles.bubbleText, { color: isDarkMode ? '#FFFFFF' : theme.text }]}>
              {item.content}
            </Text>
          </View>
        )}
        {!isUser && <Reactions isDarkMode={isDarkMode} />}
      </View>
    );
  };

  return (
    <LinearGradient
      colors={isDarkMode ? ['#081E2D', '#05141E', '#030A0F'] : theme.gradient}
      style={styles.gradient}
    >
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

      <SafeAreaView style={styles.safe}>
        {/* ── Header ── */}
        <View style={[styles.header, isDarkMode && styles.headerDark]}>
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)' }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.headerBtnText, { color: isDarkMode ? '#FFFFFF' : theme.text }]}>←</Text>
          </TouchableOpacity>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {user?.avatar_url && mode !== 'work' ? (
              <Image source={{ uri: user.avatar_url }} style={{ width: 32, height: 32, borderRadius: 16 }} />
            ) : null}
            <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFFFFF' : theme.text }]}>
              {mode === 'work' ? '💼 Work Twin' : '🌿 Personal Twin'}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)' }]}
          >
            <Text style={[styles.headerBtnText, { color: isDarkMode ? '#FFFFFF' : theme.text }]}>⋮</Text>
          </TouchableOpacity>
        </View>

        {/* ── Mode Toggle Bar ── */}
        <View style={styles.modeBar}>
          {/* Personal Toggle */}
          <TouchableOpacity
            style={[
              styles.modeToggleBtn,
              chatMode === 'personal' && styles.modeToggleBtnPersonalActive,
              isDarkMode && chatMode !== 'personal' && styles.modeToggleBtnDark,
            ]}
            onPress={() => toggleChatMode('personal')}
            activeOpacity={0.8}
          >
            <View style={[
              styles.togglePill,
              chatMode === 'personal' ? styles.togglePillOn : styles.togglePillOff,
            ]}>
              <View style={[
                styles.toggleKnob,
                chatMode === 'personal' ? styles.toggleKnobOn : styles.toggleKnobOff,
              ]} />
            </View>
            <Text style={[
              styles.modeToggleLabel,
              chatMode === 'personal' ? styles.modeToggleLabelPersonalActive : { color: isDarkMode ? '#94A3B8' : '#64748B' },
            ]}>🌿 Personal</Text>
          </TouchableOpacity>

          {/* Neutral indicator */}
          <View style={styles.neutralChip}>
            <View style={[styles.neutralDot, chatMode === null && styles.neutralDotActive]} />
            <Text style={[styles.neutralLabel, { color: isDarkMode ? '#64748B' : '#94A3B8' }]}>
              {chatMode === null ? 'Neutral' : chatMode === 'personal' ? 'Personal' : 'Work'}
            </Text>
          </View>

          {/* Work Toggle */}
          <TouchableOpacity
            style={[
              styles.modeToggleBtn,
              chatMode === 'work' && styles.modeToggleBtnWorkActive,
              isDarkMode && chatMode !== 'work' && styles.modeToggleBtnDark,
            ]}
            onPress={() => toggleChatMode('work')}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.modeToggleLabel,
              chatMode === 'work' ? styles.modeToggleLabelWorkActive : { color: isDarkMode ? '#94A3B8' : '#64748B' },
            ]}>💼 Work</Text>
            <View style={[
              styles.togglePill,
              chatMode === 'work' ? styles.togglePillWorkOn : styles.togglePillOff,
            ]}>
              <View style={[
                styles.toggleKnob,
                chatMode === 'work' ? styles.toggleKnobOn : styles.toggleKnobOff,
              ]} />
            </View>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          {isDictating ? (
            <View style={styles.voiceScreen}>
              <DateChip label={todayLabel} isDarkMode={isDarkMode} />
              <View style={styles.waveformFull}>
                <WaveformBars active={true} height={120} barCount={40} color={CYAN} />
                <Text style={[styles.dictationText, { color: isDarkMode ? '#FFFFFF' : '#0F172A' }]}>
                  What are the advantages of online education compared to traditional classroom learning.....
                </Text>
              </View>
              <View style={[styles.voiceControls, { backgroundColor: isDarkMode ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.8)' }]}>
                <TouchableOpacity
                  style={[styles.voiceCtrlBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : '#fff' }]}
                  onPress={() => { setIsDictating(false); inputRef.current?.focus(); }}
                >
                  <Text style={[styles.voiceCtrlIcon, { color: isDarkMode ? '#FFFFFF' : '#000' }]}>⌨️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.voiceCtrlBtn, styles.voiceMicBtn, { backgroundColor: CYAN }]}
                  onPress={toggleDictation}
                >
                  <Text style={[styles.voiceCtrlIcon, { color: '#070A13' }]}>🎤</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.voiceCtrlBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : '#fff' }]}
                  onPress={() => setIsDictating(false)}
                >
                  <Text style={[styles.voiceCtrlIcon, { color: isDarkMode ? '#FFFFFF' : '#000' }]}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <FlatList
                ref={listRef}
                data={messages}
                keyExtractor={item => item.id}
                renderItem={renderMessage}
                contentContainerStyle={styles.msgList}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={<DateChip label={todayLabel} isDarkMode={isDarkMode} />}
                onContentSizeChange={scrollToEnd}
              />

              {loading && (
                <View style={styles.typingRow}>
                  <ActivityIndicator size="small" color={CYAN} />
                  <Text style={[styles.typingText, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>
                    Twin is thinking…
                  </Text>
                </View>
              )}

              {showActions && (
                <View style={[styles.quickActionsBar, isDarkMode && styles.quickActionsBarDark]}>
                  {QUICK_ACTIONS.map(a => (
                    <TouchableOpacity key={a.label} style={styles.actionItem} activeOpacity={0.7}>
                      <Text style={styles.actionIcon}>{a.icon}</Text>
                      <Text style={[styles.actionLabel, isDarkMode && { color: '#94A3B8' }]}>{a.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* ── Input bar ── */}
              <View
                style={[
                  styles.inputBar,
                  isDarkMode
                    ? styles.inputBarDark
                    : { backgroundColor: theme.card, borderTopColor: theme.border }
                ]}
              >
                <TouchableOpacity
                  style={styles.inputSideBtn}
                  onPress={() => setShowActions(!showActions)}
                >
                  <Text style={[styles.inputSideBtnText, { color: isDarkMode ? '#FFFFFF' : theme.text }]}>+</Text>
                </TouchableOpacity>

                {isVoiceNote ? (
                  <View style={[styles.inlineVoiceBox, isDarkMode && styles.inlineVoiceBoxDark]}>
                    <TouchableOpacity
                      onPress={cancelVoiceNote}
                      style={[styles.inlineVoiceCancel, isDarkMode && { backgroundColor: 'rgba(255,255,255,0.06)' }]}
                    >
                      <Text style={[styles.inlineVoiceCancelText, isDarkMode && { color: '#FFFFFF' }]}>✕</Text>
                    </TouchableOpacity>
                    <View style={{ flex: 1, paddingHorizontal: 10 }}>
                      <WaveformBars active={true} height={24} barCount={20} color={CYAN} />
                    </View>
                    <Text style={[styles.inlineVoiceTime, isDarkMode && { color: '#FFFFFF' }]}>
                      {formatTime(voiceTime)}
                    </Text>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.inputWrap,
                      isDarkMode
                        ? styles.inputWrapDark
                        : { backgroundColor: theme.inputBg, borderColor: theme.border }
                    ]}
                  >
                    <TextInput
                      ref={inputRef}
                      style={[styles.textInput, { color: isDarkMode ? '#FFFFFF' : theme.text }]}
                      placeholder="Type a message.."
                      placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.35)' : theme.textSecondary}
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
                      <Text style={[styles.inputMicIcon, { color: isDarkMode ? '#94A3B8' : theme.textSecondary }]}>🎤</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    styles.sendBtn,
                    isDarkMode
                      ? styles.sendBtnDark
                      : { backgroundColor: theme.inputBg }
                  ]}
                  onPress={() => isVoiceNote ? sendVoiceNote() : sendText(input)}
                  disabled={!isVoiceNote && (!input.trim() || loading)}
                >
                  <Text style={[styles.sendBtnIcon, { color: isDarkMode ? CYAN : theme.text }]}>➤</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* ── Contextual Mode Switch Popup ── */}
          {showModePopup && (
            <View style={styles.popupOverlay}>
              <View style={[styles.popupCard, isDarkMode && styles.popupCardDark]}>
                <View style={[styles.popupIconWrap, { backgroundColor: isDarkMode ? 'rgba(12, 221, 188, 0.12)' : '#EFF6FF' }]}>
                  <Text style={styles.popupIcon}>{suggestedMode === 'work' ? '🏢' : '🏠'}</Text>
                </View>
                <Text style={[styles.popupTitle, { color: isDarkMode ? '#FFFFFF' : '#0F172A' }]}>
                  Switch Mode?
                </Text>
                <Text style={[styles.popupDesc, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>
                  I noticed you're talking about {suggestedMode === 'work' ? 'work stuff' : 'personal topics'}. 
                  Should I switch to {suggestedMode === 'work' ? 'Work' : 'Personal'} Mode?
                </Text>
                <View style={styles.popupBtnRow}>
                  <TouchableOpacity
                    style={[styles.popupBtnNo, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }]}
                    onPress={() => setShowModePopup(false)}
                  >
                    <Text style={[styles.popupBtnNoText, { color: isDarkMode ? '#94A3B8' : '#475569' }]}>
                      Stay in {mode}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.popupBtnYes, { backgroundColor: isDarkMode ? CYAN : BLUE }]}
                    onPress={() => handleModeChange(suggestedMode)}
                  >
                    <Text style={[styles.popupBtnYesText, { color: isDarkMode ? '#070A13' : '#FFFFFF' }]}>
                      Yes, Switch
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </KeyboardAvoidingView>
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

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)' },
  headerDark: { borderBottomColor: 'rgba(255,255,255,0.06)' },
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
  bubbleUser: { borderTopRightRadius: 4 },
  bubbleAI: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 4, shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 2 },
  bubbleAIDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  bubbleText: { fontSize: 15, color: '#1E293B', lineHeight: 22, fontWeight: '500' },
  bubbleTextUser: { color: '#FFFFFF' },

  // Voice bubble
  voiceBubble: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 20, gap: 10, maxWidth: '75%' },
  voiceBubbleUser: { borderTopRightRadius: 4 },
  voiceBubbleAI: { borderTopLeftRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 2 },
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
  quickActionsBarDark: {
    backgroundColor: 'rgba(10, 15, 28, 0.98)',
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  actionItem: { alignItems: 'center', gap: 4 },
  actionIcon: { fontSize: 24 },
  actionLabel: { fontSize: 11, color: '#64748B', fontWeight: '600' },

  // Input bar
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)',
  },
  inputBarDark: {
    backgroundColor: 'rgba(10, 15, 28, 0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  inputSideBtn: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', marginBottom: 2 },
  inputSideBtnText: { fontSize: 28, color: '#1E293B', fontWeight: '300', marginTop: -4 },
  inputWrap: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#F8FAFC', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', minHeight: 42, maxHeight: 100 },
  inputWrapDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  textInput: { flex: 1, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, fontSize: 15 },
  inputMicBtn: { width: 40, height: 42, justifyContent: 'center', alignItems: 'center' },
  inputMicIcon: { fontSize: 20 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3 },
  sendBtnDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    shadowColor: '#000',
  },
  sendBtnIcon: { fontSize: 18, marginLeft: 2 },
 
  // Inline voice note
  inlineVoiceBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', height: 42, paddingHorizontal: 6 },
  inlineVoiceBoxDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  inlineVoiceCancel: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  inlineVoiceCancelText: { fontSize: 14, color: '#64748B' },
  inlineVoiceTime: { fontSize: 14, color: '#64748B', fontWeight: '600', marginRight: 6 },

  // Voice recording screen
  voiceScreen: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20 },
  waveformFull: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  dictationText: { fontSize: 22, fontWeight: '500', textAlign: 'center', marginTop: 40, lineHeight: 32 },
  voiceControls: { flexDirection: 'row', alignItems: 'center', gap: 32, paddingBottom: Platform.OS === 'ios' ? 24 : 12, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 40 },
  voiceCtrlBtn: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  voiceMicBtn: { width: 72, height: 72, borderRadius: 36 },
  voiceCtrlIcon: { fontSize: 22 },

  // Popup
  popupOverlay: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 90 : 70, left: 16, right: 16,
    zIndex: 100,
  },
  popupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  popupCardDark: {
    backgroundColor: 'rgba(15, 23, 42, 0.96)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  popupIconWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  popupIcon: { fontSize: 28 },
  popupTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  popupDesc: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  popupBtnRow: { flexDirection: 'row', gap: 12, width: '100%' },
  popupBtnNo: { flex: 1, height: 48, borderRadius: 24, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  popupBtnNoText: { fontSize: 15, fontWeight: '600', color: '#475569' },
  popupBtnYes: { flex: 1, height: 48, borderRadius: 24, backgroundColor: BLUE, justifyContent: 'center', alignItems: 'center' },
  popupBtnYesText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },

  // ── Mode Toggle Bar ──
  modeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  modeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  modeToggleBtnDark: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  modeToggleBtnPersonalActive: {
    backgroundColor: 'rgba(16,185,129,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.4)',
  },
  modeToggleBtnWorkActive: {
    backgroundColor: 'rgba(99,102,241,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.4)',
  },
  modeToggleLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  modeToggleLabelPersonalActive: {
    color: '#10B981',
  },
  modeToggleLabelWorkActive: {
    color: '#818CF8',
  },
  // Toggle pill (the switch track)
  togglePill: {
    width: 34,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  togglePillOn: {
    backgroundColor: '#10B981',
  },
  togglePillWorkOn: {
    backgroundColor: '#6366F1',
  },
  togglePillOff: {
    backgroundColor: 'rgba(148,163,184,0.3)',
  },
  // Toggle knob (the circle)
  toggleKnob: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleKnobOn: {
    alignSelf: 'flex-end',
  },
  toggleKnobOff: {
    alignSelf: 'flex-start',
  },
  // Neutral chip in centre
  neutralChip: {
    alignItems: 'center',
    gap: 4,
  },
  neutralDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(148,163,184,0.3)',
  },
  neutralDotActive: {
    backgroundColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  neutralLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
