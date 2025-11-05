import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { saveLeaflet } from '../../services/localLeafletsService';
export default function AdminUploadScreen() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState('photo');
  const [notes, setNotes] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [uploading, setUploading] = useState(false);
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissions required', 'Permission to access media library is required.');
        }
      }
    })();
  }, []);
  const pickImage = async () => {
    try {
      const mediaTypesOption =
        ImagePicker && ImagePicker.MediaType && ImagePicker.MediaType.IMAGE
          ? [ImagePicker.MediaType.IMAGE]
          : ImagePicker && ImagePicker.MediaTypeOptions && ImagePicker.MediaTypeOptions.Images
          ? ImagePicker.MediaTypeOptions.Images
          : undefined;
      const pickerOptions = {
        allowsEditing: true,
        quality: 0.8,
      };
      if (mediaTypesOption !== undefined) pickerOptions.mediaTypes = mediaTypesOption;
      const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Image pick error', err);
      Alert.alert('Error', 'Failed to pick image');
    }
  };
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissions required', 'Permission to access camera is required.');
        return;
      }
      const mediaTypesOption =
        ImagePicker && ImagePicker.MediaType && ImagePicker.MediaType.IMAGE
          ? [ImagePicker.MediaType.IMAGE]
          : ImagePicker && ImagePicker.MediaTypeOptions && ImagePicker.MediaTypeOptions.Images
          ? ImagePicker.MediaTypeOptions.Images
          : undefined;
      const cameraOptions = {
        allowsEditing: true,
        quality: 0.8,
      };
      if (mediaTypesOption !== undefined) cameraOptions.mediaTypes = mediaTypesOption;
      const result = await ImagePicker.launchCameraAsync(cameraOptions);
      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Camera error', err);
      Alert.alert('Error', 'Failed to take photo');
    }
  };
  const upload = async () => {
    if (!imageUri) {
      Alert.alert('No image', 'Please select or take a photo first');
      return;
    }
    setUploading(true);
    try {
      const saved = await saveLeaflet({ uri: imageUri, title, notes, docType });
      Alert.alert('Success', 'Leaflet has been posted successfully!');
      setTitle('');
      setDocType('photo');
      setNotes('');
      setImageUri(null);
    } catch (err) {
      console.error('Upload failed', err);
      Alert.alert('Upload failed', err.message || String(err));
    } finally {
      setUploading(false);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Title</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Short title" />
      <Text style={styles.label}>Type</Text>
      <TextInput style={styles.input} value={docType} onChangeText={setDocType} placeholder="photo / receipt / id" />
      <Text style={styles.label}>Notes</Text>
      <TextInput style={[styles.input, { height: 80 }]} value={notes} onChangeText={setNotes} placeholder="Optional notes" multiline />
      <View style={styles.imageRow}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.preview} />
        ) : (
          <View style={styles.previewPlaceholder}><Text>No image selected</Text></View>
        )}
      </View>
      <View style={styles.buttonsRow}>
        <TouchableOpacity style={styles.btn} onPress={pickImage}><Text style={styles.btnText}>Pick Image</Text></TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={takePhoto}><Text style={styles.btnText}>Take Photo</Text></TouchableOpacity>
      </View>
      <TouchableOpacity style={[styles.uploadBtn, uploading && { opacity: 0.7 }]} onPress={upload} disabled={uploading}>
        {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.uploadText}>Upload</Text>}
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  label: { fontSize: 14, color: '#444', marginTop: 8, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, backgroundColor: '#fafafa' },
  imageRow: { marginTop: 12, alignItems: 'center', justifyContent: 'center' },
  preview: { width: 240, height: 160, borderRadius: 8 },
  previewPlaceholder: { width: 240, height: 160, borderRadius: 8, backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' },
  buttonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  btn: { flex: 1, padding: 12, marginHorizontal: 6, backgroundColor: '#007AFF', borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600' },
  uploadBtn: { marginTop: 20, padding: 14, backgroundColor: '#28A745', borderRadius: 8, alignItems: 'center' },
  uploadText: { color: '#fff', fontWeight: '700' },
});