import React, { useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker"; // dropdown
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import { storage } from "./firebaseConfig"; // your firebase setup
import * as FileSystem from "expo-file-system";

export default function App() {
  const [images, setImages] = useState([null, null, null, null]);
  const [selectedDB, setSelectedDB] = useState("gauteng"); // default database

  // Pick image from gallery
  const pickImage = async (index) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const newImages = [...images];
      newImages[index] = result.assets[0].uri;
      setImages(newImages);
    }
  };

  // Take photo with camera
  const takePhoto = async (index) => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      cameraType: ImagePicker.CameraType.back,
      quality: 1,
    });

    if (!result.canceled) {
      const newImages = [...images];
      newImages[index] = result.assets[0].uri;
      setImages(newImages);
    }
  };

  // Delete image
  const deleteImage = (index) => {
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);
  };

  // Upload all images to Firebase
  const uploadImages = async () => {
    try {
      for (let i = 0; i < images.length; i++) {
        if (images[i]) {
          const fileUri = images[i];
          const fileName = `image_${Date.now()}_${i}.jpg`;

          // Convert local file to blob
          const response = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          const blob = new Blob([Uint8Array.from(atob(response), c => c.charCodeAt(0))]);

          // Upload to selected Firebase "folder"
          const storageRef = ref(storage, `${selectedDB}/${fileName}`);
          await uploadBytes(storageRef, blob);

          const downloadURL = await getDownloadURL(storageRef);
          console.log(`Uploaded to ${selectedDB}: ${downloadURL}`);
        }
      }
      Alert.alert("✅ Success", `Images uploaded to ${selectedDB} database`);
    } catch (error) {
      console.error(error);
      Alert.alert("❌ Upload failed", error.message);
    }
  };

  // Render one slot
  const renderSlot = (image, index) => (
    <View key={index} style={styles.slot}>
      {image ? (
        <>
          <Image source={{ uri: image }} style={styles.image} />
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => deleteImage(index)}
          >
            <Ionicons name="close-circle" size={28} color="red" />
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.emptySlot}>
          <TouchableOpacity onPress={() => pickImage(index)}>
            <Ionicons name="images-outline" size={40} color="#888" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => takePhoto(index)}>
            <Ionicons name="camera-outline" size={40} color="#888" />
          </TouchableOpacity>
          <Text style={styles.addText}>Add</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Your Pictures</Text>

      {/* Dropdown for database selection */}
      <Picker
        selectedValue={selectedDB}
        onValueChange={(itemValue) => setSelectedDB(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Gauteng Special" value="gauteng" />
        <Picker.Item label="Capetown Special" value="capetown" />
        <Picker.Item label="KZN Special" value="kzn" />
      </Picker>

      {/* Image slots */}
      <View style={styles.row}>{images.map((img, i) => renderSlot(img, i))}</View>

      {/* Upload button */}
      <TouchableOpacity style={styles.uploadBtn} onPress={uploadImages}>
        <Text style={styles.uploadText}>Upload to {selectedDB}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    paddingBottom: 30,
  },
  title: {
    position: "absolute",
    top: 50,
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  picker: {
    width: "80%",
    height: 50,
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "95%",
    marginBottom: 20,
  },
  slot: {
    width: 80,
    height: 80,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  emptySlot: {
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  deleteBtn: {
    position: "absolute",
    top: -8,
    right: -8,
  },
  addText: {
    fontSize: 12,
    color: "#555",
    marginTop: 5,
  },
  uploadBtn: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  uploadText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
