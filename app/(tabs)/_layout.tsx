import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../lib/AuthContext';
import { StatusBar } from 'expo-status-bar';

function HeaderRight() {
  const router = useRouter();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <TouchableOpacity
      onPress={() => router.push('/profile')}
      style={styles.profileButton}
    >
      <Ionicons
        name="person-circle-outline"
        size={28}
        color="#00FF00"
      />
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#000000',
            borderBottomWidth: 1,
            borderBottomColor: '#333',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            color: '#fff',
          },
          headerRight: () => <HeaderRight />,
          tabBarActiveTintColor: "#00FF00",
          tabBarInactiveTintColor: "#888",
          tabBarStyle: {
            backgroundColor: '#000000',
            borderTopColor: '#333',
            borderTopWidth: 1,
            height: Platform.OS === 'ios' ? 85 : 60,
            paddingBottom: Platform.OS === 'ios' ? 25 : 10,
            paddingTop: 10,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            marginBottom: 4,
            fontFamily: 'Inter_500Medium',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            headerTitle: "QR Code Scanner",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="scan"
          options={{
            title: "Scan",
            headerTitle: "Scan QR Code",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="qr-code-outline" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="generate"
          options={{
            title: "Generate",
            headerTitle: "Generate QR Code",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="add-circle-outline" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="myqr"
          options={{
            title: "My Codes",
            headerTitle: "My QR Codes",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="list-outline" color={color} size={size} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  profileButton: {
    marginRight: 16,
    padding: 4,
  },
});
