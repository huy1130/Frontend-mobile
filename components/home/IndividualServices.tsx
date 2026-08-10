import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock, Car } from 'lucide-react-native';
import { mockIndividualServices } from '../../mock/homeData';

export default function IndividualServices() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Dịch Vụ Theo Yêu Cầu</Text>
        </View>

        <Text style={styles.title}>DANH MỤC DỊCH VỤ LẺ</Text>
        <Text style={styles.description}>
          Lựa chọn linh hoạt từng hạng mục chăm sóc xe chuyên sâu theo nhu cầu riêng.
        </Text>
      </View>

      {/* Services List Grid */}
      <View style={styles.servicesContainer}>
        {mockIndividualServices.map((svc) => (
          <View key={svc.id} style={styles.serviceCard}>
            <View style={styles.cardHeader}>
              <View style={styles.textContainer}>
                <Text style={styles.serviceName}>{svc.name}</Text>
                <Text style={styles.serviceDesc}>{svc.description}</Text>
              </View>

              <View style={styles.iconBox}>
                <Car color="#f97316" size={20} />
              </View>
            </View>

            <View style={styles.bottomSection}>
              <View style={styles.durationBox}>
                <Clock color="#64748b" size={14} />
                <Text style={styles.durationText}>{svc.durationMinutes} phút</Text>
              </View>

              <View style={styles.priceBox}>
                <Text style={styles.priceLabel}>Từ:</Text>
                <Text style={styles.priceValue}>{svc.price.toLocaleString('vi-VN')}đ</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    backgroundColor: '#f8fafc',
  },
  header: {
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
  servicesContainer: {
    gap: 12,
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#e2e8f0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    paddingRight: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 4,
    lineHeight: 22,
  },
  serviceDesc: {
    color: '#64748b',
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 20,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ffedd5',
    flexShrink: 0,
  },
  bottomSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  durationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  durationText: {
    color: '#64748b',
    fontSize: 12,
  },
  priceBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceLabel: {
    color: '#94a3b8',
    fontSize: 12,
  },
  priceValue: {
    color: '#ea580c',
    fontWeight: '900',
    fontSize: 16,
  },
});
