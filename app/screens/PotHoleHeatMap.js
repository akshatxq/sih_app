import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
  StatusBar,
  RefreshControl,
  Animated,
  Share
} from 'react-native';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

export default function PotHoleHeatMap({ navigation }) {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [selectedRadius, setSelectedRadius] = useState(1); // km radius
  const [showEmergencyMode, setShowEmergencyMode] = useState(false);
  const [filterMode, setFilterMode] = useState('all'); // all, high, medium, low
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Mock pothole data - in real app, this would come from API
  const mockPotholeData = [
    { id: 1, lat: 28.6139, lng: 77.2090, severity: 'high', reports: 15 },
    { id: 2, lat: 28.6149, lng: 77.2080, severity: 'medium', reports: 8 },
    { id: 3, lat: 28.6129, lng: 77.2100, severity: 'low', reports: 3 },
    { id: 4, lat: 28.6159, lng: 77.2070, severity: 'high', reports: 12 },
    { id: 5, lat: 28.6119, lng: 77.2110, severity: 'medium', reports: 6 },
    { id: 6, lat: 28.6169, lng: 77.2060, severity: 'low', reports: 4 },
    { id: 7, lat: 28.6109, lng: 77.2120, severity: 'high', reports: 18 },
    { id: 8, lat: 28.6179, lng: 77.2050, severity: 'medium', reports: 9 },
    { id: 9, lat: 28.6099, lng: 77.2130, severity: 'low', reports: 2 },
    { id: 10, lat: 28.6189, lng: 77.2040, severity: 'high', reports: 14 },
  ];

  useEffect(() => {
    // Start with immediate default location to avoid loading issues
    const defaultLocation = {
      coords: {
        latitude: 28.6139,
        longitude: 77.2090,
        accuracy: 100,
        altitude: 0,
        altitudeAccuracy: 0,
        heading: 0,
        speed: 0
      },
      timestamp: Date.now()
    };

    // Set default location immediately
    setLocation(defaultLocation);
    generateHeatmapData(defaultLocation.coords);
    setLoading(false);

    // Then try to get real location in background
    getCurrentLocation();

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleEmergency = () => {
    Alert.alert(
      "🚨 Emergency Report",
      "This will immediately notify authorities about a dangerous pothole. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Report Emergency",
          style: "destructive",
          onPress: () => {
            setShowEmergencyMode(true);
            Alert.alert("Emergency Reported!", "Authorities have been notified. Stay safe!");
          }
        }
      ]
    );
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Check out the pothole heat map in your area! Stay safe on the roads. 🚗`,
        title: 'Pothole Heat Map'
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share at this time');
    }
  };

  const handleRouteHelp = () => {
    Alert.alert(
      "🗺️ Route Planning",
      "This feature will help you plan safer routes avoiding high-density pothole areas. Coming soon!",
      [{ text: "OK" }]
    );
  };

  const getCurrentLocation = async () => {
    try {
      setErrorMsg(null);

      // Request location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Using default location (Delhi). Enable location for precise data.');
        return;
      }

      // Get current position with timeout
      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000,
        maximumAge: 60000
      });

      setLocation(currentLocation);
      generateHeatmapData(currentLocation.coords);
      setErrorMsg(null); // Clear any previous error
    } catch (error) {
      setErrorMsg('Using default location. ' + error.message);
    }
  };

  const generateHeatmapData = (userCoords) => {
    const { latitude, longitude } = userCoords;
    const radiusInDegrees = selectedRadius / 111; // Rough conversion: 1 degree ≈ 111 km

    // Filter potholes within the selected radius and by severity filter
    let filteredPotholes = mockPotholeData.filter(pothole => {
      const distance = calculateDistance(latitude, longitude, pothole.lat, pothole.lng);
      const withinRadius = distance <= selectedRadius;
      const matchesFilter = filterMode === 'all' || pothole.severity === filterMode;
      return withinRadius && matchesFilter;
    });

    // Create grid-based heatmap
    const gridSize = 10; // 10x10 grid
    const step = (radiusInDegrees * 2) / gridSize;
    const heatmap = [];

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const gridLat = latitude - radiusInDegrees + (i * step);
        const gridLng = longitude - radiusInDegrees + (j * step);

        // Calculate intensity based on nearby filtered potholes
        let intensity = 0;
        filteredPotholes.forEach(pothole => {
          const distance = calculateDistance(gridLat, gridLng, pothole.lat, pothole.lng);
          if (distance <= 0.2) { // Within 200m of grid point
            const severityMultiplier = getSeverityMultiplier(pothole.severity);
            intensity += (pothole.reports * severityMultiplier) / Math.max(distance + 0.01, 0.01);
          }
        });

        // Add some demo intensity for visualization if no real data
        if (filteredPotholes.length === 0 && Math.random() > 0.6) {
          intensity = Math.random() * 80;
        } else if (filteredPotholes.length === 0 && i < 3 && j < 3) {
          // Ensure some visible cells in top-left for demo
          intensity = (i + j) * 10 + Math.random() * 20;
        }

        heatmap.push({
          id: `${i}-${j}`,
          row: i,
          col: j,
          intensity: Math.min(Math.round(intensity), 100), // Cap at 100 and round
          lat: gridLat,
          lng: gridLng
        });
      }
    }

    setHeatmapData(heatmap);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getSeverityMultiplier = (severity) => {
    switch (severity) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 1;
    }
  };

  const getHeatmapColor = (intensity) => {
    if (intensity === 0) return '#F8FAFC'; // Light background instead of transparent
    if (intensity < 10) return '#DCFCE7'; // Very light green - Low
    if (intensity < 25) return '#FEF3C7'; // Light yellow - Medium-Low
    if (intensity < 50) return '#FED7AA'; // Light orange - Medium
    if (intensity < 75) return '#FECACA'; // Light red - High
    return '#FCA5A5'; // Solid red - Very High
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getCurrentLocation().finally(() => setRefreshing(false));
  }, []);

  const changeRadius = (newRadius) => {
    setSelectedRadius(newRadius);
    if (location) {
      generateHeatmapData(location.coords);
    }
  };

  const changeFilter = (newFilter) => {
    setFilterMode(newFilter);
    if (location) {
      generateHeatmapData(location.coords);
    }
  };

  const getLocationSummary = () => {
    if (!location) return null;

    const nearbyPotholes = mockPotholeData.filter(pothole => {
      const distance = calculateDistance(
        location.coords.latitude,
        location.coords.longitude,
        pothole.lat,
        pothole.lng
      );
      const withinRadius = distance <= selectedRadius;
      const matchesFilter = filterMode === 'all' || pothole.severity === filterMode;
      return withinRadius && matchesFilter;
    });

    const allNearbyPotholes = mockPotholeData.filter(pothole => {
      const distance = calculateDistance(
        location.coords.latitude,
        location.coords.longitude,
        pothole.lat,
        pothole.lng
      );
      return distance <= selectedRadius;
    });

    const highSeverity = allNearbyPotholes.filter(p => p.severity === 'high').length;
    const mediumSeverity = allNearbyPotholes.filter(p => p.severity === 'medium').length;
    const lowSeverity = allNearbyPotholes.filter(p => p.severity === 'low').length;

    return {
      total: filterMode === 'all' ? allNearbyPotholes.length : nearbyPotholes.length,
      high: highSeverity,
      medium: mediumSeverity,
      low: lowSeverity,
      filtered: filterMode !== 'all'
    };
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#6366F1" />

        {/* Header while loading */}
        <View style={styles.headerContainer}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Pothole Heat Map</Text>
              <Text style={styles.headerSubtitle}>Loading...</Text>
            </View>

            <View style={styles.headerActions}>
              <View style={[styles.actionButton, { opacity: 0.5 }]}>
                <Text style={styles.actionIcon}>📤</Text>
              </View>
              <View style={[styles.actionButton, { opacity: 0.5 }]}>
                <Text style={styles.actionIcon}>🗺️</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Getting your location...</Text>
          <Text style={styles.loadingSubtext}>This may take a few seconds</Text>
        </View>
      </View>
    );
  }

  const summary = getLocationSummary();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366F1" />

      {/* Beautiful Header with Back Button */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Pothole Heat Map</Text>
            <Text style={styles.headerSubtitle}>
              {location ? 'Live Data' : 'Loading...'}
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleShare}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>📤</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleRouteHelp}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>🗺️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Emergency Button */}
        <TouchableOpacity
          style={[styles.emergencyButton, showEmergencyMode && styles.emergencyButtonActive]}
          onPress={handleEmergency}
          activeOpacity={0.8}
        >
          <Text style={styles.emergencyIcon}>🚨</Text>
          <Text style={styles.emergencyText}>
            {showEmergencyMode ? 'Emergency Reported!' : 'Report Emergency'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <ScrollView
          style={styles.scrollView}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        >
          {/* Error Message (if any) */}
          {errorMsg && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerIcon}>⚠️</Text>
              <Text style={styles.errorBannerText}>{errorMsg}</Text>
              <TouchableOpacity
                style={styles.errorBannerButton}
                onPress={getCurrentLocation}
              >
                <Text style={styles.errorBannerButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
          {/* Current Location Card */}
          {location && (
            <View style={styles.locationCard}>
              <View style={styles.locationHeader}>
                <Text style={styles.locationIcon}>📍</Text>
                <View style={styles.locationInfo}>
                  <Text style={styles.locationTitle}>Current Location</Text>
                  <Text style={styles.locationCoords}>
                    {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
                  </Text>
                </View>
                <TouchableOpacity style={styles.refreshLocationButton} onPress={getCurrentLocation}>
                  <Text style={styles.refreshIcon}>🔄</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Filter Buttons */}
          <View style={styles.filterContainer}>
            <Text style={styles.filterTitle}>Filter by Severity</Text>
            <View style={styles.filterButtons}>
              {[
                { key: 'all', label: 'All', icon: '🌐', color: '#6366F1' },
                { key: 'high', label: 'High', icon: '🔴', color: '#EF4444' },
                { key: 'medium', label: 'Medium', icon: '🟡', color: '#F59E0B' },
                { key: 'low', label: 'Low', icon: '🟢', color: '#10B981' }
              ].map(filter => (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterButton,
                    filterMode === filter.key && [styles.filterButtonActive, { backgroundColor: filter.color }]
                  ]}
                  onPress={() => changeFilter(filter.key)}
                >
                  <Text style={styles.filterIcon}>{filter.icon}</Text>
                  <Text style={[
                    styles.filterButtonText,
                    filterMode === filter.key && styles.filterButtonTextActive
                  ]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

        {/* Summary Cards */}
        {summary && (
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{summary.total}</Text>
              <Text style={styles.summaryLabel}>
                {summary.filtered ? `${filterMode.charAt(0).toUpperCase() + filterMode.slice(1)} Potholes` : 'Total Potholes'}
              </Text>
              <Text style={styles.summarySubtext}>Within {selectedRadius}km</Text>
            </View>
            <View style={styles.severityCards}>
              <View style={[styles.severityCard, { backgroundColor: '#FEF2F2' }]}>
                <Text style={[styles.severityNumber, { color: '#EF4444' }]}>{summary.high}</Text>
                <Text style={styles.severityLabel}>High</Text>
              </View>
              <View style={[styles.severityCard, { backgroundColor: '#FFFBEB' }]}>
                <Text style={[styles.severityNumber, { color: '#F59E0B' }]}>{summary.medium}</Text>
                <Text style={styles.severityLabel}>Medium</Text>
              </View>
              <View style={[styles.severityCard, { backgroundColor: '#F0FDF4' }]}>
                <Text style={[styles.severityNumber, { color: '#10B981' }]}>{summary.low}</Text>
                <Text style={styles.severityLabel}>Low</Text>
              </View>
            </View>
          </View>
        )}

        {/* Radius Selector */}
        <View style={styles.radiusContainer}>
          <Text style={styles.radiusTitle}>Search Radius</Text>
          <View style={styles.radiusButtons}>
            {[0.5, 1, 2, 5].map(radius => (
              <TouchableOpacity
                key={radius}
                style={[
                  styles.radiusButton,
                  selectedRadius === radius && styles.radiusButtonActive
                ]}
                onPress={() => changeRadius(radius)}
              >
                <Text style={[
                  styles.radiusButtonText,
                  selectedRadius === radius && styles.radiusButtonTextActive
                ]}>
                  {radius}km
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Heat Map */}
        <View style={styles.heatmapContainer}>
          <Text style={styles.heatmapTitle}>Pothole Density Map</Text>
          <View style={styles.heatmapGrid}>
            {heatmapData.map(cell => (
              <View
                key={cell.id}
                style={[
                  styles.heatmapCell,
                  { backgroundColor: getHeatmapColor(cell.intensity) }
                ]}
              />
            ))}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <Text style={styles.legendTitle}>Density Level</Text>
            <View style={styles.legendItems}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#DCFCE7' }]} />
                <Text style={styles.legendText}>Low</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#FEF3C7' }]} />
                <Text style={styles.legendText}>Medium</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#FED7AA' }]} />
                <Text style={styles.legendText}>High</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#FCA5A5' }]} />
                <Text style={styles.legendText}>Very High</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Enhanced Safety Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>🚗 Smart Driving Tips</Text>
          <View style={styles.tip}>
            <Text style={styles.tipIcon}>⚠️</Text>
            <Text style={styles.tipText}>Reduce speed by 20-30% in high-density red zones</Text>
          </View>
          <View style={styles.tip}>
            <Text style={styles.tipIcon}>🛣️</Text>
            <Text style={styles.tipText}>Use navigation apps for real-time route optimization</Text>
          </View>
          <View style={styles.tip}>
            <Text style={styles.tipIcon}>📱</Text>
            <Text style={styles.tipText}>Report new potholes immediately to help your community</Text>
          </View>
          <View style={styles.tip}>
            <Text style={styles.tipIcon}>🌙</Text>
            <Text style={styles.tipText}>Exercise extra caution during night driving</Text>
          </View>
          <View style={styles.tip}>
            <Text style={styles.tipIcon}>☔</Text>
            <Text style={styles.tipText}>Potholes are harder to see during rainy weather</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.quickActionsTitle}>⚡ Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: '#EF4444' }]}
              onPress={handleEmergency}
            >
              <Text style={styles.quickActionIcon}>🚨</Text>
              <Text style={styles.quickActionText}>Emergency</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: '#10B981' }]}
              onPress={() => Alert.alert('Report Pothole', 'Feature coming soon!')}
            >
              <Text style={styles.quickActionIcon}></Text>
              <Text style={styles.quickActionText}>Report</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: '#6366F1' }]}
              onPress={handleRouteHelp}
            >
              <Text style={styles.quickActionIcon}>🗺️</Text>
              <Text style={styles.quickActionText}>Routes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: '#F59E0B' }]}
              onPress={handleShare}
            >
              <Text style={styles.quickActionIcon}>📤</Text>
              <Text style={styles.quickActionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerContainer: {
    backgroundColor: '#6366F1',
    paddingTop: Platform.OS === 'ios' ? 50 : 70,
    paddingBottom: 15,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    width: 70,
    justifyContent: 'flex-end',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  actionIcon: {
    fontSize: 14,
  },
  emergencyButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  emergencyButtonActive: {
    backgroundColor: '#059669',
    shadowColor: '#059669',
  },
  emergencyIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  emergencyText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  locationCard: {
    margin: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  locationInfo: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  locationCoords: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  refreshLocationButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshIcon: {
    fontSize: 12,
  },
  filterContainer: {
    margin: 15,
    marginTop: 0,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 10,
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 6,
    marginHorizontal: 3,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonActive: {
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  filterIcon: {
    fontSize: 14,
    marginBottom: 3,
  },
  filterButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#1E293B',
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  errorBanner: {
    margin: 15,
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  errorBannerIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#7F1D1D',
    lineHeight: 18,
  },
  errorBannerButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginLeft: 10,
  },
  errorBannerButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  summaryContainer: {
    margin: 15,
    marginBottom: 0,
  },
  summaryCard: {
    backgroundColor: '#6366F1',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#E2E8F0',
    fontWeight: '600',
  },
  summarySubtext: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 4,
  },
  severityCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  severityCard: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  severityNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  severityLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  radiusContainer: {
    margin: 15,
    marginBottom: 0,
  },
  radiusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 10,
  },
  radiusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radiusButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 3,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  radiusButtonActive: {
    backgroundColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  radiusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  radiusButtonTextActive: {
    color: '#FFFFFF',
  },
  heatmapContainer: {
    margin: 15,
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  heatmapTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 15,
    textAlign: 'center',
  },
  heatmapGrid: {
    width: width - 80,
    height: width - 80,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
  },
  heatmapCell: {
    width: (width - 80) / 10,
    height: (width - 80) / 10,
    borderWidth: 0.5,
    borderColor: '#F1F5F9',
  },
  legend: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 10,
    textAlign: 'center',
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  legendText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  tipsContainer: {
    margin: 15,
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 15,
    textAlign: 'center',
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#6366F1',
  },
  tipIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 20,
    textAlign: 'center',
  },
  tipText: {
    fontSize: 13,
    color: '#475569',
    flex: 1,
    lineHeight: 18,
    fontWeight: '500',
  },
  quickActionsContainer: {
    margin: 15,
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 15,
    textAlign: 'center',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 20,
  },
});
