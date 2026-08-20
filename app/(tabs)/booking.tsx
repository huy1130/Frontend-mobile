import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, CheckCircle2, Car, User, Tag, ChevronLeft, ChevronRight, Sparkles, Info, XCircle, CreditCard, AlertTriangle, Copy } from 'lucide-react-native';
import QRCodeSVG from 'react-native-qrcode-svg';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { serviceService, ServiceDto } from '../../services/serviceService';
import { customerService, CustomerVehicleDTO } from '../../services/customerService';
import { bookingService, BookingResponseDTO } from '../../services/bookingService';
import { promotionService, PromotionDTO } from '../../services/promotionService';
import { timeSlotService, AvailableSlotDto } from '../../services/timeSlotService';
import { loyaltyService } from '../../services/loyaltyService';
import { systemParameterService, SystemParameterDto } from '../../services/systemParameterService';
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
  const [viewingService, setViewingService] = useState<ServiceDto | null>(null);

const parseApiDate = (dateInput?: string | Date | null): Date | null => {
  if (!dateInput) return null;
  if (dateInput instanceof Date) return dateInput;

  let date = new Date(dateInput);
  if (isNaN(date.getTime())) return null;

  if (typeof dateInput === 'string' && dateInput.includes('T') && !dateInput.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(dateInput)) {
    const utcDate = new Date(`${dateInput}Z`);
    if (!isNaN(utcDate.getTime())) {
      date = utcDate;
    }
  }

  return date;
};

const isBookingExpired = (createdAt?: string | Date) => {
  if (!createdAt) return false;
  const parsed = parseApiDate(createdAt);
  if (!parsed) return false;
  return (parsed.getTime() + 10 * 60 * 1000) <= Date.now();
};

