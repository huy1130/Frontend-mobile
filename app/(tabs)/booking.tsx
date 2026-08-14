import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, CheckCircle2, Car, User, Tag, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { serviceService, ServiceDto } from '../../services/serviceService';
import { customerService, CustomerVehicleDTO } from '../../services/customerService';
import { bookingService, BookingResponseDTO } from '../../services/bookingService';
import { promotionService, PromotionDTO } from '../../services/promotionService';
import { timeSlotService, AvailableSlotDto } from '../../services/timeSlotService';
import { loyaltyService } from '../../services/loyaltyService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getCustomerIdFromToken = async (): Promise<number | undefined> => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) return undefined;
    
    const base64Url = token.split('.')[1];
    if (!base64Url) return undefined;
    
    // Replace URL-safe chars for standard base64 decoding
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    
    // Use decodeURIComponent(escape()) to handle Unicode properly just in case
    const payloadStr = decodeURIComponent(escape(atob(base64)));
    const payload = JSON.parse(payloadStr);
    
    const id = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || payload.nameid || payload.sub;
    return id ? parseInt(id, 10) : undefined;
  } catch (err) {
    console.error('Lỗi khi giải mã token:', err);
    return undefined;
  }
};

export default function BookingScreen() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);

  const [services, setServices] = useState<ServiceDto[]>([]);
  const [vehicles, setVehicles] = useState<CustomerVehicleDTO[]>([]);
  const [promotions, setPromotions] = useState<PromotionDTO[]>([]);
  
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<number>(0);
  const [selectedPromotion, setSelectedPromotion] = useState<number | null>(null);
  const [selectedRedemption, setSelectedRedemption] = useState<number | null>(null);
  
  const [bookedSuccess, setBookedSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState<number | null>(null);
  const [createdBooking, setCreatedBooking] = useState<BookingResponseDTO | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Advanced booking & Timeslots
  const [maxDays, setMaxDays] = useState(7);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [timeSlots, setTimeSlots] = useState<AvailableSlotDto[]>([]);
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);
  
  // Rewards
  const [myRedemptions, setMyRedemptions] = useState<any[]>([]);

  const generateDates = (days: number) => {
    const dates = [];
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  useFocusEffect(
    useCallback(() => {
      serviceService.getActiveServices().then(setServices).catch(console.error);
      if (isLoggedIn) {
        customerService.getMyVehicles().then(res => {
          setVehicles(res.data);
          setSelectedVehicle(prev => prev ? prev : (res.data.length > 0 ? res.data[0].vehicleId : null));
        }).catch(console.error);

        promotionService.getEligiblePromotions().then(res => {
           setPromotions(Array.isArray(res) ? res : (res as any).data || []);
        }).catch(console.error);

        loyaltyService.getMySummary().then(res => {
           let days = 7;
           if (res && res.currentTier) {
              const t = res.currentTier.toLowerCase();
              if (t === 'silver') days = 10;
              else if (t === 'gold') days = 12;
              else if (t === 'platinum') days = 14;
           }
           setMaxDays(days);
           setAvailableDates(generateDates(days));
        }).catch(() => setAvailableDates(generateDates(7)));
        
        Promise.all([
          loyaltyService.getMyRedemptions().catch(() => []),
          loyaltyService.getEligibleRewards().catch(() => [])
        ]).then(([redemptionsRes, rewardsRes]) => {
          const redemptions = Array.isArray(redemptionsRes) ? redemptionsRes : (redemptionsRes as any).data || [];
          const rewards = Array.isArray(rewardsRes) ? rewardsRes : (rewardsRes as any).data || [];
          const filtered = redemptions.filter((r: any) => r.status === 'Issued');
          const enhanced = filtered.map((r: any) => {
            const rewardDetails = rewards.find((rw: any) => rw.rewardId === r.rewardId);
            return {
              ...r,
              serviceId: rewardDetails?.serviceId,
              discountValue: rewardDetails?.discountValue
            };
          });
          setMyRedemptions(enhanced);
        }).catch(console.error);
      } else {
        setAvailableDates(generateDates(7));
      }
    }, [isLoggedIn])
  );

  useEffect(() => {
    if (!selectedDate) return;
    setIsSlotsLoading(true);
    timeSlotService.getAvailableSlots(selectedDate)
      .then(slots => {
        slots.sort((a, b) => a.startTime.localeCompare(b.startTime));
        setTimeSlots(slots);
        setSelectedTimeSlot(0); // reset when date changes
      })
      .catch(console.error)
      .finally(() => setIsSlotsLoading(false));
  }, [selectedDate]);

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!isLoggedIn) {
        Alert.alert('Yêu cầu đăng nhập', 'Vui lòng đăng nhập để đặt lịch.', [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Đăng nhập', onPress: () => router.push('/account') }
        ]);
        return;
      }
      if (!selectedVehicle) {
        Alert.alert('Lỗi', 'Vui lòng chọn xe.');
        return;
      }
      if (!selectedTimeSlot) {
        Alert.alert('Lỗi', 'Vui lòng chọn khung giờ.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!selectedService) {
        Alert.alert('Lỗi', 'Vui lòng chọn dịch vụ.');
        return;
      }
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleBooking = async () => {
    if (!selectedVehicle || !selectedService || !selectedTimeSlot) return;

    if (selectedPromotion && selectedRedemption) {
      Alert.alert('Thông báo', 'Chỉ được chọn khuyến mãi hoặc phần thưởng cho lịch hẹn của bạn.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        vehicleId: selectedVehicle,
        serviceId: selectedService,
        slotId: selectedTimeSlot,
        bookingDate: selectedDate,
      };
      
      if (isLoggedIn) {
        const customerId = await getCustomerIdFromToken();
        if (customerId) {
          payload.customerId = customerId;
        }
      }
      
      if (selectedPromotion) {
        payload.promotionId = selectedPromotion;
      }
      if (selectedRedemption) {
        payload.redemptionId = selectedRedemption;
      }

      const bookingResponse = await bookingService.createBooking(payload);
      setBookingRef(bookingResponse.bookingId);
      setCreatedBooking(bookingResponse);
      setBookedSuccess(true);
      setCurrentStep(1); // Reset for next booking
      setSelectedPromotion(null);
      setSelectedRedemption(null);
    } catch (error: any) {
      Alert.alert('Lỗi đặt lịch', error.response?.data?.Message || error.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepper = () => {
    const steps = [
      { id: 1, title: 'Thời gian & Xe' },
      { id: 2, title: 'Dịch vụ' },
      { id: 3, title: 'Ưu đãi & Xác nhận' }
    ];

    return (
      <View style={styles.stepperContainer}>
        <View style={styles.stepperTrack}>
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <View style={styles.stepIndicatorWrapper}>
                <View style={[styles.stepCircle, currentStep >= step.id ? styles.stepCircleActive : null]}>
                  <Text style={[styles.stepNumber, currentStep >= step.id ? styles.stepNumberActive : null]}>{step.id}</Text>
                </View>
                <Text style={[styles.stepLabelText, currentStep >= step.id ? styles.stepLabelTextActive : null]}>
                  {step.title}
                </Text>
              </View>
              {index < steps.length - 1 && (
                <View style={[styles.stepLine, currentStep > step.id ? styles.stepLineActive : null]} />
              )}
            </React.Fragment>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Header Bar */}
        <View style={styles.headerBar}>
          <Text style={styles.headerLogo}>LOGO</Text>
          <Text style={styles.headerTitle}>Đăng Ký Đặt Lịch</Text>
        </View>

        <View style={styles.content}>
          {bookedSuccess ? (
            <View style={styles.successCard}>
              <View style={styles.successIconBox}>
                <CheckCircle2 color="#059669" size={36} />
              </View>

              <Text style={styles.successTitle}>Đặt Lịch Thành Công!</Text>
              <Text style={styles.successSubtitle}>
                Mã lịch hẹn của bạn là <Text style={styles.refCode}>#{bookingRef}</Text>. Bạn có thể theo dõi tiến độ trong phần Lịch Sử.
              </Text>

              <View style={styles.detailsBox}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Xe của bạn:</Text>
                  <Text style={styles.detailValue}>{createdBooking?.licensePlate || vehicles.find(v => v.vehicleId === selectedVehicle)?.licensePlate}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Khung giờ:</Text>
                  <Text style={styles.detailValue}>
                    {(() => {
                      if (createdBooking?.startTime && createdBooking?.endTime) {
                        const d = new Date(createdBooking.bookingDate || selectedDate);
                        return `${createdBooking.startTime.substring(0, 5)} - ${createdBooking.endTime.substring(0, 5)} ngày ${d.getDate()}/${d.getMonth() + 1}`;
                      }
                      const slot = timeSlots.find(t => t.slotId === selectedTimeSlot);
                      const d = new Date(selectedDate);
                      return slot ? `${slot.startTime.substring(0, 5)} - ${slot.endTime.substring(0, 5)} ngày ${d.getDate()}/${d.getMonth() + 1}` : '';
                    })()}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Dịch vụ:</Text>
                  <Text style={styles.serviceValue}>{createdBooking?.serviceName || services.find(s => s.serviceId === selectedService)?.serviceName}</Text>
                </View>
                <View style={[styles.detailRow, { borderBottomWidth: 0, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10, marginTop: 4, justifyContent: 'space-between', alignItems: 'center' }]}>
                  <Text style={[styles.detailLabel, { fontWeight: 'bold', color: '#0f172a' }]}>Tổng thanh toán:</Text>
                  <Text style={{ fontSize: 18, fontWeight: '900', color: '#ea580c' }}>
                    {((createdBooking?.finalPrice ?? 0)).toLocaleString('vi-VN')}đ
                  </Text>
                </View>
              </View>

              <TouchableOpacity onPress={() => setBookedSuccess(false)} style={styles.newBookingBtn}>
                <LinearGradient
                  colors={['#f97316', '#ea580c']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.gradientBtn}
                >
                  <Text style={styles.btnText}>Đặt Thêm Lịch Mới</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {renderStepper()}

              {/* STEP 1: Vehicle and Time */}
              {currentStep === 1 && (
                <View style={styles.stepContent}>
                  <View style={styles.stepCard}>
                    <Text style={styles.stepTitle}>Chọn Xe Của Bạn</Text>
                    {!isLoggedIn ? (
                      <TouchableOpacity style={styles.loginPrompt} onPress={() => router.push('/account')}>
                        <User color="#ea580c" size={24} />
                        <Text style={styles.loginPromptText}>Đăng nhập để lấy danh sách xe của bạn</Text>
                      </TouchableOpacity>
                    ) : vehicles.length === 0 ? (
                      <Text style={{ color: '#64748b' }}>Bạn chưa có xe nào. Vui lòng thêm xe ở trang Tài khoản.</Text>
                    ) : (
                      vehicles.map((v) => (
                        <TouchableOpacity
                          key={v.vehicleId}
                          onPress={() => setSelectedVehicle(v.vehicleId)}
                          style={[
                            styles.branchItem,
                            selectedVehicle === v.vehicleId ? styles.itemSelected : styles.itemDefault
                          ]}
                        >
                          <Text style={styles.branchName}>{v.licensePlate} ({v.vehicleType || 'Khác'})</Text>
                        </TouchableOpacity>
                      ))
                    )}
                  </View>

                  <View style={[styles.stepCard, { marginBottom: 16 }]}>
                    <Text style={styles.stepTitle}>Chọn Ngày</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                      {availableDates.map(dateStr => {
                        const dateObj = new Date(dateStr);
                        const day = dateObj.getDate();
                        const month = dateObj.getMonth() + 1;
                        const isSelected = selectedDate === dateStr;
                        return (
                          <TouchableOpacity 
                            key={dateStr}
                            onPress={() => setSelectedDate(dateStr)}
                            style={[styles.dateItem, isSelected ? styles.dateItemSelected : styles.dateItemDefault]}
                          >
                            <Text style={[styles.dateItemText, isSelected ? { color: '#fff' } : { color: '#334155' }]}>
                              {day}/{month}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>

                  <View style={[styles.stepCard, { marginBottom: 24 }]}>
                    <Text style={styles.stepTitle}>Chọn Khung Giờ</Text>
                    {isSlotsLoading ? (
                       <ActivityIndicator color="#f97316" style={{ marginVertical: 20 }} />
                    ) : timeSlots.length === 0 ? (
                       <Text style={{ color: '#64748b' }}>Không có khung giờ nào trong ngày này.</Text>
                    ) : (
                      <View style={styles.timeGrid}>
                        {timeSlots.map((slot) => {
                          const selectedVeh = vehicles.find(v => v.vehicleId === selectedVehicle);
                          const isCar = selectedVeh?.vehicleType?.toLowerCase().includes('ô tô') || selectedVeh?.vehicleType?.toLowerCase().includes('car') || false;
                          const remaining = isCar ? slot.remainingCarCapacity : slot.remainingBikeCapacity;
                          const isAvailable = remaining > 0;
                          
                          // Check if past hour
                          const today = new Date().toISOString().split('T')[0];
                          const isToday = selectedDate === today;
                          let isPast = false;
                          if (isToday && slot.startTime) {
                            const now = new Date();
                            const [startH, startM] = slot.startTime.split(':').map(Number);
                            if (startH < now.getHours() || (startH === now.getHours() && startM <= now.getMinutes())) {
                              isPast = true;
                            }
                          }
                          const canBook = isAvailable && !isPast;
                          
                          return (
                            <TouchableOpacity
                              key={slot.slotId}
                              disabled={!canBook}
                              onPress={() => setSelectedTimeSlot(slot.slotId)}
                              style={[
                                styles.timeSlot,
                                !canBook ? { backgroundColor: '#f1f5f9', opacity: 0.5 } : 
                                selectedTimeSlot === slot.slotId ? styles.timeSelected : styles.timeDefault
                              ]}
                            >
                              <Text style={[
                                styles.timeText,
                                selectedTimeSlot === slot.slotId ? { color: '#fff' } : { color: '#334155' }
                              ]}>
                                {`${slot.startTime.substring(0, 5)} - ${slot.endTime.substring(0, 5)}`}
                              </Text>
                              <Text style={{ fontSize: 10, color: selectedTimeSlot === slot.slotId ? '#ffedd5' : '#64748b', marginTop: 2 }}>
                                {isPast ? 'Đã qua' : (isAvailable ? `Còn ${remaining}` : 'Hết chỗ')}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </View>

                  <TouchableOpacity 
                    onPress={handleNextStep} 
                    style={[styles.confirmBtn, (!selectedVehicle || !selectedTimeSlot) && { opacity: 0.5 }]} 
                    disabled={!selectedVehicle || !selectedTimeSlot}
                  >
                    <LinearGradient colors={['#f97316', '#ea580c']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientConfirm}>
                      <Text style={styles.confirmText}>Tiếp tục</Text>
                      <ChevronRight color="white" size={20} />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}

              {/* STEP 2: Service */}
              {currentStep === 2 && (
                <View style={styles.stepContent}>
                  <View style={styles.stepCard}>
                    <Text style={styles.stepTitle}>Chọn Dịch Vụ</Text>
                    {services.map((svc) => (
                      <TouchableOpacity
                        key={svc.serviceId}
                        onPress={() => setSelectedService(svc.serviceId)}
                        style={[
                          styles.serviceItem,
                          selectedService === svc.serviceId ? styles.itemSelected : styles.itemDefault
                        ]}
                      >
                        <View style={styles.serviceItemLeft}>
                          <Car color={selectedService === svc.serviceId ? '#f97316' : '#64748b'} size={20} />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.serviceName}>{svc.serviceName}</Text>
                            <Text style={styles.serviceDuration} numberOfLines={1}>{svc.description || 'Chăm sóc chuyên sâu'}</Text>
                          </View>
                        </View>
                        <Text style={styles.servicePrice}>{svc.price.toLocaleString('vi-VN')}đ</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.actionRow}>
                    <TouchableOpacity onPress={handlePrevStep} style={styles.backButtonAction}>
                      <ChevronLeft color="#64748b" size={20} />
                      <Text style={styles.backButtonText}>Quay lại</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={handleNextStep} style={[styles.nextButtonAction, !selectedService && { opacity: 0.5 }]} disabled={!selectedService}>
                      <LinearGradient colors={['#f97316', '#ea580c']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientAction}>
                        <Text style={styles.confirmText}>Tiếp tục</Text>
                        <ChevronRight color="white" size={20} />
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* STEP 3: Promotions & Confirm */}
              {currentStep === 3 && (
                <View style={styles.stepContent}>
                  <View style={[styles.stepCard, { marginBottom: 16 }]}>
                    <Text style={styles.stepTitle}>Phần Thưởng Của Bạn</Text>
                    {myRedemptions.length === 0 ? (
                      <Text style={{ color: '#64748b', fontStyle: 'italic' }}>Bạn chưa có phần thưởng nào.</Text>
                    ) : (
                      myRedemptions.map((redemption) => (
                        <TouchableOpacity
                          key={redemption.redemptionId}
                          onPress={() => {
                            if (selectedRedemption === redemption.redemptionId) {
                              setSelectedRedemption(null);
                            } else {
                              if (selectedPromotion) {
                                Alert.alert('Thông báo', 'Chỉ được chọn khuyến mãi hoặc phần thưởng cho lịch hẹn của bạn.');
                                setSelectedPromotion(null);
                              }
                              setSelectedRedemption(redemption.redemptionId);
                            }
                          }}
                          style={[
                            styles.promoItem,
                            selectedRedemption === redemption.redemptionId ? styles.itemSelected : styles.itemDefault
                          ]}
                        >
                          <View style={styles.promoItemLeft}>
                            <Sparkles color={selectedRedemption === redemption.redemptionId ? '#f97316' : '#64748b'} size={20} />
                            <View style={{ flex: 1, marginLeft: 12 }}>
                              <Text style={styles.promoName}>{redemption.rewardName}</Text>
                              <Text style={styles.promoDesc}>
                                {redemption.rewardType === 'FreeWash' ? 'Miễn phí dịch vụ chính' : 
                                 redemption.rewardType === 'AddOn' ? 'Tặng kèm dịch vụ phụ' : 
                                 'Giảm giá'}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))
                    )}
                  </View>

                  <View style={styles.stepCard}>
                    <Text style={styles.stepTitle}>Khuyến Mãi Hệ Thống</Text>
                    
                    <TouchableOpacity
                      onPress={() => setSelectedPromotion(null)}
                      style={[
                        styles.promoItem,
                        selectedPromotion === null ? styles.itemSelected : styles.itemDefault
                      ]}
                    >
                      <View style={styles.promoItemLeft}>
                        <Tag color={selectedPromotion === null ? '#f97316' : '#64748b'} size={20} />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={styles.promoName}>Không sử dụng khuyến mãi</Text>
                        </View>
                      </View>
                    </TouchableOpacity>

                    {promotions.length === 0 ? (
                      <Text style={{ color: '#64748b', marginTop: 12, fontStyle: 'italic' }}>Bạn chưa có khuyến mãi nào hợp lệ lúc này.</Text>
                    ) : (
                      promotions.map((promo) => (
                        <TouchableOpacity
                          key={promo.promotionId}
                          onPress={() => {
                            if (selectedPromotion === promo.promotionId) {
                              setSelectedPromotion(null);
                            } else {
                              if (selectedRedemption) {
                                Alert.alert('Thông báo', 'Chỉ được chọn khuyến mãi hoặc phần thưởng cho lịch hẹn của bạn.');
                                setSelectedRedemption(null);
                              }
                              setSelectedPromotion(promo.promotionId);
                            }
                          }}
                          style={[
                            styles.promoItem,
                            selectedPromotion === promo.promotionId ? styles.itemSelected : styles.itemDefault
                          ]}
                        >
                          <View style={styles.promoItemLeft}>
                            <Tag color={selectedPromotion === promo.promotionId ? '#f97316' : '#64748b'} size={20} />
                            <View style={{ flex: 1, marginLeft: 12 }}>
                              <Text style={styles.promoName}>{promo.promoName}</Text>
                              <Text style={styles.promoDesc} numberOfLines={2}>{promo.description}</Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))
                    )}
                  </View>

                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Tóm Tắt Đặt Lịch</Text>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Dịch vụ:</Text>
                      <Text style={styles.summaryValue}>{services.find(s => s.serviceId === selectedService)?.serviceName}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Giá dịch vụ:</Text>
                      <Text style={styles.summaryValue}>
                        {(() => {
                          const s = services.find(svc => svc.serviceId === selectedService);
                          return s ? `${s.price.toLocaleString('vi-VN')}đ` : '';
                        })()}
                      </Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Xe:</Text>
                      <Text style={styles.summaryValue}>{vehicles.find(v => v.vehicleId === selectedVehicle)?.licensePlate}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Thời gian:</Text>
                      <Text style={styles.summaryValue}>
                        {(() => {
                           const slot = timeSlots.find(t => t.slotId === selectedTimeSlot);
                           const d = new Date(selectedDate);
                           return slot ? `${slot.startTime.substring(0,5)} - ${slot.endTime.substring(0,5)} ngày ${d.getDate()}/${d.getMonth()+1}` : '';
                        })()}
                      </Text>
                    </View>
                    {selectedPromotion && (
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Khuyến mãi:</Text>
                        <Text style={styles.summaryPromoValue}>{promotions.find(p => p.promotionId === selectedPromotion)?.promoName}</Text>
                      </View>
                    )}
                    {selectedRedemption && (
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Phần thưởng:</Text>
                        <Text style={styles.summaryPromoValue}>{myRedemptions.find(r => r.redemptionId === selectedRedemption)?.rewardName}</Text>
                      </View>
                    )}
                    <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 12, marginTop: 4, alignItems: 'flex-end' }]}>
                      <Text style={[styles.summaryLabel, { fontWeight: 'bold' }]}>Tổng thanh toán:</Text>
                      <Text style={{ fontSize: 18, fontWeight: '900', color: '#ea580c' }}>
                        {(() => {
                           const svc = services.find(s => s.serviceId === selectedService);
                           if (!svc) return '0đ';
                           let total = svc.price;
                           
                           if (selectedPromotion) {
                             const promo = promotions.find(p => p.promotionId === selectedPromotion);
                             if (promo) {
                               const type = (promo.promoType || '').toLowerCase();
                               if (type === 'freewash') {
                                 if (!promo.serviceId || promo.serviceId === selectedService) {
                                   total = 0;
                                 }
                               } else if (type === 'addon') {
                                 if (promo.serviceId === selectedService) {
                                   total = 0;
                                 }
                               } else if (type === 'discount') {
                                 if (!promo.serviceId || promo.serviceId === selectedService) {
                                   if (promo.discountType === 'Fixed' && promo.discountValue) total -= promo.discountValue;
                                   else if (promo.discountType === 'Percent' && promo.discountValue) {
                                     let discount = total * promo.discountValue / 100;
                                     if (promo.maxDiscount && discount > promo.maxDiscount) discount = promo.maxDiscount;
                                     total -= discount;
                                   }
                                 }
                               }
                             }
                           }
                           
                           if (selectedRedemption) {
                             const redemption = myRedemptions.find(r => r.redemptionId === selectedRedemption);
                             if (redemption) {
                               const type = (redemption.rewardType || redemption.reward?.rewardType || '').toLowerCase();
                               const rServiceId = redemption.serviceId || redemption.reward?.serviceId;
                               if (type === 'freewash' || type === 'addon') {
                                 if (!rServiceId || rServiceId === selectedService) {
                                   total = 0;
                                 }
                               } else if (type === 'discount') {
                                 const val = redemption.discountValue || redemption.reward?.discountValue;
                                 if (val && (!rServiceId || rServiceId === selectedService)) {
                                   total -= val;
                                 }
                               }
                             }
                           }
                           
                           return Math.max(0, total).toLocaleString('vi-VN') + 'đ';
                        })()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.actionRow}>
                    <TouchableOpacity onPress={handlePrevStep} style={styles.backButtonAction} disabled={isSubmitting}>
                      <ChevronLeft color="#64748b" size={20} />
                      <Text style={styles.backButtonText}>Quay lại</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      onPress={handleBooking} 
                      style={[styles.nextButtonAction, isSubmitting && { opacity: 0.7 }]}
                      disabled={isSubmitting}
                    >
                      <LinearGradient colors={['#059669', '#047857']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientAction}>
                        {isSubmitting ? (
                          <ActivityIndicator color="white" />
                        ) : (
                          <>
                            <Text style={styles.confirmText}>Xác nhận đặt lịch</Text>
                            <Calendar color="white" size={20} />
                          </>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
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
  headerLogo: { fontWeight: 'bold', fontSize: 16 },
  headerTitle: { fontWeight: '800', fontSize: 16, color: '#0f172a' },
  content: { padding: 20 },
  
  stepperContainer: {
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  stepperTrack: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  stepIndicatorWrapper: {
    alignItems: 'center',
    width: 70,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    zIndex: 2,
  },
  stepCircleActive: {
    backgroundColor: '#f97316',
    borderColor: '#ea580c',
  },
  stepNumber: {
    fontWeight: 'bold',
    color: '#94a3b8',
    fontSize: 14,
  },
  stepNumberActive: {
    color: '#fff',
  },
  stepLabelText: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    fontWeight: '600'
  },
  stepLabelTextActive: {
    color: '#f97316',
    fontWeight: '700'
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#e2e8f0',
    marginTop: 18, // half of stepCircle height
    marginHorizontal: -20,
    zIndex: 1,
  },
  stepLineActive: {
    backgroundColor: '#f97316',
  },
  stepContent: {
    flex: 1,
  },

  successCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#e2e8f0',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 5,
  },
  successIconBox: {
    width: 64, height: 64,
    backgroundColor: '#ecfdf5',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    marginBottom: 16,
  },
  successTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 4, textAlign: 'center' },
  successSubtitle: { fontSize: 12, color: '#64748b', textAlign: 'center', marginBottom: 16 },
  refCode: { color: '#ea580c', fontWeight: '800' },
  detailsBox: {
    width: '100%',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 8,
    marginBottom: 8,
  },
  detailLabel: { color: '#64748b', fontSize: 12 },
  detailValue: { color: '#0f172a', fontSize: 12, fontWeight: 'bold' },
  serviceValue: { color: '#ea580c', fontSize: 14, fontWeight: '800' },
  newBookingBtn: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradientBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 14 },

  stepCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    shadowColor: '#e2e8f0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 3,
  },
  stepTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 16 },
  
  serviceItem: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  itemSelected: { backgroundColor: '#fff7ed', borderColor: '#f97316' },
  itemDefault: { backgroundColor: '#f8fafc', borderColor: '#e2e8f0' },
  serviceItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  serviceName: { fontWeight: 'bold', fontSize: 14, color: '#0f172a', marginBottom: 2 },
  serviceDuration: { color: '#64748b', fontSize: 12 },
  servicePrice: { color: '#ea580c', fontWeight: '800', fontSize: 16 },

  branchItem: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
  branchName: { fontWeight: 'bold', fontSize: 14, color: '#0f172a' },
  
  promoItem: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  promoName: { fontWeight: 'bold', fontSize: 14, color: '#0f172a', marginBottom: 4 },
  promoDesc: { color: '#64748b', fontSize: 12 },
  
  loginPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#fff7ed',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fed7aa'
  },
  loginPromptText: {
    color: '#ea580c',
    fontWeight: 'bold',
    flex: 1
  },

  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  timeSlot: { width: '48%', paddingHorizontal: 8, paddingVertical: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  timeSelected: { backgroundColor: '#f97316', borderColor: '#f97316' },
  timeDefault: { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' },
  timeText: { fontWeight: '800', fontSize: 14 },
  
  dateItem: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, minWidth: 60, alignItems: 'center' },
  dateItemSelected: { backgroundColor: '#f97316', borderColor: '#f97316' },
  dateItemDefault: { backgroundColor: '#f8fafc', borderColor: '#e2e8f0' },
  dateItemText: { fontWeight: 'bold', fontSize: 14 },

  confirmBtn: { width: '100%', borderRadius: 16, overflow: 'hidden', marginTop: 8 },
  gradientConfirm: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 56, gap: 8 },
  confirmText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 12
  },
  backButtonAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    height: 56,
    borderRadius: 16,
    gap: 8
  },
  backButtonText: {
    color: '#64748b',
    fontWeight: 'bold',
    fontSize: 16
  },
  nextButtonAction: {
    flex: 2,
    borderRadius: 16,
    overflow: 'hidden'
  },
  gradientAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    gap: 8
  },
  
  summaryCard: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 24,
  },
  summaryTitle: { fontSize: 14, fontWeight: 'bold', color: '#0f172a', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 13, color: '#64748b' },
  summaryValue: { fontSize: 13, fontWeight: 'bold', color: '#0f172a' },
  summaryPromoValue: { fontSize: 13, fontWeight: 'bold', color: '#ea580c' },
});
