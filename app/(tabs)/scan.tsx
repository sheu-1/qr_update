import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
  Vibration,
  Alert,
  Modal,
  SafeAreaView,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';

const { width, height } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.7;
const SCAN_AREA_TOP_OFFSET = height * 0.2;

interface ScannedData {
  account_number: string;
  created_at: string;
}

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState<ScannedData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animation]);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    Vibration.vibrate();

    try {
      const { data: qrRecord, error } = await supabase
        .from('qr_codes')
        .select('account_number, created_at')
        .eq('id', data)
        .single();

      if (error || !qrRecord) {
        throw new Error('QR code not found or invalid.');
      }

      setScannedData(qrRecord);
      setModalVisible(true);
    } catch (error: any) {
      Alert.alert('Scan Error', error.message || 'Could not validate the QR code.');
      setScanned(false); // Allow scanning again after error
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setScanned(false);
    setScannedData(null);
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color={colors.primary} style={styles.permissionIcon} />
        <Text style={styles.permissionTitle}>Camera Access Needed</Text>
        <Text style={styles.permissionText}>To scan QR codes, we need access to your camera.</Text>
        <TouchableOpacity 
          style={styles.permissionButton} 
          onPress={requestPermission}
          activeOpacity={0.8}
        >
          <Text style={styles.permissionButtonText}>Allow Camera Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Scan QR Code</Text>
            <Text style={styles.headerSubtitle}>Position the QR code within the frame</Text>
          </View>
          
          <View style={styles.overlay}>
            <View style={styles.topOverlay} />
            <View style={styles.middleOverlay}>
              <View style={styles.sideOverlay} />
              <View style={styles.scanArea}>
                <View style={styles.cornerTopLeft} />
                <View style={styles.cornerTopRight} />
                <View style={styles.cornerBottomLeft} />
                <View style={styles.cornerBottomRight} />
                
                <Animated.View
                  style={[
                    styles.scanLine,
                    {
                      transform: [
                        {
                          translateY: animation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, SCAN_AREA_SIZE - 2],
                          }),
                        },
                      ],
                    },
                  ]}
                />
              </View>
              <View style={styles.sideOverlay} />
            </View>
            <View style={styles.bottomOverlay}>
              <Text style={styles.instructionText}>Align QR code within frame to scan</Text>
              <View style={styles.flashButtonContainer}>
                <TouchableOpacity style={styles.flashButton}>
                  <Ionicons name="flashlight" size={24} color={colors.white} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </CameraView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Ionicons name="checkmark-circle" size={48} color={colors.primary} />
              <Text style={styles.modalTitle}>QR Code Scanned</Text>
            </View>
            
            <View style={styles.modalContent}>
              {scannedData && (
                <View style={styles.scannedDataContainer}>
                  <View style={styles.dataRow}>
                    <Ionicons name="keypad-outline" size={20} color={colors.textSecondary} />
                    <View style={styles.dataTextContainer}>
                      <Text style={styles.scannedDataLabel}>Account Number</Text>
                      <Text style={styles.scannedDataValue} numberOfLines={1} ellipsizeMode="tail">
                        {scannedData.account_number}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.divider} />
                  
                  <View style={styles.dataRow}>
                    <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
                    <View style={styles.dataTextContainer}>
                      <Text style={styles.scannedDataLabel}>Scanned at</Text>
                      <Text style={styles.scannedDataValue}>
                        {new Date(scannedData.created_at).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonSecondary]}
                  onPress={() => {
                    setModalVisible(false);
                  }}
                >
                  <Text style={[styles.modalButtonText, { color: colors.textPrimary }]}>Close</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonPrimary]}
                  onPress={() => {
                    setModalVisible(false);
                    setScanned(false);
                  }}
                >
                  <Text style={[styles.modalButtonText, { color: colors.black }]}>Scan Again</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  } satisfies ViewStyle,
  safeArea: {
    flex: 1,
  } satisfies ViewStyle,
  header: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
  } satisfies ViewStyle,
  headerTitle: {
    ...typography.h2,
    color: colors.white,
    marginBottom: spacing.sm / 2,
  } satisfies TextStyle,
  headerSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  } satisfies TextStyle,
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
  } satisfies ViewStyle,
  overlay: {
    flex: 1,
    position: 'relative',
  } satisfies ViewStyle,
  topOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  } satisfies ViewStyle,
  middleOverlay: {
    flexDirection: 'row',
  } satisfies ViewStyle,
  sideOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  } satisfies ViewStyle,
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    position: 'relative' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    overflow: 'hidden' as const,
  } satisfies ViewStyle,
  corner: {
    width: 30,
    height: 30,
    position: 'absolute' as const,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  } satisfies ViewStyle,
  cornerTopLeft: {
    top: -1,
    left: -1,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  } satisfies ViewStyle,
  cornerTopRight: {
    top: -1,
    right: -1,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  } satisfies ViewStyle,
  cornerBottomLeft: {
    bottom: -1,
    left: -1,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
    borderTopWidth: 0,
    borderRightWidth: 0,
  } satisfies ViewStyle,
  cornerBottomRight: {
    bottom: -1,
    right: -1,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  } satisfies ViewStyle,
  scanLine: {
    height: 2,
    backgroundColor: colors.primary,
    width: '100%',
    position: 'absolute' as const,
    top: 0,
    left: 0,
  } satisfies ViewStyle,
  bottomOverlay: {
    flex: 1.5,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: spacing.xl,
    position: 'relative',
  } satisfies ViewStyle,
  instructionText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  } satisfies TextStyle,
  flashButtonContainer: {
    position: 'absolute',
    bottom: spacing.xl,
    alignSelf: 'center',
    zIndex: 10,
  } satisfies ViewStyle,
  flashButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
  } satisfies ViewStyle,
  // Permission styles
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  } satisfies ViewStyle,
  permissionIcon: {
    marginBottom: spacing.lg,
  } satisfies TextStyle,
  permissionTitle: {
    ...typography.h2,
    color: colors.white,
    marginBottom: spacing.sm,
    textAlign: 'center',
  } satisfies TextStyle,
  permissionText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  } satisfies TextStyle,
  permissionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
    width: '100%',
    maxWidth: 300,
  } satisfies ViewStyle,
  permissionButtonText: {
    ...typography.button,
    color: colors.black,
    textAlign: 'center',
  } satisfies TextStyle,
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  } satisfies TextStyle,
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    position: 'relative',
  } satisfies ViewStyle,
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.darkGray,
    borderRadius: 16,
    overflow: 'hidden' as const,
    position: 'relative',
  } satisfies ViewStyle,
  modalHeader: {
    padding: spacing.xl,
    alignItems: 'center' as const,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  } satisfies ViewStyle,
  modalTitle: {
    ...typography.h2,
    color: colors.white,
    marginTop: spacing.md,
    textAlign: 'center',
  } satisfies TextStyle,
  modalContent: {
    padding: spacing.xl,
  } satisfies ViewStyle,
  scannedDataContainer: {
    marginBottom: spacing.xl,
  } satisfies ViewStyle,
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  } satisfies ViewStyle,
  dataTextContainer: {
    flex: 1,
    marginLeft: spacing.md,
  } satisfies ViewStyle,
  scannedDataLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  } satisfies TextStyle,
  scannedDataValue: {
    ...typography.body,
    color: colors.white,
  } satisfies TextStyle,
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: spacing.md,
  } satisfies ViewStyle,
  modalButtons: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginTop: spacing.lg,
  } satisfies ViewStyle,
  modalButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 0,
  } satisfies ViewStyle,
  modalButtonSecondary: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginRight: spacing.sm,
    borderWidth: 0,
  } satisfies ViewStyle,
  modalButtonPrimary: {
    backgroundColor: colors.primary,
    marginLeft: spacing.sm,
    borderWidth: 0,
  } satisfies ViewStyle,
  modalButtonText: {
    ...typography.button,
    textAlign: 'center',
  } satisfies TextStyle,
});
