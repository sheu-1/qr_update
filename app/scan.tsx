import { CameraView, CameraType, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import React from 'react';
import { useState, useEffect } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Animated, Dimensions, Alert, Vibration } from 'react-native';

const { width, height } = Dimensions.get('window');
const SCAN_SIZE = Math.min(width, height) * 0.7;
const BORDER_LENGTH = SCAN_SIZE * 0.2;
const SCAN_WINDOW_TOP_OFFSET = height * 0.15;

export default function Scan() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanResult, setScanResult] = useState('');
  const animation = new Animated.Value(0);

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
  }, []);

  const handleBarcodeScanned = ({ data }: BarcodeScanningResult) => {
    if (!scanned && data) {
      Vibration.vibrate(100);
      setScanned(true);

      Alert.prompt(
        "Enter Amount",
        "How much do you want to pay?",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => setScanned(false),
          },
          {
            text: "Pay",
            onPress: (amount) => {
              if (!amount || isNaN(Number(amount))) {
                Alert.alert("Invalid amount");
                setScanned(false);
                return;
              }
              initiateMpesaStkPush(data, amount);
            },
          },
        ],
        "plain-text"
      );
    }
  };

  // Function to call your backend API
  const initiateMpesaStkPush = async (phoneOrPaybill: string, amount: string) => {
    try {
      const response = await fetch("http://192.168.0.104:5000/api/mpesa-stk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneOrPaybill,
          amount,
        }),
      });
      const result = await response.json();
      if (result.success) {
        Alert.alert("STK Push Sent", "Check your phone to complete the payment.");
      } else {
        Alert.alert("STK Push Failed", result.message || "Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to initiate payment.");
    }
  };

  const handleScanAgain = () => {
    setScanned(false);
    setScanResult('');
  };

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.message}>Camera permission required</Text>
        <Button onPress={requestPermission} title="Allow Camera Access" />
      </View>
    );
  }

  const scanLineStyle = {
    transform: [{
      translateY: animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, SCAN_SIZE - 2],
      }),
    }],
  };

  function toggleCameraFacing() {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  }

  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera} 
        facing={facing}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      >
        {/* Overlay with adjusted positioning */}
        <View style={styles.overlay}>
          {/* Top overlay - smaller to push scan window up */}
          <View style={[styles.overlaySection, { height: SCAN_WINDOW_TOP_OFFSET }]} />
          
          {/* Middle section */}
          <View style={styles.middleSection}>
            <View style={[styles.overlaySection, { width: (width - SCAN_SIZE) / 2 }]} />
            
            {/* Scan window with border corners */}
            <View style={styles.scanWindow}>
              <View style={[styles.borderCorner, styles.topLeft]} />
              <View style={[styles.borderCorner, styles.topRight]} />
              <View style={[styles.borderCorner, styles.bottomLeft]} />
              <View style={[styles.borderCorner, styles.bottomRight]} />
              {!scanned && <Animated.View style={[styles.scanLine, scanLineStyle]} />}
            </View>
            
            <View style={[styles.overlaySection, { width: (width - SCAN_SIZE) / 2 }]} />
          </View>
          
          {/* Bottom overlay - larger to accommodate the offset */}
          <View style={[styles.overlaySection, { 
            height: height - SCAN_SIZE - SCAN_WINDOW_TOP_OFFSET,
            justifyContent: 'flex-end'
          }]}>
            {scanned ? (
              <View style={styles.resultContainer}>
                <Text style={styles.resultText}>Scanned: {scanResult}</Text>
                <TouchableOpacity 
                  style={styles.scanAgainButton} 
                  onPress={handleScanAgain}
                >
                  <Text style={styles.scanAgainButtonText}>Scan Again</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.instruction}>Position QR code within frame</Text>
            )}
          </View>
        </View>
        
        {/* Flip button positioned relative to the scan window */}
        {!scanned && (
          <TouchableOpacity 
            style={[styles.flipButton, { top: SCAN_WINDOW_TOP_OFFSET + SCAN_SIZE + 20 }]} 
            onPress={toggleCameraFacing}
          >
            <Text style={styles.buttonText}>Flip Camera</Text>
          </TouchableOpacity>
        )}
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlaySection: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  middleSection: {
    flexDirection: 'row',
    height: SCAN_SIZE,
  },
  scanWindow: {
    width: SCAN_SIZE,
    height: SCAN_SIZE,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    position: 'relative',
  },
  borderCorner: {
    position: 'absolute',
    width: BORDER_LENGTH,
    height: BORDER_LENGTH,
    borderColor: '#00FF00',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  scanLine: {
    height: 2,
    width: SCAN_SIZE - 30,
    backgroundColor: '#00FF00',
    marginLeft: 15,
    position: 'absolute',
  },
  instruction: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 30,
    opacity: 0.8,
  },
  flipButton: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  resultContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  resultText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  scanAgainButton: {
    backgroundColor: '#00FF00',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  scanAgainButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
});