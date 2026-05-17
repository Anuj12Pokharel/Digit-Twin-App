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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api/api';

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

  const [title, setTitle] = useState(document.title || '');
  const [content, setContent] = useState(document.content || '');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [charCount, setCharCount] = useState((document.content || '').length);

  const inputRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, []);

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
    <LinearGradient colors={['#EBF4FF', '#D6EAFF', '#C2DDFF']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Animated.View style={{ flex: 1, opacity: fadeAnim }}>

            {/* ── Header ── */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.headerBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.headerBtnText}>← Back</Text>
              </TouchableOpacity>

              <Text style={styles.headerTitle} numberOfLines={1}>
                {title || 'Untitled'}
              </Text>

              <TouchableOpacity
                onPress={handleSave}
                disabled={loading}
                style={[styles.saveBtn, saved && styles.saveBtnSuccess]}
                activeOpacity={0.85}
              >
                {loading
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.saveBtnText}>{saved ? '✓ Saved' : 'Save'}</Text>
                }
              </TouchableOpacity>
            </View>

            {/* ── Title field ── */}
            <View style={styles.titleSection}>
              <TextInput
                style={styles.titleInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Document title…"
                placeholderTextColor="#A0AABF"
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
                style={styles.contentInput}
                value={content}
                onChangeText={handleContentChange}
                placeholder={'Start writing in Markdown…\n\n**Bold**, _italic_, `code`\n\n# Heading\n- List item'}
                placeholderTextColor="#A0AABF"
                multiline
                textAlignVertical="top"
                scrollEnabled={false}
              />
            </ScrollView>

            {/* ── Status bar ── */}
            <View style={styles.statusBar}>
              <Text style={styles.statusText}>{charCount} characters</Text>
              <Text style={styles.statusText}>v{document.version || 1}</Text>
              <Text style={styles.statusText}>Markdown</Text>
            </View>

            {/* ── Markdown toolbar ── */}
            <View style={styles.toolbar}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbarScroll}>
                {TOOLBAR_ITEMS.map((item) => (
                  <TouchableOpacity
                    key={item.label}
                    style={styles.toolBtn}
                    onPress={() => insertMarkdown(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.toolBtnText, item.style]}>{item.label}</Text>
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
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  headerBtnText: { color: BLUE, fontWeight: '700', fontSize: 14 },
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
