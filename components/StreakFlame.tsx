import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export function StreakFlame({ streak, isDoneToday }: { streak: number; isDoneToday: boolean }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;
  const isLit = streak > 0 && isDoneToday;
  const isAtRisk = streak > 0 && !isDoneToday;

  useEffect(() => {
    if (isLit) {
      const loop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
            Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(glowAnim, { toValue: 0.85, duration: 1200, useNativeDriver: true }),
            Animated.timing(glowAnim, { toValue: 0.45, duration: 1200, useNativeDriver: true }),
          ]),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulseAnim.setValue(1);
      glowAnim.setValue(0.2);
    }
  }, [isLit]);

  const getColors = (): [string, string] => {
    if (isLit) return ['#FF9500', '#FF2D55'];
    if (isAtRisk) return ['rgba(255, 149, 0, 0.35)', 'rgba(255, 59, 48, 0.25)'];
    return ['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.05)'];
  };

  return (
    <View style={styles.wrapper}>
      {isLit && <Animated.View style={[styles.glow, { opacity: glowAnim, transform: [{ scale: pulseAnim }] }]} />}
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <LinearGradient colors={getColors()} style={styles.badge}>
          <Ionicons name="flame" size={48} color={isLit ? '#FFF' : isAtRisk ? '#FF9F0A' : 'rgba(255,255,255,0.35)'} />
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  glow: { position: 'absolute', width: 110, height: 110, borderRadius: 55, backgroundColor: '#FF6B00' },
  badge: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.3)' },
});
