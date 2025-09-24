import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform
} from "react-native";

export default function ProfileScreen() {
  const [user] = useState({
    name: "Anshu Kumar",
    email: "anshu.kumar@email.com",
    phone: "+91 98765 xxxxx",
    location: "Jharkhand , India",
    joinDate: "January 2024",
    profileImage: null, // Would be user's profile image URL
  });

  const [stats] = useState({
    issuesReported: 23,
    issuesResolved: 18,
    communityRank: "Gold Contributor",
    points: 1250,
    badgesEarned: 5
  });

  const badges = [
    { name: "First Reporter", icon: "🥇", earned: true },
    { name: "Problem Solver", icon: "🔧", earned: true },
    { name: "Community Hero", icon: "🦸", earned: true },
    { name: "Regular Contributor", icon: "⭐", earned: true },
    { name: "Area Expert", icon: "🏆", earned: false },
    { name: "Safety Champion", icon: "🛡️", earned: false },
  ];

  const recentActivity = [
    { id: 1, action: "Reported pothole", location: "MG Road", date: "2 days ago", status: "In Progress" },
    { id: 2, action: "Reported street light", location: "Park Street", date: "5 days ago", status: "Resolved" },
    { id: 3, action: "Reported garbage issue", location: "Market Area", date: "1 week ago", status: "Resolved" },
  ];

  const handleEditProfile = () => {
    Alert.alert("Edit Profile", "Profile editing functionality coming soon!");
  };

  const handleViewAllIssues = () => {
    Alert.alert("My Issues", "View all issues functionality coming soon!");
  };

  const handleNotificationSettings = () => {
    Alert.alert("Notifications", "Notification settings coming soon!");
  };

  const handleHelpSupport = () => {
    Alert.alert("Help & Support", "Help functionality coming soon!");
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: () => {
          Alert.alert("Logged Out", "You have been logged out successfully!");
        }}
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          {user.profileImage ? (
            <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileImageText}>
                {user.name.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
          )}
          <TouchableOpacity style={styles.editImageButton}>
            <Text style={styles.editImageText}>📷</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userRank}>{stats.communityRank}</Text>
          <Text style={styles.userLocation}>📍 {user.location}</Text>
          <Text style={styles.memberSince}>Member since {user.joinDate}</Text>
        </View>

        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Impact Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.issuesReported}</Text>
            <Text style={styles.statLabel}>Issues Reported</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.issuesResolved}</Text>
            <Text style={styles.statLabel}>Issues Resolved</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.points}</Text>
            <Text style={styles.statLabel}>Civic Points</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.badgesEarned}</Text>
            <Text style={styles.statLabel}>Badges Earned</Text>
          </View>
        </View>
      </View>

      {/* Badges Section */}
      <View style={styles.badgesContainer}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.badgesGrid}>
          {badges.map((badge, index) => (
            <View key={index} style={[styles.badge, !badge.earned && styles.badgeDisabled]}>
              <Text style={styles.badgeIcon}>{badge.icon}</Text>
              <Text style={[styles.badgeName, !badge.earned && styles.badgeNameDisabled]}>
                {badge.name}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.activityContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={handleViewAllIssues}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentActivity.map((activity) => (
          <View key={activity.id} style={styles.activityItem}>
            <View style={styles.activityInfo}>
              <Text style={styles.activityAction}>{activity.action}</Text>
              <Text style={styles.activityLocation}>📍 {activity.location}</Text>
              <Text style={styles.activityDate}>{activity.date}</Text>
            </View>
            <View style={[
              styles.statusBadge,
              activity.status === 'Resolved' ? styles.statusResolved : styles.statusInProgress
            ]}>
              <Text style={[
                styles.statusText,
                activity.status === 'Resolved' ? styles.statusTextResolved : styles.statusTextInProgress
              ]}>
                {activity.status}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Menu Options */}
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={handleViewAllIssues}>
          <Text style={styles.menuIcon}>📋</Text>
          <Text style={styles.menuText}>My Reported Issues</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleNotificationSettings}>
          <Text style={styles.menuIcon}>🔔</Text>
          <Text style={styles.menuText}>Notification Settings</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleHelpSupport}>
          <Text style={styles.menuIcon}>❓</Text>
          <Text style={styles.menuText}>Help & Support</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>ℹ️</Text>
          <Text style={styles.menuText}>About App</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
          <Text style={styles.menuIcon}>🚪</Text>
          <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Together, we're making our community better! 🌟
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 80,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  editImageText: {
    fontSize: 12,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userRank: {
    fontSize: 16,
    color: '#ffa500',
    fontWeight: '600',
    marginBottom: 5,
  },
  userLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  memberSince: {
    fontSize: 12,
    color: '#999',
  },
  editButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  statsContainer: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  badgesContainer: {
    backgroundColor: '#fff',
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badge: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#28a745',
  },
  badgeDisabled: {
    borderColor: '#e9ecef',
    opacity: 0.5,
  },
  badgeIcon: {
    fontSize: 20,
    marginBottom: 5,
  },
  badgeName: {
    fontSize: 10,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  badgeNameDisabled: {
    color: '#999',
  },
  activityContainer: {
    backgroundColor: '#fff',
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAllText: {
    color: '#007bff',
    fontWeight: '600',
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  activityInfo: {
    flex: 1,
  },
  activityAction: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  activityLocation: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 11,
    color: '#999',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusResolved: {
    backgroundColor: '#d4edda',
  },
  statusInProgress: {
    backgroundColor: '#fff3cd',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statusTextResolved: {
    color: '#155724',
  },
  statusTextInProgress: {
    color: '#856404',
  },
  menuContainer: {
    backgroundColor: '#fff',
    margin: 15,
    marginTop: 0,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 15,
    width: 25,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  menuArrow: {
    fontSize: 18,
    color: '#999',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#dc3545',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
