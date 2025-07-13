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
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('');
  const [qrCodeId, setQrCodeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [focusedQrCode, setFocusedQrCode] = useState<string | null>(null);
  const qrCodeRef = useRef<any>(null);

  const formatPhoneNumber = (input: string) => {
    // Remove all non-digit characters
    const cleaned = input.replace(/\D/g, '');
    
    // If the number starts with 0, replace with 254
    if (cleaned.startsWith('0')) {
      return '254' + cleaned.substring(1);
    }
    // If it starts with 254, return as is
    else if (cleaned.startsWith('254')) {
      return cleaned;
    }
    // If it's a 9 or 10 digit number, add 254
    else if (cleaned.length === 9 || cleaned.length === 10) {
      return '254' + (cleaned.startsWith('7') || cleaned.startsWith('1') ? cleaned : '');
    }
    // Otherwise return as is (will be validated)
    return cleaned;
  };

  const generateAndUploadQRCode = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter a phone number.');
      return;
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    // Validate Kenyan phone number (starts with 2547 or 2541 and is 12 digits total)
    if (!/^254[17]\d{8}$/.test(formattedPhone)) {
      Alert.alert('Error', 'Please enter a valid Kenyan phone number (e.g., 0712345678 or 254712345678)');
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
        .insert({ 
          account_number: formattedPhone, // Using the formatted phone number with 254
          user_id: user.id 
        })
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
        <Text style={styles.label}>Enter Phone Number</Text>
        <View style={styles.phoneInputContainer}>
          <View style={styles.countryCodeContainer}>
            <Text style={styles.countryCodeText}>+254</Text>
          </View>
          <TextInput
            style={[styles.input, styles.phoneInput]}
            placeholder="712 345 678"
            placeholderTextColor={colors.textSecondary}
            value={formattedPhoneNumber}
            onChangeText={(text) => {
              // Only allow numbers and limit to 9 digits (Kenyan numbers are 9 digits after 254)
              const cleaned = text.replace(/\D/g, '').substring(0, 9);
              setPhoneNumber(cleaned);
              
              // Format the display with spaces for better readability
              if (cleaned.length > 0) {
                const part1 = cleaned.substring(0, 3);
                const part2 = cleaned.substring(3, 6);
                const part3 = cleaned.substring(6, 9);
                let formatted = part1;
                if (part2) formatted += ` ${part2}`;
                if (part3) formatted += ` ${part3}`;
                setFormattedPhoneNumber(formatted);
              } else {
                setFormattedPhoneNumber('');
              }
            }}
            keyboardType="phone-pad"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        {formattedPhoneNumber ? (
          <Text style={styles.previewText}>
            Full number: +254{formattedPhoneNumber.replace(/\s/g, '')}
          </Text>
        ) : null}

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
          <TouchableOpacity 
            style={styles.qrContainer}
            onPress={() => setFocusedQrCode(qrCodeId)}
            activeOpacity={0.9}
          >
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
            <Text style={styles.successText}>Tap to enlarge</Text>
          </TouchableOpacity>
        )}

        {/* Full Screen QR Code Modal */}
        {focusedQrCode && (
          <TouchableOpacity
            style={styles.fullScreenOverlay}
            activeOpacity={1}
            onPress={() => setFocusedQrCode(null)}
          >
            <View style={styles.fullScreenQrContainer}>
              <QRCodeSVG
                value={focusedQrCode}
                size={300}
                color={colors.black}
                backgroundColor={colors.white}
              />
              <Text style={styles.closeText}>Tap anywhere to close</Text>
            </View>
          </TouchableOpacity>
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
    backgroundColor: colors.darkGray,
    color: colors.white,
    padding: spacing.md,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: spacing.lg,
    flex: 1,
  } as TextStyle,
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  } as ViewStyle,
  countryCodeContainer: {
    backgroundColor: colors.darkGray,
    padding: spacing.md,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    justifyContent: 'center',
    marginRight: 1,
  } as ViewStyle,
  countryCodeText: {
    color: colors.white,
    fontSize: 16,
  } as TextStyle,
  phoneInput: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    marginBottom: 0,
  } as TextStyle,
  previewText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: -spacing.md,
    marginBottom: spacing.lg,
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
  fullScreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  } as ViewStyle,
  fullScreenQrContainer: {
    backgroundColor: colors.white,
    padding: spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  closeText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: 14,
  } as TextStyle,
});