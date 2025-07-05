import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { supabase } from "../lib/supabase";
import { User } from "@supabase/supabase-js";
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from '../lib/AuthContext';

import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
});

function InitialLoading() {
  return (
    <View style={styles.loadingContainer}>
      <StatusBar style="light" />
      <ActivityIndicator size="large" color="#00FF00" />
    </View>
  );
}

function AuthLayout() {
  const { user, initialized } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Small delay to prevent flash of unauthorized content
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!initialized || !isReady) return;

    const inAuthScreen = ['login', 'signup', 'reset-password', 'welcome'].includes(segments[0]);
    const inProtectedScreen = !['profile', ...(inAuthScreen ? [] : [])].includes(segments[0]);

    if (!user) {
      // If not logged in, always go to welcome screen
      if (!inAuthScreen) {
        router.replace('/welcome');
      }
    } else if (inAuthScreen) {
      // If logged in and on auth screen, go to tabs
      router.replace('/(tabs)');
    }
  }, [user, initialized, segments, isReady, router]);

  // Show loading screen while initializing
  if (!initialized || !isReady) {
    return <InitialLoading />;
  }

  return (
    <Stack screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: '#000000' },
      animation: 'fade',
    }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen
        name="profile"
        options={{
          presentation: 'modal',
          headerShown: true,
          headerTitle: 'Profile',
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <AuthLayout />
    </AuthProvider>
  );
}