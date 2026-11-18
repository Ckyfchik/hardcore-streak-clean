import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, AppState } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useHabitStore, calculateCurrentStreak, getTodayStr } from '../../store/useHabitStore';
import { LiquidBackground, GlassCard, useTimeTheme } from '../../components/LiquidGlass';
import { StreakFlame } from '../../components/StreakFlame';

export default function HomeScreen() {
  const { habits, activeHabitId, setActiveHabit, markTodayDone } = useHabitStore();
  const theme = useTimeTheme();
  const [, setTick] = useState(0);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => { if (state === 'active') setTick((t) => t + 1); });
    return () => sub.remove();
  }, []);

  const activeHabit = habits.find((h) => h.id === activeHabitId) || habits;
  if (!activeHabit) {
    return (
      <LiquidBackground>
        <SafeAreaView style={styles.container}><Text style={styles.emptyText}>Добавь первую привычку в Настройках</Text></SafeAreaView>
      </LiquidBackground>
    );
  }

  const streak = calculateCurrentStreak(activeHabit.completedDates);
  const isDoneToday = activeHabit.completedDates.includes(getTodayStr());

  const handleDone = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    markTodayDone(activeHabit.id);
  };

  const getDaysWord = (n: number) => {
    const mod10 = n % 10, mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return 'день';
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'дня';
    return 'дней';
  };

  return (
    <LiquidBackground>
      <SafeAreaView style={styles.container}>
        {habits.length > 1 ? (
          <View style={styles.switcherWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {habits.map((habit) => {
                const isSelected = habit.id === activeHabit.id;
                const habitStreak = calculateCurrentStreak(habit.completedDates);
                const habitDoneToday = habit.completedDates.includes(getTodayStr());
                return (
                  <TouchableOpacity
                    key={habit.id}
                    onPress={() => { Haptics.selectionAsync(); setActiveHabit(habit.id); }}
                    style={[styles.chip, { backgroundColor: isSelected ? theme.accent : 'rgba(255,255,255,0.08)', borderColor: isSelected ? theme.accent : 'rgba(255,255,255,0.18)' }]}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {habitDoneToday ? '🔥' : '🩶'} {habit.title} ({habitStreak})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ) : <View style={{ height: 20 }} />}

        <GlassCard style={styles.heroCard} intensity={45}>
          <Text style={styles.habitTitle}>{activeHabit.title}</Text>
          <StreakFlame streak={streak} isDoneToday={isDoneToday} />
          <Text style={styles.streakNumber}>{streak}</Text>
          <Text style={styles.streakLabel}>
            {streak === 0 ? 'Серия не начата' : isDoneToday ? `${getDaysWord(streak)} в огне` : `${getDaysWord(streak)} — зажги огонь сегодня!`}
          </Text>
        </GlassCard>

        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={isDoneToday}
            onPress={handleDone}
            style={[styles.doneButton, isDoneToday ? styles.doneButtonDisabled : { backgroundColor: theme.accent, shadowColor: theme.accent }]}
          >
            <Text style={[styles.doneButtonText, isDoneToday && styles.doneButtonTextDisabled]}>
              {isDoneToday ? 'Отмечено сегодня ✓' : 'Сделал'}
            </Text>
          </TouchableOpacity>
          {!isDoneToday && <Text style={styles.warningText}>Пропустишь день — стрик сгорит до 0</Text>}
        </View>
      </SafeAreaView>
    </LiquidBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', padding: 20, paddingBottom: 95 },
  emptyText: { color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 120, fontSize: 16 },
  switcherWrapper: { maxHeight: 46, marginTop: 8 },
  chip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 22, borderWidth: 1, marginRight: 10 },
  chipText: { color: 'rgba(255,255,255,0.75)', fontWeight: '600', fontSize: 14 },
  chipTextActive: { color: '#050814', fontWeight: '800' },
  heroCard: { alignItems: 'center', justifyContent: 'center', paddingVertical: 42, paddingHorizontal: 24 },
  habitTitle: { color: 'rgba(255,255,255,0.85)', fontSize: 20, fontWeight: '600', marginBottom: 16, textAlign: 'center' },
  streakNumber: { color: '#FFFFFF', fontSize: 108, fontWeight: '900', lineHeight: 118, letterSpacing: -2 },
  streakLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 17, fontWeight: '500', marginTop: 4, textAlign: 'center' },
  footer: { marginBottom: 10 },
  doneButton: { paddingVertical: 20, borderRadius: 24, alignItems: 'center', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 6 },
  doneButtonDisabled: { backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', shadowOpacity: 0 },
  doneButtonText: { color: '#050814', fontSize: 20, fontWeight: '800' },
  doneButtonTextDisabled: { color: 'rgba(255,255,255,0.5)' },
  warningText: { color: 'rgba(255,255,255,0.65)', textAlign: 'center', marginTop: 12, fontSize: 13 },
});
