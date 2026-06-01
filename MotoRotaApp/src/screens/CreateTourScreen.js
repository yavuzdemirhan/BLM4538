import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    SafeAreaView, StatusBar, ScrollView, KeyboardAvoidingView,
    Platform, ActivityIndicator, Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { toursAPI, routeStopsAPI } from '../services/api';
import { useAlert } from '../components/CustomAlert';
import Icon from '../components/Icons';

const C = {
    bg: '#0A0A0F', surface: '#13131A', surfaceHigh: '#1C1C28',
    border: '#1E1E2E', orange: '#FF6B35', orangeDim: '#FF6B3520',
    textPrimary: '#F0F0F5', textSecondary: '#8585A0', textMuted: '#3A3A55',
    green: '#34D399', greenDim: '#34D39920', purple: '#A78BFA', purpleDim: '#A78BFA20',
    blue: '#60A5FA', blueDim: '#60A5FA20', yellow: '#FBBF24', yellowDim: '#FBBF2420',
    red: '#F87171', redDim: '#F8717120',
};

const CATEGORIES = [
    { key: 'Sport',     icon: '🏎️', iconName: 'sport', color: C.orange,  bg: C.orangeDim  },
    { key: 'Naked',     icon: '⚡',  iconName: 'naked', color: C.purple,  bg: C.purpleDim  },
    { key: 'Adventure', icon: '🏔️', iconName: 'adventure', color: C.green,   bg: C.greenDim   },
    { key: 'Touring',   icon: '🛣️', iconName: 'touring', color: C.blue,    bg: C.blueDim    },
    { key: 'Cruiser',   icon: '🌅', iconName: 'cruiser', color: C.yellow,  bg: C.yellowDim  },
    { key: 'Enduro',    icon: '🌲', iconName: 'enduro', color: C.red,     bg: C.redDim     },
];

