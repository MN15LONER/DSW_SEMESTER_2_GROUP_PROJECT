import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { firebaseService } from '../services/firebase';
import { notificationService } from '../services/notificationService';
const CustomerChat = ({ route, navigation }) => {
  const { orderId, driverId } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [driverInfo, setDriverInfo] = useState(null);
  const flatListRef = useRef(null);
  useEffect(() => {
    loadMessages();
    loadDriverInfo();
    notificationService.initialize();
    const unsubscribe = firebaseService.chat.listenToMessages(orderId, (newMessages) => {
      setMessages(newMessages);
      const previousMessageCount = messages.length;
      if (newMessages.length > previousMessageCount) {
        const latestMessage = newMessages[newMessages.length - 1];
        if (latestMessage.senderType === 'driver' && latestMessage.senderId !== user.uid) {
          notificationService.sendChatNotification(
            orderId,
            latestMessage.senderName,
            latestMessage.message,
            'driver'
          );
        }
      }
    });
    return unsubscribe;
  }, [orderId, driverId]);
  const loadMessages = async () => {
    try {
      setLoading(true);
      const chatMessages = await firebaseService.chat.getMessages(orderId);
      setMessages(chatMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };
  const loadDriverInfo = async () => {
    try {
      if (driverId) {
        const driver = await firebaseService.drivers.get(driverId);
        setDriverInfo(driver);
      }
    } catch (error) {
      console.error('Error loading driver info:', error);
    }
  };
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const messageData = {
        orderId,
        senderId: user.uid,
        senderName: user.displayName || 'Customer',
        senderType: 'customer',
        message: newMessage.trim(),
        timestamp: new Date(),
        isRead: false
      };
      await firebaseService.chat.sendMessage(messageData);
      setNewMessage('');
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };
  const renderMessage = ({ item: message }) => {
    const isCustomer = message.senderType === 'customer';
    return (
      <View style={[
        styles.messageContainer,
        isCustomer ? styles.customerMessage : styles.driverMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isCustomer ? styles.customerBubble : styles.driverBubble
        ]}>
          <Text style={[
            styles.messageText,
            isCustomer ? styles.customerText : styles.driverText
          ]}>
            {message.message}
          </Text>
          <Text style={[
            styles.messageTime,
            isCustomer ? styles.customerTime : styles.driverTime
          ]}>
            {(() => {
              try {
                const date = message.timestamp?.toDate ? message.timestamp.toDate() : new Date(message.timestamp);
                return date.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                });
              } catch (error) {
                return 'Just now';
              }
            })()}
          </Text>
        </View>
      </View>
    );
  };
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {driverInfo ? `Chat with ${driverInfo.displayName || 'Driver'}` : 
             driverId === 'placeholder' ? 'Chat Support' : 'Order Chat'}
          </Text>
          <Text style={styles.headerSubtitle}>Order #{orderId.slice(-6)}</Text>
        </View>
        <View style={styles.headerRight} />
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubble-outline" size={48} color="#8E8E93" />
            <Text style={styles.emptyStateText}>No messages yet</Text>
            <Text style={styles.emptyStateSubtext}>
              {driverId === 'placeholder' ? 
                'Your order hasn\'t been assigned to a driver yet. You can still send messages that will be visible when a driver is assigned.' :
                'Start a conversation about your order'
              }
            </Text>
          </View>
        }
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !newMessage.trim() && styles.sendButtonDisabled
          ]}
          onPress={sendMessage}
          disabled={!newMessage.trim()}
        >
          <Ionicons 
            name="send" 
            size={20} 
            color={newMessage.trim() ? "#fff" : "#8E8E93"} 
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  headerRight: {
    width: 40,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
  },
  customerMessage: {
    alignItems: 'flex-end',
  },
  driverMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  customerBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  driverBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  customerText: {
    color: '#fff',
  },
  driverText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  customerTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  driverTime: {
    color: '#999',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
});
export default CustomerChat;