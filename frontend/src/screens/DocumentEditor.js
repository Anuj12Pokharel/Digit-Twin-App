import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api/api';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');
const BLUE = '#2563EB';

const TOOLBAR_ITEMS = [
  { label: 'B',   wrap: '**',   style: { fontWeight: '900' } },
  { label: 'I',   wrap: '_',    style: { fontStyle: 'italic' } },
  { label: '`',   wrap: '`',    style: { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' } },
  { label: 'H1',  prefix: '# ', style: { fontWeight: '800' } },
  { label: '—',   prefix: '---\n', style: {} },
  { label: '✅',  prefix: '- [ ] ', style: {} },
];

export default function DocumentEditor({ route, navigation }) {
  const { document } = route.params;
  const { colors: theme, isDarkMode } = useTheme();

  const [title, setTitle] = useState(document.title || '');
  const [content, setContent] = useState(document.content || '');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [charCount, setCharCount] = useState((document.content || '').length);

  const inputRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const stars = useRef(
    Array.from({ length: 15 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * (height * 0.75),
      size: Math.random() * 2.5 + 1.2,
      opacity: new Animated.Value(Math.random() * 0.4 + 0.1),
    }))
  ).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
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

  const handleContentChange = (text) => {
    setContent(text);
    setCharCount(text.length);
    setSaved(false);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please add a title before saving.');
      return;
    }
    setLoading(true);
    try {
      await api.patch(`/documents/${document.id}`, { title: title.trim(), content });
      setSaved(true);
      // Brief success flash then go back
      setTimeout(() => navigation.goBack(), 800);
    } catch (err) {
      Alert.alert('Save Failed', err.response?.data?.detail || 'Could not save document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const insertMarkdown = ({ wrap, prefix }) => {
    if (!inputRef.current) return;
    if (wrap) {
      setContent(prev => prev + `${wrap}text${wrap}`);
    } else if (prefix) {
      setContent(prev => {
        const lastNewline = prev.lastIndexOf('\n');
        if (lastNewline === -1) return prefix + prev;
        return prev.slice(0, lastNewline + 1) + prefix + prev.slice(lastNewline + 1);
      });
    }
  };

  return (
    <LinearGradient colors={theme.gradient} style={{ flex: 1 }}>
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
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Animated.View style={{ flex: 1, opacity: fadeAnim }}>

            {/* ── Header ── */}
            <View style={[styles.header, { borderBottomColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={[
                  styles.headerBtn,
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
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={[styles.headerBtnText, { color: isDarkMode ? '#FFFFFF' : '#0A0A0A' }]}>←</Text>
              </TouchableOpacity>

              <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFFFFF' : '#1E293B' }]} numberOfLines={1}>
                {title || 'Untitled'}
              </Text>

              <TouchableOpacity
                onPress={handleSave}
                disabled={loading}
                style={[styles.saveBtn, { backgroundColor: theme.primary }, saved && styles.saveBtnSuccess]}
                activeOpacity={0.85}
              >
                {loading
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.saveBtnText}>{saved ? '✓ Saved' : 'Save'}</Text>
                }
              </TouchableOpacity>
            </View>

            {/* ── Title field ── */}
            <View style={[styles.titleSection, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.45)', borderBottomColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
              <TextInput
                style={[styles.titleInput, { color: isDarkMode ? '#FFFFFF' : '#0F172A' }]}
                value={title}
                onChangeText={setTitle}
                placeholder="Document title…"
                placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.35)' : '#A0AABF'}
                returnKeyType="next"
                onSubmitEditing={() => inputRef.current?.focus()}
              />
            </View>

            {/* ── Editor ── */}
            <ScrollView
              style={styles.editorScroll}
              contentContainerStyle={styles.editorContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <TextInput
                ref={inputRef}
                style={[styles.contentInput, { color: isDarkMode ? '#FFFFFF' : '#1E293B' }]}
                value={content}
                onChangeText={handleContentChange}
                placeholder={'Start writing in Markdown…\n\n**Bold**, _italic_, `code`\n\n# Heading\n- List item'}
                placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.35)' : '#A0AABF'}
                multiline
                textAlignVertical="top"
                scrollEnabled={false}
              />
            </ScrollView>

            {/* ── Status bar ── */}
            <View style={[styles.statusBar, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.4)', borderTopColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}>
              <Text style={[styles.statusText, { color: isDarkMode ? '#8FA0AF' : '#94A3B8' }]}>{charCount} characters</Text>
              <Text style={[styles.statusText, { color: isDarkMode ? '#8FA0AF' : '#94A3B8' }]}>v{document.version || 1}</Text>
              <Text style={[styles.statusText, { color: isDarkMode ? '#8FA0AF' : '#94A3B8' }]}>Markdown</Text>
            </View>

            {/* ── Markdown toolbar ── */}
            <View style={[styles.toolbar, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.85)', borderTopColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)' }]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbarScroll}>
                {TOOLBAR_ITEMS.map((item) => (
                  <TouchableOpacity
                    key={item.label}
                    style={[styles.toolBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : '#F1F5F9', borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }]}
                    onPress={() => insertMarkdown(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.toolBtnText, { color: isDarkMode ? '#FFFFFF' : '#1E293B' }, item.style]}>{item.label}</Text>
                  </TouchableOpacity>
                ))}

                {/* Divider */}
                <View style={styles.toolDivider} />

                {/* AI Polish */}
                <TouchableOpacity
                  style={styles.aiPolishBtn}
                  onPress={() => Alert.alert('✨ AI Polish', 'AI rewriting coming soon!')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.aiPolishText}>✨ AI Polish</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
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
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  headerBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  headerBtnText: { color: '#0A0A0A', fontWeight: '800', fontSize: 26 },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginHorizontal: 8,
  },
  saveBtn: {
    backgroundColor: BLUE,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 72,
    alignItems: 'center',
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  saveBtnSuccess: { backgroundColor: '#22C55E' },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Title
  titleSection: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  titleInput: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },

  // Editor
  editorScroll: { flex: 1 },
  editorContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    minHeight: 300,
  },
  contentInput: {
    fontSize: 16,
    color: '#1E293B',
    lineHeight: 26,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  // Status bar
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  statusText: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },

  // Toolbar
  toolbar: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.07)',
    paddingVertical: 8,
  },
  toolbarScroll: {
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 6,
  },
  toolBtn: {
    width: 40,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toolBtnText: { fontSize: 13, color: '#1E293B' },
  toolDivider: { width: 1, height: 28, backgroundColor: '#CBD5E1', marginHorizontal: 4 },
  aiPolishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  aiPolishText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
