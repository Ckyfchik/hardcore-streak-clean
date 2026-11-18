import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useHabitStore } from '../../store/useHabitStore';
import { scheduleDailyReminder } from '../../utils/notifications';
import { LiquidBackground, GlassCard, useTimeTheme } from '../../components/LiquidGlass';

export default function SettingsScreen() {
  const { habits, addHabit, deleteHabit, reminderTime, setReminderTime } = useHabitStore();
  const [newTitle, setNewTitle] = useState('');
  const theme = useTimeTheme();

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addHabit(newTitle);
    setNewTitle('');
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert('Удалить привычку?', `Прогресс по «${title}» будет стёрт.`, [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: () => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); deleteHabit(id); } },
    ]);
  };

  const changeTime = async (dH: number, dM: number) => {
    const h = ((reminderTime?.hour ?? 20) + dH + 24) % 24;
    const m = ((reminderTime?.minute ?? 0) + dM + 60) % 60;
    if (await scheduleDailyReminder(h, m)) { Haptics.selectionAsync(); setReminderTime({ hour: h, minute: m }); }
  };

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <LiquidBackground>
      <SafeAreaView style={styles.container}>
        <Text style={styles.sectionTitle}>ЕЖЕДНЕВНОЕ НАПОМИНАНИЕ</Text>
        <GlassCard style={styles.timeCard}>
          <View style={styles.timeControls}>
            <TouchableOpacity onPress={() => changeTime(-1, 0)} style={styles.timeBtn}><Text style={styles.timeBtnText}>-1ч</Text></TouchableOpacity>
            <Text style={styles.timeDisplay}>{pad(reminderTime?.hour ?? 20)}:{pad(reminderTime?.minute ?? 0)}</Text>
            <TouchableOpacity onPress={() => changeTime(1, 0)} style={styles.timeBtn}><Text style={styles.timeBtnText}>+1ч</Text></TouchableOpacity>
          </View>
          <View style={styles.minuteRow}>
            <TouchableOpacity onPress={() => changeTime(0, -15)} style={styles.smallBtn}><Text style={styles.smallBtnText}>-15 мин</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => changeTime(0, 15)} style={styles.smallBtn}><Text style={styles.smallBtnText}>+15 мин</Text></TouchableOpacity>
          </View>
        </GlassCard>

        <Text style={styles.sectionTitle}>МОИ ПРИВЫЧКИ</Text>
        <View style={styles.inputRow}>
          <TextInput value={newTitle} onChangeText={setNewTitle} placeholder="Новая привычка..." placeholderTextColor="rgba(255,255,255,0.45)" style={styles.input} />
          <TouchableOpacity onPress={handleAdd} style={[styles.addBtn, { backgroundColor: theme.accent }]}><Text style={styles.addBtnText}>+</Text></TouchableOpacity>
        </View>

        <FlatList
          data={habits}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <GlassCard style={styles.habitRow}>
              <Text style={styles.habitName}>{item.title}</Text>
              <TouchableOpacity onPress={() => handleDelete(item.id, item.title)}><Text style={styles.deleteText}>Удалить</Text></TouchableOpacity>
            </GlassCard>
          )}
        />
      </SafeAreaView>
    </LiquidBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  sectionTitle: { color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: '700', letterSpacing: 1.2, marginBottom: 12, marginTop: 10 },
  timeCard: { padding: 20, marginBottom: 24 },
  timeControls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timeDisplay: { color: '#FFF', fontSize: 42, fontWeight: '900' },
  timeBtn: { backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14 },
  timeBtnText: { color: '#FFF', fontWeight: '700' },
  minuteRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 14 },
  smallBtn: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
  smallBtnText: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600' },
  inputRow: { flexDirection: 'row', marginBottom: 16, gap: 10 },
  input: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', color: '#FFF', paddingHorizontal: 16, borderRadius: 16, height: 52, fontSize: 16 },
  addBtn: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: '#050814', fontSize: 28, fontWeight: '800' },
  habitRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, marginBottom: 10, borderRadius: 20 },
  habitName: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  deleteText: { color: '#FF453A', fontWeight: '700' },
});
