import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import PersonalDashboard from '../screens/PersonalDashboard';
import FleetDashboard from '../screens/FleetDashboard';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{ 
          headerShown: false,
          cardStyle: { backgroundColor: '#050810' }
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="PersonalDashboard" component={PersonalDashboard} />
        <Stack.Screen name="FleetDashboard" component={FleetDashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
