import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    Alert,
    Animated,
    Share,
    ImageBackground,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { toursAPI, participationsAPI, favoritesAPI, ratingsAPI } from '../services/api';

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
    red: '#F87171',
    redDim: '#F8717120',
    yellow: '#FBBF24',
    yellowDim: '#FBBF2420',
    purple: '#A78BFA',
    purpleDim: '#A78BFA20',
    blue: '#60A5FA',
    blueDim: '#60A5FA20',
};

const CATEGORY_CONFIG = {
    'Sport': { color: C.orange, bg: C.orangeDim, icon: '🏎️' },
    'Naked': { color: C.purple, bg: C.purpleDim, icon: '⚡' },
    'Adventure': { color: C.green, bg: C.greenDim, icon: '🏔️' },
    'Touring': { color: C.blue, bg: C.blueDim, icon: '🛣️' },
    'Cruiser': { color: C.yellow, bg: C.yellowDim, icon: '🌅' },
    'Enduro': { color: C.red, bg: C.redDim, icon: '🌲' },
};

function getCategoryConfig(cat) {
    return CATEGORY_CONFIG[cat] || { color: C.textSecondary, bg: C.surfaceHigh, icon: '🏍️' };
}

const CATEGORY_IMAGES = {
    'Sport': require('../assets/categories/sport.png'),
    'Naked': require('../assets/categories/naked.png'),
    'Adventure': require('../assets/categories/adventure.png'),
    'Touring': require('../assets/categories/touring.png'),
    'Cruiser': require('../assets/categories/cruiser.png'),
    'Enduro': require('../assets/categories/enduro.png'),
};

function getCategoryImage(cat) {
    return CATEGORY_IMAGES[cat] || CATEGORY_IMAGES['Sport'];
}

