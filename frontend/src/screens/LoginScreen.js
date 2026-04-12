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

export default function LoginScreen({ navigation, onLoginSuccess }) {
  const [email, setEmail] = useState('test@digit.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }
    if (email.toLowerCase() !== 'test@digit.com' || password !== 'password123') {
      alert("Invalid credentials. Try test@digit.com / password123");
      return;
    }
    setLoading(true);
    setTimeout(async () => {
      await AsyncStorage.setItem('userToken', 'dummy-auth-token');
      setLoading(false);
      onLoginSuccess();
    }, 1500);
  };

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
              <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
                
                <View style={styles.header}>
                  <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonIcon}>❮</Text>
                  </TouchableOpacity>
                  <Text style={styles.headerTitle}>Log In</Text>
                  <View style={{ width: 40 }} /> 
                </View>

                <View style={styles.titleContainer}>
                  <Text style={styles.title}>Welcome <Text style={{ color: CYAN }}>Back</Text></Text>
                  <Text style={styles.subtitle}>Enter your credentials to access your portal.</Text>
                </View>

                <View style={styles.formContainer}>
                  <View style={styles.inputGroupFull}>
                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="john.doe@example.com"
                      placeholderTextColor="#778"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>

                  <View style={styles.inputGroupFull}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor="#778"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                    />
                  </View>
                  
                  <TouchableOpacity style={styles.forgotPassword}>
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.spacer} />

                <View style={styles.footer}>
                  <TouchableOpacity 
                    style={styles.primaryButton}
                    onPress={handleLogin}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#000" />
                    ) : (
                      <Text style={styles.primaryButtonText}>Log In →</Text>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.linkButton}
                    onPress={() => navigation.navigate('SignUp')}
                  >
                    <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkTextBold}>Sign Up</Text></Text>
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
  container: { flex: 1, paddingTop: 10 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
  backButton: { width: 40, height: 40, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  backButtonIcon: { color: '#fff', fontSize: 16 },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '600', letterSpacing: 0.5 },
  titleContainer: { marginBottom: 40 },
  title: { fontSize: 36, fontWeight: '800', color: '#ffffff', marginBottom: 10, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: '#B0BAC5', lineHeight: 24 },
  formContainer: { marginBottom: 20 },
  inputGroupFull: { marginBottom: 20 },
  label: { color: '#ffffff', fontSize: 13, marginBottom: 8, fontWeight: '600', letterSpacing: 0.5, opacity: 0.9 },
  input: { backgroundColor: 'rgba(255,255,255,0.04)', height: 56, borderRadius: 10, paddingHorizontal: 16, color: '#ffffff', fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  forgotPassword: { alignSelf: 'flex-end', marginTop: 5 },
  forgotPasswordText: { color: CYAN, fontSize: 14, fontWeight: '600' },
  spacer: { flex: 1, minHeight: 40 },
  footer: { marginTop: 'auto' },
  primaryButton: { backgroundColor: CYAN, borderRadius: 8, height: 56, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  primaryButtonText: { color: '#000000', fontSize: 17, fontWeight: '800' },
  linkButton: { alignItems: 'center', padding: 10 },
  linkText: { color: '#B0BAC5', fontSize: 15 },
  linkTextBold: { color: CYAN, fontWeight: '700' },
});
