import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { storage, db } from '../../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function AdminUploadScreen() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState('photo');
  const [notes, setNotes] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Request permissions on mount
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
      // Backwards-compatible mediaTypes selection. Newer versions expose ImagePicker.MediaType
      // older versions use ImagePicker.MediaTypeOptions. If neither exists we omit the option.
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
      // Reuse same backwards-compatible mediaTypes logic as picker
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
      const timestamp = Date.now();
      const storagePath = `admin_docs/${timestamp}.jpg`;

      // Convert to blob via fetch
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Helper that uploads and returns the download URL, with detailed error logging
      const uploadImage = async (uri, path) => {
        const response = await fetch(uri);
        const blob = await response.blob();
        const storageRef = ref(storage, path);

        try {
          const snapshot = await uploadBytes(storageRef, blob);
          console.log('uploadBytes snapshot:', snapshot);
          const downloadURL = await getDownloadURL(snapshot.ref);
          console.log('downloadURL:', downloadURL);
          return { snapshot, downloadURL };
        } catch (error) {
          console.error('Upload failed:', error);
          console.error('Error code:', error?.code);
          console.error('Error message:', error?.message);
          if (error?.serverResponse) {
            console.error('Server response:', error.serverResponse);
          }
          console.error('Full error object:', error);
          Alert.alert('Upload failed', `${error.code || 'unknown'} - ${error.message || String(error)}`);
          throw error;
        }
      };

      // Perform upload and get download URL
      const { downloadURL: imageUrl } = await uploadImage(imageUri, storagePath).then(res => ({ downloadURL: res.downloadURL || res.downloadURL }));

      // Write Firestore doc with error logging
      let docRef;
      try {
        docRef = await addDoc(collection(db, 'admin_docs'), {
          title: title || null,
          docType: docType || null,
          imageUrl,
          storagePath,
          createdBy: user?.uid || null,
          createdAt: serverTimestamp(),
          notes: notes || null,
        });
      } catch (error) {
        console.error('Firestore addDoc failed:', error);
        console.error('Error code:', error?.code);
        console.error('Error message:', error?.message);
        console.error('Full error object:', error);
        throw error;
      }

      Alert.alert('Upload successful', `Document uploaded (id: ${docRef.id})`);
      // clear form
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