const PendingCountdown: React.FC<{ createdAt?: string | Date; onExpire?: () => void }> = ({ createdAt, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const hasExpiredRef = React.useRef(false);
  const onExpireRef = React.useRef(onExpire);

  React.useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  React.useEffect(() => {
    if (!createdAt) return;

    let isInitialCheck = true;
    hasExpiredRef.current = false;

    const calculateTime = () => {
      const parsed = parseApiDate(createdAt);
      if (!parsed) return;
      const createdTime = parsed.getTime();
      const expireTime = createdTime + 10 * 60 * 1000;
      const diff = Math.floor((expireTime - Date.now()) / 1000);
      if (diff <= 0) {
        setTimeLeft(0);
        if (!hasExpiredRef.current && !isInitialCheck) {
          hasExpiredRef.current = true;
          onExpireRef.current?.();
        }
      } else {
        setTimeLeft(diff);
      }
      isInitialCheck = false;
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [createdAt]);

  if (timeLeft === null) return null;
  if (timeLeft <= 0) {
    return <Text style={{ color: '#e11d48', fontWeight: 'bold', fontSize: 11 }}>(Hết hạn cọc)</Text>;
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <Text style={{ color: '#d97706', fontWeight: 'bold', fontSize: 11 }}>
      (Hạn cọc: {formatted})
    </Text>
  );
};

  // Deposit QR Modal & Cancellation State
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
    createdAt?: string | Date;
  } | null>(null);
  const [isCheckingDeposit, setIsCheckingDeposit] = useState<boolean>(false);
  const [isCancellingDeposit, setIsCancellingDeposit] = useState<boolean>(false);
  const [confirmCancelBookingId, setConfirmCancelBookingId] = useState<number | null>(null);

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
      systemParameterService.getSystemParameter().then(setSystemParams).catch(() => null);
      serviceService.getActiveServices().then(setServices).catch(console.error);

      if (selectedDate) {
        setIsSlotsLoading(true);
        timeSlotService.getAvailableSlots(selectedDate)
          .then(slots => {
            slots.sort((a, b) => a.startTime.localeCompare(b.startTime));
            setTimeSlots(slots);
          })
          .catch(console.error)
          .finally(() => setIsSlotsLoading(false));
      }

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
    }, [isLoggedIn, selectedDate])
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

  // Polling for deposit payment status
  useEffect(() => {
    let interval: any;
    if (depositModalData?.bookingId) {
      interval = setInterval(async () => {
        try {
          if (depositModalData.createdAt && isBookingExpired(depositModalData.createdAt)) {
            setDepositModalData(null);
            Alert.alert('Thông báo ⏱️', 'Mã QR cọc đã hết hạn thanh toán (quá 10 phút). Lịch hẹn đã bị dọn dẹp!');
            return;
          }

          const detailRes = await bookingService.getBookingDetail(depositModalData.bookingId);
          const currentStatus = detailRes?.data?.status || detailRes?.data?.bookingStatus;
          if (currentStatus === 'Deposited') {
            setDepositModalData(null);
            setBookedSuccess(true);
            Alert.alert('Thành công 🎉', 'Thanh toán cọc thành công! Lịch hẹn của bạn đã được xác nhận!');
          }
        } catch (e) {
          // silent catch
        }
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [depositModalData?.bookingId, depositModalData?.createdAt]);

  const handleCheckDepositStatus = async () => {
    if (!depositModalData?.bookingId) return;
    setIsCheckingDeposit(true);
    try {
      const detailRes = await bookingService.getBookingDetail(depositModalData.bookingId);
      const currentStatus = detailRes?.data?.status || detailRes?.data?.bookingStatus;
      if (currentStatus === 'Deposited') {
        setDepositModalData(null);
        setBookedSuccess(true);
        Alert.alert('Thành công 🎉', 'Đã xác nhận thanh toán đặt cọc thành công!');
      } else {
        Alert.alert('Thông báo', 'Hệ thống chưa nhận được giao dịch. Vui lòng hoàn tất chuyển khoản và bấm kiểm tra lại.');
      }
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể kiểm tra trạng thái thanh toán.');
    } finally {
      setIsCheckingDeposit(false);
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
    } catch (err: any) {
      Alert.alert('Lỗi', err.response?.data?.message || 'Không thể hủy đơn đặt lịch. Vui lòng thử lại.');
    } finally {
      setIsCancellingDeposit(false);
    }
  };

  // Calculation for Auto Best Promotion
  const selectedSvcObj = services.find(s => s.serviceId === selectedService);
  const subtotalPrice = selectedSvcObj ? selectedSvcObj.price : 0;

  const calcPromoDiscount = useCallback((promo: PromotionDTO) => {
    const isApplicable = !promo.serviceId || promo.serviceId === selectedService;
    if (!isApplicable) return 0;
    let val = 0;
    const type = (promo.promoType || '').toLowerCase();
    if (type === 'discount') {
      if (promo.discountType === 'Fixed' && promo.discountValue) {
        val = promo.discountValue;
      } else if (promo.discountType === 'Percent' && promo.discountValue) {
        val = (subtotalPrice * promo.discountValue) / 100;
        if (promo.maxDiscount && val > promo.maxDiscount) {
          val = promo.maxDiscount;
        }
      }
    } else if ((type === 'freewash' || type === 'addon') && promo.serviceId === selectedService) {
      val = subtotalPrice;
    }
    return val;
  }, [selectedService, subtotalPrice]);

  const autoBestPromo = useMemo(() => {
    let best: PromotionDTO | null = null;
    let maxVal = -1;
    for (const p of promotions) {
      const isApplicable = !p.serviceId || p.serviceId === selectedService;
      if (isApplicable) {
        const val = calcPromoDiscount(p);
        if (val > maxVal) {
          maxVal = val;
          best = p;
        }
      }
    }
    return best;
  }, [promotions, selectedService, calcPromoDiscount]);

  const isAutoPromoMode = selectedPromotion === null && selectedRedemption === null;
  const activePromo = isAutoPromoMode ? autoBestPromo : promotions.find(p => p.promotionId === selectedPromotion);
  const promoDiscountValue = activePromo ? calcPromoDiscount(activePromo) : 0;

  const selectedRedemptionObj = myRedemptions.find(r => r.redemptionId === selectedRedemption);
  let redemptionDiscountValue = 0;
  if (selectedRedemptionObj) {
    const rType = (selectedRedemptionObj.rewardType || '').toLowerCase();
    if (rType === 'discount' && selectedRedemptionObj.discountValue) {
      redemptionDiscountValue = selectedRedemptionObj.discountValue;
    } else if ((rType === 'freewash' || rType === 'addon') && selectedRedemptionObj.serviceId === selectedService) {
      redemptionDiscountValue = subtotalPrice;
    }
  }

  const finalTotalAmount = Math.max(0, subtotalPrice - promoDiscountValue - redemptionDiscountValue);

  const selectedVehObj = vehicles.find(v => v.vehicleId === selectedVehicle);
  const isBike = selectedVehObj ? (selectedVehObj.vehicleType || '').toLowerCase().includes('bike') || (selectedVehObj.vehicleType || '').toLowerCase().includes('xe máy') : false;
  const bikeRate = systemParams?.bikeDepositAmount ?? 20000;
  const carPercent = systemParams?.carDepositPercentage ?? 20;
  const estimatedDepositAmount = finalTotalAmount === 0 ? 0 : Math.max(0, isBike ? Math.min(bikeRate, finalTotalAmount) : Math.round((finalTotalAmount * carPercent) / 100));

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
        promotionId: isAutoPromoMode ? (autoBestPromo?.promotionId || null) : selectedPromotion,
        redemptionId: selectedRedemption
      };
      
      if (isLoggedIn) {
        const customerId = await getCustomerIdFromToken();
        if (customerId) {
          payload.customerId = customerId;
        }
      }

      const bookingResponse = await bookingService.createBooking(payload);
      setBookingRef(bookingResponse.bookingId);
      setCreatedBooking(bookingResponse);
      
      // Attempt Deposit Payment
      try {
        const payRes = await bookingService.createDepositPayment(bookingResponse.bookingId);
        if (payRes) {
          const depositAmt = payRes.amount ?? payRes.Amount ?? 0;
          const isPaid = payRes.status === 'PAID' || payRes.Status === 'PAID';
          if (depositAmt <= 0 || isPaid) {
            setBookedSuccess(true);
          } else {
            setDepositModalData({
              bookingId: bookingResponse.bookingId,
              amount: depositAmt,
              accountNumber: payRes.accountNumber || payRes.AccountNumber || '',
              accountName: payRes.accountName || payRes.AccountName || '',
              bin: payRes.bin || payRes.Bin || '',
              description: payRes.description || payRes.Description || `Deposit for booking ${bookingResponse.bookingId}`,
              qrCode: payRes.qrCode || payRes.QrCode,
              qrImageUrl: payRes.qrImageUrl || payRes.QrImageUrl,
              checkoutUrl: payRes.checkoutUrl || payRes.CheckoutUrl,
              createdAt: bookingResponse.createdAt || new Date().toISOString()
            });
          }
        } else {
          setBookedSuccess(true);
        }
      } catch (depErr) {
        setBookedSuccess(true);
      }

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
          <Image source={require('../../assets/images/logo-wash.png')} style={styles.headerLogoImage} resizeMode="contain" />
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
                  {/* Auto Best Promotion Banner */}
                  {isAutoPromoMode && autoBestPromo && (
                    <View style={{ backgroundColor: '#fff7ed', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#ffedd5', flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                      <Sparkles color="#ea580c" size={24} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#9a3412' }}>✨ Tự động áp dụng ưu đãi tốt nhất cho bạn</Text>
                        <Text style={{ fontSize: 12, color: '#c2410c', marginTop: 2 }}>
                          {autoBestPromo.promoName} {promoDiscountValue > 0 ? `(-${promoDiscountValue.toLocaleString('vi-VN')}đ)` : ''}
                        </Text>
                      </View>
                    </View>
                  )}

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
                        isAutoPromoMode ? styles.itemSelected : styles.itemDefault
                      ]}
                    >
                      <View style={styles.promoItemLeft}>
                        <Tag color={isAutoPromoMode ? '#f97316' : '#64748b'} size={20} />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={styles.promoName}>
                            Tự động chọn khuyến mãi tốt nhất {autoBestPromo ? `(${autoBestPromo.promoName})` : ''}
                          </Text>
                          <Text style={{ fontSize: 11, color: isAutoPromoMode ? '#ea580c' : '#64748b', marginTop: 2 }}>
                            {isAutoPromoMode ? '✓ Đang bật chế độ tự chọn ưu đãi cao nhất' : 'Nhấn để bật lại tự động chọn ưu đãi'}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>

                    {promotions.length === 0 ? (
                      <Text style={{ color: '#64748b', marginTop: 12, fontStyle: 'italic' }}>Bạn chưa có khuyến mãi nào hợp lệ lúc này.</Text>
                    ) : (
                      promotions.map((promo) => {
                        const isBest = autoBestPromo?.promotionId === promo.promotionId;
                        const isSelected = selectedPromotion === promo.promotionId;
                        const isActive = isSelected || (isAutoPromoMode && isBest);

                        return (
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
                              isActive ? styles.itemSelected : styles.itemDefault
                            ]}
                          >
                            <View style={styles.promoItemLeft}>
                              <Tag color={isActive ? '#f97316' : '#64748b'} size={20} />
                              <View style={{ flex: 1, marginLeft: 12 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                  <Text style={styles.promoName}>{promo.promoName}</Text>
                                  {isBest && (
                                    <View style={{ backgroundColor: '#fff7ed', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#ffedd5' }}>
                                      <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#ea580c' }}>🌟 Ưu đãi tốt nhất</Text>
                                    </View>
                                  )}
                                </View>
                                <Text style={styles.promoDesc} numberOfLines={2}>{promo.description}</Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        );
                      })
                    )}
                  </View>

                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Tóm Tắt Đặt Lịch</Text>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Dịch vụ:</Text>
                      <Text style={styles.summaryValue}>{services.find(s => s.serviceId === selectedService)?.serviceName}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Giá dịch vụ gốc:</Text>
                      <Text style={styles.summaryValue}>
                        {subtotalPrice.toLocaleString('vi-VN')}đ
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

                    {activePromo && (
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Khuyến mãi áp dụng:</Text>
                        <Text style={styles.summaryPromoValue}>
                          {activePromo.promoName} {promoDiscountValue > 0 ? `(-${promoDiscountValue.toLocaleString('vi-VN')}đ)` : ''}
                        </Text>
                      </View>
                    )}

                    {selectedRedemptionObj && (
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Phần thưởng áp dụng:</Text>
                        <Text style={styles.summaryPromoValue}>
                          {selectedRedemptionObj.rewardName} {redemptionDiscountValue > 0 ? `(-${redemptionDiscountValue.toLocaleString('vi-VN')}đ)` : ''}
                        </Text>
                      </View>
                    )}

                    <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 12, marginTop: 4, alignItems: 'flex-end' }]}>
                      <View>
                        <Text style={[styles.summaryLabel, { fontWeight: 'bold' }]}>Tổng thanh toán:</Text>
                        <Text style={{ fontSize: 11, color: '#64748b' }}>
                          Tiền cọc cần thanh toán: <Text style={{ fontWeight: 'bold', color: '#e11d48' }}>{estimatedDepositAmount.toLocaleString('vi-VN')}đ</Text>
                        </Text>
                      </View>
                      <Text style={{ fontSize: 18, fontWeight: '900', color: '#ea580c' }}>
                        {finalTotalAmount.toLocaleString('vi-VN')}đ
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

      {/* Service Detail Modal */}
      {viewingService && (
        <Modal
          visible={!!viewingService}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setViewingService(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContentSmall}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Chi Tiết Dịch Vụ</Text>
                <TouchableOpacity onPress={() => setViewingService(null)}>
                  <XCircle color="#94a3b8" size={24} />
                </TouchableOpacity>
              </View>
              <View style={{ padding: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 }}>{viewingService.serviceName}</Text>
                <Text style={{ fontSize: 13, color: '#475569', lineHeight: 20, marginBottom: 16 }}>{viewingService.description || 'Không có mô tả chi tiết cho dịch vụ này.'}</Text>
                <View style={{ backgroundColor: '#fff7ed', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#ffedd5', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontWeight: 'bold', color: '#9a3412', fontSize: 13 }}>Giá Dịch Vụ:</Text>
                  <Text style={{ fontWeight: '900', color: '#ea580c', fontSize: 18 }}>{viewingService.price.toLocaleString('vi-VN')}đ</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setViewingService(null)} style={{ margin: 20, marginTop: 0, paddingVertical: 12, backgroundColor: '#f1f5f9', borderRadius: 12, alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold', color: '#334155' }}>Đóng</Text>
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
              <View style={[styles.modalContentSmall, { padding: 20 }]}>
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

                {depositModalData.createdAt && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                    <Text style={{ fontSize: 12, color: '#64748b' }}>Thời gian thanh toán còn lại: </Text>
                    <PendingCountdown
                      createdAt={depositModalData.createdAt}
                      onExpire={() => {
                        setDepositModalData(null);
                        Alert.alert('Thông báo ⏱️', 'Mã QR cọc đã hết hạn thanh toán (quá 10 phút). Lịch hẹn đã bị dọn dẹp!');
                      }}
                    />
                  </View>
                )}

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
            <View style={[styles.modalContentSmall, { padding: 24, alignItems: 'center' }]}>
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
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContentSmall: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#f8fafc'
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a'
  }
});
