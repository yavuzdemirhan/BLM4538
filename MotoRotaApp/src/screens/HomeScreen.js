import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    RefreshControl,
    ActivityIndicator,
    TextInput,
    Animated,
    Alert,
    Image,
    ImageBackground,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { toursAPI, favoritesAPI } from '../services/api';

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
};

// ─── Kategori renk eşleşmesi ──────────────────────────────────────────────────
const CATEGORY_CONFIG = {
    'Sport': { color: C.orange, bg: C.orangeDim, icon: '🏎️' },
    'Naked': { color: C.purple, bg: C.purpleDim, icon: '⚡' },
    'Adventure': { color: C.green, bg: C.greenDim, icon: '🏔️' },
    'Touring': { color: C.blue, bg: C.blueDim, icon: '🛣️' },
    'Cruiser': { color: C.yellow, bg: C.yellowDim, icon: '🌅' },
    'Enduro': { color: '#F87171', bg: '#F8717120', icon: '🌲' },
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

// ─── Yıldız Bileşeni ──────────────────────────────────────────────────────────
function StarRating({ rating }) {
    const stars = [];
    const full = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
        stars.push(
            <Text key={i} style={{ fontSize: 11, color: i <= full ? C.yellow : C.textMuted }}>
                {i <= full ? '★' : '☆'}
            </Text>
        );
    }
    return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 1 }}>{stars}</View>;
}

