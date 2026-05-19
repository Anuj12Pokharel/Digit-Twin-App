import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const PURPLE = '#184E68';
const CYAN = '#00F0FF';
const INDIGO = '#0A2D3F';

const SLIDES = [
  {
    id: '1',
    title: 'Smart Voice Assistant',
    subtitle: 'Experience the power of advanced AI at your command with real-time feedback.',
    illustration: '🎙️',
    colors: ['#0A2234', '#061724', '#030C12'],
  },
  {
    id: '2',
    title: 'Boost Your Productivity',
    subtitle: 'Manage your schedule and tasks hands-free with intelligent curation tailored to your workflow.',
    illustration: '⚡',
    colors: ['#0B283D', '#071A28', '#030E16'],
  },
  {
    id: '3',
    title: 'Connect Your Work Tools',
    subtitle: 'Seamlessly integrate with Slack, Microsoft Teams, and more to centralize your productivity.',
    illustration: '🔗',
    colors: ['#0C2E46', '#081E2E', '#041019'],
  },
];

function AmbientBackground({ colors }) {
  const blob1 = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const blob2 = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  // 1. Twinkling Starfield Stars
  const stars = useRef(
    Array.from({ length: 16 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * (height * 0.65),
      size: Math.random() * 3 + 1.5,
      opacity: new Animated.Value(Math.random() * 0.4 + 0.1),
    }))
  ).current;

  useEffect(() => {
    // Twinkling animation loop for each star
    stars.forEach((star) => {
      const twinkle = () => {
        Animated.sequence([
          Animated.timing(star.opacity, {
            toValue: Math.random() * 0.8 + 0.2,
            duration: Math.random() * 2000 + 1200,
            useNativeDriver: true,
          }),
          Animated.timing(star.opacity, {
            toValue: Math.random() * 0.25 + 0.05,
            duration: Math.random() * 2000 + 1200,
            useNativeDriver: true,
          }),
        ]).start(() => twinkle());
      };
      twinkle();
    });

    // Blob drift animation
    const moveBlob = (value, xRange, yRange, duration) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: { x: Math.random() * xRange - xRange/2, y: Math.random() * yRange - yRange/2 },
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: { x: Math.random() * xRange - xRange/2, y: Math.random() * yRange - yRange/2 },
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: { x: 0, y: 0 },
            duration: duration,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    moveBlob(blob1, 60, 80, 6000);
    moveBlob(blob2, 80, 50, 8000);
  }, []);

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <LinearGradient colors={colors} style={StyleSheet.absoluteFillObject} />
      
      {/* Twinkling Starfield */}
      {stars.map((star, i) => (
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

      {/* Abstract Glowing Blob 1 */}
      <Animated.View
        style={[
          styles.ambientBlob,
          {
            backgroundColor: 'rgba(139, 92, 246, 0.18)',
            width: 320,
            height: 320,
            top: -50,
            left: -50,
            borderRadius: 160,
            transform: [{ translateX: blob1.x }, { translateY: blob1.y }],
          },
        ]}
      />

      {/* Abstract Glowing Blob 2 */}
      <Animated.View
        style={[
          styles.ambientBlob,
          {
            backgroundColor: 'rgba(12, 221, 188, 0.18)',
            width: 260,
            height: 260,
            bottom: height * 0.3,
            right: -50,
            borderRadius: 130,
            transform: [{ translateX: blob2.x }, { translateY: blob2.y }],
          },
        ]}
      />
    </View>
  );
}

function WaveformAnimation() {
  // Animating audio equalizer lines
  const bar1 = useRef(new Animated.Value(12)).current;
  const bar2 = useRef(new Animated.Value(24)).current;
  const bar3 = useRef(new Animated.Value(16)).current;
  const bar4 = useRef(new Animated.Value(32)).current;
  const bar5 = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    const runBounce = (bar, min, max) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bar, {
            toValue: Math.random() * (max - min) + min,
            duration: Math.random() * 250 + 200,
            useNativeDriver: false,
          }),
          Animated.timing(bar, {
            toValue: Math.random() * (max - min) + min,
            duration: Math.random() * 250 + 200,
            useNativeDriver: false,
          }),
        ])
      ).start();
    };

    runBounce(bar1, 8, 26);
    runBounce(bar2, 12, 42);
    runBounce(bar3, 10, 32);
    runBounce(bar4, 16, 48);
    runBounce(bar5, 6, 20);
  }, []);

  return (
    <View style={styles.waveformContainer}>
      <Animated.View style={[styles.waveBar, { height: bar1 }]} />
      <Animated.View style={[styles.waveBar, { height: bar2, backgroundColor: PURPLE }]} />
      <Animated.View style={[styles.waveBar, { height: bar3 }]} />
      <Animated.View style={[styles.waveBar, { height: bar4, backgroundColor: PURPLE }]} />
      <Animated.View style={[styles.waveBar, { height: bar5 }]} />
    </View>
  );
}

