import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator, Animated, ImageBackground
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const BG_IMAGE = 'https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=1200&auto=format&fit=crop';
const CYAN = '#0cdbbc';

export default function SignUpScreen({ navigation, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    countryCode: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSignUp = async () => {
    if (!formData.firstName || !formData.email || !formData.password || !formData.confirmPassword) {
      alert("Please fill in all required fields.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    setLoading(true);
    setTimeout(async () => {
      await AsyncStorage.setItem('userToken', 'dummy-auth-token-signup');
      setLoading(false);
      onLoginSuccess();
    }, 1500);
  };

  const updateForm = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  return (
    <ImageBackground source={{ uri: BG_IMAGE }} style={styles.backgroundImage}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Animated.View style={{ opacity: fadeAnim }}>
                
                <View style={styles.header}>
                  <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonIcon}>❮</Text>
                  </TouchableOpacity>
                  <Text style={styles.headerTitle}>Create Account</Text>
                  <View style={{ width: 40 }} /> 
                </View>

                <View style={styles.titleContainer}>
                  <Text style={styles.title}>Join the <Text style={{ color: CYAN }}>Network</Text></Text>
                  <Text style={styles.subtitle}>Enter your details to create your secure digital profile.</Text>
                </View>

                <View style={styles.formContainer}>
                  <View style={styles.row}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>First Name</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="John"
                        placeholderTextColor="#778"
                        value={formData.firstName}
                        onChangeText={(val) => updateForm('firstName', val)}
                      />
                    </View>
                    <View style={[styles.inputGroup, { marginLeft: 15 }]}>
                      <Text style={styles.label}>Last Name</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Doe"
                        placeholderTextColor="#778"
                        value={formData.lastName}
                        onChangeText={(val) => updateForm('lastName', val)}
                      />
                    </View>
                  </View>

                  <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 0.35 }]}>
                      <Text style={styles.label}>Code</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="+1"
                        placeholderTextColor="#778"
                        keyboardType="phone-pad"
                        value={formData.countryCode}
                        onChangeText={(val) => updateForm('countryCode', val)}
                      />
                    </View>
                    <View style={[styles.inputGroup, { flex: 0.65, marginLeft: 15 }]}>
                      <Text style={styles.label}>Phone Number</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="555 000 0000"
                        placeholderTextColor="#778"
                        keyboardType="phone-pad"
                        value={formData.phone}
                        onChangeText={(val) => updateForm('phone', val)}
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroupFull}>
                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="john.doe@example.com"
                      placeholderTextColor="#778"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={formData.email}
                      onChangeText={(val) => updateForm('email', val)}
                    />
                  </View>

                  <View style={styles.row}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Password</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        placeholderTextColor="#778"
                        secureTextEntry
                        value={formData.password}
                        onChangeText={(val) => updateForm('password', val)}
                      />
                    </View>
                    <View style={[styles.inputGroup, { marginLeft: 15 }]}>
                      <Text style={styles.label}>Confirm Password</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        placeholderTextColor="#778"
                        secureTextEntry
                        value={formData.confirmPassword}
                        onChangeText={(val) => updateForm('confirmPassword', val)}
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.footer}>
                  <TouchableOpacity 
                    style={styles.primaryButton}
                    onPress={handleSignUp}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#000" />
                    ) : (
                      <Text style={styles.primaryButtonText}>Sign Up →</Text>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.linkButton}
                    onPress={() => navigation.navigate('Login')}
                  >
                    <Text style={styles.linkText}>Already have an account? <Text style={styles.linkTextBold}>Log In</Text></Text>
                  </TouchableOpacity>
                </View>

              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  overlay: { flex: 1, backgroundColor: 'rgba(5, 12, 18, 0.93)' },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 10, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  backButton: { width: 40, height: 40, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  backButtonIcon: { color: '#fff', fontSize: 16 },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '600', letterSpacing: 0.5 },
  titleContainer: { marginBottom: 35 },
  title: { fontSize: 32, fontWeight: '800', color: '#ffffff', marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: '#B0BAC5', lineHeight: 22 },
  formContainer: { marginBottom: 10 },
  row: { flexDirection: 'row', marginBottom: 20 },
  inputGroup: { flex: 1 },
  inputGroupFull: { marginBottom: 20 },
  label: { color: '#ffffff', fontSize: 13, marginBottom: 8, fontWeight: '600', letterSpacing: 0.5, opacity: 0.9 },
  input: { backgroundColor: 'rgba(255,255,255,0.06)', height: 56, borderRadius: 10, paddingHorizontal: 16, color: '#ffffff', fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  footer: { marginTop: 10 },
  primaryButton: { backgroundColor: CYAN, borderRadius: 8, height: 56, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  primaryButtonText: { color: '#000000', fontSize: 17, fontWeight: '800' },
  linkButton: { alignItems: 'center', padding: 10 },
  linkText: { color: '#B0BAC5', fontSize: 15 },
  linkTextBold: { color: CYAN, fontWeight: '700' },
});
