import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { TextInput, Button, Switch, HelperText, Menu, Divider } from 'react-native-paper';
import { COLORS } from '../styles/colors';
import { validators, sanitizers } from '../utils/validation';

export default function AddEditPaymentMethodScreen({ route, navigation }) {
  const { mode, paymentMethod, onSave } = route.params;
  const isEditMode = mode === 'edit';

  const [formData, setFormData] = useState({
    type: '',
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    isDefault: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);

  const cardTypes = ['Visa', 'Mastercard', 'American Express'];

  useEffect(() => {
    if (isEditMode && paymentMethod) {
      setFormData(paymentMethod);
    }
  }, [isEditMode, paymentMethod]);

  const validateCardNumber = (cardNumber) => {
    const cleaned = cardNumber.replace(/\s+/g, '');
    if (!cleaned) return 'Card number is required';
    if (cleaned.length < 13 || cleaned.length > 19) return 'Please enter a valid card number';
    if (!/^\d+$/.test(cleaned)) return 'Card number must contain only digits';
    return null;
  };

  const validateExpiryMonth = (month) => {
    if (!month) return 'Expiry month is required';
    const monthNum = parseInt(month);
    if (monthNum < 1 || monthNum > 12) return 'Please enter a valid month (1-12)';
    return null;
  };

  const validateExpiryYear = (year) => {
    if (!year) return 'Expiry year is required';
    const currentYear = new Date().getFullYear();
    const yearNum = parseInt(year);
    if (yearNum < currentYear || yearNum > currentYear + 20) return 'Please enter a valid year';
    return null;
  };

  const validateCVV = (cvv) => {
    if (!cvv) return 'CVV is required';
    if (cvv.length < 3 || cvv.length > 4) return 'CVV must be 3 or 4 digits';
    if (!/^\d+$/.test(cvv)) return 'CVV must contain only digits';
    return null;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.type.trim()) {
      newErrors.type = 'Card type is required';
    }

    const cardNumberError = validateCardNumber(formData.cardNumber);
    if (cardNumberError) newErrors.cardNumber = cardNumberError;

    const nameError = validators.name(formData.cardholderName);
    if (nameError) newErrors.cardholderName = nameError;

    const monthError = validateExpiryMonth(formData.expiryMonth);
    if (monthError) newErrors.expiryMonth = monthError;

    const yearError = validateExpiryYear(formData.expiryYear);
    if (yearError) newErrors.expiryYear = yearError;

    const cvvError = validateCVV(formData.cvv);
    if (cvvError) newErrors.cvv = cvvError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const sanitizedData = {
        type: sanitizers.text(formData.type),
        cardNumber: formData.cardNumber.replace(/\s+/g, ''), // Remove spaces
        cardholderName: sanitizers.name(formData.cardholderName),
        expiryMonth: formData.expiryMonth.padStart(2, '0'), // Ensure 2 digits
        expiryYear: formData.expiryYear,
        cvv: formData.cvv, // Don't store CVV in production
        isDefault: formData.isDefault,
      };

      onSave(sanitizedData);
      navigation.goBack();
    } catch (error) {
      console.error('Error saving payment method:', error);
      Alert.alert('Error', 'Failed to save payment method. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const formatCardNumber = (value) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');
    // Add spaces every 4 digits
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted;
  };

  const handleCardNumberChange = (value) => {
    const formatted = formatCardNumber(value);
    updateField('cardNumber', formatted);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <Text style={styles.headerText}>
          {isEditMode ? 'Edit your payment method' : 'Add a new payment method'}
        </Text>

        <Menu
          visible={showTypeMenu}
          onDismiss={() => setShowTypeMenu(false)}
          anchor={
            <TextInput
              label="Card Type"
              value={formData.type}
              mode="outlined"
              style={styles.input}
              error={!!errors.type}
              onFocus={() => setShowTypeMenu(true)}
              showSoftInputOnFocus={false}
              right={<TextInput.Icon icon="chevron-down" />}
            />
          }
        >
          {cardTypes.map((type) => (
            <Menu.Item
              key={type}
              onPress={() => {
                updateField('type', type);
                setShowTypeMenu(false);
              }}
              title={type}
            />
          ))}
        </Menu>
        <HelperText type="error" visible={!!errors.type}>
          {errors.type}
        </HelperText>

        <TextInput
          label="Card Number"
          value={formData.cardNumber}
          onChangeText={handleCardNumberChange}
          mode="outlined"
          style={styles.input}
          error={!!errors.cardNumber}
          keyboardType="numeric"
          maxLength={23} // 16 digits + 3 spaces
          placeholder="1234 5678 9012 3456"
        />
        <HelperText type="error" visible={!!errors.cardNumber}>
          {errors.cardNumber}
        </HelperText>

        <TextInput
          label="Cardholder Name"
          value={formData.cardholderName}
          onChangeText={(value) => updateField('cardholderName', value)}
          mode="outlined"
          style={styles.input}
          error={!!errors.cardholderName}
          autoCapitalize="words"
        />
        <HelperText type="error" visible={!!errors.cardholderName}>
          {errors.cardholderName}
        </HelperText>

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <TextInput
              label="Expiry Month"
              value={formData.expiryMonth}
              onChangeText={(value) => updateField('expiryMonth', value)}
              mode="outlined"
              style={styles.input}
              error={!!errors.expiryMonth}
              keyboardType="numeric"
              maxLength={2}
              placeholder="MM"
            />
            <HelperText type="error" visible={!!errors.expiryMonth}>
              {errors.expiryMonth}
            </HelperText>
          </View>

          <View style={styles.halfWidth}>
            <TextInput
              label="Expiry Year"
              value={formData.expiryYear}
              onChangeText={(value) => updateField('expiryYear', value)}
              mode="outlined"
              style={styles.input}
              error={!!errors.expiryYear}
              keyboardType="numeric"
              maxLength={4}
              placeholder="YYYY"
            />
            <HelperText type="error" visible={!!errors.expiryYear}>
              {errors.expiryYear}
            </HelperText>
          </View>
        </View>

        <TextInput
          label="CVV"
          value={formData.cvv}
          onChangeText={(value) => updateField('cvv', value)}
          mode="outlined"
          style={styles.input}
          error={!!errors.cvv}
          keyboardType="numeric"
          maxLength={4}
          secureTextEntry
          placeholder="123"
        />
        <HelperText type="error" visible={!!errors.cvv}>
          {errors.cvv}
        </HelperText>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Set as default payment method</Text>
          <Switch
            value={formData.isDefault}
            onValueChange={(value) => updateField('isDefault', value)}
            color={COLORS.primary}
          />
        </View>

        <View style={styles.securityNote}>
          <Text style={styles.securityText}>
            🔒 Your payment information is encrypted and secure
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.saveButton}
            loading={loading}
            disabled={loading}
          >
            {isEditMode ? 'Update Card' : 'Save Card'}
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  headerText: {
    fontSize: 16,
    color: COLORS.gray,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    marginTop: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  securityNote: {
    backgroundColor: COLORS.lightGray,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  securityText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: COLORS.primary,
  },
});
