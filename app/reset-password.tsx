import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { globalStyles } from './theme';

const handleError = (error: any) => {
  if (error.message.includes('Email not found')) {
    return 'No account found with this email address.';
  }
  return error.message || 'An error occurred. Please try again later.';
};

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReset = async () => {
    try {
      if (!email) {
        Alert.alert('Error', 'Please enter your email address');
        return;
      }

      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'http://localhost:19006/reset-password-complete',
      });

      if (error) {
        Alert.alert('Error', handleError(error));
        throw error;
      }

      Alert.alert(
        'Success',
        'Password reset email sent! Check your inbox and follow the instructions to reset your password.'
      );
      router.replace("/login");
    } catch (error) {
      console.error('Error resetting password:', error);
      Alert.alert('Error', 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.header}>
        <TouchableOpacity onPress={() => router.replace("/login")}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <Text style={globalStyles.title}>Reset Password</Text>

      <TextInput
        style={globalStyles.input}
        placeholder="Email"
        placeholderTextColor="#666"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={[globalStyles.button, loading && { opacity: 0.7 }]}
        onPress={handleReset}
        disabled={loading}
      >
        <Text style={globalStyles.buttonText}>{loading ? 'Sending...' : 'Reset Password'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[globalStyles.button, { backgroundColor: '#000' }]}
        onPress={() => router.replace("/login")}
      >
        <Text style={[globalStyles.buttonText, { color: '#fff' }]}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}
