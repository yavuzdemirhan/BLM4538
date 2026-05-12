import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
    Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { toursAPI } from '../services/api';

// ─── Design Tokens ────────────────────────────────────────────────────────────
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
    purple: '#A78BFA',
    purpleDim: '#A78BFA20',
    blue: '#60A5FA',
    blueDim: '#60A5FA20',
    yellow: '#FBBF24',
    yellowDim: '#FBBF2420',
    red: '#F87171',
    redDim: '#F8717120',
};

const CATEGORIES = [
    { key: 'Sport',     icon: '🏎️', color: C.orange,  bg: C.orangeDim  },
    { key: 'Naked',     icon: '⚡',  color: C.purple,  bg: C.purpleDim  },
    { key: 'Adventure', icon: '🏔️', color: C.green,   bg: C.greenDim   },
    { key: 'Touring',   icon: '🛣️', color: C.blue,    bg: C.blueDim    },
    { key: 'Cruiser',   icon: '🌅', color: C.yellow,  bg: C.yellowDim  },
    { key: 'Enduro',    icon: '🌲', color: C.red,     bg: C.redDim     },
];

// ─── Animasyonlu Input ────────────────────────────────────────────────────────
function Field({ label, icon, placeholder, value, onChangeText, multiline, keyboardType, maxLength }) {
    const [isFocused, setIsFocused] = useState(false);
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
        outputRange: [C.border, C.orange],
    });

    return (
        <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <Animated.View style={[styles.fieldWrapper, { borderColor }, multiline && styles.fieldWrapperMulti]}>
                <Text style={styles.fieldIcon}>{icon}</Text>
                <TextInput
                    style={[styles.fieldInput, multiline && styles.fieldInputMulti]}
                    placeholder={placeholder}
                    placeholderTextColor={C.textMuted}
                    value={value}
                    onChangeText={onChangeText}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    multiline={multiline}
                    numberOfLines={multiline ? 4 : 1}
                    textAlignVertical={multiline ? 'top' : 'center'}
                    keyboardType={keyboardType || 'default'}
                    maxLength={maxLength}
                />
            </Animated.View>
            {maxLength && (
                <Text style={styles.charCount}>{value?.length || 0} / {maxLength}</Text>
            )}
        </View>
    );
}

