import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  ViewStyle,
  TextStyle 
} from 'react-native';
import { Stack } from 'expo-router';
import QRCodeSVG from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { decode } from 'base64-arraybuffer';
import { colors, spacing, typography } from '../../theme';

export default function GenerateScreen() {
  const [accountNumber, setAccountNumber] = useState('');
  const [qrCodeId, setQrCodeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const qrCodeRef = useRef<any>(null);

  const generateAndUploadQRCode = async () => {
    if (!accountNumber) {
      Alert.alert('Error', 'Please enter an account number.');
      return;
    }

    setLoading(true);
    setQrCodeId(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // 1. Insert data and get the new record's ID
      const { data: newQrCode, error: insertError } = await supabase
        .from('qr_codes')
        .insert({ account_number: accountNumber, user_id: user.id })
        .select()
        .single();

      if (insertError) throw insertError;
      if (!newQrCode) throw new Error('Failed to create QR code record.');

      // Set the ID in state to render the QR code component
      setQrCodeId(newQrCode.id);

      // Use a timeout to allow the QR code to render before we grab the image data
      setTimeout(() => {
        if (qrCodeRef.current) {
          qrCodeRef.current.toDataURL(async (dataURL: string) => {
            try {
              const base64Data = dataURL.replace('data:image/png;base64,', '');
              const filePath = `${user.id}/${newQrCode.id}.png`;

              // 2. Upload the image to Supabase Storage
              const { error: uploadError } = await supabase.storage
                .from('qr-images')
                .upload(filePath, decode(base64Data), { contentType: 'image/png' });

              if (uploadError) throw uploadError;

              // 3. Get the public URL of the uploaded image
              const { data: { publicUrl } } = supabase.storage
                .from('qr-images')
                .getPublicUrl(filePath);

              // 4. Update the database record with the image URL
              const { error: updateError } = await supabase
                .from('qr_codes')
                .update({ image_url: publicUrl })
                .eq('id', newQrCode.id);

              if (updateError) throw updateError;

              Alert.alert('Success', 'QR Code generated and saved!');
            } catch (error: any) {
              console.error('Error saving QR image:', error);
              Alert.alert('Error', 'Failed to save QR code image.');
            } finally {
              setLoading(false);
            }
          });
        }
      }, 200);

    } catch (error: any) {
      console.error('Error generating QR code:', error);
      Alert.alert('Error', `Failed to generate QR code: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{
        title: 'Generate QR Code',
        headerStyle: {
          backgroundColor: colors.darkGray,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          ...typography.h2,
          color: colors.white,
        },
      }} />

      <View style={styles.content}>
        <Text style={styles.label}>Enter Account Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your account number"
          placeholderTextColor={colors.textSecondary}
          value={accountNumber}
          onChangeText={setAccountNumber}
          keyboardType="numeric"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={generateAndUploadQRCode}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <View style={styles.buttonContent}>
              <Ionicons name="qr-code-outline" size={20} style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Generate & Save QR Code</Text>
            </View>
          )}
        </TouchableOpacity>

        {qrCodeId && (
          <View style={styles.qrContainer}>
            <View style={styles.qrCodeWrapper}>
              <QRCodeSVG
                getRef={(node) => {
                  if (node) {
                    (qrCodeRef as React.MutableRefObject<any>).current = node;
                  }
                }}
                value={qrCodeId}
                size={200}
                color={colors.black}
                backgroundColor={colors.white}
              />
            </View>
            <Text style={styles.successText}>QR Code Generated Successfully!</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  } as ViewStyle,
  content: {
    flex: 1,
    padding: spacing.lg,
  } as ViewStyle,
  label: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  } as TextStyle,
  input: {
    ...typography.body,
    backgroundColor: colors.mediumGray,
    color: colors.white,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  } as TextStyle,
  button: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    flexDirection: 'row',
  } as ViewStyle,
  buttonDisabled: {
    opacity: 0.7,
  } as ViewStyle,
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  buttonText: {
    ...typography.button,
    color: colors.black,
    textAlign: 'center',
  } as TextStyle,
  buttonIcon: {
    marginRight: spacing.xs,
    color: colors.black,
  } as TextStyle,
  qrContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  } as ViewStyle,
  qrCodeWrapper: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  } as ViewStyle,
  successText: {
    ...typography.body,
    color: colors.primary,
    marginTop: spacing.md,
    textAlign: 'center',
  } as TextStyle,
});