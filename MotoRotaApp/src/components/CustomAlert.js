/**
 * CustomAlert — Uygulamanın koyu temasına uyumlu premium pop-up bileşeni.
 *
 * Kullanım:
 *   import { AlertProvider, useAlert } from '../components/CustomAlert';
 *
 *   // App.tsx'de sarmalayın:
 *   <AlertProvider>
 *     <NavigationContainer>...</NavigationContainer>
 *   </AlertProvider>
 *
 *   // Herhangi bir ekranda:
 *   const alert = useAlert();
 *   alert.show({
 *     icon: 'success',       // Icons.js'deki ikon adı
 *     title: 'Başarılı!',
 *     message: 'İşlem tamamlandı.',
 *     buttons: [
 *       { text: 'Tamam' },
 *       { text: 'İptal', style: 'cancel' },
 *     ],
 *   });
 */
import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
    Animated,
    Dimensions,
    TouchableWithoutFeedback,
} from 'react-native';
import Icon from './Icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Design Tokens (uygulamayla aynı) ─────────────────────────────────────────
const C = {
    bg: '#0A0A0F',
    surface: '#13131A',
    surfaceHigh: '#1C1C28',
    border: '#1E1E2E',
    orange: '#FF6B35',
    orangeDim: '#FF6B3520',
    textPrimary: '#F0F0F5',
    textSecondary: '#8585A0',
    textMuted: '#3A3A55',
    green: '#34D399',
    greenDim: '#34D39920',
    red: '#F87171',
    redDim: '#F8717120',
    yellow: '#FBBF24',
    yellowDim: '#FBBF2420',
    purple: '#A78BFA',
    purpleDim: '#A78BFA20',
    blue: '#60A5FA',
    blueDim: '#60A5FA20',
};

// İkon-renk eşleştirmesi
const ICON_THEMES = {
    success: { color: C.green, bg: C.greenDim, icon: 'success' },
    error:   { color: C.red,   bg: C.redDim,   icon: 'error' },
    warning: { color: C.yellow, bg: C.yellowDim, icon: 'warning' },
    info:    { color: C.blue,   bg: C.blueDim,   icon: 'info' },
    confirm: { color: C.orange, bg: C.orangeDim, icon: 'warning' },
    pending: { color: C.yellow, bg: C.yellowDim, icon: 'pending' },
    check:   { color: C.green,  bg: C.greenDim,  icon: 'check' },
    trash:   { color: C.red,    bg: C.redDim,    icon: 'trash' },
    party:   { color: C.purple, bg: C.purpleDim, icon: 'party' },
    admin:   { color: C.orange, bg: C.orangeDim, icon: 'admin' },
};

// ─── Context ──────────────────────────────────────────────────────────────────
const AlertContext = createContext(null);

