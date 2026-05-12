import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
    ScrollView,
    Animated,
    StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

const COLORS = {
    bg: '#0A0A0F',
    surface: '#13131A',
    surfaceHigh: '#1C1C28',
    border: '#1E1E2E',
    borderFocus: '#FF6B3560',
    orange: '#FF6B35',
    textPrimary: '#F0F0F5',
    textSecondary: '#8585A0',
    textMuted: '#3A3A55',
    error: '#FF4444',
};

function InputField({ label, placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize, icon }) {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const borderAnim = useRef(new Animated.Value(0)).current;

    const handleFocus = () => {
        setIsFocused(true);
        Animated.timing(borderAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
    };

    const handleBlur = () => {
        setIsFocused(false);
        Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    };

    const borderColor = borderAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [COLORS.border, COLORS.orange],
    });

    const isPassword = secureTextEntry === true;

    return (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <Animated.View style={[styles.inputWrapper, { borderColor }]}>
                <Text style={styles.inputIcon}>{icon}</Text>
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.textMuted}
                    value={value}
                    onChangeText={onChangeText}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    secureTextEntry={isPassword && !showPassword}
                    keyboardType={keyboardType || 'default'}
                    autoCapitalize={autoCapitalize || 'sentences'}
                />
                {isPassword && (
                    <TouchableOpacity
                        onPress={() => setShowPassword(v => !v)}
                        style={styles.eyeButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Text style={styles.eyeIcon}>
                            {showPassword ? '\uD83D\uDE48' : '\uD83D\uDC41\uFE0F'}
                        </Text>
                    </TouchableOpacity>
                )}
            </Animated.View>
        </View>
    );
}

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start();
    }, []);

    const handleLogin = async () => {
        if (!email.trim() || !password) {
            Alert.alert('Eksik Bilgi', 'E-posta ve şifre alanlarını doldurman gerekiyor.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await authAPI.login(email.trim(), password);
            const { token, username, role } = response.data;

            await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('username', username || '');
            await AsyncStorage.setItem('userRole', role || 'User');

            Alert.alert(
                'Giriş Başarılı! 🏍️',
                `Hoş geldin, ${username || email}! Motor çalıştı, yola hazırsın.`,
                [{ text: 'Haydi Gidelim!', onPress: () => navigation.navigate('Home') }]
            );
        } catch (error) {
            const msg = error.response?.data?.message || 'E-posta veya şifre hatalı.';
            Alert.alert('Giriş Başarısız', msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Geri Butonu */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Text style={styles.backIcon}>{'\u2190'}</Text>
                    </TouchableOpacity>

                    <Animated.View
                        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                    >
                        {/* Header */}
                        <View style={styles.headerContainer}>
                            <View style={styles.iconBadge}>
                                <Text style={styles.iconBadgeText}>{'\uD83D\uDD11'}</Text>
                            </View>
                            <Text style={styles.headerTitle}>Tekrar Hoş Geldin</Text>
                            <Text style={styles.headerSubtitle}>
                                Garajın ve rotaların seni bekliyor
                            </Text>
                        </View>

                        {/* Form */}
                        <View style={styles.formCard}>
                            <InputField
                                label="E-POSTA"
                                placeholder="sürücü@email.com"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                icon={'\uD83D\uDCE7'}
                            />
                            <InputField
                                label="ŞİFRE"
                                placeholder="En az 6 karakter"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={true}
                                autoCapitalize="none"
                                icon={'\uD83D\uDD12'}
                            />

                            <TouchableOpacity
                                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                                onPress={handleLogin}
                                disabled={isLoading}
                                activeOpacity={0.85}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#FFFFFF" size="small" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Giriş Yap</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Footer */}
                        <View style={styles.footerRow}>
                            <Text style={styles.footerText}>Hesabın yok mu?</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                <Text style={styles.footerLink}>{'  Kayıt Ol'}</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 48,
        paddingTop: 16,
    },
    backButton: {
        width: 44,
        height: 44,
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    backIcon: {
        color: COLORS.textPrimary,
        fontSize: 20,
        lineHeight: 22,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 36,
    },
    iconBadge: {
        width: 72,
        height: 72,
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: COLORS.orange,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 4,
    },
    iconBadgeText: { fontSize: 32 },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: COLORS.textPrimary,
        letterSpacing: -0.8,
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 15,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    formCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 24,
        marginBottom: 24,
    },
    inputGroup: { marginBottom: 20 },
    label: {
        color: COLORS.textSecondary,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.2,
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surfaceHigh,
        borderRadius: 14,
        borderWidth: 1.5,
        paddingHorizontal: 14,
    },
    inputIcon: { fontSize: 16, marginRight: 10 },
    input: {
        flex: 1,
        color: COLORS.textPrimary,
        fontSize: 15,
        paddingVertical: 14,
    },
    eyeButton: { paddingLeft: 8 },
    eyeIcon: { fontSize: 18 },
    submitButton: {
        backgroundColor: COLORS.orange,
        borderRadius: 14,
        paddingVertical: 17,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: COLORS.orange,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 6,
    },
    submitButtonDisabled: {
        backgroundColor: '#8B3D1E',
        shadowOpacity: 0,
        elevation: 0,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: { color: COLORS.textSecondary, fontSize: 15 },
    footerLink: { color: COLORS.orange, fontSize: 15, fontWeight: '700' },
});