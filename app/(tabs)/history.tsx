import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar as CalendarIcon, CheckCircle2, XCircle, MapPin } from 'lucide-react-native';

export default function HistoryScreen() {
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'cancelled'>('all');

  const historyData = [
    {
      id: 'BK-98214',
      services: ['Rửa Xe Bọt Tuyết & Hút Bụi Cao Cấp'],
      date: '10/08/2026',
      time: '14:00',
      branch: 'Chi nhánh Quận 1 - 123 Nguyễn Trãi',
      totalPrice: '135.000đ',
      status: 'completed',
    },
    {
      id: 'BK-88410',
      services: ['Combo Vệ Sinh Nội Thất Chuyên Sâu'],
      date: '02/08/2026',
      time: '09:30',
      branch: 'Chi nhánh Quận 7 - 456 Nguyễn Thị Thập',
      totalPrice: '700.000đ',
      status: 'completed',
    },
    {
      id: 'BK-79901',
      services: ['Rửa Xe Bọt Tuyết & Hút Bụi Cao Cấp'],
      date: '05/07/2026',
      time: '10:00',
      branch: 'Chi nhánh Quận 1 - 123 Nguyễn Trãi',
      totalPrice: '150.000đ',
      status: 'cancelled',
    },
  ];

  const filtered = historyData.filter(i => filterStatus === 'all' ? true : i.status === filterStatus);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Top Header Bar */}
        <View style={styles.headerBar}>
          <Text style={styles.headerLogo}>LOGO</Text>
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
          {filtered.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.idBadge}>
                  <Text style={styles.idText}>{item.id}</Text>
                </View>

                {item.status === 'completed' ? (
                  <View style={[styles.statusBadge, styles.statusBadgeCompleted]}>
                    <CheckCircle2 color="#059669" size={12} />
                    <Text style={[styles.statusText, { color: '#047857' }]}>Đã Hoàn Thành</Text>
                  </View>
                ) : (
                  <View style={[styles.statusBadge, styles.statusBadgeCancelled]}>
                    <XCircle color="#e11d48" size={12} />
                    <Text style={[styles.statusText, { color: '#be123c' }]}>Đã Hủy</Text>
                  </View>
                )}
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.serviceName}>{item.services.join(', ')}</Text>
                <View style={styles.iconRow}>
                  <CalendarIcon color="#f97316" size={14} />
                  <Text style={styles.iconText}>{item.date} • {item.time}</Text>
                </View>
                <View style={styles.iconRow}>
                  <MapPin color="#94a3b8" size={14} />
                  <Text style={styles.iconTextDim}>{item.branch}</Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.footerLabel}>Tổng thanh toán:</Text>
                <Text style={styles.footerValue}>{item.totalPrice}</Text>
              </View>
            </View>
          ))}

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
});