// ─── Tur Kartı ────────────────────────────────────────────────────────────────
function TourCard({ tour, isFavorite, onToggleFavorite, onPress }) {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    
    // API alan isimleri camelCase gelebilir
    const kategori = tour.MotosikletKategorisi || tour.motosikletKategorisi;
    const baslik = tour.Baslik || tour.baslik;
    const aciklama = tour.Aciklama || tour.aciklama;
    const rota = tour.Rota || tour.rota;
    const tarih = tour.Tarih || tour.tarih;
    const olusturanKisi = tour.OlusturanKisi || tour.olusturanKisi || 'Bilinmiyor';
    const viewCount = tour.ViewCount ?? tour.viewCount ?? 0;
    const averageRating = tour.AverageRating ?? tour.averageRating ?? 0;

    const cfg = getCategoryConfig(kategori);
    const bgImg = getCategoryImage(kategori);

    const dateStr = tarih
        ? new Date(tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
        : '—';

    const handlePressIn = () => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
    const handlePressOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

    return (
        <Animated.View style={[styles.cardWrapper, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity
                style={styles.card}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
            >
                {/* Resim Arkaplanı */}
                <ImageBackground 
                    source={bgImg} 
                    style={styles.cardImageBg}
                    imageStyle={{ opacity: 0.3 }}
                >
                    <View style={styles.cardContent}>
                        {/* Üst satır */}
                        <View style={styles.cardTopRow}>
                            {/* Kategori pill */}
                            <View style={[styles.categoryPill, { backgroundColor: cfg.bg }]}>
                                <Text style={{ fontSize: 12 }}>{cfg.icon}</Text>
                                <Text style={[styles.categoryText, { color: cfg.color }]}>
                                    {kategori || 'Genel'}
                                </Text>
                            </View>

                            {/* Favori butonu */}
                            <TouchableOpacity
                                onPress={onToggleFavorite}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                style={styles.favButton}
                            >
                                <Text style={{ fontSize: 18 }}>{isFavorite ? '❤️' : '🤍'}</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Başlık */}
                        <Text style={styles.cardTitle} numberOfLines={2}>{baslik}</Text>

                        {/* Açıklama */}
                        <Text style={styles.cardDesc} numberOfLines={2}>{aciklama}</Text>

                        {/* Rota */}
                        {rota ? (
                            <View style={styles.routeRow}>
                                <Text style={{ fontSize: 12 }}>📍</Text>
                                <Text style={styles.routeText} numberOfLines={1}>{rota}</Text>
                            </View>
                        ) : null}

                        {/* Alt bilgi */}
                        <View style={styles.cardFooter}>
                            <View style={styles.footerLeft}>
                                {/* Puan */}
                                <StarRating rating={averageRating || 0} />
                                <Text style={styles.ratingText}>
                                    {averageRating > 0 ? averageRating.toFixed(1) : 'Puanlanmadı'}
                                </Text>
                            </View>
                            <View style={styles.footerRight}>
                                <Text style={styles.dateText}>📅 {dateStr}</Text>
                            </View>
                        </View>

                        {/* Oluşturan */}
                        <View style={styles.creatorRow}>
                            <View style={styles.avatarCircle}>
                                <Text style={styles.avatarText}>
                                    {olusturanKisi !== 'Bilinmiyor' ? olusturanKisi[0].toUpperCase() : '?'}
                                </Text>
                            </View>
                            <Text style={styles.creatorText}>{olusturanKisi}</Text>
                            <View style={[styles.viewBadge]}>
                                <Text style={styles.viewBadgeText}>👁 {viewCount || 0}</Text>
                            </View>
                        </View>
                    </View>
                </ImageBackground>
            </TouchableOpacity>
        </Animated.View>
    );
}

// ─── Kategori Filtre Sekmesi ──────────────────────────────────────────────────
const CATEGORIES = ['Tümü', 'Sport', 'Naked', 'Adventure', 'Touring', 'Cruiser', 'Enduro'];

function CategoryFilter({ selected, onSelect }) {
    return (
        <FlatList
            data={CATEGORIES}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item}
            contentContainerStyle={styles.filterList}
            renderItem={({ item }) => {
                const isSelected = selected === item;
                const cfg = getCategoryConfig(item);
                return (
                    <TouchableOpacity
                        onPress={() => onSelect(item)}
                        style={[
                            styles.filterChip,
                            isSelected && { backgroundColor: cfg.color, borderColor: cfg.color },
                        ]}
                    >
                        {item !== 'Tümü' && <Text style={{ fontSize: 12 }}>{cfg.icon}</Text>}
                        <Text style={[styles.filterChipText, isSelected && { color: '#FFF', fontWeight: '700' }]}>
                            {item}
                        </Text>
                    </TouchableOpacity>
                );
            }}
        />
    );
}

// ─── Ana Ekran ────────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
    const [tours, setTours] = useState([]);
    const [filteredTours, setFilteredTours] = useState([]);
    const [favorites, setFavorites] = useState(new Set());
    const [selectedCategory, setSelectedCategory] = useState('Tümü');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [username, setUsername] = useState('');
    const headerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
        initData();

        // Ekrana her dönüşte (tur eklendikten sonra) listeyi yenile
        const unsubscribe = navigation.addListener('focus', () => {
            fetchTours();
        });
        return unsubscribe;
    }, [navigation]);

    const initData = async () => {
        const uname = await AsyncStorage.getItem('username') || '';
        setUsername(uname);
        await Promise.all([fetchTours(), fetchFavorites(uname)]);
        setIsLoading(false);
    };

    const fetchTours = async () => {
        try {
            const res = await toursAPI.getAll();
            setTours(res.data);
            setFilteredTours(res.data);
        } catch (e) {
            Alert.alert('Bağlantı Hatası', 'Turlar yüklenemedi. Sunucunun çalıştığından emin ol.');
        }
    };

    const fetchFavorites = async (uname) => {
        if (!uname) return;
        try {
            const res = await favoritesAPI.getMyFavorites(uname);
            setFavorites(new Set(res.data.map(f => f.tourId || f.TourId)));
        } catch (_) {}
    };

    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await fetchTours();
        setIsRefreshing(false);
    }, []);

    // Filtre + Arama birlikte çalışır
    useEffect(() => {
        let result = tours;
        if (selectedCategory !== 'Tümü') {
            result = result.filter(t => {
                const k = t.MotosikletKategorisi || t.motosikletKategorisi;
                return k === selectedCategory;
            });
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(t => {
                const b = t.Baslik || t.baslik || '';
                const r = t.Rota || t.rota || '';
                const o = t.OlusturanKisi || t.olusturanKisi || '';
                return b.toLowerCase().includes(q) || r.toLowerCase().includes(q) || o.toLowerCase().includes(q);
            });
        }
        setFilteredTours(result);
    }, [selectedCategory, searchQuery, tours]);

    const handleToggleFavorite = async (tour) => {
        if (!username) {
            Alert.alert('Giriş Gerekli', 'Favorilere eklemek için giriş yapman gerekiyor.');
            return;
        }
        const wasInFav = favorites.has(tour.Id || tour.id);
        // Optimistik güncelleme
        setFavorites(prev => {
            const next = new Set(prev);
            const id = tour.Id || tour.id;
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
        try {
            await favoritesAPI.toggle(tour.Id || tour.id, username);
        } catch (_) {
            // Hata durumunda geri al
            setFavorites(prev => {
                const next = new Set(prev);
                const id = tour.Id || tour.id;
                if (wasInFav) next.add(id); else next.delete(id);
                return next;
            });
        }
    };

    const renderHeader = () => (
        <Animated.View style={{ opacity: headerAnim }}>
            {/* Başlık */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Merhaba {username ? username : 'Binici'} 👋</Text>
                    <Text style={styles.headerTitle}>Turları Keşfet</Text>
                </View>
                <TouchableOpacity
                    style={styles.profileButton}
                    onPress={() => navigation.navigate('Welcome')}
                >
                    <Text style={styles.profileInitial}>
                        {username ? username[0].toUpperCase() : '?'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Arama */}
            <View style={styles.searchWrapper}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Tur, rota veya sürücü ara..."
                    placeholderTextColor={C.textMuted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Text style={styles.clearIcon}>✕</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Kategori filtresi */}
            <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />

            {/* Sonuç sayısı */}
            <Text style={styles.resultCount}>
                {filteredTours.length} tur bulundu
            </Text>
        </Animated.View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🏍️</Text>
            <Text style={styles.emptyTitle}>Tur Bulunamadı</Text>
            <Text style={styles.emptySubtitle}>
                {searchQuery || selectedCategory !== 'Tümü'
                    ? 'Farklı bir arama veya kategori dene'
                    : 'Henüz hiç tur eklenmemiş'}
            </Text>
        </View>
    );

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor={C.bg} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={C.orange} />
                    <Text style={styles.loadingText}>Turlar yükleniyor...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={C.bg} />
            <FlatList
                data={filteredTours}
                keyExtractor={item => String(item.Id || item.id)}
                renderItem={({ item }) => (
                    <TourCard
                        tour={item}
                        isFavorite={favorites.has(item.Id || item.id)}
                        onToggleFavorite={() => handleToggleFavorite(item)}
                        onPress={() => navigation.navigate('TourDetail', { tourId: item.Id || item.id })}
                    />
                )}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        tintColor={C.orange}
                        colors={[C.orange]}
                    />
                }
            />

            {/* FAB — Tur Ekle */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => {
                    if (!username) {
                        Alert.alert('Giriş Gerekli', 'Tur eklemek için önce giriş yapman gerekiyor.');
                        return;
                    }
                    navigation.navigate('CreateTour');
                }}
                activeOpacity={0.85}
            >
                <Text style={styles.fabIcon}>+</Text>
                <Text style={styles.fabLabel}>Tur Ekle</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    listContent: { paddingHorizontal: 16, paddingBottom: 110, paddingTop: 16 },

    // FAB
    fab: {
        position: 'absolute',
        bottom: 28,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: C.orange,
        borderRadius: 28,
        paddingVertical: 14,
        paddingHorizontal: 22,
        gap: 8,
        shadowColor: C.orange,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.45,
        shadowRadius: 16,
        elevation: 10,
    },
    fabIcon: { color: '#FFF', fontSize: 22, fontWeight: '300', lineHeight: 24 },
    fabLabel: { color: '#FFF', fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    greeting: { color: C.textSecondary, fontSize: 14, marginBottom: 4 },
    headerTitle: {
        color: C.textPrimary,
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    profileButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: C.orange,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: C.orange,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 6,
    },
    profileInitial: { color: '#FFF', fontSize: 18, fontWeight: '700' },

    // Arama
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: C.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: C.border,
        paddingHorizontal: 14,
        marginBottom: 16,
    },
    searchIcon: { fontSize: 16, marginRight: 10 },
    searchInput: {
        flex: 1,
        color: C.textPrimary,
        fontSize: 15,
        paddingVertical: 13,
    },
    clearIcon: { color: C.textSecondary, fontSize: 16, paddingLeft: 8 },

    // Filtre
    filterList: { paddingBottom: 12, gap: 8 },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: C.surface,
        borderWidth: 1,
        borderColor: C.border,
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    filterChipText: { color: C.textSecondary, fontSize: 13, fontWeight: '500' },

    // Sonuç sayısı
    resultCount: {
        color: C.textMuted,
        fontSize: 12,
        marginBottom: 12,
        fontWeight: '500',
    },

    // Kart
    cardWrapper: { marginBottom: 14 },
    card: {
        backgroundColor: C.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: C.border,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    cardImageBg: { width: '100%' },
    cardContent: { padding: 16 },
    cardTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    categoryPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    categoryText: { fontSize: 12, fontWeight: '600' },
    favButton: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTitle: {
        color: C.textPrimary,
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: -0.3,
        marginBottom: 6,
        lineHeight: 24,
    },
    cardDesc: {
        color: C.textSecondary,
        fontSize: 13,
        lineHeight: 20,
        marginBottom: 10,
    },
    routeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginBottom: 12,
    },
    routeText: {
        color: C.textSecondary,
        fontSize: 12,
        flex: 1,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: C.border,
    },
    footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    footerRight: {},
    ratingText: { color: C.textMuted, fontSize: 11, fontWeight: '600' },
    dateText: { color: C.textMuted, fontSize: 11 },
    creatorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    avatarCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: C.orangeDim,
        borderWidth: 1,
        borderColor: C.orange,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: { color: C.orange, fontSize: 11, fontWeight: '700' },
    creatorText: { color: C.textSecondary, fontSize: 12, flex: 1 },
    viewBadge: {
        backgroundColor: C.surfaceHigh,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    viewBadgeText: { color: C.textMuted, fontSize: 11 },

    // Yükleme
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
    loadingText: { color: C.textSecondary, fontSize: 15 },

    // Boş
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 60,
        gap: 12,
    },
    emptyEmoji: { fontSize: 56 },
    emptyTitle: { color: C.textPrimary, fontSize: 20, fontWeight: '700' },
    emptySubtitle: {
        color: C.textSecondary,
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});
