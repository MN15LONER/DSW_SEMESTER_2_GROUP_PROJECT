import React, { useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ImageWithFallback = ({ 
  source, 
  style, 
  fallbackIcon = "image-outline",
  fallbackIconSize = 40,
  fallbackIconColor = "#ccc",
  resizeMode = "cover",
  ...props 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  if (imageError || !source?.uri) {
    return (
      <View style={[styles.fallbackContainer, style]}>
        <Ionicons 
          name={fallbackIcon} 
          size={fallbackIconSize} 
          color={fallbackIconColor} 
        />
      </View>
    );
  }

  return (
    <View style={style}>
      <Image
        source={source}
        style={[StyleSheet.absoluteFillObject]}
        resizeMode={resizeMode}
        onError={handleImageError}
        onLoad={handleImageLoad}
        {...props}
      />
      {imageLoading && (
        <View style={[styles.loadingContainer, StyleSheet.absoluteFillObject]}>
          <Ionicons 
            name="hourglass-outline" 
            size={fallbackIconSize * 0.8} 
            color={fallbackIconColor} 
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fallbackContainer: {
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  loadingContainer: {
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ImageWithFallback;
