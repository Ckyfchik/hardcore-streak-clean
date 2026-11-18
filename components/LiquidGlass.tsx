import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { getTimeTheme, TimeTheme } from '../constants/timeTheme';

export function useTimeTheme(): TimeTheme {
  const [theme, setTheme] = useState<TimeTheme>(() => getTimeTheme());
  useEffect(() => {
    const interval = setInterval(() => setTheme(getTimeTheme()), 60000);
    return () => clearInterval(interval);
  }, []);
  return theme;
}

export function LiquidBackground({ children }: { children: React.ReactNode }) {
  const theme = useTimeTheme();
  return (
    <LinearGradient colors={theme.bgGradient} style={styles.container}>
      <View style={[styles.orbTop, { backgroundColor: theme.orbPrimary }]} />
      <View style={[styles.orbBottom, { backgroundColor: theme.orbSecondary }]} />
      {children}
    </LinearGradient>
  );
}

export function GlassCard({ children, style, intensity = 35 }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; intensity?: number }) {
  const theme = useTimeTheme();
  return (
    <View style={[styles.glassWrapper, { borderColor: theme.glassBorder, backgroundColor: theme.glassBg }, style]}>
      <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  orbTop: { position: 'absolute', top: -60, right: -40, width: 280, height: 280, borderRadius: 140 },
  orbBottom: { position: 'absolute', bottom: 40, left: -70, width: 320, height: 320, borderRadius: 160 },
  glassWrapper: { overflow: 'hidden', borderWidth: 1, borderRadius: 28 },
});
