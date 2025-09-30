module.exports = () => ({
  expo: {
    name: 'Mzansi React',
    slug: 'mzansi-react',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icons/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/images/splash-icon.jpg',
      resizeMode: 'contain',
      backgroundColor: '#1B5E20',
    },
    assetBundlePatterns: ['**/*'],
    ios: { supportsTablet: true },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/icons/adaptive-icon.png',
        backgroundColor: '#1B5E20',
      },
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyCBhYA1g0dEdw6VfjsVKsDUbrhop84MpfY',
        },
      },
    },
    web: { favicon: './assets/icons/favicon.png' },
    extra: {
      eas: { projectId: process.env.EAS_PROJECT_ID },
      googlePlacesApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyCBhYA1g0dEdw6VfjsVKsDUbrhop84MpfY',
      unsplashAccessKey: process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY,
      seedOnStart: process.env.EXPO_PUBLIC_SEED_ON_START,
    },
    runtimeVersion: {
      policy: 'sdkVersion',
    },
  },
});


