import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import CardWalletScreen from './src/screens/CardWalletScreen';
import RecommendationScreen from './src/screens/RecommendationScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user, logout } = useAuth();

  return (
    <NavigationContainer>
      {!user ? (
        <Stack.Navigator>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#007AFF',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen
            name="Recommendation"
            component={RecommendationScreen}
            options={({ navigation }) => ({
              title: 'Card Optimizer',
              headerRight: () => (
                <TouchableOpacity
                  onPress={() => navigation.navigate('Cards' as never)}
                  style={styles.headerButton}
                >
                  <Text style={styles.headerButtonText}>My Cards</Text>
                </TouchableOpacity>
              ),
              headerLeft: () => (
                <TouchableOpacity onPress={logout} style={styles.headerButton}>
                  <Text style={styles.headerButtonText}>Logout</Text>
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen
            name="Cards"
            component={CardWalletScreen}
            options={{
              title: 'My Credit Cards',
            }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
