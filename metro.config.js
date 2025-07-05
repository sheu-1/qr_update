// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add stream and crypto support for Supabase/ws
config.resolver.extraNodeModules = {
  stream: require.resolve('readable-stream'),
  crypto: require.resolve('react-native-quick-crypto'),
  ...config.resolver.extraNodeModules, // Keep existing modules
};

module.exports = config;