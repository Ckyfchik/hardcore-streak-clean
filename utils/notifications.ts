import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false, shouldShowBanner: true, shouldShowList: true,
  }),
});

export async function scheduleDailyReminder(hour: number, minute: number) {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    Alert.alert('Нет доступа', 'Разреши уведомления в настройках телефона!');
    return false;
  }
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Ежедневные напоминания',
      importance: Notifications.AndroidImportance.MAX,
    });
  }
  await Notifications.scheduleNotificationAsync({
    content: { title: '🔥 Стрик под угрозой!', body: 'Отметь выполнение сегодня, иначе огонёк погаснет!' },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
  });
  return true;
}
