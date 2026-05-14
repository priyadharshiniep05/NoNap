import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { colors } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';
import { db } from '../services/DatabaseService';

// Fallback for modules that might not be installed yet
let MaterialCommunityIcons: any;
try { MaterialCommunityIcons = require('@expo/vector-icons').MaterialCommunityIcons; } catch (e) {
  // Simple fallback component
  MaterialCommunityIcons = ({ name, size, color }: any) => <View style={{ width: size, height: size, backgroundColor: color }} />;
}

interface Driver {
  id: string;
  name: string;
  vehicle: string;
  status: 'ALERT' | 'CAUTION' | 'DROWSY';
  lastActive: string;
  trips: number;
}

const MOCK_DRIVERS: Driver[] = [
  { id: '1', name: 'John Doe', vehicle: 'Truck-042', status: 'ALERT', lastActive: '2 mins ago', trips: 124 },
  { id: '2', name: 'Sarah Smith', vehicle: 'Van-089', status: 'CAUTION', lastActive: 'Just now', trips: 89 },
  { id: '3', name: 'Mike Johnson', vehicle: 'Truck-011', status: 'DROWSY', lastActive: '5 mins ago', trips: 156 },
  { id: '4', name: 'Emma Wilson', vehicle: 'Van-002', status: 'ALERT', lastActive: '10 mins ago', trips: 45 },
];

export default function FleetDashboard() {
  const [drivers, setDrivers] = useState(MOCK_DRIVERS);
  const [activeAlerts, setActiveAlerts] = useState<Driver[]>([]);
  const navigation = useNavigation<any>();

  const handleLogout = async () => {
    await db.logout();
    navigation.navigate('Login');
  };

  useEffect(() => {
    const drowsyDrivers = drivers.filter(d => d.status === 'DROWSY');
    setActiveAlerts(drowsyDrivers);
  }, [drivers]);

  const renderDriverCard = ({ item }: { item: Driver }) => {
    const statusColor = item.status === 'ALERT' ? colors.success : item.status === 'CAUTION' ? colors.caution : colors.danger;
    
    return (
      <View style={styles.driverCard}>
        <View style={styles.driverHeader}>
          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>{item.name}</Text>
            <Text style={styles.vehicleId}>{item.vehicle}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '22', borderColor: statusColor }]}>
            <Text style={[styles.statusBadgeText, { color: statusColor }]}>{item.status}</Text>
          </View>
        </View>
        
        <View style={styles.driverFooter}>
          <View style={styles.stat}>
            <MaterialCommunityIcons name="clock-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.statText}>{item.lastActive}</Text>
          </View>
          <View style={styles.stat}>
            <MaterialCommunityIcons name="truck-delivery" size={14} color={colors.textSecondary} />
            <Text style={styles.statText}>{item.trips} trips</Text>
          </View>
          <TouchableOpacity style={styles.viewButton}>
            <Text style={styles.viewButtonText}>View Live</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Fleet Control</Text>
          <Text style={styles.headerSubtitle}>{drivers.length} Drivers Online</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={handleLogout}
        >
          <MaterialCommunityIcons name="logout" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
        <View style={styles.quickStat}>
          <Text style={styles.quickStatLabel}>Active Alerts</Text>
          <Text style={[styles.quickStatValue, { color: colors.danger }]}>{activeAlerts.length}</Text>
        </View>
        <View style={styles.quickStat}>
          <Text style={styles.quickStatLabel}>Caution</Text>
          <Text style={[styles.quickStatValue, { color: colors.caution }]}>{drivers.filter(d => d.status === 'CAUTION').length}</Text>
        </View>
        <View style={styles.quickStat}>
          <Text style={styles.quickStatLabel}>Avg Fatigue</Text>
          <Text style={[styles.quickStatValue, { color: colors.accent }]}>12%</Text>
        </View>
      </ScrollView>

      {activeAlerts.length > 0 && (
        <View style={styles.alertBanner}>
          <MaterialCommunityIcons name="alert-octagon" size={24} color={colors.danger} />
          <Text style={styles.alertBannerText}>
            Emergency: {activeAlerts[0].name} is in critical state!
          </Text>
          <TouchableOpacity style={styles.escalateButton}>
            <Text style={styles.escalateButtonText}>Escalate</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.sectionTitle}>All Drivers</Text>
      <FlatList
        data={drivers}
        renderItem={renderDriverCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: 60,
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
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  profileButton: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
    borderWidth: 1,
    borderColor: colors.bg,
  },
  statsScroll: {
    maxHeight: 100,
    paddingLeft: 20,
    marginBottom: 20,
  },
  quickStat: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    marginRight: 12,
    minWidth: 120,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickStatLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  quickStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  alertBanner: {
    backgroundColor: colors.danger + '11',
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.danger + '33',
  },
  alertBannerText: {
    color: colors.textPrimary,
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  escalateButton: {
    backgroundColor: colors.danger,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  escalateButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  driverCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  driverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  vehicleId: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  driverFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginLeft: 4,
  },
  viewButton: {
    marginLeft: 'auto',
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  viewButtonText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  }
});
