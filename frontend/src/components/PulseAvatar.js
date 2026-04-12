import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Image } from 'react-native';
import { Theme } from '../constants/Theme';

export default function PulseAvatar({ avatarUrl, isActive }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim, { toValue: 1.2, duration: 1500, useNativeDriver: true }),
            Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(opacityAnim, { toValue: 0.1, duration: 1500, useNativeDriver: true }),
            Animated.timing(opacityAnim, { toValue: 0.4, duration: 1500, useNativeDriver: true }),
          ]),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      opacityAnim.setValue(0.2);
    }
  }, [isActive]);

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.pulse, 
          { 
            transform: [{ scale: pulseAnim }], 
            opacity: opacityAnim,
            backgroundColor: Theme.colors.primary 
          }
        ]} 
      />
      <View style={styles.avatarWrapper}>
        <Image 
          source={{ uri: avatarUrl || 'https://via.placeholder.com/150' }} 
          style={styles.avatar} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
  },
  pulse: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    ...Theme.shadows.medium,
    padding: 3,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
});
