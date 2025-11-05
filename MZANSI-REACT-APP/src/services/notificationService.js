import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const NOTIFICATIONS_STORAGE_KEY = 'user_notifications';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  constructor() {
    this.isInitialized = false;
    this.currentUserId = null;
  }

  async initialize(userId) {
    if (this.isInitialized && this.currentUserId === userId) return;

    try {
      this.currentUserId = userId;

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted');
        return false;
      }

      // Set up notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      this.isInitialized = true;
      console.log('Notification service initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      return false;
    }
  }

  async sendLocalNotification(title, body, data = {}) {
    try {
      const notificationId = Date.now().toString();

      // Schedule the notification
      const notificationIdFromExpo = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { ...data, notificationId },
          sound: 'default',
        },
        trigger: null, // Send immediately
      });

      // Store notification in AsyncStorage for the notifications screen
      if (this.currentUserId) {
        const storedNotifications = await this.getStoredNotifications();
        const newNotification = {
          id: notificationId,
          expoId: notificationIdFromExpo,
          request: {
            content: {
              title,
              body,
              data: { ...data, notificationId }
            }
          },
          timestamp: new Date().toISOString(),
          read: false
        };

        storedNotifications.push(newNotification);
        await AsyncStorage.setItem(
          `${NOTIFICATIONS_STORAGE_KEY}_${this.currentUserId}`,
          JSON.stringify(storedNotifications)
        );
      }

      return notificationId;
    } catch (error) {
      console.error('Failed to send local notification:', error);
      return null;
    }
  }

  async getStoredNotifications() {
    try {
      if (!this.currentUserId) return [];

      const stored = await AsyncStorage.getItem(`${NOTIFICATIONS_STORAGE_KEY}_${this.currentUserId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting stored notifications:', error);
      return [];
    }
  }

  async markNotificationAsRead(notificationId) {
    try {
      if (!this.currentUserId) return;

      const storedNotifications = await this.getStoredNotifications();
      const updatedNotifications = storedNotifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      );

      await AsyncStorage.setItem(
        `${NOTIFICATIONS_STORAGE_KEY}_${this.currentUserId}`,
        JSON.stringify(updatedNotifications)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async clearAllNotifications() {
    try {
      if (!this.currentUserId) return;

      await AsyncStorage.removeItem(`${NOTIFICATIONS_STORAGE_KEY}_${this.currentUserId}`);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  async sendChatNotification(orderId, senderName, message, senderType) {
    const title = senderType === 'driver' ? 'New Message from Driver' : 'New Message from Customer';
    const body = `${senderName}: ${message.length > 50 ? message.substring(0, 50) + '...' : message}`;

    return await this.sendLocalNotification(title, body, {
      type: 'chat_message',
      orderId,
      senderType,
    });
  }

  async sendOrderStatusNotification(orderId, status, driverName = null) {
    let title = 'Order Update';
    let body = '';

    switch (status) {
      case 'assigned':
        title = 'Driver Assigned';
        body = `A driver has been assigned to your order #${orderId.slice(-6)}`;
        break;
      case 'accepted':
        title = 'Order Accepted';
        body = `Your order #${orderId.slice(-6)} has been accepted by ${driverName || 'the driver'}`;
        break;
      case 'in_transit':
        title = 'Order In Transit';
        body = `Your order #${orderId.slice(-6)} is on the way!`;
        break;
      case 'delivered':
        title = 'Order Delivered';
        body = `Your order #${orderId.slice(-6)} has been delivered successfully!`;
        break;
      case 'rejected':
        title = 'Order Update';
        body = `Unfortunately, your order #${orderId.slice(-6)} could not be fulfilled`;
        break;
      default:
        body = `Your order #${orderId.slice(-6)} status has been updated to ${status}`;
    }

    return await this.sendLocalNotification(title, body, {
      type: 'order_status',
      orderId,
      status,
    });
  }

  // Listen for incoming notifications
  setNotificationListener(callback) {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      callback(notification);
    });

    return subscription;
  }

  // Listen for notification responses (when user taps notification)
  setNotificationResponseListener(callback) {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      callback(response);
    });

    return subscription;
  }

  // Get the current notification token (for push notifications)
  async getExpoPushToken() {
    try {
      const token = await Notifications.getExpoPushTokenAsync();
      return token.data;
    } catch (error) {
      console.error('Failed to get push token:', error);
      return null;
    }
  }

  // Cancel all scheduled notifications
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to cancel notifications:', error);
    }
  }
}

export const notificationService = new NotificationService();