// ─── Yıldız Seçici ────────────────────────────────────────────────────────────
function StarPicker({ value, onChange, readonly }) {
    return (
        <View style={{ flexDirection: 'row', gap: 6 }}>
            {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity
                    key={star}
                    onPress={() => !readonly && onChange(star)}
                    disabled={readonly}
                >
                    <Text style={{ fontSize: readonly ? 16 : 28, color: star <= value ? C.yellow : C.textMuted }}>
                        {star <= value ? '★' : '☆'}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

// ─── Bilgi Satırı ─────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value, valueColor }) {
    return (
        <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
                <Text style={{ fontSize: 16 }}>{icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={[styles.infoValue, valueColor && { color: valueColor }]}>{value}</Text>
            </View>
        </View>
    );
}

// ─── Ana Bileşen ──────────────────────────────────────────────────────────────
export default function TourDetailScreen({ route, navigation }) {
    const { tourId } = route.params;
    const [tour, setTour] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [username, setUsername] = useState('');
    const [isJoined, setIsJoined] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [avgRating, setAvgRating] = useState({ average: 0, count: 0 });
    const [userRating, setUserRating] = useState(0);
    const [isJoinLoading, setIsJoinLoading] = useState(false);
    const [isRatingLoading, setIsRatingLoading] = useState(false);

    const slideAnim = useRef(new Animated.Value(30)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        loadAll();
    }, [tourId]);

    const loadAll = async () => {
        const uname = await AsyncStorage.getItem('username') || '';
        setUsername(uname);

        try {
            const [tourRes, ratingRes] = await Promise.all([
                toursAPI.getById(tourId),
                ratingsAPI.getAverage(tourId),
            ]);
            setTour(tourRes.data);
            setAvgRating(ratingRes.data);

            if (uname) {
                const [partRes, favRes] = await Promise.all([
                    participationsAPI.checkStatus(tourId, uname),
                    favoritesAPI.getMyFavorites(uname),
                ]);
                setIsJoined(partRes.data.isJoined);
                const favSet = new Set(favRes.data.map(f => f.tourId || f.TourId));
                setIsFavorite(favSet.has(tourId));
            }
        } catch (e) {
            Alert.alert('Hata', 'Tur bilgileri yüklenemedi.');
        } finally {
            setIsLoading(false);
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
            ]).start();
        }
    };

    const handleJoinLeave = async () => {
        if (!username) {
            Alert.alert('Giriş Gerekli', 'Tura katılmak için giriş yapman gerekiyor.');
            return;
        }
        setIsJoinLoading(true);
        try {
            if (isJoined) {
                await participationsAPI.leave(tourId, username);
                setIsJoined(false);
                Alert.alert('Ayrıldın', 'Turdan başarıyla ayrıldın. 🏍️');
            } else {
                await participationsAPI.join(tourId, username);
                setIsJoined(true);
                Alert.alert('Katıldın! 🎉', 'Tura başarıyla kaydoldun. Hazır ol!');
            }
        } catch (e) {
            const msg = e.response?.data || 'Bir hata oluştu.';
            Alert.alert('Hata', typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setIsJoinLoading(false);
        }
    };

    const handleToggleFavorite = async () => {
        if (!username) {
            Alert.alert('Giriş Gerekli', 'Favorilere eklemek için giriş yapman gerekiyor.');
            return;
        }
        const prev = isFavorite;
        setIsFavorite(!prev); // Optimistik
        try {
            await favoritesAPI.toggle(tourId, username);
        } catch (_) {
            setIsFavorite(prev);
        }
    };

    const handleRating = async (star) => {
        if (!username) {
            Alert.alert('Giriş Gerekli', 'Puanlamak için giriş yapman gerekiyor.');
            return;
        }
        setIsRatingLoading(true);
        setUserRating(star);
        try {
            await ratingsAPI.rate(tourId, username, star);
            const res = await ratingsAPI.getAverage(tourId);
            setAvgRating(res.data);
        } catch (_) {
            Alert.alert('Hata', 'Puanın kaydedilemedi.');
        } finally {
            setIsRatingLoading(false);
        }
    };

    const handleShare = async () => {
        if (!tour) return;
        try {
            await Share.share({
                message: `MotoRota'da "${tour.Baslik || tour.baslik}" turuna bak! 🏍️\nRota: ${tour.Rota || tour.rota || 'Belirtilmemiş'}`,
            });
        } catch (_) {}
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor={C.bg} />
                <View style={styles.loadingBox}>
                    <ActivityIndicator size="large" color={C.orange} />
                    <Text style={styles.loadingText}>Tur yükleniyor...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!tour) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor={C.bg} />
                <View style={styles.loadingBox}>
                    <Text style={{ fontSize: 48 }}>😕</Text>
                    <Text style={styles.loadingText}>Tur bulunamadı.</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Text style={styles.backBtnText}>← Geri Dön</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const kategori = tour.MotosikletKategorisi || tour.motosikletKategorisi;
    const baslik = tour.Baslik || tour.baslik;
    const aciklama = tour.Aciklama || tour.aciklama;
    const rota = tour.Rota || tour.rota;
    const tarih = tour.Tarih || tour.tarih;
    const olusturanKisi = tour.OlusturanKisi || tour.olusturanKisi || 'Bilinmiyor';
    const viewCount = tour.ViewCount ?? tour.viewCount ?? 0;

    const cfg = getCategoryConfig(kategori);
    const bgImg = getCategoryImage(kategori);

    const dateStr = tarih
        ? new Date(tarih).toLocaleDateString('tr-TR', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        })
        : 'Belirtilmemiş';

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={C.bg} />

            {/* Üst Header Bar */}
            <View style={styles.topBar}>
                <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Text style={styles.iconBtnText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.topBarTitle} numberOfLines={1}>Tur Detayı</Text>
                <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
                    <Text style={{ fontSize: 18 }}>📤</Text>
                </TouchableOpacity>
            </View>

            <Animated.ScrollView
                style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Banner */}
                <View style={[styles.heroBanner, { borderColor: cfg.color + '40' }]}>
                    <ImageBackground 
                        source={bgImg} 
                        style={styles.heroImageBg} 
                        imageStyle={{ opacity: 0.3 }}
                    >
                        <View style={styles.heroBannerContent}>
                            <View style={styles.heroBannerStrip}>
                                <View style={[styles.categoryBadge, { backgroundColor: cfg.bg }]}>
                                    <Text style={{ fontSize: 20 }}>{cfg.icon}</Text>
                                    <Text style={[styles.categoryBadgeText, { color: cfg.color }]}>
                                        {kategori || 'Genel'}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={handleToggleFavorite} style={styles.favBtn}>
                                    <Text style={{ fontSize: 24 }}>{isFavorite ? '❤️' : '🤍'}</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.heroTitle}>{baslik}</Text>

                            {/* Rating özeti */}
                            <View style={styles.heroRatingRow}>
                                <StarPicker value={Math.round(avgRating.average)} onChange={() => {}} readonly />
                                <Text style={styles.heroRatingText}>
                                    {avgRating.average > 0
                                        ? `${avgRating.average.toFixed(1)} / 5.0 (${avgRating.count} oy)`
                                        : 'Henüz puanlanmadı'}
                                </Text>
                            </View>

                            {/* Görüntülenme */}
                            <View style={styles.heroMeta}>
                                <View style={styles.heroMetaItem}>
                                    <Text style={styles.heroMetaIcon}>👁</Text>
                                    <Text style={styles.heroMetaText}>{viewCount} görüntülenme</Text>
                                </View>
                                <View style={styles.heroDivider} />
                                <View style={styles.heroMetaItem}>
                                    <Text style={styles.heroMetaIcon}>🏍️</Text>
                                    <Text style={styles.heroMetaText}>@{olusturanKisi}</Text>
                                </View>
                            </View>
                        </View>
                    </ImageBackground>
                </View>

                {/* Katıl/Ayrıl Butonu */}
                <TouchableOpacity
                    style={[
                        styles.joinBtn,
                        isJoined ? styles.joinBtnLeave : styles.joinBtnJoin,
                        isJoinLoading && { opacity: 0.6 },
                    ]}
                    onPress={handleJoinLeave}
                    disabled={isJoinLoading}
                    activeOpacity={0.85}
                >
                    {isJoinLoading ? (
                        <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                        <Text style={styles.joinBtnText}>
                            {isJoined ? '🚪  Turdan Ayrıl' : '🏁  Tura Katıl'}
                        </Text>
                    )}
                </TouchableOpacity>

                {/* Tur Bilgileri */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tur Bilgileri</Text>
                    <View style={styles.sectionCard}>
                        <InfoRow icon="📅" label="Tarih" value={dateStr} />
                        <View style={styles.rowDivider} />
                        <InfoRow icon="📍" label="Rota" value={rota || 'Belirtilmemiş'} />
                        <View style={styles.rowDivider} />
                        <InfoRow
                            icon={cfg.icon}
                            label="Motor Kategorisi"
                            value={kategori || 'Genel'}
                            valueColor={cfg.color}
                        />
                        <View style={styles.rowDivider} />
                        <InfoRow
                            icon="👤"
                            label="Oluşturan"
                            value={`@${olusturanKisi}`}
                            valueColor={C.orange}
                        />
                    </View>
                </View>

                {/* Açıklama */}
                {aciklama ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Açıklama</Text>
                        <View style={styles.sectionCard}>
                            <Text style={styles.descText}>{aciklama}</Text>
                        </View>
                    </View>
                ) : null}

                {/* Puanla */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Bu Turu Puanla</Text>
                    <View style={styles.sectionCard}>
                        {username ? (
                            <>
                                <Text style={styles.ratingPrompt}>
                                    {userRating > 0 ? `Seçtiğin puan: ${userRating} / 5` : 'Turu deneyimlediğine göre puan ver:'}
                                </Text>
                                <View style={styles.starPickerRow}>
                                    <StarPicker value={userRating} onChange={handleRating} readonly={false} />
                                    {isRatingLoading && (
                                        <ActivityIndicator size="small" color={C.orange} style={{ marginLeft: 12 }} />
                                    )}
                                </View>
                                <Text style={styles.ratingHint}>Puan verince otomatik kaydedilir</Text>
                            </>
                        ) : (
                            <View style={styles.loginPromptBox}>
                                <Text style={styles.loginPromptText}>
                                    Puanlamak için giriş yapman gerekiyor
                                </Text>
                                <TouchableOpacity
                                    style={styles.loginPromptBtn}
                                    onPress={() => navigation.navigate('Login')}
                                >
                                    <Text style={styles.loginPromptBtnText}>Giriş Yap →</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>

                {/* Katılım durumu */}
                {isJoined && (
                    <View style={[styles.statusBanner, { backgroundColor: C.greenDim, borderColor: C.green + '40' }]}>
                        <Text style={{ fontSize: 20 }}>✅</Text>
                        <Text style={[styles.statusBannerText, { color: C.green }]}>
                            Bu tura kayıtlısın! Hazırlıkları tamamla.
                        </Text>
                    </View>
                )}

                <View style={{ height: 24 }} />
            </Animated.ScrollView>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },

    // Yükleme
    loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
    loadingText: { color: C.textSecondary, fontSize: 15 },
    backBtn: {
        backgroundColor: C.orange,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 8,
    },
    backBtnText: { color: '#FFF', fontWeight: '700' },

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
    iconBtn: {
        width: 40,
        height: 40,
        backgroundColor: C.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: C.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconBtnText: { color: C.textPrimary, fontSize: 20 },
    topBarTitle: {
        flex: 1,
        textAlign: 'center',
        color: C.textPrimary,
        fontSize: 17,
        fontWeight: '700',
        paddingHorizontal: 8,
    },

    // Scroll
    scrollContent: { paddingHorizontal: 16, paddingTop: 20 },

    // Hero
    heroBanner: {
        backgroundColor: C.surface,
        borderRadius: 24,
        borderWidth: 1,
        marginBottom: 16,
        overflow: 'hidden',
    },
    heroImageBg: {
        width: '100%',
    },
    heroBannerContent: {
        padding: 20,
    },
    heroBannerStrip: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    categoryBadgeText: { fontSize: 14, fontWeight: '700' },
    favBtn: {
        width: 40,
        height: 40,
        backgroundColor: C.surfaceHigh,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroTitle: {
        color: C.textPrimary,
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: -0.5,
        lineHeight: 32,
        marginBottom: 16,
    },
    heroRatingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
    },
    heroRatingText: { color: C.textSecondary, fontSize: 13 },
    heroMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: C.border,
    },
    heroMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    heroMetaIcon: { fontSize: 14 },
    heroMetaText: { color: C.textSecondary, fontSize: 13 },
    heroDivider: { width: 1, height: 16, backgroundColor: C.border },

    // Katıl butonu
    joinBtn: {
        borderRadius: 16,
        paddingVertical: 17,
        alignItems: 'center',
        marginBottom: 24,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 12,
        elevation: 6,
    },
    joinBtnJoin: {
        backgroundColor: C.orange,
        shadowColor: C.orange,
        shadowOpacity: 0.35,
    },
    joinBtnLeave: {
        backgroundColor: C.surface,
        borderWidth: 1.5,
        borderColor: C.red,
        shadowColor: C.red,
        shadowOpacity: 0.2,
    },
    joinBtnText: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.3,
    },

    // Bölümler
    section: { marginBottom: 20 },
    sectionTitle: {
        color: C.textSecondary,
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1.2,
        marginBottom: 10,
        textTransform: 'uppercase',
    },
    sectionCard: {
        backgroundColor: C.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: C.border,
        overflow: 'hidden',
    },
    rowDivider: { height: 1, backgroundColor: C.border, marginHorizontal: 16 },

    // Bilgi satırı
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 14,
    },
    infoIconBox: {
        width: 36,
        height: 36,
        backgroundColor: C.surfaceHigh,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoLabel: {
        color: C.textMuted,
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.8,
        marginBottom: 3,
        textTransform: 'uppercase',
    },
    infoValue: { color: C.textPrimary, fontSize: 14, fontWeight: '600' },

    // Açıklama
    descText: {
        color: C.textSecondary,
        fontSize: 14,
        lineHeight: 22,
        padding: 16,
    },

    // Puanlama
    ratingPrompt: { color: C.textSecondary, fontSize: 14, padding: 16, paddingBottom: 10 },
    starPickerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 4,
    },
    ratingHint: {
        color: C.textMuted,
        fontSize: 11,
        padding: 16,
        paddingTop: 8,
    },
    loginPromptBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    loginPromptText: { color: C.textSecondary, fontSize: 13, flex: 1 },
    loginPromptBtn: {
        backgroundColor: C.orangeDim,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    loginPromptBtnText: { color: C.orange, fontSize: 13, fontWeight: '700' },

    // Durum banner
    statusBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
    },
    statusBannerText: { fontSize: 14, fontWeight: '600', flex: 1, lineHeight: 20 },
});
