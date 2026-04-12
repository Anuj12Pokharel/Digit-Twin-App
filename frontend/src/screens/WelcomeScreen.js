import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, StatusBar, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const BG_IMAGE = 'https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=1200&auto=format&fit=crop';
const CYAN = '#0cdbbc';

export default function WelcomeScreen({ navigation }) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in all content
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();

    // Continuous floating animation for the text logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -15,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);

  return (
    <ImageBackground source={{ uri: BG_IMAGE }} style={styles.backgroundImage}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="light-content" />
          
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            
            {/* Animated Logo Section */}
            <Animated.View style={[styles.iconContainer, { transform: [{ translateY: floatAnim }] }]}>
              <Text style={styles.digitLogo}>
                Digit <Text style={styles.digitDot}>.</Text>
              </Text>
            </Animated.View>

            {/* Typography Section */}
            <Text style={styles.mainTitle}>
              Unlock Your Mind,{'\n'}
              <Text style={styles.highlightText}>Meet Your Twin</Text>
            </Text>
            
            <Text style={styles.subtitle}>
              Say hello to Digit Twin. Your revolutionary AI framework designed to understand your habits, secure your data, and automate your daily digital workflow flawlessly.
            </Text>

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => navigation.navigate('SignUp')}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>Getting Started →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>I already have an account</Text>
              </TouchableOpacity>
            </View>
            
            {/* Bottom Features */}
            <View style={styles.featuresContainer}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>📈</Text>
                <Text style={styles.featureText}>Digital Efficiency</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🛡️</Text>
                <Text style={styles.featureText}>Ethical & Safe</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>💽</Text>
                <Text style={styles.featureText}>Data Integrity</Text>
              </View>
            </View>

          </Animated.View>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 12, 18, 0.88)', 
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 40,
    marginTop: 20,
    shadowColor: CYAN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 25,
    elevation: 8,
  },
  digitLogo: {
    fontSize: 52,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -1,
  },
  digitDot: {
    color: CYAN,
  },
  mainTitle: {
    fontSize: 38,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 46,
    marginBottom: 20,
  },
  highlightText: {
    color: CYAN,
  },
  subtitle: {
    fontSize: 16,
    color: '#B0BAC5',
    textAlign: 'center',
    paddingHorizontal: 10,
    lineHeight: 24,
    marginBottom: 45,
    fontWeight: '400',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: CYAN,
    paddingVertical: 18,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
    shadowColor: CYAN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 17,
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 18,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    marginTop: 'auto',
    marginBottom: 20,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    fontSize: 22,
    marginBottom: 8,
    color: CYAN,
  },
  featureText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
  }
});
