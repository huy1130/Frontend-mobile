import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CalendarCheck, ClipboardCheck, Sparkles, Award } from 'lucide-react-native';
import { mockProcessSteps } from '../../mock/homeData';

const iconMap: Record<string, React.ReactNode> = {
  CalendarCheck: <CalendarCheck color="#f97316" size={26} />,
  ClipboardCheck: <ClipboardCheck color="#d97706" size={26} />,
  Sparkles: <Sparkles color="#ea580c" size={26} />,
  Award: <Award color="#059669" size={26} />,
};

export default function HowItWorks() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Trải Nghiệm Đơn Giản & Minh Bạch</Text>
        </View>
        
        <Text style={styles.title}>QUY TRÌNH DỊCH VỤ</Text>
        <Text style={styles.subtitle}>4 BƯỚC THÔNG MINH</Text>
        
        <Text style={styles.description}>
          Trải nghiệm rửa xe chuyên nghiệp, minh bạch và tiết kiệm thời gian tối đa cho quý khách.
        </Text>
      </View>

      {/* Steps List */}
      <View style={styles.stepsContainer}>
        {mockProcessSteps.map((step) => (
          <View key={step.id} style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <View style={styles.iconBox}>
                {iconMap[step.iconName]}
              </View>
              <Text style={styles.stepNumber}>{step.stepNumber}</Text>
            </View>

            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepDescription}>{step.description}</Text>
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
    alignItems: 'center',
    marginBottom: 24,
  },
  badge: {
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 9999,
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
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ea580c',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    color: '#64748b',
    textAlign: 'center',
    fontSize: 12,
    paddingHorizontal: 8,
    lineHeight: 20,
  },
  stepsContainer: {
    gap: 14,
  },
  stepCard: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#e2e8f0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 12,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#ffedd5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    fontSize: 30,
    fontWeight: '900',
    color: '#e2e8f0',
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 4,
  },
  stepDescription: {
    color: '#64748b',
    fontSize: 12,
    lineHeight: 20,
  },
});
