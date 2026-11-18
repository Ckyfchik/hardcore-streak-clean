import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isAfter, isBefore, startOfDay, getDay, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useHabitStore, calculateBestStreak } from '../../store/useHabitStore';
import { LiquidBackground, GlassCard } from '../../components/LiquidGlass';

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export default function HistoryScreen() {
  const { habits, activeHabitId } = useHabitStore();
  const activeHabit = habits.find((h) => h.id === activeHabitId) || habits;
  if (!activeHabit) return <LiquidBackground><SafeAreaView style={styles.container}><Text style={styles.emptyText}>Нет данных</Text></SafeAreaView></LiquidBackground>;

  const today = startOfDay(new Date());
  const monthStart = startOfMonth(today);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: endOfMonth(today) });
  const firstDayOffset = (getDay(monthStart) + 6) % 7;
  const completedSet = new Set(activeHabit.completedDates);
  const createdDate = startOfDay(parseISO(activeHabit.createdAt));
  const bestStreak = calculateBestStreak(activeHabit.completedDates);

  const getDayStyle = (date: Date) => {
    const str = format(date, 'yyyy-MM-dd');
    if (completedSet.has(str)) return styles.dayDone;
    if (isAfter(date, today) || isBefore(date, createdDate)) return styles.dayFuture;
    if (str === format(today, 'yyyy-MM-dd')) return styles.dayToday;
    return styles.dayMissed;
  };

  return (
    <LiquidBackground>
      <SafeAreaView style={styles.container}>
        <Text style={styles.headerTitle}>{activeHabit.title}</Text>
        <GlassCard style={styles.statCard}>
          <Text style={styles.statLabel}>ЛУЧШИЙ СТРИК ЗА ВСЁ ВРЕМЯ</Text>
          <Text style={styles.statValue}>🔥 {bestStreak} дн.</Text>
        </GlassCard>
        <GlassCard style={styles.calendarCard}>
          <Text style={styles.monthTitle}>{format(today, 'LLLL yyyy', { locale: ru }).toUpperCase()}</Text>
          <View style={styles.weekRow}>
            {WEEKDAYS.map((d) => <Text key={d} style={styles.weekDayText}>{d}</Text>)}
          </View>
          <View style={styles.grid}>
            {Array.from({ length: firstDayOffset }).map((_, i) => <View key={i} style={styles.cell} />)}
            {daysInMonth.map((d) => (
              <View key={d.toISOString()} style={styles.cell}>
                <View style={[styles.dayCircle, getDayStyle(d)]}>
                  <Text style={styles.dayText}>{format(d, 'd')}</Text>
                </View>
              </View>
            ))}
          </View>
        </GlassCard>
      </SafeAreaView>
    </LiquidBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  emptyText: { color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 100 },
  headerTitle: { color: '#FFF', fontSize: 26, fontWeight: '800', marginBottom: 18, marginTop: 8 },
  statCard: { padding: 20, marginBottom: 20 },
  statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },
  statValue: { color: '#FFF', fontSize: 32, fontWeight: '900', marginTop: 6 },
  calendarCard: { padding: 18 },
  monthTitle: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '700', marginBottom: 16 },
  weekRow: { flexDirection: 'row', marginBottom: 10 },
  weekDayText: { flex: 1, textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  dayCircle: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  dayDone: { backgroundColor: 'rgba(52, 199, 89, 0.8)', borderColor: '#6EE7B7' },
  dayMissed: { backgroundColor: 'rgba(255, 59, 48, 0.8)', borderColor: '#FCA5A5' },
  dayFuture: { backgroundColor: 'rgba(255, 255, 255, 0.07)' },
  dayToday: { borderWidth: 2, borderColor: '#FFF', backgroundColor: 'rgba(255, 255, 255, 0.15)' },
  dayText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});