function IllustrationView({ emoji, slideId }) {
  const float = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: -15, duration: 2500, useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2500, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.15, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.illustrationContainer}>
      <Animated.View style={[styles.illustrationCircle, { transform: [{ translateY: float }] }]}>
        <Animated.View style={[styles.glowRing, { transform: [{ scale: pulse }] }]} />
        <Animated.View style={[styles.glowRingOuter, { transform: [{ scale: Animated.multiply(pulse, 1.15) }] }]} />
        <Text style={styles.illustrationEmoji}>{emoji}</Text>
      </Animated.View>

      {/* Renders real equalizer waveform animation on slide 1 */}
      {slideId === '1' && <WaveformAnimation />}

      <View style={[styles.floatDot, { top: '25%', left: '20%', width: 8, height: 8, opacity: 0.4 }]} />
      <View style={[styles.floatDot, { top: '35%', right: '18%', width: 6, height: 6, opacity: 0.3 }]} />
      <View style={[styles.floatDot, { bottom: '30%', left: '25%', width: 10, height: 10, opacity: 0.25 }]} />
    </View>
  );
}

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(20)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  // 3. Metallic sweep shiny animation
  const shineX = useRef(new Animated.Value(-150)).current;

  useEffect(() => {
    animateText();
  }, [currentIndex]);

  useEffect(() => {
    // Loop shiny shine sweep every 2.8 seconds
    const runShine = () => {
      shineX.setValue(-150);
      Animated.sequence([
        Animated.delay(2200),
        Animated.timing(shineX, {
          toValue: width * 0.6,
          duration: 900,
          useNativeDriver: true,
        }),
      ]).start(() => runShine());
    };
    runShine();
  }, []);

  const animateText = () => {
    titleOpacity.setValue(0);
    titleSlide.setValue(15);
    subtitleOpacity.setValue(0);

    Animated.parallel([
      Animated.sequence([
        Animated.parallel([
          Animated.timing(titleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(titleSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]),
        Animated.timing(subtitleOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
      ]),
    ]).start();
  };

  const goNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      navigation.replace('GetStarted');
    }
  };

  const goSkip = () => {
    navigation.replace('GetStarted');
  };

  const onMomentumScrollEnd = (e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    if (idx !== currentIndex) {
      setCurrentIndex(idx);
    }
  };

  return (
    <View style={styles.container}>
      <AmbientBackground colors={SLIDES[currentIndex].colors} />
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          scrollEnabled={true}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumScrollEnd}
          renderItem={({ item }) => (
            <View style={{ width }}>
              <IllustrationView emoji={item.illustration} slideId={item.id} />
            </View>
          )}
          style={styles.flatList}
        />

        <View style={styles.bottomCard}>
          <View style={styles.accentHandle} />

          <Animated.Text style={[styles.slideTitle, { opacity: titleOpacity, transform: [{ translateY: titleSlide }] }]}>
            {SLIDES[currentIndex].title}
          </Animated.Text>
          <Animated.Text style={[styles.slideSubtitle, { opacity: subtitleOpacity }]}>
            {SLIDES[currentIndex].subtitle}
          </Animated.Text>

          <View style={styles.dotsRow}>
            {SLIDES.map((_, i) => {
              const isActive = i === currentIndex;
              return (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    isActive ? styles.dotActive : styles.dotInactive,
                  ]}
                />
              );
            })}
          </View>

          <View style={styles.buttonsRow}>
            <TouchableOpacity style={styles.skipButton} onPress={goSkip} activeOpacity={0.7}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.nextButtonWrapper} onPress={goNext} activeOpacity={0.85}>
              <LinearGradient
                colors={[PURPLE, INDIGO]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.nextButton}
              >
                <Text style={styles.nextText}>
                  {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
                </Text>

                {/* Sweeping metallic shimmer overlay */}
                <Animated.View
                  style={[
                    styles.shineOverlay,
                    { transform: [{ translateX: shineX }, { skewX: '-28deg' }] },
                  ]}
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>
            By continuing, you agree to our{' '}
            <Text style={styles.footerLink}>Privacy Policy</Text>
            {' '}&{' '}
            <Text style={styles.footerLink}>Terms of Use</Text>
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070A13',
  },
  safeArea: {
    flex: 1,
  },
  ambientBlob: {
    position: 'absolute',
    opacity: 0.8,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
  flatList: {
    flex: 1,
  },
  illustrationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: height * 0.05,
  },
  illustrationCircle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: CYAN,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
  },
  glowRing: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 1.5,
    borderColor: 'rgba(12, 221, 188, 0.25)',
  },
  glowRingOuter: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.18)',
    borderStyle: 'dashed',
  },
  illustrationEmoji: {
    fontSize: 72,
  },
  floatDot: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: CYAN,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 20,
    height: 50,
  },
  waveBar: {
    width: 4,
    backgroundColor: CYAN,
    borderRadius: 2,
  },
  bottomCard: {
    backgroundColor: 'rgba(10, 15, 28, 0.94)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  accentHandle: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignSelf: 'center',
    marginBottom: 20,
  },
  slideTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 10,
    textAlign: 'left',
  },
  slideSubtitle: {
    fontSize: 14.5,
    color: '#94A3B8',
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 24,
    textAlign: 'left',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 22,
    backgroundColor: CYAN,
    shadowColor: CYAN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  dotInactive: {
    width: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 20,
  },
  skipButton: {
    flex: 1,
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  nextButtonWrapper: {
    flex: 1,
    height: 54,
    position: 'relative',
  },
  nextButton: {
    flex: 1,
    height: '100%',
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden', // Ensures metallic shine doesn't bleed out of button borders
  },
  nextText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  shineOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 65,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  footerLink: {
    color: CYAN,
    fontWeight: '600',
  },
});
