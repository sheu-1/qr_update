import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';

export default function HomeScreen() {
  const router = useRouter();

  const features = [
    {
      title: 'Scan QR Code',
      description: 'Quickly scan any QR code with your camera',
      icon: 'qr-code-outline',
      route: '/(tabs)/scan',
      color: colors.primary,
    },
    {
      title: 'Generate QR',
      description: 'Create custom QR codes for any text or URL',
      icon: 'create-outline',
      route: '/(tabs)/generate',
      color: colors.secondary,
    },
    {
      title: 'My QR Codes',
      description: 'View and manage your saved QR codes',
      icon: 'list-outline',
      route: '/(tabs)/myqr',
      color: '#FF9500',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, User</Text>
          <Text style={styles.subtitle}>What would you like to do today?</Text>
        </View>

        <View style={styles.grid}>
          {features.map((feature, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.card, { borderLeftColor: feature.color }]}
              onPress={() => router.push(feature.route as any)}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${feature.color}20` }]}>
                <Ionicons name={feature.icon as any} size={24} color={feature.color} />
              </View>
              <Text style={styles.cardTitle}>{feature.title}</Text>
              <Text style={styles.cardDescription}>{feature.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Scans</Text>
          <View style={styles.emptyState}>
            <Ionicons name="scan-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No recent scans</Text>
            <Text style={styles.emptySubtext}>Scan a QR code to see it here</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  scrollContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  greeting: {
    ...typography.h1,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.sm,
    marginBottom: spacing.xl,
  },
  card: {
    width: '100%',
    backgroundColor: colors.darkGray,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.h2,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  cardDescription: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 14,
  },
  recentSection: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.white,
    marginBottom: spacing.md,
  },
  emptyState: {
    backgroundColor: colors.darkGray,
    borderRadius: 12,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...typography.h2,
    color: colors.white,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
