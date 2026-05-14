import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useDetection } from '../hooks/useDetection';
import { colors } from '../theme/colors';
import * as Haptics from 'expo-haptics';
import { db } from '../services/DatabaseService';
import { useNavigation } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';

// Fallback for modules that might not be installed yet
let Audio: any;
try { Audio = require('expo-av').Audio; } catch (e) {}
let MaterialCommunityIcons: any;
try { MaterialCommunityIcons = require('@expo/vector-icons').MaterialCommunityIcons; } catch (e) {
  MaterialCommunityIcons = ({ name, size, color }: any) => <View style={{ width: size, height: size, backgroundColor: color }} />;
}

export default function PersonalDashboard() {
  const { ear, mar, state, isConnected, sendFrame } = useDetection();
  const navigation = useNavigation<any>();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  useEffect(() => {
    if (state === 'DROWSY') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      playAlarm();
      db.logAlert({ driverId: 'me', type: 'DROWSY' });
    }
  }, [state]);

  const playAlarm = async () => {
    if (!Audio) return;
    try {
      // NOTE: alarm.mp3 is currently missing from assets. 
      // Commenting out to prevent build errors.
      /*
      const alarmAsset = require('../../assets/alarm.mp3');
      const { sound } = await Audio.Sound.createAsync(alarmAsset);
      await sound.playAsync();
      setTimeout(() => { sound.unloadAsync(); }, 3000);
      */
      console.log("DROWSY ALERT: Alarm sound would play here (asset missing)");
    } catch (error) {
      console.log("Alarm sound failed to load", error);
    }
  };

  // Real-time processing loop
  useEffect(() => {
    if (!isConnected || !permission?.granted) return;

    const interval = setInterval(async () => {
      if (cameraRef.current && !isProcessing) {
        setIsProcessing(true);
        try {
          const photo = await cameraRef.current.takePictureAsync({
            quality: 0.3,
            base64: true,
            skipProcessing: true,
          });

          if (photo.base64) {
            sendFrame(photo.base64);
          }
        } catch (e) {
          console.log("Processing error", e);
        } finally {
          setIsProcessing(false);
        }
      }
    }, 200); // 5 FPS for mobile to balance performance

    return () => clearInterval(interval);
  }, [isConnected, permission]);

  const statusColor = state === 'ALERT' ? colors.success : state === 'CAUTION' ? colors.caution : colors.danger;

  // SAFE MODE: Use standard View instead of Animated.View to bypass NativeWorklets error
  const containerStyle = [
    styles.container,
    { backgroundColor: state === 'DROWSY' ? colors.danger + '22' : colors.bg }
  ];

  return (
    <View style={containerStyle}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="chevron-left" size={32} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Driver Mode</Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={styles.statusText}>{state}</Text>
        </View>
      </View>

      {/* Camera View */}
      <View style={styles.cameraPlaceholder}>
        {permission?.granted ? (
          <CameraView 
            ref={cameraRef}
            style={StyleSheet.absoluteFill} 
            facing="front"
          />
        ) : (
          <View style={styles.permissionContainer}>
            <Text style={styles.cameraText}>Camera Permission Required</Text>
            <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
              <Text style={styles.permissionButtonText}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.overlayInfo}>
           <Text style={{color: colors.textSecondary}}>{isConnected ? "Connected to Backend" : "Connecting..."}</Text>
        </View>
      </View>

      {/* Metrics */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>EAR</Text>
          <Text style={[styles.metricValue, { color: colors.chartEAR }]}>{ear.toFixed(3)}</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>MAR</Text>
          <Text style={[styles.metricValue, { color: colors.chartMAR }]}>{mar.toFixed(3)}</Text>
        </View>
      </View>

      {/* Settings / Actions */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.emergencyButton]}>
          <Text style={styles.buttonText}>Emergency</Text>
        </TouchableOpacity>
      </View>

      {state === 'DROWSY' && (
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <Text style={styles.alertText}>DROWSY</Text>
            <Text style={styles.alertSubtext}>PULL OVER SAFELY</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  cameraPlaceholder: {
    flex: 1,
    marginHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cameraText: {
    color: colors.textMuted,
    fontSize: 18,
    textAlign: 'center',
  },
  permissionContainer: {
    padding: 20,
    alignItems: 'center',
  },
  permissionButton: {
    marginTop: 20,
    backgroundColor: colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  overlayInfo: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  metricBox: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    padding: 20,
    borderRadius: 16,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  metricLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  emergencyButton: {
    backgroundColor: colors.danger + '33',
    borderColor: colors.danger,
    borderWidth: 1,
  },
  buttonText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  alertOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  alertBox: {
    backgroundColor: 'black',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
  },
  alertText: {
    fontSize: 48,
    fontWeight: '900',
    color: 'white',
  },
  alertSubtext: {
    fontSize: 18,
    color: 'white',
    marginTop: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  }
});
