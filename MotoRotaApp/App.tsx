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

export type RootStackParamList = {
    Welcome: undefined;
    Login: undefined;
    Register: undefined;
    Home: undefined;
    TourDetail: { tourId: number };
    CreateTour: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

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
                    <Stack.Screen name="Home" component={HomeScreen} />
                    <Stack.Screen name="TourDetail" component={TourDetailScreen} />
                    <Stack.Screen name="CreateTour" component={CreateTourScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}
