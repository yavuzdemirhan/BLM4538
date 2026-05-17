import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import TourDetailScreen from './src/screens/TourDetailScreen';
import CreateTourScreen from './src/screens/CreateTourScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import GarageScreen from './src/screens/GarageScreen';
import ActivitiesScreen from './src/screens/ActivitiesScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

export type RootStackParamList = {
    Welcome: undefined;
    Login: undefined;
    Register: undefined;
    MainTabs: undefined;
    TourDetail: { tourId: number };
    CreateTour: undefined;
    Garage: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#13131A',
                    borderTopColor: '#1E1E2E',
                    height: 60,
                    paddingBottom: 8,
                },
                tabBarActiveTintColor: '#FF6B35',
                tabBarInactiveTintColor: '#8585A0',
                tabBarIcon: ({ color, size }) => {
                    let iconName;
                    if (route.name === 'Turlar') iconName = '🏍️';
                    else if (route.name === 'Etkinliklerim') iconName = '📅';
                    else if (route.name === 'Profil') iconName = '👤';
                    return <Text style={{ fontSize: 20 }}>{iconName}</Text>;
                },
            })}
        >
            <Tab.Screen name="Turlar" component={HomeScreen} />
            <Tab.Screen name="Etkinliklerim" component={ActivitiesScreen} />
            <Tab.Screen name="Profil" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

export default function App() {
    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <Stack.Navigator
                    initialRouteName="Welcome"
                    screenOptions={{
                        headerShown: false,
                        animation: 'slide_from_right',
                        contentStyle: { backgroundColor: '#0A0A0F' },
                    }}
                >
                    <Stack.Screen name="Welcome" component={WelcomeScreen} />
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                    <Stack.Screen name="MainTabs" component={MainTabs} />
                    <Stack.Screen name="TourDetail" component={TourDetailScreen} />
                    <Stack.Screen name="CreateTour" component={CreateTourScreen} />
                    <Stack.Screen name="Garage" component={GarageScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}
