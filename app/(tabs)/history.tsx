import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar as CalendarIcon, CheckCircle2, XCircle, MapPin, QrCode, Tag, PlusCircle, X, ChevronRight, CreditCard, AlertTriangle, Clock } from 'lucide-react-native';
import QRCodeSVG from 'react-native-qrcode-svg';
import { useAuth } from '../../context/AuthContext';
import { bookingService, BookingResponseDTO } from '../../services/bookingService';
import { promotionService } from '../../services/promotionService';
import { loyaltyService } from '../../services/loyaltyService';
import { systemParameterService, SystemParameterDto } from '../../services/systemParameterService';

export default function HistoryScreen() {
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  const { user, isLoggedIn } = useAuth();
  const [historyData, setHistoryData] = useState<BookingResponseDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedBooking, setSelectedBooking] = useState<BookingResponseDTO | null>(null);
  const [promotionsMap, setPromotionsMap] = useState<Record<number, string>>({});
  const [redemptionsMap, setRedemptionsMap] = useState<Record<number, string>>({});

  // Deposit QR & Cancel State
  const [systemParams, setSystemParams] = useState<SystemParameterDto | null>(null);
  const [depositModalData, setDepositModalData] = useState<{
    bookingId: number;
    amount: number;
    accountNumber: string;
    accountName: string;
    bin: string;
    description: string;
    qrCode?: string;
    qrImageUrl?: string;
    checkoutUrl?: string;
  } | null>(null);
  const [isCheckingDeposit, setIsCheckingDeposit] = useState<boolean>(false);
  const [isCancellingDeposit, setIsCancellingDeposit] = useState<boolean>(false);
  const [confirmCancelBookingId, setConfirmCancelBookingId] = useState<number | null>(null);

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
    systemParameterService.getSystemParameter().then(setSystemParams).catch(() => null);

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

  // Polling for deposit status when deposit QR modal is open
  useEffect(() => {
    let interval: any;
    if (depositModalData?.bookingId) {
      interval = setInterval(async () => {
        try {
          const detailRes = await bookingService.getBookingDetail(depositModalData.bookingId);
          const currentStatus = detailRes?.data?.status || detailRes?.data?.bookingStatus;
          if (currentStatus === 'Deposited') {
            setDepositModalData(null);
            loadHistory();
            Alert.alert('Thành công 🎉', 'Thanh toán cọc thành công! Lịch hẹn của bạn đã được xác nhận!');
          }
        } catch {
          // silent catch
        }
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [depositModalData?.bookingId]);

  const handleOpenDepositQr = async (bId: number) => {
    try {
      const payRes = await bookingService.createDepositPayment(bId);
      if (payRes) {
        const depositAmt = payRes.amount ?? payRes.Amount ?? 0;
        const isPaid = payRes.status === 'PAID' || payRes.Status === 'PAID';
        if (depositAmt <= 0 || isPaid) {
          loadHistory();
          Alert.alert('Thành công 🎉', '🎉 Đơn hàng miễn phí 100% cọc! Trạng thái đã tự động cập nhật.');
        } else {
          setDepositModalData({
            bookingId: bId,
            amount: depositAmt,
            accountNumber: payRes.accountNumber || payRes.AccountNumber || '',
            accountName: payRes.accountName || payRes.AccountName || '',
            bin: payRes.bin || payRes.Bin || '',
            description: payRes.description || payRes.Description || `Deposit for booking ${bId}`,
            qrCode: payRes.qrCode || payRes.QrCode,
            qrImageUrl: payRes.qrImageUrl || payRes.QrImageUrl,
            checkoutUrl: payRes.checkoutUrl || payRes.CheckoutUrl
          });
        }
      }
    } catch {
      Alert.alert('Lỗi', 'Không thể tạo mã QR thanh toán cọc.');
    }
  };

  const handleCheckDepositStatus = async () => {
    if (!depositModalData?.bookingId) return;
    setIsCheckingDeposit(true);
    try {
      const detailRes = await bookingService.getBookingDetail(depositModalData.bookingId);
      const currentStatus = detailRes?.data?.status || detailRes?.data?.bookingStatus;
      if (currentStatus === 'Deposited') {
        setDepositModalData(null);
        loadHistory();
        Alert.alert('Thành công 🎉', 'Đã xác nhận thanh toán đặt cọc thành công!');
      } else {
        Alert.alert('Thông báo', 'Hệ thống chưa nhận được giao dịch. Vui lòng hoàn tất chuyển khoản và kiểm tra lại.');
      }
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể kiểm tra trạng thái thanh toán.');
    } finally {
      setIsCheckingDeposit(false);
    }
  };

  const [loadingDetailBookingId, setLoadingDetailBookingId] = useState<number | null>(null);

  const handleViewDetail = async (item: BookingResponseDTO) => {
    setLoadingDetailBookingId(item.bookingId);
    try {
      const res = await bookingService.getBookingDetail(item.bookingId);
      if (res && res.data) {
        setSelectedBooking(res.data);
      } else {
        setSelectedBooking(item);
      }
    } catch {
      setSelectedBooking(item);
    } finally {
      setLoadingDetailBookingId(null);
    }
  };

  const handleConfirmCancel = async (bookingId: number) => {
    if (!bookingId) return;
    setIsCancellingDeposit(true);
    try {
      await bookingService.cancelBooking(bookingId);
      Alert.alert('Thông báo', `Đơn đặt lịch #${bookingId} đã được chuyển sang trạng thái Đã Hủy.`);
      setConfirmCancelBookingId(null);
      setDepositModalData(null);
      loadHistory();
    } catch (err: any) {
      Alert.alert('Lỗi', err.response?.data?.message || 'Không thể hủy đơn đặt lịch. Vui lòng thử lại.');
    } finally {
      setIsCancellingDeposit(false);
    }
  };

  const filtered = historyData
    .filter(i => {
      const st = i.status.toLowerCase();
      if (filterStatus === 'all') return true;
      if (filterStatus === 'active') return ['pending', 'deposited', 'confirmed', 'washing'].includes(st);
      if (filterStatus === 'completed') return ['completed', 'checkedout'].includes(st);
      if (filterStatus === 'cancelled') return st === 'cancelled';
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
              onPress={() => setFilterStatus('active')}
              style={[styles.filterBtn, filterStatus === 'active' ? { backgroundColor: '#3b82f6', borderColor: '#2563eb' } : styles.filterBtnInactive]}
            >
              <Text style={[styles.filterText, filterStatus === 'active' ? styles.filterTextActive : styles.filterTextInactive]}>
                Đang Thực Hiện
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
          ) : filtered.map((item) => {
            const st = item.status.toLowerCase();
            const isBike = (item.vehicleType || '').toLowerCase().includes('bike') || (item.vehicleType || '').toLowerCase().includes('xe máy');
            const bikeRate = systemParams?.bikeDepositAmount ?? 20000;
            const carPercent = systemParams?.carDepositPercentage ?? 20;
            const depositAmtEst = item.depositAmount ?? (isBike ? Math.min(bikeRate, item.finalPrice ?? 0) : Math.round(((item.finalPrice ?? 0) * carPercent) / 100));
            const remainingAmt = Math.max(0, (item.finalPrice ?? 0) - depositAmtEst);

            return (
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

                  {st === 'completed' || st === 'checkedout' ? (
                    <View style={[styles.statusBadge, styles.statusBadgeCompleted]}>
                      <CheckCircle2 color="#059669" size={12} />
                      <Text style={[styles.statusText, { color: '#047857' }]}>Đã Hoàn Thành</Text>
                    </View>
                  ) : st === 'cancelled' ? (
                    <View style={[styles.statusBadge, styles.statusBadgeCancelled]}>
                      <XCircle color="#e11d48" size={12} />
                      <Text style={[styles.statusText, { color: '#be123c' }]}>Đã Hủy</Text>
                    </View>
                  ) : st === 'washing' || st === 'inprogress' || st === 'in-progress' ? (
                    <View style={[styles.statusBadge, { backgroundColor: '#fff7ed', borderColor: '#ffedd5' }]}>
                      <Clock color="#ea580c" size={12} />
                      <Text style={[styles.statusText, { color: '#c2410c' }]}>Đang Rửa Xe</Text>
                    </View>
                  ) : st === 'deposited' ? (
                    <View style={[styles.statusBadge, { backgroundColor: '#ccfbf1', borderColor: '#99f6e4' }]}>
                      <CreditCard color="#0d9488" size={12} />
                      <Text style={[styles.statusText, { color: '#0f766e' }]}>Đã Đặt Cọc</Text>
                    </View>
                  ) : st === 'confirmed' ? (
                    <View style={[styles.statusBadge, { backgroundColor: '#e0e7ff', borderColor: '#c7d2fe' }]}>
                      <CheckCircle2 color="#4f46e5" size={12} />
                      <Text style={[styles.statusText, { color: '#4338ca' }]}>Đã Xác Nhận</Text>
                    </View>
                  ) : st === 'noshow' ? (
                    <View style={[styles.statusBadge, { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' }]}>
                      <XCircle color="#64748b" size={12} />
                      <Text style={[styles.statusText, { color: '#475569' }]}>Khách Không Đến</Text>
                    </View>
                  ) : st === 'pending' ? (
                    <View style={[styles.statusBadge, { backgroundColor: '#fef3c7', borderColor: '#fde68a' }]}>
                      <Clock color="#d97706" size={12} />
                      <Text style={[styles.statusText, { color: '#b45309' }]}>Chờ Thanh Toán Cọc</Text>
                    </View>
                  ) : (
                    <View style={[styles.statusBadge, { backgroundColor: '#e0f2fe', borderColor: '#bae6fd' }]}>
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
                  {(() => {
                    const isDepositedState = ['deposited', 'confirmed', 'washing', 'inprogress', 'in-progress'].includes(st);
                    return (
                      <View>
                        <Text style={styles.footerLabel}>{isDepositedState ? 'Còn lại trả tại tiệm:' : 'Tổng thanh toán:'}</Text>
                        <Text style={styles.footerValue}>
                          {(isDepositedState ? remainingAmt : (item.finalPrice ?? 0)).toLocaleString('vi-VN')}đ
                        </Text>
                      </View>
                    );
                  })()}

                  <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                    {st === 'pending' && (
                      <TouchableOpacity
                        style={{ backgroundColor: '#ea580c', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 }}
                        onPress={() => handleOpenDepositQr(item.bookingId)}
                      >
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 11 }}>Cọc Ngay</Text>
                      </TouchableOpacity>
                    )}

                    {['pending', 'confirmed'].includes(st) && (
                      <TouchableOpacity
                        style={{ backgroundColor: '#fff1f2', borderWidth: 1, borderColor: '#fecdd3', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 10 }}
                        onPress={() => setConfirmCancelBookingId(item.bookingId)}
                      >
                        <Text style={{ color: '#e11d48', fontWeight: 'bold', fontSize: 11 }}>Hủy Đơn</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.detailBtn}
                      onPress={() => handleViewDetail(item)}
                      disabled={loadingDetailBookingId === item.bookingId}
                    >
                      {loadingDetailBookingId === item.bookingId ? (
                        <ActivityIndicator size="small" color="#ea580c" />
                      ) : (
                        <>
                          <Text style={styles.detailBtnText}>Chi Tiết</Text>
                          <ChevronRight color="#ea580c" size={14} />
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}

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
                      {(() => {
                        const rawStatus = (selectedBooking as any).bookingStatus || selectedBooking.status || '';
                        const detailSt = rawStatus.toLowerCase();
                        let label = rawStatus;
                        let color = '#334155';
                        let bgColor = '#f1f5f9';

                        if (detailSt === 'completed' || detailSt === 'checkedout') {
                          label = 'Đã Hoàn Thành'; color = '#047857'; bgColor = '#ecfdf5';
                        } else if (detailSt === 'cancelled') {
                          label = 'Đã Hủy'; color = '#be123c'; bgColor = '#fff1f2';
                        } else if (detailSt === 'washing' || detailSt === 'inprogress' || detailSt === 'in-progress') {
                          label = 'Đang Rửa Xe'; color = '#c2410c'; bgColor = '#fff7ed';
                        } else if (detailSt === 'deposited') {
                          label = 'Đã Đặt Cọc'; color = '#0f766e'; bgColor = '#ccfbf1';
                        } else if (detailSt === 'confirmed') {
                          label = 'Đã Xác Nhận'; color = '#4338ca'; bgColor = '#e0e7ff';
                        } else if (detailSt === 'noshow') {
                          label = 'Khách Không Đến'; color = '#475569'; bgColor = '#f1f5f9';
                        } else if (detailSt === 'pending') {
                          label = 'Chờ Thanh Toán Cọc'; color = '#b45309'; bgColor = '#fef3c7';
                        }

                        return (
                          <View style={{ backgroundColor: bgColor, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginTop: 2 }}>
                            <Text style={{ fontSize: 12, fontWeight: '800', color: color }}>
                              {label}
                            </Text>
                          </View>
                        );
                      })()}
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
                <View style={{ backgroundColor: '#f8fafc', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', gap: 8 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 13, color: '#64748b' }}>Tổng Chi Phí Dịch Vụ:</Text>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#0f172a' }}>
                      {(selectedBooking.finalPrice ?? 0).toLocaleString('vi-VN')}đ
                    </Text>
                  </View>

                  {(() => {
                    const st = selectedBooking.status?.toLowerCase() || '';
                    const isBike = (selectedBooking.vehicleType || '').toLowerCase().includes('bike') || (selectedBooking.vehicleType || '').toLowerCase().includes('xe máy');
                    const bikeRate = systemParams?.bikeDepositAmount ?? 20000;
                    const carPercent = systemParams?.carDepositPercentage ?? 20;
                    const depositAmtEst = selectedBooking.depositAmount ?? (isBike ? Math.min(bikeRate, selectedBooking.finalPrice ?? 0) : Math.round(((selectedBooking.finalPrice ?? 0) * carPercent) / 100));
                    const isDepositedState = ['deposited', 'confirmed', 'washing', 'completed', 'checkedout'].includes(st);
                    const remainingAmt = Math.max(0, (selectedBooking.finalPrice ?? 0) - (isDepositedState ? depositAmtEst : 0));

                    return (
                      <>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={{ fontSize: 13, color: '#64748b' }}>Đã Đặt Cọc:</Text>
                          <Text style={{ fontSize: 14, fontWeight: 'bold', color: isDepositedState ? '#0d9488' : '#64748b' }}>
                            {isDepositedState ? `${depositAmtEst.toLocaleString('vi-VN')}đ` : '0đ (Chưa cọc)'}
                          </Text>
                        </View>

                        <View style={{ borderTopWidth: 1, borderTopColor: '#cbd5e1', paddingTop: 8, marginTop: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#0f172a' }}>Còn Lại:</Text>
                          <Text style={{ fontSize: 18, fontWeight: '900', color: '#ea580c' }}>
                            {remainingAmt.toLocaleString('vi-VN')}đ
                          </Text>
                        </View>
                      </>
                    );
                  })()}
                </View>
              </ScrollView>

              <TouchableOpacity onPress={() => setSelectedBooking(null)} style={styles.closeModalBtn}>
                <Text style={styles.closeModalBtnText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* PayOS VietQR Deposit Payment Modal */}
      {depositModalData && (
        <Modal
          visible={!!depositModalData}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setDepositModalData(null)}
        >
          <View style={styles.modalOverlay}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
              <View style={[styles.modalContent, { maxHeight: '90%', padding: 20 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ padding: 8, backgroundColor: '#ea580c', borderRadius: 12 }}>
                      <CreditCard color="white" size={20} />
                    </View>
                    <View>
                      <Text style={{ fontWeight: '800', fontSize: 16, color: '#0f172a' }}>Thanh Toán Tiền Cọc</Text>
                      <Text style={{ fontSize: 12, color: '#64748b' }}>Mã lịch hẹn #{depositModalData.bookingId}</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => setDepositModalData(null)}>
                    <XCircle color="#94a3b8" size={22} />
                  </TouchableOpacity>
                </View>

                {/* QR Display */}
                <View style={{ alignItems: 'center', marginVertical: 12 }}>
                  <View style={{ padding: 12, backgroundColor: '#fff', borderRadius: 20, borderWidth: 2, borderColor: '#ffedd5', shadowColor: '#ea580c', shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 }}>
                    {depositModalData.qrImageUrl ? (
                      <Image source={{ uri: depositModalData.qrImageUrl }} style={{ width: 200, height: 200 }} resizeMode="contain" />
                    ) : (
                      <QRCodeSVG value={depositModalData.qrCode || depositModalData.checkoutUrl || ''} size={190} />
                    )}
                  </View>
                  <Text style={{ fontSize: 11, color: '#64748b', marginTop: 8, fontStyle: 'italic' }}>Quét mã bằng App Ngân Hàng để chuyển khoản cọc</Text>
                </View>

                {/* Info Card */}
                <View style={{ backgroundColor: '#f8fafc', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', gap: 10, marginVertical: 12 }}>
                  {depositModalData.accountName && (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 12, color: '#64748b' }}>Chủ tài khoản:</Text>
                      <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#0f172a' }}>{depositModalData.accountName}</Text>
                    </View>
                  )}
                  {depositModalData.accountNumber && (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: 12, color: '#64748b' }}>Số tài khoản:</Text>
                      <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#ea580c' }}>{depositModalData.accountNumber}</Text>
                    </View>
                  )}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 12, color: '#64748b' }}>Số tiền cọc:</Text>
                    <Text style={{ fontSize: 14, fontWeight: '900', color: '#e11d48' }}>{depositModalData.amount.toLocaleString('vi-VN')}đ</Text>
                  </View>
                  {depositModalData.description && (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 12, color: '#64748b' }}>Nội dung CK:</Text>
                      <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#b45309', backgroundColor: '#fef3c7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>{depositModalData.description}</Text>
                    </View>
                  )}
                </View>

                {/* Action Buttons */}
                <View style={{ gap: 10, marginTop: 4 }}>
                  <TouchableOpacity
                    onPress={handleCheckDepositStatus}
                    disabled={isCheckingDeposit}
                    style={{ backgroundColor: '#f97316', paddingVertical: 14, borderRadius: 14, alignItems: 'center', opacity: isCheckingDeposit ? 0.7 : 1 }}
                  >
                    {isCheckingDeposit ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>Tôi Đã Chuyển Khoản - Kiểm Tra Ngay</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setDepositModalData(null)}
                    style={{ backgroundColor: '#f1f5f9', paddingVertical: 12, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: '#cbd5e1' }}
                  >
                    <Text style={{ color: '#334155', fontWeight: 'bold', fontSize: 13 }}>Đóng (Thanh Toán Sau)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setConfirmCancelBookingId(depositModalData.bookingId)}
                    disabled={isCancellingDeposit}
                    style={{ backgroundColor: '#fff1f2', paddingVertical: 12, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: '#fecdd3' }}
                  >
                    <Text style={{ color: '#e11d48', fontWeight: 'bold', fontSize: 13 }}>Hủy Đơn Lịch Hẹn Này</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </Modal>
      )}

      {/* Confirm Cancel Modal */}
      {confirmCancelBookingId && (
        <Modal
          visible={!!confirmCancelBookingId}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setConfirmCancelBookingId(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxHeight: 'auto', padding: 24, alignItems: 'center' }]}>
              <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff1f2', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fecdd3', marginBottom: 16 }}>
                <AlertTriangle color="#e11d48" size={28} />
              </View>

              <Text style={{ fontSize: 18, fontWeight: '900', color: '#0f172a', marginBottom: 8, textAlign: 'center' }}>
                Xác Nhận Hủy Lịch Hẹn
              </Text>
              <Text style={{ fontSize: 13, color: '#475569', textAlign: 'center', lineHeight: 20, marginBottom: 20 }}>
                Bạn có chắc chắn muốn hủy đơn đặt lịch <Text style={{ fontWeight: 'bold', color: '#ea580c' }}>#{confirmCancelBookingId}</Text> này không?
                {'\n'}<Text style={{ color: '#e11d48', fontWeight: '600' }}>⚠️ Thao tác này sẽ hủy suất giữ chỗ và không thể hoàn tác.</Text>
              </Text>

              <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
                <TouchableOpacity
                  onPress={() => setConfirmCancelBookingId(null)}
                  disabled={isCancellingDeposit}
                  style={{ flex: 1, paddingVertical: 12, backgroundColor: '#f1f5f9', borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#cbd5e1' }}
                >
                  <Text style={{ fontWeight: 'bold', color: '#475569', fontSize: 14 }}>Quay Lại</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleConfirmCancel(confirmCancelBookingId)}
                  disabled={isCancellingDeposit}
                  style={{ flex: 1, paddingVertical: 12, backgroundColor: '#e11d48', borderRadius: 12, alignItems: 'center' }}
                >
                  {isCancellingDeposit ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={{ fontWeight: 'bold', color: 'white', fontSize: 14 }}>Xác Nhận Hủy</Text>
                  )}
                </TouchableOpacity>
              </View>
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
