import React, { useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ImageWithFallback = ({ 
  source, 
  style, 
  loader, // optional async loader: () => Promise<source>
  fallbackIcon = "image-outline",
  fallbackIconSize = 40,
  fallbackIconColor = "#ccc",
  resizeMode = "cover",
  ...props 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [currentSource, setCurrentSource] = useState(source);

  React.useEffect(() => {
    let mounted = true;
    setImageError(false);
    setImageLoading(true);

    if (loader && typeof loader === 'function') {
      (async () => {
        try {
          const loaded = await loader();
          if (!mounted) return;

          if (typeof loaded === 'string') setCurrentSource({ uri: loaded });
          else setCurrentSource(loaded || source);
        } catch (e) {
          if (!mounted) return;

        } finally {
          if (mounted) setImageLoading(false);
        }
      })();
    } else {

      setCurrentSource(source);

      const t = setTimeout(() => setImageLoading(false), 250);
      return () => clearTimeout(t);
    }

    return () => { mounted = false; };
  }, [source, loader]);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const isLocalRequire = typeof currentSource === 'number';
  const hasUri = currentSource && typeof currentSource === 'object' && (currentSource.uri || currentSource.url);

  if (imageError || (!isLocalRequire && !hasUri && !imageLoading)) {
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

  const imageSourceProp = isLocalRequire ? currentSource : (hasUri ? { uri: currentSource.uri || currentSource.url } : undefined);

  return (
    <View style={[style, { position: 'relative', overflow: 'hidden' }]}>
      {imageSourceProp && (
        <Image
          source={imageSourceProp}
          style={[StyleSheet.absoluteFillObject]}
          resizeMode={resizeMode}
          onError={handleImageError}
          onLoad={handleImageLoad}
          {...props}
        />
      )}
      {imageLoading && (
        <View style={[styles.loadingContainer, StyleSheet.absoluteFillObject, { justifyContent: 'center', alignItems: 'center' }]}>
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
