import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, Alert } from 'react-native';
import { Card, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';

export default function AboutScreen() {
  const handleContactSupport = () => {
    const email = 'trellis973@gmail.com';
    const subject = 'Mzansi App Support Request';
    const body = `Hello Mzansi Support Team,

I need assistance with the following:

[Please describe your issue here]

Thank you for your help!`;

    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.canOpenURL(mailtoUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(mailtoUrl);
        } else {
          Alert.alert(
            'Email Not Available',
            `Please contact our support team at: ${email}`,
            [
              {
                text: 'Copy Email',
                onPress: () => {
                  Alert.alert('Support Email', email);
                }
              },
              { text: 'OK' }
            ]
          );
        }
      })
      .catch((err) => {
        Alert.alert(
          'Contact Support',
          `Please email us at: ${email}`,
          [{ text: 'OK' }]
        );
      });
  };

  const handleRateApp = () => {
    Alert.alert(
      'Rate Our App',
      'Thank you for considering rating our app! This feature will be available when the app is published on app stores.',
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.heroCard}>
        <Card.Content>
          <Text style={styles.heroTitle}>Mzansi React</Text>
          <Text style={styles.heroSubtitle}>
            Connecting South African shoppers with local retailers
          </Text>
          <Text style={styles.version}>Version 1.0.0 (Prototype)</Text>
        </Card.Content>
      </Card>

      <Card style={styles.featuresCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>What We Offer</Text>
          
          <View style={styles.featureItem}>
            <Ionicons name="newspaper" size={24} color={COLORS.primary} />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Daily Flyers & Deals</Text>
              <Text style={styles.featureDescription}>
                Browse the latest promotions from your favorite stores
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="storefront" size={24} color={COLORS.primary} />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Multiple Retailers</Text>
              <Text style={styles.featureDescription}>
                Shop from supermarkets, clothing stores, and more in one app
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="bicycle" size={24} color={COLORS.primary} />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Fast Delivery</Text>
              <Text style={styles.featureDescription}>
                Same-day delivery for groceries, 3-7 days for clothing
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="location" size={24} color={COLORS.primary} />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Local Focus</Text>
              <Text style={styles.featureDescription}>
                Supporting South African retailers and communities
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.missionCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.missionText}>
            To bridge the gap between South African consumers and local retailers 
            by providing a unified platform that makes shopping convenient, 
            affordable, and accessible to everyone.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.contactCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Get in Touch</Text>
          <Button
            mode="outlined"
            icon="email"
            onPress={handleContactSupport}
            style={styles.contactButton}
          >
            Contact Support
          </Button>
          <Button
            mode="outlined"
            icon="star"
            onPress={handleRateApp}
            style={styles.contactButton}
          >
            Rate Our App
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  heroCard: {
    marginBottom: 16,
    elevation: 3,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 16,
  },
  version: {
    fontSize: 12,
    color: COLORS.lightGray,
    textAlign: 'center',
  },
  featuresCard: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  featureText: {
    marginLeft: 12,
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
  },
  missionCard: {
    marginBottom: 16,
    elevation: 2,
  },
  missionText: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 22,
    textAlign: 'justify',
  },
  contactCard: {
    marginBottom: 32,
    elevation: 2,
  },
  contactButton: {
    marginBottom: 8,
    borderColor: COLORS.primary,
  },
});
