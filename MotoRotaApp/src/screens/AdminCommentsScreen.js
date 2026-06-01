import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    Animated,
    RefreshControl,
} from 'react-native';
import { commentsAPI, toursAPI } from '../services/api';
import { useAlert } from '../components/CustomAlert';
import Icon from '../components/Icons';

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

// ─── Yorum Kartı ──────────────────────────────────────────────────────────────
function CommentCard({ comment, onApprove, onReject, isProcessing, tourTitle }) {
    const cId = comment.id || comment.Id;
    const cUsername = comment.username || comment.Username || 'Anonim';
    const cContent = comment.content || comment.Content || '';
    const cDate = comment.createdAt || comment.CreatedAt;

    const scaleAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;

    const dateStr = cDate
        ? new Date(cDate).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
        : '';

    const handlePressIn = () =>
        Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true }).start();
    const handlePressOut = () =>
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

    return (
        <Animated.View
            style={[
                styles.commentCard,
                {
                    transform: [{ scale: scaleAnim }],
                    opacity: fadeAnim,
                },
            ]}
        >
            {/* Üst kısım: Avatar + Kullanıcı bilgisi */}
            <View style={styles.commentCardHeader}>
                <View style={styles.commentAvatar}>
                    <Text style={styles.commentAvatarText}>
                        {cUsername[0].toUpperCase()}
                    </Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.commentUsername}>@{cUsername}</Text>
                    {dateStr ? (
                        <Text style={styles.commentDate}>{dateStr}</Text>
                    ) : null}
                </View>
                <View style={styles.tourIdBadge}>
                    <Text style={styles.tourIdBadgeText} numberOfLines={1}>{tourTitle}</Text>
                </View>
            </View>

            {/* Yorum İçeriği */}
            <View style={styles.commentContentBox}>
                <Text style={styles.commentContent}>{cContent}</Text>
            </View>

            {/* Onay Durumu Etiketi */}
            <View style={styles.pendingBadge}>
                <Icon name="pending" size={13} color={C.yellow} />
                <Text style={styles.pendingBadgeText}>Onay Bekliyor</Text>
            </View>

            {/* Aksiyon Butonları */}
            <View style={styles.actionRow}>
                <TouchableOpacity
                    style={[styles.actionBtn, styles.approveBtn]}
                    onPress={() => onApprove(cId)}
                    disabled={isProcessing}
                    activeOpacity={0.8}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                >
                    {isProcessing ? (
                        <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                        <>
                            <Icon name="check" size={16} color="#FFF" />
                            <Text style={styles.actionBtnText}>Onayla</Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionBtn, styles.rejectBtn]}
                    onPress={() => onReject(cId)}
                    disabled={isProcessing}
                    activeOpacity={0.8}
                >
                    {isProcessing ? (
                        <ActivityIndicator color={C.red} size="small" />
                    ) : (
                        <>
                            <Icon name="trash" size={16} color={C.red} />
                            <Text style={[styles.actionBtnText, { color: C.red }]}>
                                Reddet
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
}

// ─── Ana Bileşen ──────────────────────────────────────────────────────────────
export default function AdminCommentsScreen({ navigation }) {
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [processingId, setProcessingId] = useState(null);
    const [tourMap, setTourMap] = useState({});

    const alert = useAlert();

    const headerFade = useRef(new Animated.Value(0)).current;
    const headerSlide = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        loadPending();
        Animated.parallel([
            Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(headerSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start();
    }, []);

    // Ekrana her dönüldüğünde verileri yenile
    useEffect(() => {
        const unsub = navigation.addListener('focus', () => {
            loadPending();
        });
        return unsub;
    }, [navigation]);

    const loadPending = async () => {
        try {
            const [commentsRes, toursRes] = await Promise.all([
                commentsAPI.getPending(),
                toursAPI.getAll(),
            ]);
            setComments(commentsRes.data || []);

            // Build tourId -> title map
            const tours = toursRes.data || [];
            const map = {};
            tours.forEach(t => {
                const id = t.id || t.Id;
                const title = t.title || t.Title || `Tur #${id}`;
                if (id) map[id] = title;
            });
            setTourMap(map);
        } catch (e) {
            console.log('[Admin] Pending yorumlar yüklenemedi:', e.message);
            alert.show({
                icon: 'error',
                title: 'Hata',
                message: 'Bekleyen yorumlar yüklenemedi.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await loadPending();
        setIsRefreshing(false);
    }, []);

    const handleApprove = async (commentId) => {
        setProcessingId(commentId);
        try {
            await commentsAPI.approve(commentId);
            // Onaylanan yorumu listeden kaldır
            setComments(prev => prev.filter(c => (c.id || c.Id) !== commentId));
            alert.show({
                icon: 'success',
                title: 'Onaylandı',
                message: 'Yorum başarıyla onaylandı ve yayına alındı.',
            });
        } catch (e) {
            alert.show({
                icon: 'error',
                title: 'Hata',
                message: 'Yorum onaylanamadı. Lütfen tekrar deneyin.',
            });
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = (commentId) => {
        alert.show({
            icon: 'trash',
            title: 'Yorumu Reddet',
            message: 'Bu yorumu silmek istediğine emin misin? Bu işlem geri alınamaz.',
            buttons: [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                        setProcessingId(commentId);
                        try {
                            await commentsAPI.deleteComment(commentId);
                            setComments(prev =>
                                prev.filter(c => (c.id || c.Id) !== commentId),
                            );
                            alert.show({
                                icon: 'trash',
                                title: 'Silindi',
                                message: 'Yorum reddedildi ve silindi.',
                            });
                        } catch (e) {
                            alert.show({
                                icon: 'error',
                                title: 'Hata',
                                message: 'Yorum silinemedi.',
                            });
                        } finally {
                            setProcessingId(null);
                        }
                    },
                },
            ],
        });
    };

    // ─── Loading State ──────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor={C.bg} />
                <View style={styles.loadingBox}>
                    <ActivityIndicator size="large" color={C.orange} />
                    <Text style={styles.loadingText}>Yorumlar yükleniyor...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={C.bg} />

            {/* Top Bar */}
            <View style={styles.topBar}>
                {navigation.canGoBack() ? (
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.goBack()}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Text style={styles.backBtnText}>←</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 40 }} />
                )}
                <Text style={styles.topBarTitle}>Admin Paneli</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        tintColor={C.orange}
                        colors={[C.orange]}
                    />
                }
            >
                {/* Hero Header */}
                <Animated.View
                    style={[
                        styles.heroSection,
                        {
                            opacity: headerFade,
                            transform: [{ translateY: headerSlide }],
                        },
                    ]}
                >
                    <View style={styles.heroIconRing}>
                        <Icon name="admin" size={32} color={C.orange} />
                    </View>
                    <Text style={styles.heroTitle}>Yorum Onay Yönetimi</Text>
                    <Text style={styles.heroSubtitle}>
                        Kullanıcıların gönderdiği yorumları incele, onayla veya reddet
                    </Text>
                </Animated.View>

                {/* İstatistik Banner */}
                <View style={styles.statsBanner}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{comments.length}</Text>
                        <Text style={styles.statLabel}>Bekleyen</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Icon name="pending" size={24} color={C.yellow} />
                        <Text style={styles.statLabel}>Onay Bekliyor</Text>
                    </View>
                </View>

                {/* Yorum Listesi */}
                {comments.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconBox}>
                            <Icon name="party" size={36} color={C.green} />
                        </View>
                        <Text style={styles.emptyTitle}>Tüm Yorumlar İncelendi!</Text>
                        <Text style={styles.emptySubtitle}>
                            Şu an onay bekleyen yorum bulunmuyor.{'\n'}Yeni yorumlar
                            geldiğinde burada görünecek.
                        </Text>
                        <TouchableOpacity
                            style={styles.refreshBtn}
                            onPress={onRefresh}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Icon name="refresh" size={14} color={C.orange} />
                                <Text style={styles.refreshBtnText}>Yenile</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <Text style={styles.listHeader}>
                            BEKLEYEN YORUMLAR ({comments.length})
                        </Text>
                        {comments.map((comment, idx) => {
                            const tId = comment.tourId || comment.TourId;
                            const tTitle = tourMap[tId] || `Tur #${tId}`;
                            return (
                                <CommentCard
                                    key={comment.id || comment.Id || idx}
                                    comment={comment}
                                    onApprove={handleApprove}
                                    onReject={handleReject}
                                    isProcessing={
                                        processingId === (comment.id || comment.Id)
                                    }
                                    tourTitle={tTitle}
                                />
                            );
                        })}
                    </>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },

    // Loading
    loadingBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: { color: C.textSecondary, fontSize: 15 },

    // Top Bar
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
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: -0.3,
    },

    // Scroll
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 40,
    },

    // Hero
    heroSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    heroIconRing: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: C.orangeDim,
        borderWidth: 2,
        borderColor: C.orange + '60',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: C.orange,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    heroTitle: {
        color: C.textPrimary,
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: -0.5,
        marginBottom: 8,
        textAlign: 'center',
    },
    heroSubtitle: {
        color: C.textSecondary,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 20,
    },

    // Stats Banner
    statsBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: C.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: C.border,
        paddingVertical: 18,
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    statNumber: {
        color: C.orange,
        fontSize: 28,
        fontWeight: '800',
    },
    statLabel: {
        color: C.textSecondary,
        fontSize: 12,
        fontWeight: '600',
    },
    statDivider: {
        width: 1,
        height: 36,
        backgroundColor: C.border,
        marginHorizontal: 16,
    },

    // List Header
    listHeader: {
        color: C.textSecondary,
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1.2,
        marginBottom: 14,
        textTransform: 'uppercase',
    },

    // Comment Card
    commentCard: {
        backgroundColor: C.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: C.border,
        marginBottom: 14,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    commentCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingBottom: 12,
        gap: 12,
    },
    commentAvatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: C.purpleDim,
        borderWidth: 1.5,
        borderColor: C.purple,
        justifyContent: 'center',
        alignItems: 'center',
    },
    commentAvatarText: {
        color: C.purple,
        fontSize: 17,
        fontWeight: '800',
    },
    commentUsername: {
        color: C.orange,
        fontSize: 14,
        fontWeight: '700',
    },
    commentDate: {
        color: C.textMuted,
        fontSize: 11,
        marginTop: 2,
    },
    tourIdBadge: {
        backgroundColor: C.blueDim,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: C.blue + '40',
        maxWidth: 140,
    },
    tourIdBadgeText: {
        color: C.blue,
        fontSize: 11,
        fontWeight: '700',
    },

    // Comment Content
    commentContentBox: {
        backgroundColor: C.surfaceHigh,
        marginHorizontal: 16,
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
    },
    commentContent: {
        color: C.textPrimary,
        fontSize: 14,
        lineHeight: 22,
    },

    // Pending Badge
    pendingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginHorizontal: 16,
        marginBottom: 14,
        backgroundColor: C.yellowDim,
        borderRadius: 10,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: C.yellow + '30',
    },
    pendingBadgeText: {
        color: C.yellow,
        fontSize: 12,
        fontWeight: '700',
    },

    // Action Buttons
    actionRow: {
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: 14,
        paddingVertical: 14,
    },
    approveBtn: {
        backgroundColor: C.green,
        shadowColor: C.green,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 6,
    },
    rejectBtn: {
        backgroundColor: C.redDim,
        borderWidth: 1.5,
        borderColor: C.red + '60',
    },
    actionBtnText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '700',
    },

    // Empty State
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 20,
        paddingHorizontal: 24,
    },
    emptyIconBox: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: C.greenDim,
        borderWidth: 2,
        borderColor: C.green + '40',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        color: C.textPrimary,
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 10,
        textAlign: 'center',
    },
    emptySubtitle: {
        color: C.textSecondary,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    refreshBtn: {
        backgroundColor: C.orangeDim,
        borderRadius: 14,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: C.orange + '40',
    },
    refreshBtnText: {
        color: C.orange,
        fontSize: 14,
        fontWeight: '700',
    },
});
