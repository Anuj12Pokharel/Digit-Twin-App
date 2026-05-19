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
const BLUE_GLOW = '#00F0FF';
const BLUE_COBALT = '#184E68';
const BLUE_INDIGO = '#0A2D3F';

export default function SplashScreen({ navigation }) {
  // Logo movement: bottom to center spring
  const logoY = useRef(new Animated.Value(height * 0.5)).current;
  const logoScale = useRef(new Animated.Value(0.4)).current;
  const containerOpacity = useRef(new Animated.Value(0)).current;

  // Expanding shockwave landing effects (Nested double ripple!)
  const shock1Scale = useRef(new Animated.Value(0.5)).current;
  const shock1Opacity = useRef(new Animated.Value(0)).current;
  const shock2Scale = useRef(new Animated.Value(0.5)).current;
  const shock2Opacity = useRef(new Animated.Value(0)).current;

  // Radial particle explosion sparks
  const sparkAnims = useRef(
    Array.from({ length: 6 }, () => new Animated.ValueXY({ x: 0, y: 0 }))
  ).current;
  const sparkOpacity = useRef(new Animated.Value(0)).current;

  // Staggered text assembly
  const textFade = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(25)).current;
  const textScale = useRef(new Animated.Value(0.9)).current;

  // Bottom loader progress
  const progressWidth = useRef(new Animated.Value(0)).current;
  const loaderFade = useRef(new Animated.Value(0)).current;

  // Aurora background floating blobs
  const blob1 = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const blob2 = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  useEffect(() => {
    // 1. Initial fade-in of screen container
    Animated.timing(containerOpacity, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();

    // 2. Slow circular paths for background aurora blobs
    const runBlobAnim = (val, targetX, targetY, duration) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, {
            toValue: { x: targetX, y: targetY },
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: { x: -targetX, y: -targetY },
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: { x: 0, y: 0 },
            duration: duration,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };
    runBlobAnim(blob1, 50, -40, 5000);
    runBlobAnim(blob2, -60, 50, 7000);

    // 3. Shoot logo from bottom to top center with spring bounce
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.spring(logoY, {
          toValue: 0,
          tension: 28,
          friction: 6.5,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 25,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // 4. ELITE Landing Effects: Double Shockwave + Radial Sparks Burst!
      shock1Opacity.setValue(0.9);
      shock1Scale.setValue(0.6);
      
      Animated.parallel([
        // Shockwave 1 (Fast Cyan)
        Animated.timing(shock1Scale, {
          toValue: 2.5,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(shock1Opacity, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]).start();

      // Shockwave 2 (Delayed Cobalt ripple)
      setTimeout(() => {
        shock2Opacity.setValue(0.75);
        shock2Scale.setValue(0.5);
        Animated.parallel([
          Animated.timing(shock2Scale, {
            toValue: 2.3,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(shock2Opacity, {
            toValue: 0,
            duration: 950,
            useNativeDriver: true,
          }),
        ]).start();
      }, 150);

      // Radial Sparks burst
      sparkOpacity.setValue(1);
      Animated.parallel([
        Animated.timing(sparkOpacity, {
          toValue: 0,
          duration: 650,
          useNativeDriver: true,
        }),
        ...sparkAnims.map((spark, index) => {
          const angle = (index * 2 * Math.PI) / 6;
          const targetX = Math.cos(angle) * 85;
          const targetY = Math.sin(angle) * 85;
          return Animated.spring(spark, {
            toValue: { x: targetX, y: targetY },
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          });
        }),
      ]).start();

      // 5. Staggered text & loader entry
      Animated.parallel([
        Animated.spring(textSlide, {
          toValue: 0,
          tension: 40,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(textScale, {
          toValue: 1,
          tension: 45,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(textFade, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(loaderFade, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(progressWidth, {
          toValue: width * 0.52,
          duration: 1600,
          useNativeDriver: false,
        }),
      ]).start();
    });

    // Auto-navigate after 2.8s if navigation is available
    const timer = setTimeout(() => {
      if (navigation) {
        navigation.replace('Onboarding');
      }
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      <LinearGradient
        colors={['#081E2D', '#05141E', '#030A0F']}
        style={StyleSheet.absoluteFillObject}
      />
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Dynamic colorful aurora blobs */}
      <Animated.View
        style={[
          styles.bgBlob,
          styles.bgBlob1,
          { transform: [{ translateX: blob1.x }, { translateY: blob1.y }] },
        ]}
      />
      <Animated.View
        style={[
          styles.bgBlob,
          styles.bgBlob2,
          { transform: [{ translateX: blob2.x }, { translateY: blob2.y }] },
        ]}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          {/* Shockwave 1 expanding landing glow */}
          <Animated.View
            style={[
              styles.shockwave,
              {
                opacity: shock1Opacity,
                transform: [{ scale: shock1Scale }],
                borderColor: BLUE_GLOW,
                shadowColor: BLUE_GLOW,
              },
            ]}
          />

          {/* Shockwave 2 delayed expanding landing glow */}
          <Animated.View
            style={[
              styles.shockwave,
              {
                opacity: shock2Opacity,
                transform: [{ scale: shock2Scale }],
                borderColor: BLUE_COBALT,
                shadowColor: BLUE_COBALT,
              },
            ]}
          />

          {/* Radial Sparks Burst Particles */}
          {sparkAnims.map((spark, i) => (
            <Animated.View
              key={i}
              style={[
                styles.sparkDot,
                {
                  opacity: sparkOpacity,
                  transform: [
                    { translateX: spark.x },
                    { translateY: spark.y },
                  ],
                },
              ]}
            />
          ))}

          {/* Flying Logo Wrapper */}
          <Animated.View
            style={[
              styles.iconShadowWrapper,
              {
                transform: [{ translateY: logoY }, { scale: logoScale }],
              },
            ]}
          >
            <LinearGradient
              colors={[BLUE_COBALT, BLUE_GLOW]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconBgBlue}
            >
              <View style={styles.stackIcon}>
                <View style={[styles.stackLayer, styles.stackTop]} />
                <View style={[styles.stackLayer, styles.stackMid]} />
                <View style={[styles.stackLayer, styles.stackBot]} />
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Staggered Elastic Text Reveal */}
          <Animated.View
            style={[
              styles.textBlock,
              {
                opacity: textFade,
                transform: [{ translateY: textSlide }, { scale: textScale }],
              },
            ]}
          >
            <Text style={styles.appName}>Digit App</Text>
            <Text style={styles.tagline}>AI-Powered Conversations Simplified</Text>
          </Animated.View>
        </View>

        {/* Sleek bottom loader */}
        <Animated.View style={[styles.loaderContainer, { opacity: loaderFade }]}>
          <Animated.View style={[styles.loaderBar, { width: progressWidth }]} />
        </Animated.View>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgBlob: {
    position: 'absolute',
    borderRadius: 150,
    opacity: 0.28,
  },
  bgBlob1: {
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: BLUE_COBALT,
    top: -50,
    left: -50,
  },
  bgBlob2: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: BLUE_GLOW,
    bottom: height * 0.2,
    right: -60,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 45,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  shockwave: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    backgroundColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
  },
  sparkDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BLUE_GLOW,
    shadowColor: BLUE_GLOW,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  iconShadowWrapper: {
    shadowColor: BLUE_GLOW,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 25,
    elevation: 20,
    zIndex: 10,
  },
  iconBgBlue: {
    width: 98,
    height: 98,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stackIcon: {
    width: 48,
    height: 40,
    position: 'relative',
  },
  stackLayer: {
    position: 'absolute',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 20,
    borderRightWidth: 20,
  },
  stackTop: {
    width: 0,
    height: 0,
    borderBottomWidth: 10,
    borderBottomColor: 'rgba(255,255,255,0.98)',
    top: 0,
  },
  stackMid: {
    width: 0,
    height: 0,
    borderBottomWidth: 10,
    borderBottomColor: 'rgba(255,255,255,0.72)',
    top: 13,
  },
  stackBot: {
    width: 0,
    height: 0,
    borderBottomWidth: 10,
    borderBottomColor: 'rgba(255,255,255,0.44)',
    top: 26,
  },
  textBlock: {
    marginTop: 38,
    alignItems: 'center',
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.8,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 240, 255, 0.35)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  tagline: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  loaderContainer: {
    width: width * 0.52,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  loaderBar: {
    height: '100%',
    backgroundColor: BLUE_GLOW,
    borderRadius: 2,
    shadowColor: BLUE_GLOW,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
});
