import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar as CalendarIcon, CheckCircle2, XCircle, MapPin, QrCode, Tag, PlusCircle, X, ChevronRight } from 'lucide-react-native';
import QRCodeSVG from 'react-native-qrcode-svg';
import { useAuth } from '../../context/AuthContext';
import { bookingService, BookingResponseDTO } from '../../services/bookingService';
import { promotionService } from '../../services/promotionService';
import { loyaltyService } from '../../services/loyaltyService';

export default function HistoryScreen() {
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'cancelled'>('all');
  const { user, isLoggedIn } = useAuth();
  const [historyData, setHistoryData] = useState<BookingResponseDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedBooking, setSelectedBooking] = useState<BookingResponseDTO | null>(null);
  const [promotionsMap, setPromotionsMap] = useState<Record<number, string>>({});
  const [redemptionsMap, setRedemptionsMap] = useState<Record<number, string>>({});

  const loadHistory = async () => {
    if (!isLoggedIn || !user?.phone) return;
    setLoading(true);
    try {
      const response = await bookingService.getBookingHistory(user.phone);
      if (response && response.data) {
        setHistoryData(response.data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && user?.phone) {
      loadHistory();
      loyaltyService.getMyRedemptions().then(res => {
        const map: Record<number, string> = {};
        const list = Array.isArray(res) ? res : (res as any)?.data || [];
        list.forEach((r: any) => map[r.redemptionId] = r.rewardName);
        setRedemptionsMap(map);
      }).catch(() => { });
    } else {
      setHistoryData([]);
      setRedemptionsMap({});
    }

    promotionService.getPublicPromotions().then(res => {
      const map: Record<number, string> = {};
      if (Array.isArray(res)) res.forEach(p => map[p.promotionId] = p.promoName);
      setPromotionsMap(map);
    }).catch(() => { });
  }, [isLoggedIn, user]);

  const filtered = historyData
    .filter(i => {
      if (filterStatus === 'all') return true;
      if (filterStatus === 'completed') return i.status.toLowerCase() === 'completed';
      if (filterStatus === 'cancelled') return i.status.toLowerCase() === 'cancelled';
      return true;
    })
    .sort((a, b) => b.bookingId - a.bookingId);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Top Header Bar */}
        <View style={styles.headerBar}>
          <Image source={require('../../assets/images/logo-wash.png')} style={styles.headerLogoImage} resizeMode="contain" />
          <Text style={styles.headerTitle}>Lịch Sử Đặt Lịch</Text>
        </View>

        <View style={styles.content}>

          {/* Filter Pills */}
          <View style={styles.filterContainer}>
            <TouchableOpacity
              onPress={() => setFilterStatus('all')}
              style={[styles.filterBtn, filterStatus === 'all' ? styles.filterBtnActiveAll : styles.filterBtnInactive]}
            >
              <Text style={[styles.filterText, filterStatus === 'all' ? styles.filterTextActive : styles.filterTextInactive]}>
                Tất Cả
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFilterStatus('completed')}
              style={[styles.filterBtn, filterStatus === 'completed' ? styles.filterBtnActiveCompleted : styles.filterBtnInactive]}
            >
              <Text style={[styles.filterText, filterStatus === 'completed' ? styles.filterTextActive : styles.filterTextInactive]}>
                Hoàn Thành
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFilterStatus('cancelled')}
              style={[styles.filterBtn, filterStatus === 'cancelled' ? styles.filterBtnActiveCancelled : styles.filterBtnInactive]}
            >
              <Text style={[styles.filterText, filterStatus === 'cancelled' ? styles.filterTextActive : styles.filterTextInactive]}>
                Đã Hủy
              </Text>
            </TouchableOpacity>
          </View>

          {/* Cards */}
          {loading ? (
            <ActivityIndicator size="large" color="#f97316" style={{ marginTop: 40 }} />
          ) : filtered.length === 0 ? (
            <Text style={{ textAlign: 'center', marginTop: 40, color: '#64748b' }}>Không có dữ liệu lịch sử đặt lịch.</Text>
          ) : filtered.map((item) => (
            <View key={item.bookingId} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1, gap: 4 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.idBadge}>
                      <Text style={styles.idText}>Mã Lịch hẹn-{item.bookingId}</Text>
                    </View>
                  </View>
                  {(item.appliedReward || item.redemptionId || item.promotionId || item.promoCode) && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      {(item.appliedReward || item.redemptionId) && (
                        <View style={styles.rewardBadgeCard}>
                          <Text style={styles.rewardBadgeCardText}>
                            🎁 {item.appliedReward?.serviceName || item.appliedReward?.rewardName || (item.redemptionId ? redemptionsMap[item.redemptionId] : null) || 'Đổi thưởng'}
                          </Text>
                        </View>
                      )}
                      {(item.promotionId || item.promoCode) && (
                        <View style={styles.promoBadgeCard}>
                          <Text style={styles.promoBadgeCardText}>
                            🏷️ {item.promoCode || (item.promotionId ? promotionsMap[item.promotionId] : null) || 'Khuyến mãi'}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>

                {item.status.toLowerCase() === 'completed' ? (
                  <View style={[styles.statusBadge, styles.statusBadgeCompleted]}>
                    <CheckCircle2 color="#059669" size={12} />
                    <Text style={[styles.statusText, { color: '#047857' }]}>Đã Hoàn Thành</Text>
                  </View>
                ) : item.status.toLowerCase() === 'cancelled' ? (
                  <View style={[styles.statusBadge, styles.statusBadgeCancelled]}>
                    <XCircle color="#e11d48" size={12} />
                    <Text style={[styles.statusText, { color: '#be123c' }]}>Đã Hủy</Text>
                  </View>
                ) : (
                  <View style={[styles.statusBadge, { backgroundColor: '#e0f2fe' }]}>
                    <Text style={[styles.statusText, { color: '#0369a1' }]}>{item.status}</Text>
                  </View>
                )}
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.serviceName}>{item.serviceName}</Text>

                {item.addOns && item.addOns.length > 0 && (
                  <View style={{ marginBottom: 8 }}>
                    {item.addOns.map(addon => (
                      <View key={addon.bookingAddOnId} style={styles.addOnTag}>
                        <PlusCircle color="#ea580c" size={12} />
                        <Text style={styles.addOnText}>+ {addon.serviceName}</Text>
                        {addon.finalPrice === 0 && (
                          <View style={styles.freeBadge}>
                            <Text style={styles.freeBadgeText}>Miễn phí</Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.iconRow}>
                  <CalendarIcon color="#f97316" size={14} />
                  <Text style={styles.iconText}>{new Date(item.bookingDate).toLocaleDateString('vi-VN')} • {item.startTime?.substring(0, 5)} - {item.endTime?.substring(0, 5)}</Text>
                </View>
                <View style={styles.iconRow}>
                  <MapPin color="#94a3b8" size={14} />
                  <Text style={styles.iconTextDim}>{item.licensePlate ? `${item.licensePlate} (${item.vehicleType || 'Xe'})` : 'Chi nhánh HybridWash'}</Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.footerLabel}>Tổng thanh toán:</Text>
                  <Text style={styles.footerValue}>{(item.finalPrice ?? 0).toLocaleString('vi-VN')}đ</Text>
                </View>

                <TouchableOpacity
                  style={styles.detailBtn}
                  onPress={() => setSelectedBooking(item)}
                >
                  <Text style={styles.detailBtnText}>Xem Chi Tiết</Text>
                  <ChevronRight color="#ea580c" size={16} />
                </TouchableOpacity>
              </View>
            </View>
          ))}

        </View>
      </ScrollView>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <Modal
          visible={!!selectedBooking}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSelectedBooking(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Chi Tiết Lịch Đặt</Text>
                <TouchableOpacity onPress={() => setSelectedBooking(null)} style={styles.closeBtn}>
                  <X color="#64748b" size={24} />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.modalBody}>
                {/* QR Code Section */}
                {selectedBooking.qrCode ? (
                  <View style={styles.qrContainer}>
                    <View style={styles.qrHeader}>
                      <QrCode color="#ea580c" size={16} />
                      <Text style={styles.qrHeaderText}>MÃ QR CHECK-IN</Text>
                    </View>
                    <View style={styles.qrCodeBox}>
                      <QRCodeSVG
                        value={selectedBooking.qrCode}
                        size={150}
                      />
                    </View>
                    <Text style={styles.qrSubText}>Đưa mã này cho nhân viên để check-in nhanh</Text>
                  </View>
                ) : null}

                {/* Details Grid */}
                <View style={styles.infoSection}>
                  <View style={styles.infoRow}>
                    <View style={styles.infoCol}>
                      <Text style={styles.infoLabel}>MÃ ĐẶT LỊCH</Text>
                      <Text style={styles.infoValue}>#{selectedBooking.bookingId}</Text>
                    </View>
                    <View style={styles.infoCol}>
                      <Text style={styles.infoLabel}>TRẠNG THÁI</Text>
                      <Text style={[styles.infoValue, {
                        color: ['completed', 'checkedout'].includes(selectedBooking.status.toLowerCase()) ? '#059669'
                          : ['pending', 'confirmed', 'washing'].includes(selectedBooking.status.toLowerCase()) ? '#0284c7'
                            : '#e11d48'
                      }]}>
                        {selectedBooking.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.infoCol}>
                      <Text style={styles.infoLabel}>NGÀY ĐẶT</Text>
                      <Text style={styles.infoSubValue}>
                        {selectedBooking.bookingDate ? new Date(selectedBooking.bookingDate).toLocaleDateString('vi-VN') : ''}
                      </Text>
                    </View>
                    <View style={styles.infoCol}>
                      <Text style={styles.infoLabel}>THỜI GIAN</Text>
                      <Text style={styles.infoSubValue}>
                        {selectedBooking.startTime?.substring(0, 5)} - {selectedBooking.endTime?.substring(0, 5)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Vehicle */}
                <View style={styles.divider} />
                <View style={styles.sectionBox}>
                  <Text style={styles.infoLabel}>PHƯƠNG TIỆN</Text>
                  <Text style={styles.infoSubValue}>{selectedBooking.licensePlate} ({selectedBooking.vehicleType || 'Xe'})</Text>
                </View>

                {/* Service Breakdown */}
                <View style={styles.divider} />
                <View style={styles.sectionBox}>
                  <Text style={styles.infoLabel}>DỊCH VỤ & TẶNG KÈM</Text>
                  <View style={styles.serviceRow}>
                    <Text style={styles.serviceTitle}>{selectedBooking.serviceName}</Text>
                    <Text style={styles.servicePrice}>
                      {selectedBooking.originalPrice != null ? `${selectedBooking.originalPrice.toLocaleString('vi-VN')}đ` : ''}
                    </Text>
                  </View>

                  {selectedBooking.addOns && selectedBooking.addOns.length > 0 && selectedBooking.addOns.map(addon => (
                    <View key={addon.bookingAddOnId} style={styles.addOnRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <PlusCircle color="#ea580c" size={14} />
                        <Text style={{ fontSize: 13, color: '#c2410c', fontWeight: '600' }}>{addon.serviceName}</Text>
                      </View>
                      <Text style={{ fontSize: 12, fontWeight: 'bold', color: addon.finalPrice === 0 ? '#059669' : '#0f172a' }}>
                        {addon.finalPrice === 0 ? 'Miễn phí' : `${addon.finalPrice.toLocaleString('vi-VN')}đ`}
                      </Text>
                    </View>
                  ))}
                </View>

                {(selectedBooking.appliedReward?.serviceName || (selectedBooking.redemptionId && redemptionsMap[selectedBooking.redemptionId])) && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.sectionBox}>
                      <Text style={styles.infoLabel}>PHẦN THƯỞNG ÁP DỤNG</Text>
                      <View style={styles.rewardModalTag}>
                        <Text style={styles.rewardModalTagText}>
                          🎁 Miễn phí dịch vụ: {selectedBooking.appliedReward?.serviceName || redemptionsMap[selectedBooking.redemptionId!]}
                        </Text>
                      </View>
                    </View>
                  </>
                )}

                {(selectedBooking.promotionId || selectedBooking.promoCode) && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.sectionBox}>
                      <Text style={styles.infoLabel}>KHUYẾN MÃI ÁP DỤNG</Text>
                      <View style={styles.promoModalTag}>
                        <Text style={styles.promoModalTagText}>
                          🏷️ {selectedBooking.promoCode || (selectedBooking.promotionId ? promotionsMap[selectedBooking.promotionId] : null) || 'Khuyến mãi'}
                          {selectedBooking.originalPrice != null && selectedBooking.finalPrice != null && selectedBooking.originalPrice > selectedBooking.finalPrice ? ` (-${(selectedBooking.originalPrice - selectedBooking.finalPrice).toLocaleString('vi-VN')}đ)` : ''}
                        </Text>
                      </View>
                    </View>
                  </>
                )}

                {/* Payment Breakdown */}
                <View style={styles.divider} />
                <View style={styles.paymentRow}>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#475569' }}>Tổng Tiền</Text>
                  <Text style={{ fontSize: 20, fontWeight: '900', color: '#ea580c' }}>
                    {(selectedBooking.finalPrice ?? 0).toLocaleString('vi-VN')}đ
                  </Text>
                </View>
              </ScrollView>

              <TouchableOpacity onPress={() => setSelectedBooking(null)} style={styles.closeModalBtn}>
                <Text style={styles.closeModalBtnText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  headerBar: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerLogoImage: { width: 110, height: 36 },
  headerTitle: { fontWeight: '800', fontSize: 16, color: '#0f172a' },

  content: { padding: 20 },

  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(226, 232, 240, 0.7)',
    padding: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  filterBtnInactive: { backgroundColor: 'transparent' },
  filterBtnActiveAll: { backgroundColor: '#f97316' },
  filterBtnActiveCompleted: { backgroundColor: '#059669' },
  filterBtnActiveCancelled: { backgroundColor: '#e11d48' },
  filterText: { fontWeight: '800', fontSize: 12 },
  filterTextActive: { color: '#fff' },
  filterTextInactive: { color: '#475569' },

  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 24,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#e2e8f0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 12,
    marginBottom: 12,
  },
  idBadge: {
    backgroundColor: '#fff7ed',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffedd5',
  },
  idText: { color: '#ea580c', fontWeight: '800', fontSize: 12 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
  },
  statusBadgeCompleted: { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' },
  statusBadgeCancelled: { backgroundColor: '#fff1f2', borderColor: '#fecdd3' },
  statusText: { fontWeight: 'bold', fontSize: 11 },

  cardBody: { marginBottom: 12 },
  serviceName: { color: '#0f172a', fontWeight: '800', fontSize: 14, marginBottom: 8 },
  addOnTag: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  addOnText: { fontSize: 12, fontWeight: 'bold', color: '#ea580c' },
  freeBadge: { backgroundColor: '#ffedd5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  freeBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#c2410c' },
  iconRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  iconText: { color: '#475569', fontSize: 12 },
  iconTextDim: { color: '#64748b', fontSize: 12 },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  footerLabel: { color: '#94a3b8', fontSize: 12 },
  footerValue: { color: '#ea580c', fontWeight: '800', fontSize: 16 },

  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffedd5',
  },
  detailBtnText: { color: '#ea580c', fontWeight: 'bold', fontSize: 12, marginRight: 2 },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#f8fafc',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  closeBtn: { padding: 4 },
  modalBody: { padding: 20 },

  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff7ed',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ffedd5',
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  qrHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  qrHeaderText: { fontSize: 12, fontWeight: '800', color: '#ea580c', letterSpacing: 0.5 },
  qrCodeBox: { backgroundColor: '#fff', padding: 12, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  qrSubText: { fontSize: 11, color: '#94a3b8', marginTop: 10, textAlign: 'center' },

  infoSection: { gap: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoCol: { flex: 1 },
  infoLabel: { fontSize: 10, fontWeight: '800', color: '#94a3b8', letterSpacing: 0.5, marginBottom: 4 },
  infoValue: { fontSize: 14, fontWeight: '800', color: '#0f172a' },
  infoSubValue: { fontSize: 14, fontWeight: '600', color: '#334155' },

  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 16 },
  sectionBox: { gap: 6 },
  serviceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  serviceTitle: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
  servicePrice: { fontSize: 14, fontWeight: 'bold', color: '#334155' },

  addOnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    padding: 10,
    borderRadius: 10,
    marginTop: 6,
  },

  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  promoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  promoBadgeText: { fontSize: 11, fontWeight: 'bold', color: '#047857' },

  rewardBadgeCard: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  rewardBadgeCardText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#92400e',
  },
  promoBadgeCard: {
    backgroundColor: '#ffe4e6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fecdd3',
  },
  promoBadgeCardText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#be123c',
  },
  rewardModalTag: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fde68a',
    alignSelf: 'flex-start',
  },
  rewardModalTagText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#92400e',
  },
  promoModalTag: {
    backgroundColor: '#ffe4e6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecdd3',
    alignSelf: 'flex-start',
  },
  promoModalTagText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#be123c',
  },

  closeModalBtn: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  closeModalBtnText: { fontWeight: 'bold', fontSize: 14, color: '#334155' },
});
