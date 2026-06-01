import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
    StatusBar, ScrollView, FlatList, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { toursAPI, participationsAPI, favoritesAPI, followsAPI } from '../services/api';
import { useAlert } from '../components/CustomAlert';
import Icon from '../components/Icons';

const C = {
    bg: '#0A0A0F', surface: '#13131A', surfaceHigh: '#1C1C28',
    border: '#1E1E2E', orange: '#FF6B35', orangeDim: '#FF6B3520',
    textPrimary: '#F0F0F5', textSecondary: '#8585A0', textMuted: '#3A3A55',
    green: '#34D399', greenDim: '#34D39920', purple: '#A78BFA', purpleDim: '#A78BFA20',
    blue: '#60A5FA', blueDim: '#60A5FA20', yellow: '#FBBF24', red: '#F87171', redDim: '#F8717120',
};

import { MiniTourCard } from './ActivitiesScreen';

export default function ProfileScreen({ navigation }) {
    const alert = useAlert();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [favTours, setFavTours] = useState([]);
    const [myToursCount, setMyToursCount] = useState(0);
    const [joinedToursCount, setJoinedToursCount] = useState(0);
    const [followers, setFollowers] = useState(0);
    const [following, setFollowing] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        init();
        const unsub = navigation.addListener('focus', init);
        return unsub;
    }, [navigation]);

    const init = async () => {
        setIsLoading(true);
        const uname = await AsyncStorage.getItem('username') || '';
        const mail  = await AsyncStorage.getItem('userEmail') || '';
        const role  = await AsyncStorage.getItem('userRole') || 'User';
        setUsername(uname);
        setEmail(mail);
        setIsAdmin(role === 'Admin');
        if (uname) {
            try {
                const [myRes, joinRes, favRes, followStatsRes, allToursRes] = await Promise.all([
                    toursAPI.getMyCreated(uname),
                    participationsAPI.getMyParticipations(uname),
                    favoritesAPI.getMyFavorites(uname),
                    followsAPI.getStats(uname),
                    toursAPI.getAll(),
                ]);
                setMyToursCount(myRes.data?.length || 0);
                setJoinedToursCount(joinRes.data?.length || 0);
                
                // Favori tur ID'lerini çekip tüm turlar listesiyle eşleştiriyoruz.
                // Böylece kategori, rota, tarih gibi tüm detaylar yan kartta tam görünecektir.
                const favIds = new Set(favRes.data?.map(f => f.tourId || f.TourId) || []);
                const filteredFavs = (allToursRes.data || []).filter(t => favIds.has(t.Id || t.id));
                
                setFavTours(filteredFavs);
                setFollowers(followStatsRes.data?.followers ?? 0);
                setFollowing(followStatsRes.data?.following ?? 0);
            } catch (_) {}
        }
        setIsLoading(false);
    };

    const handleLogout = () => {
        alert.show({
            icon: 'warning',
            title: 'Çıkış Yap',
            message: 'Hesabından çıkmak istediğine emin misin?',
            buttons: [
                { text: 'İptal', style: 'cancel' },
                { text: 'Çıkış Yap', style: 'destructive', onPress: async () => {
                    await AsyncStorage.multiRemove(['userToken', 'username', 'userEmail']);
                    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
                }},
            ],
        });
    };

    const goToTour = (tourId) => {
        if (tourId) navigation.navigate('TourDetail', { tourId });
    };



    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={C.bg} />

            {/* Top Bar */}
            <View style={styles.topBar}>
                <Text style={styles.topBarTitle}>Profilim</Text>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                    <View style={{flexDirection:'row', alignItems:'center', gap: 4}}>
                        <Icon name="logout" size={14} color={C.red} />
                        <Text style={styles.logoutBtnText}>Çıkış</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Avatar & Info */}
                <View style={styles.profileHero}>
                    <View style={styles.avatarRing}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{username ? username[0].toUpperCase() : '?'}</Text>
                        </View>
                    </View>
                    <Text style={styles.profileName}>{username || 'Kullanıcı'}</Text>
                    {email ? <Text style={styles.profileEmail}>{email}</Text> : null}

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{myToursCount}</Text>
                            <Text style={styles.statLabel}>Tur</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{joinedToursCount}</Text>
                            <Text style={styles.statLabel}>Katılım</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{favTours.length}</Text>
                            <Text style={styles.statLabel}>Favori</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{followers}</Text>
                            <Text style={styles.statLabel}>Takipçi</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{following}</Text>
                            <Text style={styles.statLabel}>Takip</Text>
                        </View>
                    </View>
                </View>

                {/* Garaj Butonu */}
                <TouchableOpacity style={styles.garageBtn} onPress={() => navigation.navigate('Garage')}>
                    <Icon name="garage" size={28} color={C.orange} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.garageBtnTitle}>Garajım</Text>
                        <Text style={styles.garageBtnSub}>Motorlarını yönet</Text>
                    </View>
                    <Text style={styles.garageBtnArrow}>›</Text>
                </TouchableOpacity>

                {/* Admin Paneli Butonu */}
                {isAdmin && (
                    <TouchableOpacity style={styles.adminBtn} onPress={() => navigation.navigate('AdminComments')}>
                        <Icon name="admin" size={28} color={C.orange} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.adminBtnTitle}>Admin Paneli</Text>
                            <Text style={styles.adminBtnSub}>Yorum onay yönetimi</Text>
                        </View>
                        <View style={styles.adminBadge}>
                            <Text style={styles.adminBadgeText}>Admin</Text>
                        </View>
                        <Text style={styles.garageBtnArrow}>›</Text>
                    </TouchableOpacity>
                )}

                <View style={styles.sectionHeader}>
                    <View style={{flexDirection:'row', alignItems:'center', gap: 8}}>
                        <Icon name="heart" size={16} color={C.red} />
                        <Text style={styles.sectionTitle}>Favori Turlarım</Text>
                    </View>
                </View>

                {/* Tab Content */}
                {isLoading ? (
                    <View style={{ paddingTop: 40, alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={C.orange} />
                    </View>
                ) : favTours.length === 0 ? (
                    <View style={styles.emptyBox}>
                        <View style={{ marginBottom: 12 }}><Icon name="motorcycle" size={48} color={C.textMuted} /></View>
                        <Text style={styles.emptyText}>Henüz favori eklemedin</Text>
                    </View>
                ) : (
                    <View style={{ paddingHorizontal: 16 }}>
                        {favTours.map((item, idx) => (
                            <MiniTourCard key={item.Id || item.id || item.tourId || idx} tour={item} onPress={goToTour} />
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: C.border },
    topBarTitle: { color: C.textPrimary, fontSize: 18, fontWeight: '800' },
    logoutBtn: { backgroundColor: C.redDim, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
    logoutBtnText: { color: C.red, fontSize: 13, fontWeight: '700' },

    profileHero: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: C.border },
    avatarRing: { width: 88, height: 88, borderRadius: 44, borderWidth: 2, borderColor: C.orange, justifyContent: 'center', alignItems: 'center', marginBottom: 14, shadowColor: C.orange, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
    avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: C.orangeDim, justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: C.orange, fontSize: 32, fontWeight: '800' },
    profileName: { color: C.textPrimary, fontSize: 22, fontWeight: '800', marginBottom: 4 },
    profileEmail: { color: C.textSecondary, fontSize: 14, marginBottom: 20 },
    statsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, paddingVertical: 16, paddingHorizontal: 12, gap: 0, flexWrap: 'nowrap' },
    statItem: { alignItems: 'center', flex: 1 },
    statNumber: { color: C.textPrimary, fontSize: 18, fontWeight: '800' },
    statLabel: { color: C.textMuted, fontSize: 11, fontWeight: '600', marginTop: 2 },
    statDivider: { width: 1, height: 32, backgroundColor: C.border },

    garageBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, margin: 16, padding: 16, gap: 14, shadowColor: C.orange, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
    garageBtnIcon: { fontSize: 28 },
    garageBtnTitle: { color: C.textPrimary, fontSize: 16, fontWeight: '700' },
    garageBtnSub: { color: C.textSecondary, fontSize: 12, marginTop: 2 },
    garageBtnArrow: { color: C.orange, fontSize: 24, fontWeight: '300' },

    adminBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: '#FF6B3540', marginHorizontal: 16, marginTop: 0, marginBottom: 8, padding: 16, gap: 14, shadowColor: C.orange, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
    adminBtnIcon: { fontSize: 28 },
    adminBtnTitle: { color: C.textPrimary, fontSize: 16, fontWeight: '700' },
    adminBtnSub: { color: C.textSecondary, fontSize: 12, marginTop: 2 },
    adminBadge: { backgroundColor: '#FF6B3520', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#FF6B3540' },
    adminBadgeText: { color: C.orange, fontSize: 11, fontWeight: '700' },

    sectionHeader: { paddingHorizontal: 16, marginBottom: 12, marginTop: 8 },
    sectionTitle: { color: C.textPrimary, fontSize: 16, fontWeight: '700' },

    emptyBox: { alignItems: 'center', paddingTop: 20, paddingHorizontal: 32 },
    emptyText: { color: C.textSecondary, fontSize: 15, textAlign: 'center' },
});