function Field({ label, icon, placeholder, value, onChangeText, multiline, keyboardType, maxLength }) {
    const [isFocused, setIsFocused] = useState(false);
    const borderAnim = useRef(new Animated.Value(0)).current;
    const handleFocus = () => { setIsFocused(true); Animated.timing(borderAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start(); };
    const handleBlur = () => { setIsFocused(false); Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start(); };
    const borderColor = borderAnim.interpolate({ inputRange: [0, 1], outputRange: [C.border, C.orange] });
    return (
        <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <Animated.View style={[styles.fieldWrapper, { borderColor }, multiline && styles.fieldWrapperMulti]}>
                <Icon name={icon} size={16} color={isFocused ? C.orange : C.textSecondary} style={{ marginRight: 10, marginTop: multiline ? 14 : 14 }} />
                <TextInput
                    style={[styles.fieldInput, multiline && styles.fieldInputMulti]}
                    placeholder={placeholder} placeholderTextColor={C.textMuted}
                    value={value} onChangeText={onChangeText}
                    onFocus={handleFocus} onBlur={handleBlur}
                    multiline={multiline} numberOfLines={multiline ? 4 : 1}
                    textAlignVertical={multiline ? 'top' : 'center'}
                    keyboardType={keyboardType || 'default'} maxLength={maxLength}
                />
            </Animated.View>
            {maxLength && <Text style={styles.charCount}>{value?.length || 0} / {maxLength}</Text>}
        </View>
    );
}

export default function CreateTourScreen({ navigation }) {
    const alert = useAlert();
    const [baslik, setBaslik] = useState('');
    const [aciklama, setAciklama] = useState('');
    const [rota, setRota] = useState('');
    const [tarih, setTarih] = useState('');
    const [kategori, setKategori] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Durak ekleme aşaması
    const [phase, setPhase] = useState('form'); // 'form' | 'stops'
    const [createdTourId, setCreatedTourId] = useState(null);
    const [stops, setStops] = useState([]);
    const [stopName, setStopName] = useState('');
    const [stopDesc, setStopDesc] = useState('');
    const [stopTime, setStopTime] = useState('');
    const [isStopLoading, setIsStopLoading] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(24)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start();
    }, []);

    const validate = () => {
        if (!baslik.trim())   { alert.show({ icon: 'warning', title: 'Eksik Alan', message: 'Tur başlığını gir.' }); return false; }
        if (!rota.trim())     { alert.show({ icon: 'warning', title: 'Eksik Alan', message: 'Rotayı gir (örn: İstanbul → Bursa).' }); return false; }
        if (!kategori)        { alert.show({ icon: 'warning', title: 'Eksik Alan', message: 'Motor kategorisi seç.' }); return false; }
        if (!tarih.trim())    { alert.show({ icon: 'warning', title: 'Eksik Alan', message: 'Tarih gir (GG.AA.YYYY).' }); return false; }
        const parts = tarih.trim().split('.');
        if (parts.length !== 3) { alert.show({ icon: 'warning', title: 'Hatalı Tarih', message: 'Tarih formatı GG.AA.YYYY olmalı.' }); return false; }
        const [gun, ay, yil] = parts.map(Number);
        const parsed = new Date(yil, ay - 1, gun);
        if (isNaN(parsed.getTime()) || parsed.getFullYear() !== yil) { alert.show({ icon: 'warning', title: 'Hatalı Tarih', message: 'Geçerli bir tarih gir.' }); return false; }
        return true;
    };

    const handleCreate = async () => {
        if (!validate()) return;
        const username = await AsyncStorage.getItem('username');
        if (!username) { alert.show({ icon: 'warning', title: 'Giriş Gerekli', message: 'Tur oluşturmak için giriş yapman gerekiyor.' }); return; }
        setIsLoading(true);
        try {
            const parts = tarih.trim().split('.');
            const [gun, ay, yil] = parts.map(Number);
            const isoDate = new Date(yil, ay - 1, gun).toISOString();
            const res = await toursAPI.create({
                baslik: baslik.trim(), aciklama: aciklama.trim(),
                rota: rota.trim(), tarih: isoDate,
                motosikletKategorisi: kategori, olusturanKisi: username,
            });
            const newId = res.data?.id || res.data?.Id;
            setCreatedTourId(newId);
            setPhase('stops');
        } catch (e) {
            const msg = e.response?.data || 'Tur oluşturulamadı.';
            alert.show({ icon: 'error', title: 'Hata', message: typeof msg === 'string' ? msg : JSON.stringify(msg) });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddStop = async () => {
        if (!stopName.trim()) { alert.show({ icon: 'warning', title: 'Eksik Alan', message: 'Durak adını gir.' }); return; }
        setIsStopLoading(true);
        try {
            const res = await routeStopsAPI.addStop({
                tourId: createdTourId,
                stopName: stopName.trim(),
                description: stopDesc.trim(),
                time: stopTime.trim(),
                orderIndex: stops.length + 1,
            });
            setStops(prev => [...prev, res.data]);
            setStopName(''); setStopDesc(''); setStopTime('');
        } catch (e) {
            alert.show({ icon: 'error', title: 'Hata', message: 'Durak eklenemedi.' });
        } finally {
            setIsStopLoading(false);
        }
    };

    const handleFinish = () => {
        alert.show({
            icon: 'party',
            title: 'Tur Hazır!',
            message: `"${baslik}" adlı turun ve ${stops.length} durağı oluşturuldu!`,
            buttons: [
                { text: 'Detayı Gör', onPress: () => { navigation.goBack(); setTimeout(() => navigation.navigate('TourDetail', { tourId: createdTourId }), 300); } },
                { text: 'Ana Sayfaya Dön', onPress: () => navigation.goBack() },
            ],
        });
    };

    // ─── DURAK EKLEME AŞAMASI ─────────────────────────────────────────────────
    if (phase === 'stops') {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor={C.bg} />
                <View style={styles.topBar}>
                    <View style={{ width: 40 }} />
                    <Text style={styles.topBarTitle}>Rota Durakları</Text>
                    <TouchableOpacity style={styles.doneBtn} onPress={handleFinish}>
                        <Text style={styles.doneBtnText}>Bitir</Text>
                    </TouchableOpacity>
                </View>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                        {/* Başlık */}
                        <View style={styles.stopsHero}>
                            <Icon name="mapPin" size={40} color={C.orange} style={{ marginBottom: 6 }} />
                            <Text style={styles.stopsHeroTitle}>Rota Durakları</Text>
                            <Text style={styles.stopsHeroSub}>"{baslik}" tura durak ekle</Text>
                        </View>

                        {/* Mevcut duraklar */}
                        {stops.length > 0 && (
                            <View style={styles.formCard}>
                                <Text style={styles.sectionLabel}>EKLENEN DURAKLAR ({stops.length})</Text>
                                {stops.map((s, idx) => (
                                    <View key={s.id || s.Id || idx} style={styles.stopItem}>
                                        <View style={styles.stopBullet}>
                                            <Text style={styles.stopBulletText}>{idx + 1}</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.stopName}>{s.stopName || s.StopName}</Text>
                                            {(s.description || s.Description) ? <Text style={styles.stopDesc}>{s.description || s.Description}</Text> : null}
                                            {(s.time || s.Time) ? (
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                                    <Icon name="clock" size={11} color={C.textMuted} />
                                                    <Text style={styles.stopTime}>{s.time || s.Time}</Text>
                                                </View>
                                            ) : null}
                                        </View>
                                        {idx < stops.length - 1 && <View style={styles.stopConnector} />}
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Yeni durak formu */}
                        <View style={styles.formCard}>
                            <Text style={styles.sectionLabel}>YENİ DURAK EKLE</Text>
                            <Field label="DURAK ADI *" icon="mapPin" placeholder="Örn: Kavşak Kahvaltıcı" value={stopName} onChangeText={setStopName} maxLength={80} />
                            <Field label="AÇIKLAMA" icon="description" placeholder="Burada ne yapılacak?" value={stopDesc} onChangeText={setStopDesc} multiline maxLength={200} />
                            <Field label="SAAT / SÜRE" icon="clock" placeholder="Örn: 09:00 / 30 dk" value={stopTime} onChangeText={setStopTime} maxLength={30} />
                            <TouchableOpacity style={[styles.addStopBtn, isStopLoading && { opacity: 0.6 }]} onPress={handleAddStop} disabled={isStopLoading}>
                                {isStopLoading ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.addStopBtnText}>+ Durak Ekle</Text>}
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.createBtn} onPress={handleFinish}>
                            <Text style={styles.createBtnIcon}>🚀</Text>
                            <Text style={styles.createBtnText}>Turu Yayınla ({stops.length} durak)</Text>
                        </TouchableOpacity>
                        <View style={{ height: 32 }} />
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }

    // ─── TUR OLUŞTURMA FORMU ──────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={C.bg} />
            <View style={styles.topBar}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Icon name="back" size={20} color={C.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.topBarTitle}>Yeni Tur</Text>
                <View style={{ width: 40 }} />
            </View>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                        <View style={styles.heroBox}>
                            <View style={styles.heroIcon}>
                                <Icon name="motorcycle" size={36} color={C.orange} />
                            </View>
                            <Text style={styles.heroTitle}>Tur Düzenle</Text>
                            <Text style={styles.heroSub}>Rotanı tanımla, diğer binicileri davet et</Text>
                        </View>

                        <View style={styles.formCard}>
                            <Text style={styles.sectionLabel}>TUR BİLGİLERİ</Text>
                            <Field label="BAŞLIK" icon="flag" placeholder="Örn: Karadeniz Kıyı Turu 2025" value={baslik} onChangeText={setBaslik} maxLength={80} />
                            <Field label="ROTA" icon="mapPin" placeholder="Örn: İstanbul → Trabzon → Rize" value={rota} onChangeText={setRota} maxLength={150} />
                            <Field label="TARİH (GG.AA.YYYY)" icon="calendar" placeholder="Örn: 25.06.2025" value={tarih} onChangeText={setTarih} keyboardType="numbers-and-punctuation" maxLength={10} />
                            <Field label="AÇIKLAMA" icon="description" placeholder="Tur hakkında detaylar, buluşma noktası..." value={aciklama} onChangeText={setAciklama} multiline maxLength={500} />
                        </View>

                        <View style={styles.formCard}>
                            <Text style={styles.sectionLabel}>MOTOR KATEGORİSİ</Text>
                            <Text style={styles.sectionHint}>Tura hangi motor tipi uygun?</Text>
                            <View style={styles.categoryGrid}>
                                {CATEGORIES.map(cat => {
                                    const isSelected = kategori === cat.key;
                                    return (
                                        <TouchableOpacity key={cat.key}
                                            style={[styles.categoryCard, isSelected && { backgroundColor: cat.bg, borderColor: cat.color, borderWidth: 1.5 }]}
                                            onPress={() => setKategori(cat.key)} activeOpacity={0.75}>
                                            <Icon name={cat.iconName} size={24} color={isSelected ? cat.color : C.textSecondary} style={{ marginBottom: 6 }} />
                                            <Text style={[styles.categoryCardText, isSelected && { color: cat.color, fontWeight: '700' }]}>{cat.key}</Text>
                                            {isSelected && <View style={[styles.checkDot, { backgroundColor: cat.color }]}><Icon name="check" size={8} color="#FFF" /></View>}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        {(baslik || rota || kategori) ? (
                            <View style={styles.previewCard}>
                                <Text style={styles.sectionLabel}>ÖNİZLEME</Text>
                                <View style={styles.previewInner}>
                                    <View style={[styles.previewStrip, { backgroundColor: CATEGORIES.find(c => c.key === kategori)?.color || C.orange }]} />
                                    <View style={{ flex: 1, padding: 14 }}>
                                        <Text style={styles.previewTitle} numberOfLines={1}>{baslik || 'Tur Başlığı'}</Text>
                                        {rota ? (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                                                <Icon name="mapPin" size={12} color={C.textSecondary} />
                                                <Text style={styles.previewRoute}>{rota}</Text>
                                            </View>
                                        ) : null}
                                        <View style={styles.previewMeta}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                <Icon name={kategori ? CATEGORIES.find(c => c.key === kategori)?.iconName : 'motorcycle'} size={11} color={C.textMuted} />
                                                <Text style={styles.previewMetaText}>{kategori || 'Kategori Seç'}</Text>
                                            </View>
                                            {tarih ? (
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                    <Icon name="calendar" size={11} color={C.textMuted} />
                                                    <Text style={styles.previewMetaText}>{tarih}</Text>
                                                </View>
                                            ) : null}
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ) : null}

                        <View style={styles.nextHint}>
                            <Icon name="mapPin" size={13} color={C.blue} style={{ marginRight: 6 }} />
                            <Text style={styles.nextHintText}>Tur oluşturulduktan sonra rota durakları ekleyebileceksin</Text>
                        </View>

                        <TouchableOpacity style={[styles.createBtn, isLoading && styles.createBtnDisabled]} onPress={handleCreate} disabled={isLoading} activeOpacity={0.85}>
                            {isLoading ? <ActivityIndicator color="#FFF" size="small" /> : (
                                <><Text style={styles.createBtnIcon}>➡️</Text><Text style={styles.createBtnText}>İleri — Durak Ekle</Text></>
                            )}
                        </TouchableOpacity>
                        <View style={{ height: 32 }} />
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
    backBtn: { width: 40, height: 40, backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.border, justifyContent: 'center', alignItems: 'center' },
    backBtnText: { color: C.textPrimary, fontSize: 20 },
    topBarTitle: { color: C.textPrimary, fontSize: 17, fontWeight: '700' },
    doneBtn: { backgroundColor: C.green, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
    doneBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
    scrollContent: { paddingHorizontal: 16, paddingTop: 20 },
    heroBox: { alignItems: 'center', marginBottom: 24 },
    heroIcon: { width: 72, height: 72, backgroundColor: C.surface, borderRadius: 20, borderWidth: 1, borderColor: C.border, justifyContent: 'center', alignItems: 'center', marginBottom: 14, shadowColor: C.orange, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 4 },
    heroTitle: { color: C.textPrimary, fontSize: 24, fontWeight: '800', letterSpacing: -0.4, marginBottom: 6 },
    heroSub: { color: C.textSecondary, fontSize: 14, textAlign: 'center' },
    formCard: { backgroundColor: C.surface, borderRadius: 20, borderWidth: 1, borderColor: C.border, padding: 20, marginBottom: 16 },
    sectionLabel: { color: C.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 4 },
    sectionHint: { color: C.textMuted, fontSize: 12, marginBottom: 16 },
    fieldGroup: { marginBottom: 18 },
    fieldLabel: { color: C.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 8 },
    fieldWrapper: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: C.surfaceHigh, borderRadius: 14, borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 4 },
    fieldWrapperMulti: { paddingVertical: 10 },
    fieldIcon: { fontSize: 16, marginRight: 10, marginTop: 14 },
    fieldInput: { flex: 1, color: C.textPrimary, fontSize: 15, paddingVertical: 12 },
    fieldInputMulti: { minHeight: 90, paddingVertical: 4 },
    charCount: { color: C.textMuted, fontSize: 11, textAlign: 'right', marginTop: 4 },
    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
    categoryCard: { width: '30%', alignItems: 'center', backgroundColor: C.surfaceHigh, borderRadius: 14, borderWidth: 1, borderColor: C.border, paddingVertical: 14, paddingHorizontal: 8, position: 'relative' },
    categoryCardIcon: { fontSize: 24, marginBottom: 6 },
    categoryCardText: { color: C.textSecondary, fontSize: 12, fontWeight: '500' },
    checkDot: { position: 'absolute', top: 6, right: 6, width: 14, height: 14, borderRadius: 7, justifyContent: 'center', alignItems: 'center' },
    previewCard: { backgroundColor: C.surface, borderRadius: 20, borderWidth: 1, borderColor: C.border, padding: 20, marginBottom: 16 },
    previewInner: { flexDirection: 'row', backgroundColor: C.surfaceHigh, borderRadius: 14, overflow: 'hidden', marginTop: 14 },
    previewStrip: { width: 4 },
    previewTitle: { color: C.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 4 },
    previewRoute: { color: C.textSecondary, fontSize: 12, marginBottom: 6 },
    previewMeta: { flexDirection: 'row', gap: 12 },
    previewMetaText: { color: C.textMuted, fontSize: 11 },
    nextHint: { backgroundColor: C.blueDim, borderRadius: 12, borderWidth: 1, borderColor: C.blue + '40', padding: 14, marginBottom: 16, flexDirection: 'row', alignItems: 'center' },
    nextHintText: { color: C.blue, fontSize: 13, flex: 1 },
    createBtn: { flexDirection: 'row', backgroundColor: C.orange, borderRadius: 16, paddingVertical: 18, alignItems: 'center', justifyContent: 'center', gap: 10, shadowColor: C.orange, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8, marginBottom: 8 },
    createBtnDisabled: { opacity: 0.6, shadowOpacity: 0, elevation: 0 },
    createBtnIcon: { fontSize: 20 },
    createBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
    // Stops phase
    stopsHero: { alignItems: 'center', marginBottom: 24, gap: 6 },
    stopsHeroTitle: { color: C.textPrimary, fontSize: 22, fontWeight: '800' },
    stopsHeroSub: { color: C.textSecondary, fontSize: 13, textAlign: 'center' },
    stopItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
    stopBullet: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.orange, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
    stopBulletText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
    stopName: { color: C.textPrimary, fontSize: 14, fontWeight: '700', marginBottom: 2 },
    stopDesc: { color: C.textSecondary, fontSize: 12, marginBottom: 2 },
    stopTime: { color: C.textMuted, fontSize: 11 },
    stopConnector: { position: 'absolute', left: 13, top: 42, width: 2, height: 20, backgroundColor: C.border },
    addStopBtn: { backgroundColor: C.green, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
    addStopBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});
