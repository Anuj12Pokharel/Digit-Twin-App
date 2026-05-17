import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Layered diamond/stack icon matching the mockup
function AppIcon({ size = 72, animated = false, scaleAnim }) {
  const iconStyle = animated ? { transform: [{ scale: scaleAnim }] } : {};
  return (
    <Animated.View style={[styles.iconWrapper, { width: size, height: size, borderRadius: size * 0.28 }, iconStyle]}>
      <View style={styles.iconBg}>
        {/* Top diamond */}
        <View style={[styles.diamond, styles.diamondTop]} />
        {/* Middle layer */}
        <View style={[styles.diamond, styles.diamondMid]} />
        {/* Bottom layer */}
        <View style={[styles.diamond, styles.diamondBot]} />
      </View>
    </Animated.View>
  );
}

export default function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const titleFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Icon scale + fade in
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Then fade title in
      Animated.timing(titleFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    });

    // Auto-navigate after 2.8s
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={['#EBF4FF', '#D6EAFF', '#C8E0FF']}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          {/* Icon */}
          <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
            <View style={styles.iconShadowWrapper}>
              <View style={styles.iconBgBlue}>
                {/* Stack icon layers */}
                <View style={styles.stackIcon}>
                  <View style={[styles.stackLayer, styles.stackTop]} />
                  <View style={[styles.stackLayer, styles.stackMid]} />
                  <View style={[styles.stackLayer, styles.stackBot]} />
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Title + Tagline */}
          <Animated.View style={[styles.textBlock, { opacity: titleFade }]}>
            <Text style={styles.appName}>Digit App</Text>
            <Text style={styles.tagline}>AI-Powered Conversations Simplified</Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const BLUE = '#2563EB';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconShadowWrapper: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  iconBgBlue: {
    width: 88,
    height: 88,
    borderRadius: 22,
    backgroundColor: BLUE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stackIcon: {
    width: 46,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
  },
  stackLayer: {
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    position: 'absolute',
  },
  stackTop: {
    width: 38,
    height: 0,
    borderBottomWidth: 10,
    borderBottomColor: 'rgba(255,255,255,0.95)',
    top: 0,
    borderStyle: 'solid',
    borderLeftWidth: 19,
    borderRightWidth: 19,
  },
  stackMid: {
    width: 38,
    height: 0,
    borderBottomWidth: 10,
    borderBottomColor: 'rgba(255,255,255,0.70)',
    top: 14,
    borderStyle: 'solid',
    borderLeftWidth: 19,
    borderRightWidth: 19,
  },
  stackBot: {
    width: 38,
    height: 0,
    borderBottomWidth: 10,
    borderBottomColor: 'rgba(255,255,255,0.45)',
    top: 28,
    borderStyle: 'solid',
    borderLeftWidth: 19,
    borderRightWidth: 19,
  },
  textBlock: {
    marginTop: 32,
    alignItems: 'center',
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '400',
    letterSpacing: 0.1,
  },
});
