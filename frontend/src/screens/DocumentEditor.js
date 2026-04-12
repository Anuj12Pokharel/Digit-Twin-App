import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import api from '../api/api';

export default function DocumentEditor({ route, navigation }) {
  const { document } = route.params;
  const [content, setContent] = useState(document.content);
  const [title, setTitle] = useState(document.title);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.patch(`/documents/${document.id}`, {
        title,
        content
      });
      Alert.alert('Success', 'Document saved successfully');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Failed to save document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Document Editor</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          <Text style={styles.saveBtn}>{loading ? '...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.titleInput}
        value={title}
        onChangeText={setTitle}
        placeholder="Document Title"
      />

      <ScrollView style={styles.editorContainer}>
        <TextInput
          style={styles.contentInput}
          value={content}
          onChangeText={setContent}
          placeholder="Start writing in Markdown..."
          multiline
          textAlignVertical="top"
        />
      </ScrollView>

      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolBtn}>
          <Text style={styles.toolText}>B</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn}>
          <Text style={styles.toolText}>I</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn}>
          <Text style={styles.toolText}>List</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.polishBtn}>
          <Text style={styles.polishBtnText}>✨ AI Polish</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { height: 100, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  backBtn: { color: '#007bff', fontWeight: 'bold' },
  headerTitle: { fontSize: 16, fontWeight: '700' },
  saveBtn: { color: '#28a745', fontWeight: 'bold' },
  titleInput: { padding: 20, fontSize: 24, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  editorContainer: { flex: 1, padding: 20 },
  contentInput: { fontSize: 16, lineHeight: 24, minHeight: 400 },
  toolbar: { height: 60, borderTopWidth: 1, borderTopColor: '#eee', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, backgroundColor: '#f9f9f9' },
  toolBtn: { padding: 10, marginRight: 10 },
  toolText: { fontWeight: 'bold', color: '#555' },
  polishBtn: { backgroundColor: '#212529', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  polishBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' }
});
