import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import {
  CameraView,
  useCameraPermissions,
} from 'expo-camera';
import { Video } from 'expo-av';

export default function ReportIssueScreen() {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraOpen, setCameraOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [videoUri, setVideoUri] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [facing, setFacing] = useState('back');

  const openCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permission Required', 'Camera permission is required to take photos.');
        return;
      }
    }
    setCameraOpen(true);
  };

 const takeVideo = async () => {
    if (!cameraRef.current || recording) return;

    setRecording(true);

    try {
      const recordingPromise = cameraRef.current.recordAsync({
        quality: '720p',
        onRecordingStarted: () => {
          // This ensures the countdown and stop timer start only after the camera is ready
          setCountdown(2);

          const countdownInterval = setInterval(() => {
            setCountdown(prev => {
              if (prev <= 1) {
                clearInterval(countdownInterval);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

          setTimeout(() => {
            if (cameraRef.current) {
              cameraRef.current.stopRecording();
            }
          }, 2000);
        },
      });

      const video = await recordingPromise;

      if (video?.uri) {
        setVideoUri(video.uri);
        setCameraOpen(false);
      } else {
        throw new Error('Video recording failed to produce a valid URI.');
      }
    } catch (err) {
      console.log('Recording error:', err);
      Alert.alert('Error', 'Could not record video. Please try again.');
    } finally {
      // These will reset the state after the whole process is complete
      setRecording(false);
      setCountdown(0);
    }
  };
  
  const uploadVideo = async () => {
    if (!videoUri) return;
    setUploading(true);
    try {
      // Simulate upload
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setUploaded(true);
      Alert.alert('Success', 'Video uploaded successfully!');
    } catch (err) {
      Alert.alert('Upload Error', 'Could not upload video');
    } finally {
      setUploading(false);
    }
  };

  const resetFlow = () => {
    setVideoUri(null);
    setUploaded(false);
    setCameraOpen(false);
    setRecording(false);
    setCountdown(0);
  };

  // Initial state - Show "Take a Photo" button
  if (!cameraOpen && !videoUri) {
    return (
      <View style={styles.initialScreen}>
        <Text style={styles.title}>Report an Issue</Text>
        <Text style={styles.subtitle}>Take a 2-second video to report your issue</Text>
        <TouchableOpacity style={styles.takePhotoButton} onPress={openCamera}>
          <Text style={styles.takePhotoText}>📸 Take a Video</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Camera is open
  if (cameraOpen && !videoUri) {
    if (!permission) {
      return (
        <View style={styles.center}>
          <Text>Requesting camera permission...</Text>
        </View>
      );
    }

    if (!permission.granted) {
      return (
        <View style={styles.center}>
          <Text style={styles.permissionText}>
            We need your permission to access the camera.
          </Text>
          <TouchableOpacity
            onPress={requestPermission}
            style={styles.permissionButton}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <View style={styles.cameraContainer}>
          <CameraView ref={cameraRef} style={styles.camera} facing={facing} mode="video" />

          {/* Countdown Overlay */}
          {countdown > 0 && (
            <View style={styles.countdownOverlay}>
              <Text style={styles.countdownText}>{countdown}</Text>
            </View>
          )}

          {/* Recording Overlay */}
          {recording && countdown === 0 && (
            <View style={styles.recordingOverlay}>
              <View style={styles.recordingIndicator}>
                <Text style={styles.recordingDot}>●</Text>
                <Text style={styles.recordingText}>Recording...</Text>
              </View>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.recordButton, recording && styles.recordButtonDisabled]}
              onPress={takeVideo}
              disabled={recording}
            >
              <View
                style={[
                  styles.recordButtonInner,
                  recording && styles.recordingButton,
                ]}
              />
            </TouchableOpacity>
            {!recording && (
              <Text style={styles.captureText}>Tap to Record (2s)</Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setCameraOpen(false)}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Video captured - Show upload screen
  if (videoUri) {
    return (
      <View style={styles.afterCapture}>
        <Text style={styles.captureTitle}>Video Captured!</Text>

        {Platform.OS === 'web' ? (
          <video
            src={videoUri}
            style={{
              width: '100%',
              height: 300,
              borderRadius: 10,
              marginBottom: 20,
            }}
            controls
            loop
            autoPlay
          />
        ) : (
          <Video
            source={{ uri: videoUri }}
            style={styles.videoPlayer}
            useNativeControls
            resizeMode="contain"
            isLooping
            shouldPlay
          />
        )}

        {!uploaded ? (
          uploading ? (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator size="large" color="#007bff" />
              <Text style={styles.uploadingText}>Uploading video...</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.uploadBtn} onPress={uploadVideo}>
              <Text style={styles.uploadText}>📤 Upload Video</Text>
            </TouchableOpacity>
          )
        ) : (
          <View style={styles.successContainer}>
            <Text style={styles.success}>✅ Uploaded Successfully!</Text>
          </View>
        )}

        <TouchableOpacity onPress={resetFlow} style={styles.retakeBtn}>
          <Text style={styles.retakeText}>↩ Record Another</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  initialScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  takePhotoButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  takePhotoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  cameraContainer: {
    flex: 1,
    position: 'relative'
  },
  camera: {
    flex: 1
  },
  countdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 10,
  },
  countdownText: {
    color: '#fff',
    fontSize: 80,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  recordingOverlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 5,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,0,0,0.8)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  recordingDot: {
    color: '#fff',
    fontSize: 20,
    marginRight: 8,
  },
  recordingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  recordButtonDisabled: {
    opacity: 0.5,
  },
  recordButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'red',
  },
  recordingButton: {
    backgroundColor: 'darkred',
    transform: [{ scale: 0.8 }],
  },
  captureText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  afterCapture: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  captureTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  videoPlayer: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  uploadBtn: {
    padding: 15,
    backgroundColor: '#007bff',
    borderRadius: 10,
    marginTop: 20,
    paddingHorizontal: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  uploadText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  uploadingContainer: {
    alignItems: 'center',
    marginTop: 20
  },
  uploadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#007bff'
  },
  successContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  success: {
    fontSize: 18,
    color: 'green',
    fontWeight: '600',
    textAlign: 'center',
  },
  retakeBtn: {
    marginTop: 20,
    padding: 10,
  },
  retakeText: {
    color: '#007bff',
    fontWeight: '600',
    fontSize: 16
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#007bff',
    borderRadius: 10,
    elevation: 2,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  permissionText: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
    paddingHorizontal: 20,
    color: '#333',
    lineHeight: 22,
  },
});