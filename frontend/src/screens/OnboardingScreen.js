import React, { useRef, useState } from 'react';
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

const SLIDES = [
  {
    id: '1',
    title: 'Smart Voice Assistant',
    subtitle: 'Experience the power of advance AI at your command.',
    illustration: '🎙️',
    colors: ['#EBF4FF', '#D6EAFF', '#C2DDFF'],
  },
  {
    id: '2',
    title: 'Boost Your Productivity',
    subtitle: 'Manage your schedule and task hands-free with intelligent curation tailored to workflow.',
    illustration: '⚡',
    colors: ['#EBF4FF', '#D6EAFF', '#C2DDFF'],
  },
  {
    id: '3',
    title: 'Connect Your Work Tools',
    subtitle: 'Seamlessly integrate with Slack, Teams and more to centralize your productivity.',
    illustration: '🔗',
    colors: ['#EBF4FF', '#D6EAFF', '#C2DDFF'],
  },
];

function IllustrationView({ emoji }) {
  const float = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: -18, duration: 2200, useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.illustrationContainer}>
      <Animated.View style={[styles.illustrationCircle, { transform: [{ translateY: float }] }]}>
        {/* Glowing backdrop */}
        <View style={styles.glowRing} />
        <Text style={styles.illustrationEmoji}>{emoji}</Text>
      </Animated.View>
      {/* Floating dots */}
      <View style={[styles.floatDot, { top: '20%', left: '15%', width: 8, height: 8, opacity: 0.3 }]} />
      <View style={[styles.floatDot, { top: '30%', right: '12%', width: 6, height: 6, opacity: 0.2 }]} />
      <View style={[styles.floatDot, { bottom: '25%', left: '20%', width: 10, height: 10, opacity: 0.15 }]} />
    </View>
  );
}

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

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
    setCurrentIndex(idx);
  };

  return (
    <LinearGradient colors={SLIDES[currentIndex].colors} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        {/* Illustration Area */}
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumScrollEnd}
          renderItem={({ item }) => (
            <View style={{ width }}>
              <IllustrationView emoji={item.illustration} />
            </View>
          )}
          style={styles.flatList}
        />

        {/* Bottom Card */}
        <View style={styles.bottomCard}>
          {/* Text Content */}
          <Text style={styles.slideTitle}>{SLIDES[currentIndex].title}</Text>
          <Text style={styles.slideSubtitle}>{SLIDES[currentIndex].subtitle}</Text>

          {/* Progress Dots */}
          <View style={styles.dotsRow}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === currentIndex ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>

          {/* Buttons */}
          <View style={styles.buttonsRow}>
            <TouchableOpacity style={styles.skipButton} onPress={goSkip} activeOpacity={0.7}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextButton} onPress={goNext} activeOpacity={0.85}>
              <Text style={styles.nextText}>
                {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <Text style={styles.footer}>
            By Continuing , your agree to our{' '}
            <Text style={styles.footerLink}>Privacy Policy</Text>
            {' '}& {' '}
            <Text style={styles.footerLink}>Term Of Use</Text>
          </Text>
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
  flatList: {
    flex: 1,
  },
  illustrationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  illustrationCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: 'rgba(37, 99, 235, 0.15)',
  },
  illustrationEmoji: {
    fontSize: 80,
  },
  floatDot: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: BLUE,
  },
  bottomCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 10,
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
    marginBottom: 10,
  },
  slideSubtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 21,
    fontWeight: '400',
    marginBottom: 20,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 6,
  },
  dot: {
    height: 5,
    borderRadius: 3,
  },
  dotActive: {
    width: 24,
    backgroundColor: BLUE,
  },
  dotInactive: {
    width: 8,
    backgroundColor: '#CBD5E1',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 18,
  },
  skipButton: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  nextButton: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    backgroundColor: BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  nextText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
  },
  footerLink: {
    color: '#2563EB',
    fontWeight: '500',
  },
});
