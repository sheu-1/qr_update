import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  Dimensions, 
  SafeAreaView,
  StyleProp,
  ViewStyle,
  TextStyle
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadow } from '../theme';

// Define gradients locally to match the theme
const gradients = {
  primary: [colors.primary, colors.secondary] as [string, string],
  secondary: [colors.secondary, colors.primary] as [string, string],
};

const { width } = Dimensions.get('window');

const features = [
  {
    icon: 'qr-code-outline',
    title: 'Scan QR Codes',
    description: 'Quickly scan any QR code with your camera'
  },
  {
    icon: 'add-circle-outline',
    title: 'Generate QR Codes',
    description: 'Create custom QR codes for websites, contacts, and more'
  },
  {
    icon: 'save-outline',
    title: 'Save & Organize',
    description: 'Keep track of all your scanned and generated QR codes'
  }
];

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={gradients.primary}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Ionicons name="qr-code" size={48} color={colors.primary} />
            <Text style={styles.title as TextStyle}>QR Code Scanner</Text>
            <Text style={styles.subtitle as TextStyle}>Scan, generate, and manage QR codes with ease</Text>
          </View>

          <View style={styles.features as ViewStyle}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem as ViewStyle}>
                <View style={styles.featureIcon as ViewStyle}>
                  <Ionicons name={feature.icon as any} size={28} color={colors.primary} />
                </View>
                <View style={styles.featureText as ViewStyle}>
                  <Text style={styles.featureTitle as TextStyle}>{feature.title}</Text>
                  <Text style={styles.featureDescription as TextStyle}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.buttonContainer as ViewStyle}>
            <TouchableOpacity 
              style={styles.button as ViewStyle}
              onPress={() => router.push('/signup')}
            >
              <Text style={styles.buttonText as TextStyle}>Get Started</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.secondaryButton as ViewStyle}
              onPress={() => router.push('/login')}
            >
              <Text style={styles.secondaryButtonText as TextStyle}>I already have an account</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer as ViewStyle}>
            <Text style={styles.footerText as TextStyle}>By continuing, you agree to our </Text>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.footerLink as TextStyle}>Terms of Service</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  } as ViewStyle,
  buttonContainer: {
    width: '100%',
    marginBottom: spacing.xl,
  } as ViewStyle,
  gradient: {
    flex: 1,
    padding: spacing.xl,
  } as ViewStyle,
  content: {
    flex: 1,
    justifyContent: 'space-between',
  } as ViewStyle,
  header: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  } as ViewStyle,
  title: {
    fontSize: typography.h1.fontSize,
    fontWeight: typography.h1.fontWeight,
    color: colors.white,
    marginTop: spacing.md,
    textAlign: 'center',
  } as TextStyle,
  subtitle: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
  } as TextStyle,
  features: {
    marginVertical: spacing.xxl,
  } as ViewStyle,
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  } as ViewStyle,
  featureIcon: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: borderRadius.sm,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  } as ViewStyle,
  featureText: {
    flex: 1,
  } as ViewStyle,
  featureTitle: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    color: colors.white,
    marginBottom: spacing.xs,
  } as TextStyle,
  featureDescription: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
  } as TextStyle,
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    minHeight: 56,
    justifyContent: 'center',
    ...shadow.sm,
  } as ViewStyle,
  buttonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
    color: colors.black,
  } as TextStyle,
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  } as ViewStyle,
  secondaryButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
    color: colors.primary,
  } as TextStyle,
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  } as ViewStyle,
  footerText: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
  } as TextStyle,
  footerLink: {
    fontSize: typography.caption.fontSize,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: spacing.xs,
  } as TextStyle,
});