// ─── Ana Bileşen ──────────────────────────────────────────────────────────────
export default function CreateTourScreen({ navigation }) {
    const [baslik, setBaslik] = useState('');
    const [aciklama, setAciklama] = useState('');
    const [rota, setRota] = useState('');
    const [tarih, setTarih] = useState('');
    const [kategori, setKategori] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(24)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start();
    }, []);

    const validate = () => {
        if (!baslik.trim())   { Alert.alert('Eksik Alan', 'Tur başlığını gir.'); return false; }
        if (!rota.trim())     { Alert.alert('Eksik Alan', 'Rotayı gir (örn: İstanbul → Bursa).'); return false; }
        if (!kategori)        { Alert.alert('Eksik Alan', 'Motor kategorisi seç.'); return false; }
        if (!tarih.trim())    { Alert.alert('Eksik Alan', 'Tarih gir (GG.AA.YYYY).'); return false; }

        // Tarih doğrulama
        const parts = tarih.trim().split('.');
        if (parts.length !== 3) {
            Alert.alert('Hatalı Tarih', 'Tarih formatı GG.AA.YYYY olmalı (örn: 25.06.2025).');
            return false;
        }
        const [gun, ay, yil] = parts.map(Number);
        const parsed = new Date(yil, ay - 1, gun);
        if (isNaN(parsed.getTime()) || parsed.getFullYear() !== yil) {
            Alert.alert('Hatalı Tarih', 'Geçerli bir tarih gir.');
            return false;
        }
        return true;
    };

    const handleCreate = async () => {
        if (!validate()) return;

        const username = await AsyncStorage.getItem('username');
        if (!username) {
            Alert.alert('Giriş Gerekli', 'Tur oluşturmak için giriş yapman gerekiyor.');
            return;
        }

        setIsLoading(true);
        try {
            const parts = tarih.trim().split('.');
            const [gun, ay, yil] = parts.map(Number);
            const isoDate = new Date(yil, ay - 1, gun).toISOString();

            const res = await toursAPI.create({
                baslik: baslik.trim(),
                aciklama: aciklama.trim(),
                rota: rota.trim(),
                tarih: isoDate,
                motosikletKategorisi: kategori,
                olusturanKisi: username,
            });

            const newTourId = res.data?.id || res.data?.Id;

            Alert.alert(
                '🏁 Tur Oluşturuldu!',
                `"${baslik}" adlı turun hazır. Herkese açıldı!`,
                [
                    {
                        text: 'Detayı Gör',
                        onPress: () => {
                            navigation.goBack();
                            if (newTourId) {
                                setTimeout(() => navigation.navigate('TourDetail', { tourId: newTourId }), 300);
                            }
                        },
                    },
                    { text: 'Ana Sayfaya Dön', onPress: () => navigation.goBack() },
                ]
            );
        } catch (e) {
            const msg = e.response?.data || 'Tur oluşturulamadı.';
            Alert.alert('Hata', typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={C.bg} />

            {/* Üst Bar */}
            <View style={styles.topBar}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Text style={styles.backBtnText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.topBarTitle}>Yeni Tur</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

                        {/* Hero */}
                        <View style={styles.heroBox}>
                            <View style={styles.heroIcon}>
                                <Text style={{ fontSize: 36 }}>🏍️</Text>
                            </View>
                            <Text style={styles.heroTitle}>Tur Düzenle</Text>
                            <Text style={styles.heroSub}>
                                Rotanı tanımla, diğer binicileri davet et
                            </Text>
                        </View>

                        {/* Form Kartı */}
                        <View style={styles.formCard}>
                            <Text style={styles.sectionLabel}>TUR BİLGİLERİ</Text>

                            <Field
                                label="BAŞLIK"
                                icon="🏆"
                                placeholder="Örn: Karadeniz Kıyı Turu 2025"
                                value={baslik}
                                onChangeText={setBaslik}
                                maxLength={80}
                            />
                            <Field
                                label="ROTA"
                                icon="📍"
                                placeholder="Örn: İstanbul → Trabzon → Rize"
                                value={rota}
                                onChangeText={setRota}
                                maxLength={150}
                            />
                            <Field
                                label="TARİH (GG.AA.YYYY)"
                                icon="📅"
                                placeholder="Örn: 25.06.2025"
                                value={tarih}
                                onChangeText={setTarih}
                                keyboardType="numbers-and-punctuation"
                                maxLength={10}
                            />
                            <Field
                                label="AÇIKLAMA"
                                icon="📝"
                                placeholder="Tur hakkında detaylar, buluşma noktası, ekipman önerileri..."
                                value={aciklama}
                                onChangeText={setAciklama}
                                multiline
                                maxLength={500}
                            />
                        </View>

                        {/* Kategori Seçimi */}
                        <View style={styles.formCard}>
                            <Text style={styles.sectionLabel}>MOTOR KATEGORİSİ</Text>
                            <Text style={styles.sectionHint}>Tura hangi motor tipi uygun?</Text>

                            <View style={styles.categoryGrid}>
                                {CATEGORIES.map(cat => {
                                    const isSelected = kategori === cat.key;
                                    return (
                                        <TouchableOpacity
                                            key={cat.key}
                                            style={[
                                                styles.categoryCard,
                                                isSelected && {
                                                    backgroundColor: cat.bg,
                                                    borderColor: cat.color,
                                                    borderWidth: 1.5,
                                                },
                                            ]}
                                            onPress={() => setKategori(cat.key)}
                                            activeOpacity={0.75}
                                        >
                                            <Text style={styles.categoryCardIcon}>{cat.icon}</Text>
                                            <Text style={[
                                                styles.categoryCardText,
                                                isSelected && { color: cat.color, fontWeight: '700' },
                                            ]}>
                                                {cat.key}
                                            </Text>
                                            {isSelected && (
                                                <View style={[styles.checkDot, { backgroundColor: cat.color }]}>
                                                    <Text style={{ color: '#FFF', fontSize: 8, fontWeight: '700' }}>✓</Text>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Özet Önizleme */}
                        {(baslik || rota || kategori) ? (
                            <View style={styles.previewCard}>
                                <Text style={styles.sectionLabel}>ÖNİZLEME</Text>
                                <View style={styles.previewInner}>
                                    <View style={[
                                        styles.previewStrip,
                                        { backgroundColor: CATEGORIES.find(c => c.key === kategori)?.color || C.orange }
                                    ]} />
                                    <View style={{ flex: 1, padding: 14 }}>
                                        <Text style={styles.previewTitle} numberOfLines={1}>
                                            {baslik || 'Tur Başlığı'}
                                        </Text>
                                        {rota ? (
                                            <Text style={styles.previewRoute}>📍 {rota}</Text>
                                        ) : null}
                                        <View style={styles.previewMeta}>
                                            <Text style={styles.previewMetaText}>
                                                {kategori
                                                    ? `${CATEGORIES.find(c => c.key === kategori)?.icon} ${kategori}`
                                                    : '🏍️ Kategori Seç'}
                                            </Text>
                                            {tarih ? <Text style={styles.previewMetaText}>📅 {tarih}</Text> : null}
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ) : null}

                        {/* Oluştur Butonu */}
                        <TouchableOpacity
                            style={[styles.createBtn, isLoading && styles.createBtnDisabled]}
                            onPress={handleCreate}
                            disabled={isLoading}
                            activeOpacity={0.85}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFF" size="small" />
                            ) : (
                                <>
                                    <Text style={styles.createBtnIcon}>🚀</Text>
                                    <Text style={styles.createBtnText}>Turu Oluştur</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <View style={{ height: 32 }} />
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },

    // Üst bar
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: C.border,
    },
    backBtn: {
        width: 40,
        height: 40,
        backgroundColor: C.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: C.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backBtnText: { color: C.textPrimary, fontSize: 20 },
    topBarTitle: {
        color: C.textPrimary,
        fontSize: 17,
        fontWeight: '700',
    },

    // Scroll
    scrollContent: { paddingHorizontal: 16, paddingTop: 20 },

    // Hero
    heroBox: {
        alignItems: 'center',
        marginBottom: 24,
    },
    heroIcon: {
        width: 72,
        height: 72,
        backgroundColor: C.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: C.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
        shadowColor: C.orange,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 4,
    },
    heroTitle: {
        color: C.textPrimary,
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: -0.4,
        marginBottom: 6,
    },
    heroSub: {
        color: C.textSecondary,
        fontSize: 14,
        textAlign: 'center',
    },

    // Form Kartı
    formCard: {
        backgroundColor: C.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: C.border,
        padding: 20,
        marginBottom: 16,
    },
    sectionLabel: {
        color: C.textSecondary,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.2,
        marginBottom: 4,
    },
    sectionHint: {
        color: C.textMuted,
        fontSize: 12,
        marginBottom: 16,
    },

    // Field
    fieldGroup: { marginBottom: 18 },
    fieldLabel: {
        color: C.textSecondary,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.2,
        marginBottom: 8,
    },
    fieldWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: C.surfaceHigh,
        borderRadius: 14,
        borderWidth: 1.5,
        paddingHorizontal: 14,
        paddingVertical: 4,
    },
    fieldWrapperMulti: { paddingVertical: 10 },
    fieldIcon: { fontSize: 16, marginRight: 10, marginTop: 14 },
    fieldInput: {
        flex: 1,
        color: C.textPrimary,
        fontSize: 15,
        paddingVertical: 12,
    },
    fieldInputMulti: {
        minHeight: 90,
        paddingVertical: 4,
    },
    charCount: {
        color: C.textMuted,
        fontSize: 11,
        textAlign: 'right',
        marginTop: 4,
    },

    // Kategori Grid
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 14,
    },
    categoryCard: {
        width: '30%',
        alignItems: 'center',
        backgroundColor: C.surfaceHigh,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: C.border,
        paddingVertical: 14,
        paddingHorizontal: 8,
        position: 'relative',
    },
    categoryCardIcon: { fontSize: 24, marginBottom: 6 },
    categoryCardText: { color: C.textSecondary, fontSize: 12, fontWeight: '500' },
    checkDot: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 14,
        height: 14,
        borderRadius: 7,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Önizleme
    previewCard: {
        backgroundColor: C.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: C.border,
        padding: 20,
        marginBottom: 16,
    },
    previewInner: {
        flexDirection: 'row',
        backgroundColor: C.surfaceHigh,
        borderRadius: 14,
        overflow: 'hidden',
        marginTop: 14,
    },
    previewStrip: { width: 4 },
    previewTitle: {
        color: C.textPrimary,
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 4,
    },
    previewRoute: {
        color: C.textSecondary,
        fontSize: 12,
        marginBottom: 6,
    },
    previewMeta: { flexDirection: 'row', gap: 12 },
    previewMetaText: { color: C.textMuted, fontSize: 11 },

    // Oluştur Butonu
    createBtn: {
        flexDirection: 'row',
        backgroundColor: C.orange,
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        shadowColor: C.orange,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
        marginBottom: 8,
    },
    createBtnDisabled: { opacity: 0.6, shadowOpacity: 0, elevation: 0 },
    createBtnIcon: { fontSize: 20 },
    createBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
});
