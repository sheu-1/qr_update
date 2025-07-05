import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  StyleProp,
  ViewStyle,
  TextStyle
} from 'react-native';
import { useRouter } from "expo-router";
import { useAuth } from '../lib/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadow } from '../theme';

// Define gradients
const gradients = {
  primary: [colors.primary, colors.secondary] as [string, string],
  secondary: [colors.secondary, colors.primary] as [string, string],
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  useEffect(() => {
    if (error) setError(null);
  }, [email, password]);

  const handleLogin = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await signIn(email, password);
      
      if (error) {
        setError(error.message || 'Invalid email or password');
        return;
      }
      
      // Success - user will be automatically redirected by AuthLayout
      
    } catch (error: any) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignUpPress = () => {
    router.push('/signup');
  };
  
  const handleForgotPassword = () => {
    router.push('/reset-password');
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={gradients.primary} style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView contentContainerStyle={styles.scrollView}>
            <View style={styles.header}>
              <Ionicons name="qr-code" size={48} color={colors.primary} />
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to continue</Text>
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="warning-outline" size={18} color={colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input as TextStyle}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.lightGray}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                  editable={!loading}
                />
                <Ionicons name="mail-outline" size={20} color={colors.lightGray} style={styles.inputIcon} />
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Password</Text>
                <TouchableOpacity 
                  onPress={() => router.push('/reset-password')}
                  disabled={loading}
                >
                  <Text style={styles.forgotPassword}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input as TextStyle}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.lightGray}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                  editable={!loading}
                />
                <TouchableOpacity 
                  style={styles.passwordToggle}
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  disabled={loading}
                >
                  <Ionicons 
                    name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} 
                    size={20} 
                    color={colors.lightGray} 
                  />
                </TouchableOpacity>
              </View>
            </View>
            
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.black} />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>
            
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity 
                onPress={() => !loading && router.push('/signup')}
                disabled={loading}
              >
                <Text style={styles.footerLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  } as ViewStyle,
  gradient: {
    flex: 1,
  } as ViewStyle,
  keyboardAvoidingView: {
    flex: 1,
  } as ViewStyle,
  scrollView: {
    flexGrow: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  } as ViewStyle,
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  } as ViewStyle,
  title: {
    fontSize: typography.h1.fontSize,
    fontWeight: typography.h1.fontWeight,
    color: colors.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    textAlign: 'center',
  } as TextStyle,
  subtitle: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  } as TextStyle,
  formGroup: {
    marginBottom: spacing.lg,
  } as ViewStyle,
  label: {
    fontSize: typography.body.fontSize,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  } as TextStyle,
  inputContainer: {
    position: 'relative',
  } as ViewStyle,
  input: {
    backgroundColor: colors.darkGray,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    paddingLeft: spacing.xl + 20,
    color: colors.textPrimary,
    fontSize: typography.body.fontSize,
    borderWidth: 1,
    borderColor: 'transparent',
    includeFontPadding: false,
    textAlignVertical: 'center',
  } as TextStyle,
  inputIcon: {
    position: 'absolute',
    left: spacing.lg,
    top: 18,
  } as ViewStyle,
  passwordToggle: {
    position: 'absolute',
    right: spacing.lg,
    top: 16,
    padding: spacing.xs,
  } as ViewStyle,
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  } as ViewStyle,
  forgotPassword: {
    fontSize: typography.caption.fontSize,
    color: colors.secondary,
  } as TextStyle,
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    ...shadow.sm,
    minHeight: 56,
  } as ViewStyle,
  buttonDisabled: {
    opacity: 0.7,
  } as ViewStyle,
  buttonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
    color: colors.black,
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
    color: colors.secondary,
    fontWeight: '600',
  } as TextStyle,
  errorContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  errorText: {
    fontSize: typography.caption.fontSize,
    color: colors.error,
    marginLeft: spacing.sm,
  } as TextStyle,
});
