import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { ChevronLeft, Gift, Award, CheckCircle2, History, ArrowDownCircle, ArrowUpCircle, Clock, Tag } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { loyaltyService } from '../../services/loyaltyService';
import { useAuth } from '../../context/AuthContext';

export default function RewardsScreen() {
  const router = useRouter();
  const { isLoggedIn, user, refreshLoyalty } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'exchange' | 'my_rewards' | 'transactions'>('exchange');
  const [currentPoints, setCurrentPoints] = useState<number>(user?.points || 0);
  
  const [eligibleRewards, setEligibleRewards] = useState<any[]>([]);
  const [myRedemptions, setMyRedemptions] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRedeeming, setIsRedeeming] = useState<number | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const summary = await loyaltyService.getMySummary();
      if (summary) {
        setCurrentPoints(summary.currentPoints);
        if (refreshLoyalty) refreshLoyalty(summary.currentPoints, summary.currentTier);
      }

      if (activeTab === 'exchange') {
        const rewards = await loyaltyService.getEligibleRewards();
        setEligibleRewards(Array.isArray(rewards) ? rewards : (rewards as any).data || []);
      } else if (activeTab === 'my_rewards') {
        const redemptions = await loyaltyService.getMyRedemptions();
        setMyRedemptions(Array.isArray(redemptions) ? redemptions : (redemptions as any).data || []);
      } else if (activeTab === 'transactions') {
        const tx = await loyaltyService.getMyTransactions();
        const txList = Array.isArray(tx) ? tx : (tx as any).items || (tx as any).data || [];
        setTransactions(txList);
      }
    } catch (error) {
      console.error('Error fetching rewards data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [activeTab, isLoggedIn]);

  const handleRedeem = (rewardId: number, pointCost: number, rewardName: string) => {
    if (currentPoints < pointCost) {
      Alert.alert('Không đủ điểm', 'Bạn không đủ điểm để đổi phần thưởng này.');
      return;
    }
    Alert.alert(
      'Xác nhận đổi thưởng',
      `Bạn có chắc chắn muốn dùng ${pointCost} điểm để đổi lấy ${rewardName}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đồng ý', 
          onPress: async () => {
            setIsRedeeming(rewardId);
            try {
              await loyaltyService.redeemReward(rewardId);
              Alert.alert('Thành công', 'Đổi phần thưởng thành công! Bạn có thể sử dụng khi đặt lịch.');
              fetchData();
            } catch (error: any) {
              Alert.alert('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra khi đổi thưởng.');
            } finally {
              setIsRedeeming(null);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ width: 24 }} />
        <Text style={styles.headerTitle}>Cửa Hàng Đổi Thưởng</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.pointsBanner}>
        <View style={styles.pointsLeft}>
          <View style={styles.giftIconBox}>
            <Gift color="#fff" size={28} />
          </View>
          <View>
            <Text style={styles.pointsLabel}>Điểm hiện tại</Text>
            <Text style={styles.pointsValue}>{currentPoints}</Text>
          </View>
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'exchange' && styles.tabBtnActive]} 
          onPress={() => setActiveTab('exchange')}
        >
          <Text style={[styles.tabText, activeTab === 'exchange' && styles.tabTextActive]}>Đổi Quà Mới</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'my_rewards' && styles.tabBtnActive]} 
          onPress={() => setActiveTab('my_rewards')}
        >
          <Text style={[styles.tabText, activeTab === 'my_rewards' && styles.tabTextActive]}>Quà Của Tôi</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'transactions' && styles.tabBtnActive]} 
          onPress={() => setActiveTab('transactions')}
        >
          <Text style={[styles.tabText, activeTab === 'transactions' && styles.tabTextActive]}>Lịch Sử</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {isLoading ? (
          <ActivityIndicator color="#f97316" size="large" style={{ marginTop: 40 }} />
        ) : (
          <>
            {activeTab === 'exchange' && (
              <View style={styles.listContainer}>
                {eligibleRewards.length === 0 ? (
                  <Text style={styles.emptyText}>Hiện chưa có phần thưởng nào để đổi.</Text>
                ) : (
                  eligibleRewards.map(reward => (
                    <View key={reward.rewardId} style={styles.rewardCard}>
                      <View style={styles.rewardHeader}>
                        <View style={styles.awardIcon}>
                          <Award color="#d97706" size={20} />
                        </View>
                        <View style={styles.pointCostBadge}>
                          <Text style={styles.pointCostText}>{reward.pointCost} điểm</Text>
                        </View>
                      </View>
                      <Text style={styles.rewardName}>{reward.rewardName}</Text>
                      <Text style={styles.rewardDesc}>{reward.description}</Text>
                      <TouchableOpacity 
                        disabled={currentPoints < reward.pointCost || isRedeeming === reward.rewardId}
                        style={[styles.redeemBtn, currentPoints < reward.pointCost && styles.redeemBtnDisabled]}
                        onPress={() => handleRedeem(reward.rewardId, reward.pointCost, reward.rewardName)}
                      >
                        {isRedeeming === reward.rewardId ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <Text style={styles.redeemBtnText}>
                            {currentPoints < reward.pointCost ? 'Không đủ điểm' : 'Đổi Ngay'}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>
            )}

            {activeTab === 'my_rewards' && (
              <View style={styles.listContainer}>
                {myRedemptions.length === 0 ? (
                  <Text style={styles.emptyText}>Bạn chưa đổi phần thưởng nào.</Text>
                ) : (
                  myRedemptions.map(redemption => {
                    const isUsed = redemption.status !== 'Issued';
                    return (
                      <View key={redemption.redemptionId} style={[styles.myRewardCard, isUsed && styles.myRewardCardUsed]}>
                        <View style={[styles.myRewardIcon, isUsed && { backgroundColor: '#e2e8f0' }]}>
                          {isUsed ? <CheckCircle2 color="#94a3b8" size={24} /> : <Tag color="#ea580c" size={24} />}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.myRewardName, isUsed && { color: '#94a3b8' }]}>{redemption.rewardName}</Text>
                          <Text style={styles.myRewardStatus}>
                            {isUsed ? 'Đã sử dụng' : 'Có thể sử dụng khi đặt lịch'}
                          </Text>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            )}

            {activeTab === 'transactions' && (
              <View style={styles.listContainer}>
                {transactions.length === 0 ? (
                  <Text style={styles.emptyText}>Chưa có giao dịch điểm nào.</Text>
                ) : (
                  <View style={styles.txBox}>
                    {transactions.map(tx => {
                      const isEarn = tx.transactionType === 'Earn';
                      const isRedeem = tx.transactionType === 'Redeem';
                      
                      let Icon = Clock;
                      let iconColor = '#94a3b8';
                      let typeLabel = tx.transactionType;
                      let pointColor = '#475569';
                      let pointPrefix = '';
                      
                      if (isEarn) {
                        Icon = ArrowUpCircle;
                        iconColor = '#10b981';
                        typeLabel = 'Cộng điểm';
                        pointColor = '#059669';
                        pointPrefix = '+';
                      } else if (isRedeem) {
                        Icon = ArrowDownCircle;
                        iconColor = '#f97316';
                        typeLabel = 'Đổi quà';
                        pointColor = '#ea580c';
                        pointPrefix = '-';
                      }

                      return (
                        <View key={tx.transactionId} style={styles.txRow}>
                          <View style={styles.txLeft}>
                            <Icon color={iconColor} size={24} />
                            <View style={{ marginLeft: 12 }}>
                              <Text style={styles.txType}>{typeLabel}</Text>
                              <Text style={styles.txDate}>{new Date(tx.createdAt).toLocaleDateString('vi-VN')}</Text>
                            </View>
                          </View>
                          <Text style={[styles.txPoints, { color: pointColor }]}>{pointPrefix}{Math.abs(tx.points)}</Text>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  
  pointsBanner: { margin: 16, padding: 20, borderRadius: 16, backgroundColor: '#f97316' },
  pointsLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  giftIconBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  pointsLabel: { color: '#ffedd5', fontSize: 12, fontWeight: '600' },
  pointsValue: { color: '#fff', fontSize: 28, fontWeight: '900' },
  
  tabsContainer: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  tabBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: '#f97316' },
  tabText: { fontSize: 13, fontWeight: 'bold', color: '#64748b' },
  tabTextActive: { color: '#f97316' },
  
  content: { padding: 16, paddingBottom: 40 },
  listContainer: { gap: 12 },
  emptyText: { textAlign: 'center', color: '#64748b', marginTop: 20 },
  
  rewardCard: { backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  rewardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  awardIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#fef3c7', alignItems: 'center', justifyContent: 'center' },
  pointCostBadge: { backgroundColor: '#ffedd5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' },
  pointCostText: { color: '#d97706', fontWeight: 'bold', fontSize: 11 },
  rewardName: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
  rewardDesc: { fontSize: 12, color: '#64748b', marginBottom: 16 },
  redeemBtn: { backgroundColor: '#f59e0b', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  redeemBtnDisabled: { backgroundColor: '#e2e8f0' },
  redeemBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  
  myRewardCard: { backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#fdba74', flexDirection: 'row', alignItems: 'center', gap: 12 },
  myRewardCardUsed: { borderColor: '#e2e8f0', backgroundColor: '#f8fafc' },
  myRewardIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#ffedd5', alignItems: 'center', justifyContent: 'center' },
  myRewardName: { fontSize: 14, fontWeight: 'bold', color: '#0f172a', marginBottom: 2 },
  myRewardStatus: { fontSize: 11, color: '#64748b' },
  
  txBox: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden' },
  txRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  txLeft: { flexDirection: 'row', alignItems: 'center' },
  txType: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
  txDate: { fontSize: 11, color: '#64748b', marginTop: 2 },
  txPoints: { fontSize: 16, fontWeight: 'bold' }
});
