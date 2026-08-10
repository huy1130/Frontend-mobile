import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Tag, Copy, Percent, Calendar } from 'lucide-react-native';
import { mockPromotions } from '../../mock/homeData';

export default function PublicPromotions() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Khuyến Mãi Đang Diễn Ra</Text>
        </View>

        <Text style={styles.title}>VOUCHER & ƯU ĐÃI</Text>
        <Text style={styles.subtitle}>DÀNH CHO BẠN</Text>
        <Text style={styles.description}>
          Nhập mã giảm giá khi đặt lịch online để nhận ngàn ưu đãi hấp dẫn.
        </Text>
      </View>

      {/* Promotions List */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {mockPromotions.map((promo) => (
          <View 
            key={promo.id}
            style={styles.card}
          >
            <View>
              <View style={styles.cardHeader}>
                <View style={styles.iconBox}>
                  <Percent color="white" size={18} />
                </View>
                <Text style={styles.validUntilText}>Hạn: {promo.validUntil}</Text>
              </View>

              <Text style={styles.promoTitle}>{promo.title}</Text>
              <Text style={styles.promoDesc}>{promo.description}</Text>
            </View>

            <View style={styles.bottomSection}>
              <View>
                <Text style={styles.codeLabel}>Mã ưu đãi:</Text>
                <Text style={styles.codeText}>{promo.code}</Text>
              </View>

              <TouchableOpacity style={styles.copyButton}>
                <Copy color="white" size={12} />
                <Text style={styles.copyButtonText}>Lấy Mã</Text>
              </TouchableOpacity>
            </View>
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
    borderBottomWidth: 1,
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
  subtitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ea580c',
    marginBottom: 8,
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
    backgroundColor: 'rgba(255, 247, 237, 0.6)', // orange-50/60
    borderWidth: 1,
    borderColor: '#fed7aa',
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
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  validUntilText: {
    color: '#64748b',
    fontSize: 11,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 4,
    lineHeight: 22,
  },
  promoDesc: {
    color: '#64748b',
    fontSize: 12,
    marginBottom: 12,
  },
  bottomSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(254, 215, 170, 0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codeLabel: {
    fontSize: 10,
    color: '#94a3b8',
  },
  codeText: {
    color: '#ea580c',
    fontFamily: 'monospace',
    fontWeight: '900',
    fontSize: 14,
  },
  copyButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#f97316',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  copyButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 12,
  },
});
