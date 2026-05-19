import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  TextInput, KeyboardAvoidingView, Platform, Image, Alert,
  ActivityIndicator, Modal, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../api/api';
import { useTheme } from '../context/ThemeContext';

const BLUE = '#2563EB';

// ── Country list ──────────────────────────────────────────────────────────────
const COUNTRIES = [
  { code: '+1',   flag: '🇺🇸', name: 'United States' },
  { code: '+1',   flag: '🇨🇦', name: 'Canada' },
  { code: '+44',  flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+61',  flag: '🇦🇺', name: 'Australia' },
  { code: '+91',  flag: '🇮🇳', name: 'India' },
  { code: '+977', flag: '🇳🇵', name: 'Nepal' },
  { code: '+86',  flag: '🇨🇳', name: 'China' },
  { code: '+81',  flag: '🇯🇵', name: 'Japan' },
  { code: '+82',  flag: '🇰🇷', name: 'South Korea' },
  { code: '+49',  flag: '🇩🇪', name: 'Germany' },
  { code: '+33',  flag: '🇫🇷', name: 'France' },
  { code: '+39',  flag: '🇮🇹', name: 'Italy' },
  { code: '+34',  flag: '🇪🇸', name: 'Spain' },
  { code: '+55',  flag: '🇧🇷', name: 'Brazil' },
  { code: '+52',  flag: '🇲🇽', name: 'Mexico' },
  { code: '+7',   flag: '🇷🇺', name: 'Russia' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+65',  flag: '🇸🇬', name: 'Singapore' },
  { code: '+60',  flag: '🇲🇾', name: 'Malaysia' },
  { code: '+63',  flag: '🇵🇭', name: 'Philippines' },
  { code: '+92',  flag: '🇵🇰', name: 'Pakistan' },
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh' },
  { code: '+94',  flag: '🇱🇰', name: 'Sri Lanka' },
  { code: '+20',  flag: '🇪🇬', name: 'Egypt' },
  { code: '+234', flag: '🇳🇬', name: 'Nigeria' },
  { code: '+27',  flag: '🇿🇦', name: 'South Africa' },
  { code: '+254', flag: '🇰🇪', name: 'Kenya' },
  { code: '+31',  flag: '🇳🇱', name: 'Netherlands' },
  { code: '+46',  flag: '🇸🇪', name: 'Sweden' },
  { code: '+47',  flag: '🇳🇴', name: 'Norway' },
  { code: '+45',  flag: '🇩🇰', name: 'Denmark' },
  { code: '+41',  flag: '🇨🇭', name: 'Switzerland' },
  { code: '+32',  flag: '🇧🇪', name: 'Belgium' },
  { code: '+48',  flag: '🇵🇱', name: 'Poland' },
  { code: '+90',  flag: '🇹🇷', name: 'Turkey' },
  { code: '+62',  flag: '🇮🇩', name: 'Indonesia' },
  { code: '+66',  flag: '🇹🇭', name: 'Thailand' },
  { code: '+84',  flag: '🇻🇳', name: 'Vietnam' },
  { code: '+64',  flag: '🇳🇿', name: 'New Zealand' },
  { code: '+54',  flag: '🇦🇷', name: 'Argentina' },
  { code: '+56',  flag: '🇨🇱', name: 'Chile' },
  { code: '+57',  flag: '🇨🇴', name: 'Colombia' },
  { code: '+51',  flag: '🇵🇪', name: 'Peru' },
  { code: '+58',  flag: '🇻🇪', name: 'Venezuela' },
];

// ── Country Picker Modal ───────────────────────────────────────────────────────
function CountryPickerModal({ visible, onSelect, onClose }) {
  const { colors: theme, isDarkMode } = useTheme();
  const [search, setSearch] = useState('');
  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.includes(search)
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={[modal.overlay, { backgroundColor: theme.modalOverlay }]}>
        <View style={[modal.sheet, { backgroundColor: theme.card }]}>
          <View style={modal.header}>
            <Text style={[modal.title, { color: theme.text }]}>Select Country</Text>
            <TouchableOpacity onPress={onClose} style={[modal.closeBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }]}>
              <Text style={[modal.closeText, { color: theme.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={[modal.searchWrap, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
            <Text style={modal.searchIcon}>🔍</Text>
            <TextInput
              style={[modal.searchInput, { color: theme.text }]}
              placeholder="Search country or code..."
              placeholderTextColor="#A0AABF"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item, i) => `${item.code}-${item.name}-${i}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={modal.item}
                onPress={() => { onSelect(item); setSearch(''); }}
                activeOpacity={0.7}
              >
                <Text style={modal.itemFlag}>{item.flag}</Text>
                <Text style={[modal.itemName, { color: theme.text }]}>{item.name}</Text>
                <Text style={[modal.itemCode, { color: theme.textSecondary }]}>{item.code}</Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={[modal.separator, { backgroundColor: theme.border }]} />}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </Modal>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function EditProfileScreen({ navigation }) {
  const { colors: theme, isDarkMode } = useTheme();
  const [user, setUser] = useState({ full_name: '', email: '' });
  const [phone, setPhone] = useState('308.555.0121');
  const [country, setCountry] = useState(COUNTRIES[0]); // default USA
  const [dob, setDob] = useState(new Date(2000, 10, 24)); // Nov 24 2000
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api.get('/me').then(res => setUser(res.data)).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch('/users/me', { full_name: user.full_name });
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,       // lower quality = smaller base64 string
      base64: true,       // get base64 data directly
    });
    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      if (!asset.base64) {
        Alert.alert('Error', 'Could not read image data.');
        return;
      }
      setUploading(true);
      try {
        // Build a data URI and store it directly in avatar_url
        const mimeType = asset.mimeType || 'image/jpeg';
        const dataUri = `data:${mimeType};base64,${asset.base64}`;

        const res = await api.patch('/users/me', { avatar_url: dataUri });
        setUser(res.data);
        Alert.alert('✅ Success', 'Profile photo updated!');
      } catch {
        Alert.alert('Upload Failed', 'Could not save image. Please try again.');
      } finally {
        setUploading(false);
      }
    }
  };

  const formatDob = (date) => {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const initial = user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?';
  // avatar_url is now a base64 data URI — use it directly as image source
  const avatarUri = user?.avatar_url || null;

  return (
    <LinearGradient colors={theme.gradient} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={[styles.backBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)' }]} onPress={() => navigation.goBack()}>
            <Text style={[styles.backIcon, { color: theme.text }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Edit Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

            {/* Avatar */}
            <View style={styles.avatarWrap}>
              <TouchableOpacity onPress={pickImage} activeOpacity={0.8} style={styles.avatarTouchable}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                ) : (
                  <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                    <Text style={styles.avatarText}>{initial}</Text>
                  </View>
                )}
                <View style={[styles.avatarOverlay, { backgroundColor: theme.primary, borderColor: theme.card }]}>
                  {uploading
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={styles.cameraIcon}>📷</Text>
                  }
                </View>
              </TouchableOpacity>
              <Text style={[styles.changePhotoText, { color: theme.primary }]}>Tap to change photo</Text>
            </View>

            {/* Full Name */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Full Name</Text>
              <View style={[styles.inputCard, { backgroundColor: theme.card }]}>
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  value={user.full_name}
                  onChangeText={v => setUser({ ...user, full_name: v })}
                  placeholder="Enter your full name"
                  placeholderTextColor="#A0AABF"
                />
              </View>
            </View>

            {/* Email (read-only) */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
              <View style={[styles.inputCard, { backgroundColor: theme.inputBgDisabled }]}>
                <TextInput
                  style={[styles.input, { color: theme.textSecondary }]}
                  value={user.email}
                  editable={false}
                />
              </View>
              <Text style={styles.fieldHint}>Email cannot be changed</Text>
            </View>

            {/* Phone Number with Country Picker */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Phone Number</Text>
              <View style={[styles.inputCard, { backgroundColor: theme.card, flexDirection: 'row', alignItems: 'center' }]}>
                {/* Country Flag + Code Button */}
                <TouchableOpacity
                  style={styles.countryBtn}
                  onPress={() => setShowCountryPicker(true)}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 20 }}>{country.flag}</Text>
                  <Text style={[styles.countryCode, { color: theme.text }]}>{country.code}</Text>
                  <Text style={styles.countryChevron}>▾</Text>
                </TouchableOpacity>
                <View style={[styles.phoneDivider, { backgroundColor: theme.border }]} />
                <TextInput
                  style={[styles.input, { flex: 1, paddingLeft: 12, color: theme.text }]}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholder="Phone number"
                  placeholderTextColor="#A0AABF"
                />
              </View>
            </View>

            {/* Date of Birth with Calendar */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Date of Birth</Text>
              <TouchableOpacity
                style={[styles.inputCard, { backgroundColor: theme.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.8}
              >
                <Text style={[styles.input, { flex: 1, lineHeight: 56, color: theme.text }]}>
                  {formatDob(dob)}
                </Text>
                <Text style={{ fontSize: 20, color: theme.primary }}>📅</Text>
              </TouchableOpacity>
            </View>

            {/* Date Picker — Android shows inline dialog, iOS shows inline */}
            {showDatePicker && (
              <View style={[styles.datePickerWrap, { backgroundColor: theme.card }]}>
                <DateTimePicker
                  value={dob}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)}
                  onChange={(event, selectedDate) => {
                    if (Platform.OS === 'android') {
                      setShowDatePicker(false);
                    }
                    if (selectedDate) setDob(selectedDate);
                  }}
                  style={styles.datePicker}
                  themeVariant={isDarkMode ? 'dark' : 'light'}
                  accentColor={theme.primary}
                />
                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    style={[styles.dateConfirmBtn, { backgroundColor: theme.primary }]}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={[styles.dateConfirmText, { color: isDarkMode ? '#05141E' : '#fff' }]}>Confirm</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

          </ScrollView>

          {/* Save Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: theme.primary, shadowColor: theme.primary }, saving && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator color={isDarkMode ? '#05141E' : '#fff'} />
                : <Text style={[styles.saveBtnText, { color: isDarkMode ? '#05141E' : '#fff' }]}>Save Changes</Text>
              }
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Country Picker Modal */}
      <CountryPickerModal
        visible={showCountryPicker}
        onSelect={(c) => { setCountry(c); setShowCountryPicker(false); }}
        onClose={() => setShowCountryPicker(false)}
      />
    </LinearGradient>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 18, color: '#0F172A' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },

  scroll: { paddingHorizontal: 20, paddingBottom: 30 },

  // Avatar
  avatarWrap: { alignSelf: 'center', marginBottom: 32, alignItems: 'center' },
  avatarTouchable: { position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: BLUE, justifyContent: 'center', alignItems: 'center' },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
  avatarText: { fontSize: 36, fontWeight: '700', color: '#fff' },
  avatarOverlay: { position: 'absolute', bottom: 0, right: 0, width: 34, height: 34, borderRadius: 17, backgroundColor: BLUE, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  cameraIcon: { fontSize: 14 },
  changePhotoText: { marginTop: 10, fontSize: 13, color: BLUE, fontWeight: '600' },

  // Form
  formGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#1E293B', marginBottom: 8, marginLeft: 4 },
  inputCard: { backgroundColor: '#FFFFFF', borderRadius: 16, height: 56, paddingHorizontal: 16, justifyContent: 'center', shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2 },
  inputCardDisabled: { backgroundColor: '#F8FAFC' },
  input: { fontSize: 15, color: '#1E293B' },
  fieldHint: { fontSize: 11, color: '#94A3B8', marginTop: 4, marginLeft: 4 },

  // Phone / Country
  countryBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingRight: 8 },
  countryCode: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  countryChevron: { fontSize: 10, color: '#94A3B8' },
  phoneDivider: { width: 1, height: 30, backgroundColor: '#E2E8F0', marginRight: 4 },

  // Date Picker
  datePickerWrap: { backgroundColor: '#FFFFFF', borderRadius: 20, marginBottom: 12, overflow: 'hidden', shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 },
  datePicker: { height: Platform.OS === 'ios' ? 350 : undefined },
  dateConfirmBtn: { margin: 12, height: 48, backgroundColor: BLUE, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  dateConfirmText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // Footer
  footer: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10 },
  saveBtn: { height: 56, backgroundColor: BLUE, borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowColor: BLUE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

// ── Modal Styles ──────────────────────────────────────────────────────────────
const modal = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: Platform.OS === 'ios' ? 40 : 20, maxHeight: '80%' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  title: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  closeText: { fontSize: 16, color: '#64748B' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 12, backgroundColor: '#F8FAFC', borderRadius: 14, paddingHorizontal: 14, height: 48, borderWidth: 1, borderColor: '#E2E8F0' },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#1E293B' },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20 },
  itemFlag: { fontSize: 24, width: 36 },
  itemName: { flex: 1, fontSize: 15, color: '#1E293B', fontWeight: '500' },
  itemCode: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  separator: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 72 },
});
