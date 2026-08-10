import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MapPin, Phone, Clock, Navigation } from 'lucide-react-native';
import { mockBranches } from '../../mock/homeData';

export default function Branches() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Hệ Thống Rửa Xe Chuyên Nghiệp</Text>
        </View>

        <Text style={styles.title}>CHI NHÁNH PHỤC VỤ</Text>
        <Text style={styles.description}>
          Hệ thống các điểm rửa xe hiện đại trang bị công nghệ bọt tuyết & phòng chờ VIP.
        </Text>
      </View>

      {/* Branches List */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {mockBranches.map((branch) => (
          <View 
            key={branch.id}
            style={styles.card}
          >
            <View>
              <View style={styles.cardHeader}>
                <View style={styles.iconBox}>
                  <MapPin color="white" size={16} />
                </View>
                <Text style={styles.branchName}>{branch.name}</Text>
              </View>

              <Text style={styles.address}>{branch.address}</Text>
              
              <View style={styles.detailsList}>
                <View style={styles.detailRow}>
                  <Phone color="#f97316" size={12} />
                  <Text style={styles.detailText}>{branch.phone}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Clock color="#f97316" size={12} />
                  <Text style={styles.detailText}>{branch.operatingHours}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.navButton}>
              <Navigation color="#f97316" size={12} />
              <Text style={styles.navButtonText}>Chỉ Đường Google Maps</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 32,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  badge: {
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 9999,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  badgeText: {
    color: '#ea580c',
    fontWeight: '900',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 4,
  },
  description: {
    color: '#64748b',
    fontSize: 12,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 14,
  },
  card: {
    width: 280,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    justifyContent: 'space-between',
    marginRight: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  branchName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
    flex: 1,
  },
  address: {
    color: '#475569',
    fontWeight: '500',
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 20,
  },
  detailsList: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  detailText: {
    color: '#475569',
    fontSize: 12,
  },
  navButton: {
    width: '100%',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
  },
  navButtonText: {
    color: '#1e293b',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
