import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

// Prevent native splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const Splash = ({ onFinish }: { onFinish: () => void }) => {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Simulate loading time (6 seconds)
        await new Promise(resolve => setTimeout(resolve, 6000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      // Hide the splash screen
      SplashScreen.hideAsync().then(() => {
        // Call the onFinish callback to hide the splash screen component
        setTimeout(onFinish, 500); // Small delay to ensure smooth transition
      });
    }
  }, [appIsReady, onFinish]);

  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/images/splash.png')} 
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.welcomeText}>Welcome to Pay</Text>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  welcomeText: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  image: {
    width: width * 0.7,
    height: height * 0.3,
  },
});

export default Splash;
