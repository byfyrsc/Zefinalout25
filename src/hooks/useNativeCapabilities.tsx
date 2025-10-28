import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { PushNotifications } from '@capacitor/push-notifications';

export const useNativeCapabilities = () => {
  const [isNative, setIsNative] = useState(false);
  const [permissions, setPermissions] = useState({
    camera: false,
    location: false,
    notifications: false
  });

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
    
    if (Capacitor.isNativePlatform()) {
      initializePermissions();
    }
  }, []);

  const initializePermissions = async () => {
    try {
      // Initialize push notifications
      await PushNotifications.requestPermissions();
      
      // Check camera permissions
      const cameraPermissions = await Camera.checkPermissions();
      
      // Check location permissions  
      const locationPermissions = await Geolocation.checkPermissions();

      setPermissions({
        camera: cameraPermissions.camera === 'granted',
        location: locationPermissions.location === 'granted',
        notifications: true
      });
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const hapticFeedback = async (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (!isNative) return;
    
    try {
      const impactStyle = style === 'light' ? ImpactStyle.Light :
                         style === 'heavy' ? ImpactStyle.Heavy : 
                         ImpactStyle.Medium;
      
      await Haptics.impact({ style: impactStyle });
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  };

  const capturePhoto = async () => {
    if (!isNative || !permissions.camera) {
      throw new Error('Camera not available or permission denied');
    }

    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });

      return image.webPath;
    } catch (error) {
      console.error('Camera capture error:', error);
      throw error;
    }
  };

  const getCurrentLocation = async () => {
    if (!isNative || !permissions.location) {
      throw new Error('Location not available or permission denied');
    }

    try {
      const coordinates = await Geolocation.getCurrentPosition();
      return {
        latitude: coordinates.coords.latitude,
        longitude: coordinates.coords.longitude,
        accuracy: coordinates.coords.accuracy
      };
    } catch (error) {
      console.error('Geolocation error:', error);
      throw error;
    }
  };

  const requestNotificationPermission = async () => {
    if (!isNative) return false;

    try {
      const permission = await PushNotifications.requestPermissions();
      const granted = permission.receive === 'granted';
      
      setPermissions(prev => ({ ...prev, notifications: granted }));
      
      if (granted) {
        await PushNotifications.register();
      }
      
      return granted;
    } catch (error) {
      console.error('Notification permission error:', error);
      return false;
    }
  };

  return {
    isNative,
    permissions,
    hapticFeedback,
    capturePhoto,
    getCurrentLocation,
    requestNotificationPermission,
    initializePermissions
  };
};