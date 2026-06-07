import React, { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
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
import AdminCommentsScreen from './src/screens/AdminCommentsScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AlertProvider } from './src/components/CustomAlert';
import { TabIcon } from './src/components/Icons';

export type RootStackParamList = {
    Welcome: undefined;
    Login: undefined;
    Register: undefined;
    MainTabs: undefined;
    TourDetail: { tourId: number };
    CreateTour: undefined;
    Garage: undefined;
    AdminComments: undefined;
    Notifications: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function MainTabs() {
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        checkAdminRole();
    }, []);

    const checkAdminRole = async () => {
        const role = await AsyncStorage.getItem('userRole');
        setIsAdmin(role === 'Admin');
    };

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
                    let iconName = 'motorcycle';
                    if (route.name === 'Turlar') iconName = 'motorcycle';
                    else if (route.name === 'Etkinliklerim') iconName = 'calendar';
                    else if (route.name === 'Profil') iconName = 'profile';
                    else if (route.name === 'Admin') iconName = 'admin';
                    return <TabIcon name={iconName} size={22} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Turlar" component={HomeScreen} />
            <Tab.Screen name="Etkinliklerim" component={ActivitiesScreen} />
            <Tab.Screen name="Profil" component={ProfileScreen} />
            {isAdmin && (
                <Tab.Screen
                    name="Admin"
                    component={AdminCommentsScreen}
                    options={{
                        tabBarLabel: 'Admin',
                        tabBarLabelStyle: { fontWeight: '700' },
                    }}
                />
            )}
        </Tab.Navigator>
    );
}

const MyTheme = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        primary: '#FF6B35',
        background: '#0A0A0F',
        card: '#13131A',
        text: '#F0F0F5',
        border: '#1E1E2E',
        notification: '#FF6B35',
    },
};

export default function App() {
    return (
        <SafeAreaProvider>
            <AlertProvider>
                <NavigationContainer theme={MyTheme}>
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
                        <Stack.Screen name="AdminComments" component={AdminCommentsScreen} />
                        <Stack.Screen name="Notifications" component={NotificationsScreen} />
                    </Stack.Navigator>
                </NavigationContainer>
            </AlertProvider>
        </SafeAreaProvider>
    );
}
