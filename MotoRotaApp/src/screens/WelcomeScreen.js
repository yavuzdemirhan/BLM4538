import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Animated,
    Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const COLORS = {
    bg: '#0A0A0F',
    surface: '#13131A',
    border: '#1E1E2E',
    orange: '#FF6B35',
    orangeGlow: '#FF8C42',
    textPrimary: '#F0F0F5',
    textSecondary: '#8585A0',
    textMuted: '#3A3A55',
};

export default function WelcomeScreen({ navigation }) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const logoScale = useRef(new Animated.Value(0.8)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Logo animasyonu önce gelsin
        Animated.sequence([
            Animated.parallel([
                Animated.spring(logoScale, {
                    toValue: 1,
                    tension: 60,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.timing(logoOpacity, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ]),
            // Sonra içerik fade in
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();

        // Logo pulse döngüsü
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.06,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const features = [
        { icon: '\uD83D\uDDFA\uFE0F', label: 'Rota Çiz' },
        { icon: '\uD83C\uDFCD\uFE0F', label: 'Garaj' },
        { icon: '\uD83D\uDC65', label: 'Topluluk' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

            {/* Dekoratif arka plan halkası */}
            <View style={styles.bgRing} />
            <View style={styles.bgRingOuter} />

            {/* Logo Bölümü */}
            <Animated.View
                style={[
                    styles.logoSection,
                    {
                        opacity: logoOpacity,
                        transform: [{ scale: logoScale }],
                    },
                ]}
            >
                <Animated.View
                    style={[
                        styles.logoRing,
                        { transform: [{ scale: pulseAnim }] },
                    ]}
                >
                    <View style={styles.logoInner}>
                        <Text style={styles.logoEmoji}>{'\uD83C\uDFCD\uFE0F'}</Text>
                    </View>
                </Animated.View>
            </Animated.View>

            {/* Ana İçerik */}
            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    },
                ]}
            >
                <Text style={styles.appName}>MotoRota</Text>
                <Text style={styles.tagline}>
                    Rotanı çiz, garajını yönet{'\n'}en iyi sürücülerle yola çık
                </Text>

                {/* Özellik pilleri */}
                <View style={styles.featureRow}>
                    {features.map((f, i) => (
                        <View key={i} style={styles.featurePill}>
                            <Text style={styles.featureIcon}>{f.icon}</Text>
                            <Text style={styles.featureLabel}>{f.label}</Text>
                        </View>
                    ))}
                </View>
            </Animated.View>

            {/* Butonlar */}
            <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => navigation.navigate('Login')}
                    activeOpacity={0.85}
                >
                    <View style={styles.primaryButtonInner}>
                        <Text style={styles.primaryButtonText}>Giriş Yap</Text>
                        <Text style={styles.buttonArrow}>{' \u2192'}</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => navigation.navigate('Register')}
                    activeOpacity={0.7}
                >
                    <Text style={styles.secondaryButtonText}>
                        Hesabın yok mu?{'  '}
                        <Text style={styles.secondaryButtonHighlight}>Kayıt Ol</Text>
                    </Text>
                </TouchableOpacity>
            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 44,
        paddingTop: 20,
    },
    bgRing: {
        position: 'absolute',
        width: 400,
        height: 400,
        borderRadius: 200,
        borderWidth: 1,
        borderColor: '#FF6B3515',
        top: -60,
        alignSelf: 'center',
    },
    bgRingOuter: {
        position: 'absolute',
        width: 600,
        height: 600,
        borderRadius: 300,
        borderWidth: 1,
        borderColor: '#FF6B350A',
        top: -160,
        alignSelf: 'center',
    },
    logoSection: {
        marginTop: 60,
        alignItems: 'center',
    },
    logoRing: {
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 1.5,
        borderColor: '#FF6B3540',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.orange,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 30,
        elevation: 12,
    },
    logoInner: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoEmoji: {
        fontSize: 54,
    },
    content: {
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    appName: {
        fontSize: 52,
        fontWeight: '900',
        color: COLORS.textPrimary,
        letterSpacing: -1.5,
        marginBottom: 12,
    },
    tagline: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 26,
        marginBottom: 36,
    },
    featureRow: {
        flexDirection: 'row',
        gap: 10,
    },
    featurePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    featureIcon: {
        fontSize: 14,
    },
    featureLabel: {
        fontSize: 13,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    footer: {
        width: '100%',
        paddingHorizontal: 24,
        gap: 12,
    },
    primaryButton: {
        backgroundColor: COLORS.orange,
        borderRadius: 16,
        paddingVertical: 18,
        shadowColor: COLORS.orange,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 8,
    },
    primaryButtonInner: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    buttonArrow: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '400',
    },
    secondaryButton: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: COLORS.textSecondary,
        fontSize: 15,
    },
    secondaryButtonHighlight: {
        color: COLORS.orange,
        fontWeight: '700',
    },
});