import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { TextInput, Button, Switch, HelperText } from 'react-native-paper';
import { COLORS } from '../styles/colors';
import { validators, sanitizers } from '../utils/validation';
import AddressLocationPicker from '../components/common/AddressLocationPicker';
import AddressMapPreview from '../components/common/AddressMapPreview';
import { logError } from '../utils/errorLogger';
import { firebaseService } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddEditAddressScreen({ route, navigation }) {
  const { mode, address } = route.params;
  const { user } = useAuth();
  const { updateLocation, updateUserLocation } = useLocation();
  const isEditMode = mode === 'edit';
  const insets = useSafeAreaInsets();

  const [formData, setFormData] = useState({
    title: '',
    street: '',
    city: '',
    province: '',
    postalCode: '',
    phone: '',
    isDefault: false,
    latitude: null,
    longitude: null,
    formattedAddress: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const addressPickerRef = useRef(null);
  const [pickerSignal, setPickerSignal] = useState(0);

  useEffect(() => {
    if (isEditMode && address) {
      setFormData(address);
    }
  }, [isEditMode, address]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Address title is required';
    }

    if (!formData.street.trim()) {
      newErrors.street = 'Street address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.province.trim()) {
      newErrors.province = 'Province is required';
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    } else {
      const postalError = validators.postalCode(formData.postalCode);
      if (postalError) newErrors.postalCode = postalError;
    }

    if (formData.phone) {
      const phoneError = validators.phone(formData.phone);
      if (phoneError) newErrors.phone = phoneError;
    }

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
        title: sanitizers.text(formData.title),
        street: sanitizers.address(formData.street),
        city: sanitizers.text(formData.city),
        province: sanitizers.text(formData.province),
        postalCode: sanitizers.postalCode(formData.postalCode),
        phone: formData.phone ? sanitizers.phone(formData.phone) : '',
        isDefault: formData.isDefault,
        latitude: formData.latitude,
        longitude: formData.longitude,
        formattedAddress: formData.formattedAddress,
      };

      if (isEditMode && address?.id) {
        await firebaseService.addresses.update(address.id, sanitizedData);
      } else {
        await firebaseService.addresses.create(user.uid, sanitizedData);
      }

      if (sanitizedData.isDefault) {
        const defaultToCache = {
          ...sanitizedData,
          id: address?.id || null
        };
        try {
          await AsyncStorage.setItem(`default_address_${user.uid}`, JSON.stringify(defaultToCache));
        } catch (e) {
          console.error('Error caching default address after save:', e);
        }

        const formatted = defaultToCache.formattedAddress || [defaultToCache.street, defaultToCache.city, defaultToCache.province].filter(Boolean).join(', ');
        if (updateLocation) updateLocation(formatted);
        if (updateUserLocation && defaultToCache.latitude && defaultToCache.longitude) updateUserLocation({ latitude: defaultToCache.latitude, longitude: defaultToCache.longitude });
      }

      navigation.goBack();
    } catch (error) {
      logError('AddEditAddressScreen - Error saving address', error);
      Alert.alert('Error', 'Failed to save address. Please try again.');
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

  const provinces = [
    'Eastern Cape',
    'Free State',
    'Gauteng',
    'KwaZulu-Natal',
    'Limpopo',
    'Mpumalanga',
    'Northern Cape',
    'North West',
    'Western Cape'
  ];

  const scrollStyle = [styles.scrollContainer, { paddingBottom: 20 }]; // Reduced padding since buttons are now below

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={scrollStyle}>
        <Text style={styles.headerText}>
          {isEditMode ? 'Edit your delivery address' : 'Add a new delivery address'}
        </Text>

        <TextInput
          label="Address Title (e.g., Home, Work)"
          value={formData.title}
          onChangeText={(value) => updateField('title', value)}
          mode="outlined"
          style={styles.input}
          error={!!errors.title}
        />
        <HelperText type="error" visible={!!errors.title}>
          {errors.title}
        </HelperText>

        <TextInput
          label="Street Address"
          value={formData.street}
          onChangeText={(value) => updateField('street', value)}
          mode="outlined"
          style={styles.input}
          error={!!errors.street}
          multiline
        />
        <HelperText type="error" visible={!!errors.street}>
          {errors.street}
        </HelperText>

        <TextInput
          label="City"
          value={formData.city}
          onChangeText={(value) => updateField('city', value)}
          mode="outlined"
          style={styles.input}
          error={!!errors.city}
        />
        <HelperText type="error" visible={!!errors.city}>
          {errors.city}
        </HelperText>

        <TextInput
          label="Province"
          value={formData.province}
          onChangeText={(value) => updateField('province', value)}
          mode="outlined"
          style={styles.input}
          error={!!errors.province}
          placeholder="e.g., Gauteng, Western Cape"
        />
        <HelperText type="error" visible={!!errors.province}>
          {errors.province}
        </HelperText>

        <TextInput
          label="Postal Code"
          value={formData.postalCode}
          onChangeText={(value) => updateField('postalCode', value)}
          mode="outlined"
          style={styles.input}
          error={!!errors.postalCode}
          keyboardType="numeric"
          maxLength={4}
        />
        <HelperText type="error" visible={!!errors.postalCode}>
          {errors.postalCode}
        </HelperText>

        <TextInput
          label="Phone Number (Optional)"
          value={formData.phone}
          onChangeText={(value) => updateField('phone', value)}
          mode="outlined"
          style={styles.input}
          error={!!errors.phone}
          keyboardType="phone-pad"
          placeholder="e.g., 0123456789"
        />
        <HelperText type="error" visible={!!errors.phone}>
          {errors.phone}
        </HelperText>

        {}
        <AddressLocationPicker
          onAddressSelect={(addressData) => {
            setFormData(prev => ({
              ...prev,
              street: addressData.street,
              city: addressData.city,
              province: addressData.province,
              postalCode: addressData.postalCode,
              latitude: addressData.latitude,
              longitude: addressData.longitude,
              formattedAddress: addressData.formattedAddress,
            }));
          }}
          currentAddress={formData.formattedAddress}
          ref={addressPickerRef}
          pickerSignal={pickerSignal}
        />

        {}
        <AddressMapPreview
          address={formData}
          onEdit={() => {

            if (addressPickerRef.current && addressPickerRef.current.open) {
              addressPickerRef.current.open();
            } else {
              setPickerSignal(s => s + 1);
            }

            setPickerSignal(s => s + 1);
          }}
        />

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Set as default address</Text>
          <Switch
            value={formData.isDefault}
            onValueChange={(value) => updateField('isDefault', value)}
            color={COLORS.primary}
          />
        </View>
      </ScrollView>

      <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + 12, paddingHorizontal: 16 }]}>
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
          {isEditMode ? 'Update Address' : 'Save Address'}
        </Button>
      </View>
    </SafeAreaView>
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
    paddingBottom: 72, // extra space so buttons sit higher and are not hidden by keyboard
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12, // move buttons slightly upward
    marginBottom: 12,
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
