import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect, Stack } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { colors, spacing, typography } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { ViewStyle, TextStyle, ImageStyle } from 'react-native';

interface QRCodeRecord {
  id: string;
  account_number: string;
  image_url: string;
  created_at: string;
}

export default function MyQRScreen() {
  const [qrCodes, setQrCodes] = useState<QRCodeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchMyQRCodes = async () => {
        try {
          setLoading(true);
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            setQrCodes([]);
            return;
          }

          const { data, error } = await supabase
            .from('qr_codes')
            .select('*')
            .not('image_url', 'is', null) // Only fetch records that have an image
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching QR codes:', error);
            setQrCodes([]);
          } else {
            setQrCodes(data || []);
          }
        } catch (e: any) {
          console.error('An unexpected error occurred:', e);
          setQrCodes([]);
        } finally {
          setLoading(false);
        }
      };

      fetchMyQRCodes();
    }, [])
  );

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchQRCodes();
    setRefreshing(false);
  }, []);

  const fetchQRCodes = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setQrCodes([]);
        return;
      }

      const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .not('image_url', 'is', null)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching QR codes:', error);
        setQrCodes([]);
      } else {
        setQrCodes(data || []);
      }
    } catch (e: any) {
      console.error('An unexpected error occurred:', e);
      setQrCodes([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchQRCodes();
    }, [])
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'My QR Codes',
          headerStyle: {
            backgroundColor: colors.darkGray,
          },
          headerTintColor: colors.white,
          headerTitleStyle: {
            ...typography.h2,
            color: colors.white,
          },
        }} 
      />
      
      {qrCodes.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="qr-code-outline" size={64} color={colors.textSecondary} style={styles.emptyIcon} />
          <Text style={styles.title}>No QR Codes Yet</Text>
          <Text style={styles.subtitle}>Your saved QR codes will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={qrCodes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.qrItem}>
              <Image 
                source={{ uri: item.image_url }} 
                style={styles.qrImage} 
                resizeMode="contain"
              />
              <View style={styles.qrInfo}>
                <Text style={styles.accountText}>{item.account_number}</Text>
                <View style={styles.dateContainer}>
                  <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.dateText}>
                    {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.black,
  } as ViewStyle,
  container: {
    flex: 1,
    backgroundColor: colors.black,
  } as ViewStyle,
  emptyIcon: {
    marginBottom: spacing.lg,
    opacity: 0.5,
  } as TextStyle,
  title: {
    ...typography.h2,
    color: colors.white,
    marginBottom: spacing.sm,
    textAlign: 'center' as const,
  } as TextStyle,
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  } as TextStyle,
  listContent: {
    padding: spacing.md,
  } as ViewStyle,
  qrItem: {
    backgroundColor: colors.darkGray,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  qrImage: {
    width: 60,
    height: 60,
    marginRight: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.mediumGray,
  } as ImageStyle,
  qrInfo: {
    flex: 1,
  } as ViewStyle,
  accountText: {
    ...typography.h2,
    fontSize: 18,
    color: colors.white,
    marginBottom: spacing.xs,
  } as TextStyle,
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  dateText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  } as TextStyle,
});