export function useAlert() {
    const ctx = useContext(AlertContext);
    if (!ctx) {
        // Fallback — context dışında kullanılırsa standart Alert
        return {
            show: ({ title, message, buttons }) => {
                const { Alert } = require('react-native');
                Alert.alert(title || '', message || '', buttons);
            },
        };
    }
    return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AlertProvider({ children }) {
    const [visible, setVisible] = useState(false);
    const [config, setConfig] = useState({});
    const overlayAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.85)).current;

    const show = useCallback((cfg) => {
        setConfig(cfg);
        setVisible(true);
        Animated.parallel([
            Animated.timing(overlayAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 80, useNativeDriver: true }),
        ]).start();
    }, []);

    const hide = useCallback((callback) => {
        Animated.parallel([
            Animated.timing(overlayAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 0.85, duration: 200, useNativeDriver: true }),
        ]).start(() => {
            setVisible(false);
            setConfig({});
            callback?.();
        });
    }, []);

    const handleButtonPress = (btn) => {
        hide(btn?.onPress);
    };

    const theme = ICON_THEMES[config.icon] || ICON_THEMES.info;
    const buttons = config.buttons || [{ text: 'Tamam' }];
    const hasDestructive = buttons.some(b => b.style === 'destructive');

    return (
        <AlertContext.Provider value={{ show }}>
            {children}
            <Modal
                visible={visible}
                transparent
                animationType="none"
                statusBarTranslucent
                onRequestClose={() => hide()}
            >
                <TouchableWithoutFeedback onPress={() => hide()}>
                    <Animated.View style={[styles.overlay, { opacity: overlayAnim }]}>
                        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                            <Animated.View
                                style={[
                                    styles.alertBox,
                                    { transform: [{ scale: scaleAnim }] },
                                ]}
                            >
                                {/* Üst glow çizgisi */}
                                <View style={[styles.glowLine, { backgroundColor: theme.color }]} />

                                {/* İkon */}
                                <View style={[styles.iconCircle, { backgroundColor: theme.bg, borderColor: theme.color + '40' }]}>
                                    <Icon name={theme.icon} size={32} color={theme.color} />
                                </View>

                                {/* Başlık */}
                                {config.title ? (
                                    <Text style={styles.title}>{config.title}</Text>
                                ) : null}

                                {/* Mesaj */}
                                {config.message ? (
                                    <Text style={styles.message}>{config.message}</Text>
                                ) : null}

                                {/* Butonlar */}
                                <View style={[
                                    styles.buttonRow,
                                    buttons.length === 1 && { justifyContent: 'center' },
                                ]}>
                                    {buttons.map((btn, idx) => {
                                        const isCancel = btn.style === 'cancel';
                                        const isDestructive = btn.style === 'destructive';
                                        let btnStyle = styles.btnPrimary;
                                        let textStyle = styles.btnPrimaryText;

                                        if (isCancel) {
                                            btnStyle = styles.btnCancel;
                                            textStyle = styles.btnCancelText;
                                        } else if (isDestructive) {
                                            btnStyle = styles.btnDestructive;
                                            textStyle = styles.btnDestructiveText;
                                        }

                                        return (
                                            <TouchableOpacity
                                                key={idx}
                                                style={[styles.btn, btnStyle, buttons.length === 1 && { flex: 0, paddingHorizontal: 48 }]}
                                                onPress={() => handleButtonPress(btn)}
                                                activeOpacity={0.85}
                                            >
                                                <Text style={textStyle}>{btn.text}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </Animated.View>
                        </TouchableWithoutFeedback>
                    </Animated.View>
                </TouchableWithoutFeedback>
            </Modal>
        </AlertContext.Provider>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 28,
    },
    alertBox: {
        width: SCREEN_WIDTH - 56,
        maxWidth: 380,
        backgroundColor: C.surface,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: C.border,
        alignItems: 'center',
        paddingTop: 0,
        paddingBottom: 24,
        paddingHorizontal: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
        elevation: 20,
    },
    glowLine: {
        width: '100%',
        height: 3,
        borderRadius: 2,
        marginBottom: 24,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 18,
    },
    title: {
        color: C.textPrimary,
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: -0.3,
        textAlign: 'center',
        marginBottom: 10,
    },
    message: {
        color: C.textSecondary,
        fontSize: 14,
        lineHeight: 22,
        textAlign: 'center',
        marginBottom: 24,
        paddingHorizontal: 4,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 10,
        width: '100%',
    },
    btn: {
        flex: 1,
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnPrimary: {
        backgroundColor: C.orange,
        shadowColor: C.orange,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    btnPrimaryText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '700',
    },
    btnCancel: {
        backgroundColor: C.surfaceHigh,
        borderWidth: 1,
        borderColor: C.border,
    },
    btnCancelText: {
        color: C.textSecondary,
        fontSize: 15,
        fontWeight: '600',
    },
    btnDestructive: {
        backgroundColor: C.redDim,
        borderWidth: 1,
        borderColor: C.red + '60',
    },
    btnDestructiveText: {
        color: C.red,
        fontSize: 15,
        fontWeight: '700',
    },
});
