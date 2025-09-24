import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  RefreshControl,
  Platform
} from "react-native";

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mock data - in real app, this would come from API
  const [dashboardData] = useState({
    user: {
      name: "Anshu Kumar",
      location: "Jharkhand",
    },
    stats: {
      totalIssues: 1247,
      resolvedIssues: 892,
      inProgress: 234,
      pending: 121,
      responseTime: "4.2 days"
    },
    recentIssues: [
      {
        id: 1,
        title: "Pothole on MG Road",
        location: "MG Road, Sector 14",
        priority: "High",
        status: "In Progress",
        timeAgo: "2 hours ago",
        category: "Roads"
      },
      {
        id: 2,
        title: "Street Light Not Working",
        location: "Park Street, Block A",
        priority: "Medium",
        status: "Assigned",
        timeAgo: "5 hours ago",
        category: "Infrastructure"
      },
      {
        id: 3,
        title: "Garbage Overflow",
        location: "Market Complex",
        priority: "High",
        status: "Resolved",
        timeAgo: "1 day ago",
        category: "Sanitation"
      }
    ],
    quickActions: [
      { id: 1, title: "Report Issue", icon: "📸", color: "#6366F1", route: "ReportIssue" },
      { id: 2, title: "Heat Map", icon: "🗺️", color: "#10B981", route: "HeatMap" },
      { id: 3, title: "Emergency", icon: "🚨", color: "#EF4444", route: "Emergency" },
      { id: 4, title: "Feedback", icon: "💬", color: "#8B5CF6", route: "Feedback" }
    ],
    categories: [
      { name: "Roads", count: 45, color: "#F59E0B", icon: "🛣️" },
      { name: "Water", count: 32, color: "#3B82F6", icon: "💧" },
      { name: "Power", count: 28, color: "#F59E0B", icon: "⚡" },
      { name: "Sanitation", count: 19, color: "#10B981", icon: "🗑️" }
    ]
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#EF4444';
      case 'Medium': return '#F59E0B';
      case 'Low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved': return '#10B981';
      case 'In Progress': return '#3B82F6';
      case 'Assigned': return '#8B5CF6';
      case 'Pending': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const handleQuickAction = (action) => {
    if (action.route === 'ReportIssue') {
      navigation?.navigate('Report Issue');
    } else if (action.route === 'HeatMap') {
      navigation?.navigate('Heat Map');
    } else {
      // Handle other actions
      console.log(`Navigate to ${action.route}`);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.userInfoContainer}>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName} numberOfLines={1} adjustsFontSizeToFit>
                {dashboardData.user.name}
              </Text>
              <Text style={styles.location}>📍 {dashboardData.user.location}</Text>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Text style={styles.notificationIcon}>🔔</Text>
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationCount}>3</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Community Impact</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.primaryStatCard]}>
              <Text style={[styles.statNumber, styles.primaryStatNumber]}>{dashboardData.stats.totalIssues}</Text>
              <Text style={[styles.statLabel, styles.primaryStatLabel]}>Total Issues</Text>
              <Text style={[styles.statSubtext, styles.primaryStatSubtext]}>Reported by community</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: '#10B981' }]}>
                {dashboardData.stats.resolvedIssues}
              </Text>
              <Text style={styles.statLabel}>Resolved</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: '#3B82F6' }]}>
                {dashboardData.stats.inProgress}
              </Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: '#F59E0B' }]}>
                {dashboardData.stats.pending}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>
          <View style={styles.responseTimeCard}>
            <Text style={styles.responseTimeLabel}>Avg. Response Time</Text>
            <Text style={styles.responseTimeValue}>{dashboardData.stats.responseTime}</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsScrollContent}
          >
            {dashboardData.quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.quickActionCard, { backgroundColor: action.color }]}
                onPress={() => handleQuickAction(action)}
                activeOpacity={0.8}
              >
                <Text style={styles.quickActionIcon}>{action.icon}</Text>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Issue Categories */}
        <View style={styles.categoriesContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Issue Categories</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScrollContent}
          >
            {dashboardData.categories.map((category, index) => (
              <TouchableOpacity key={index} style={styles.categoryCard}>
                <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                  <Text style={styles.categoryEmoji}>{category.icon}</Text>
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryCount}>{category.count} issues</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recent Issues */}
        <View style={styles.recentIssuesContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Issues</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>

          {dashboardData.recentIssues.map((issue) => (
            <TouchableOpacity key={issue.id} style={styles.issueCard}>
              <View style={styles.issueHeader}>
                <View style={styles.issueInfo}>
                  <Text style={styles.issueTitle}>{issue.title}</Text>
                  <Text style={styles.issueLocation}>📍 {issue.location}</Text>
                  <Text style={styles.issueTime}>{issue.timeAgo}</Text>
                </View>
                <View style={styles.issueBadges}>
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(issue.priority) }]}>
                    <Text style={styles.badgeText}>{issue.priority}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(issue.status) }]}>
                    <Text style={styles.badgeText}>{issue.status}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.issueCategory}>
                <Text style={styles.categoryTag}>{issue.category}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Emergency Contact */}
        <View style={styles.emergencyContainer}>
          <View style={styles.emergencyCard}>
            <Text style={styles.emergencyIcon}>🚨</Text>
            <View style={styles.emergencyInfo}>
              <Text style={styles.emergencyTitle}>Emergency Hotline</Text>
              <Text style={styles.emergencyText}>Report urgent civic issues immediately</Text>
            </View>
            <TouchableOpacity style={styles.emergencyButton}>
              <Text style={styles.emergencyButtonText}>Call Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: Platform.OS === 'android' ? 10 : 0,
  },
  userInfoContainer: {
    flex: 1,
    marginRight: 15,
  },
  greeting: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '400',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 4,
    flexShrink: 1,
  },
  location: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  notificationButton: {
    position: 'relative',
    padding: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
  },
  notificationIcon: {
    fontSize: 20,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsContainer: {
    margin: 20,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    width: (width - 60) / 2,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  primaryStatCard: {
    width: width - 40,
    backgroundColor: '#6366F1',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  primaryStatNumber: {
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  primaryStatLabel: {
    color: '#E2E8F0',
  },
  statSubtext: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  primaryStatSubtext: {
    color: '#CBD5E1',
  },
  responseTimeCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  responseTimeLabel: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  responseTimeValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  quickActionsContainer: {
    margin: 20,
    marginBottom: 0,
    paddingBottom: 10,
  },
  quickActionsScrollContent: {
    paddingHorizontal: 0,
    paddingVertical: 10,
  },
  quickActionCard: {
    width: 140,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  categoriesContainer: {
    margin: 20,
    marginBottom: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesScrollContent: {
    paddingHorizontal: 0,
    paddingVertical: 10,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    width: 120,
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
    color: '#64748B',
  },
  recentIssuesContainer: {
    margin: 20,
    marginBottom: 0,
  },
  issueCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  issueInfo: {
    flex: 1,
    marginRight: 12,
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  issueLocation: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  issueTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
  issueBadges: {
    alignItems: 'flex-end',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  issueCategory: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  categoryTag: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '600',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  emergencyContainer: {
    margin: 20,
  },
  emergencyCard: {
    backgroundColor: '#FEF2F2',
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  emergencyIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  emergencyInfo: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#991B1B',
    marginBottom: 4,
  },
  emergencyText: {
    fontSize: 14,
    color: '#DC2626',
  },
  emergencyButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  emergencyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 20,
  },
});
