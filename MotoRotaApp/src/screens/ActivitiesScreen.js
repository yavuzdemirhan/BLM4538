import React, { useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
    StatusBar, ScrollView, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { toursAPI, participationsAPI } from '../services/api';
import { useAlert } from '../components/CustomAlert';
import Icon from '../components/Icons';

const C = {
    bg: '#0A0A0F', surface: '#13131A', surfaceHigh: '#1C1C28',
    border: '#1E1E2E', orange: '#FF6B35', orangeDim: '#FF6B3520',
    textPrimary: '#F0F0F5', textSecondary: '#8585A0', textMuted: '#3A3A55',
    green: '#34D399', greenDim: '#34D39920', purple: '#A78BFA', purpleDim: '#A78BFA20',
    blue: '#60A5FA', blueDim: '#60A5FA20', yellow: '#FBBF24', red: '#F87171', redDim: '#F8717120',
};

const CATEGORY_CONFIG = {
    'Sport': { color: C.orange, icon: '🏎️' }, 'Naked': { color: C.purple, icon: '⚡' },
    'Adventure': { color: C.green, icon: '🏔️' }, 'Touring': { color: C.blue, icon: '🛣️' },
    'Cruiser': { color: C.yellow, icon: '🌅' }, 'Enduro': { color: C.red, icon: '🌲' },
};

const TABS = [
    { key: 'olusturduklarim', label: 'Oluşturduklarım', icon: '🏁' },
    { key: 'katildiklarim',   label: 'Katıldıklarım',   icon: '✅' },
];

export function MiniTourCard({ tour, onPress, onDelete }) {
    const baslik = tour.Baslik || tour.baslik || tour.title || '';
    const rota = tour.Rota || tour.rota || '';
    const kategori = tour.MotosikletKategorisi || tour.motosikletKategorisi || '';
    const tarih = tour.Tarih || tour.tarih || '';
    const cfg = CATEGORY_CONFIG[kategori] || { color: C.textSecondary, icon: '🏍️' };
    const dateStr = tarih ? new Date(tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    const tourId = tour.Id || tour.id || tour.tourId || tour.TourId;

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <TouchableOpacity style={styles.miniCard} onPress={() => onPress && onPress(tourId)} activeOpacity={0.8}>
                <View style={[styles.miniCardStrip, { backgroundColor: cfg.color }]} />
                <View style={styles.miniCardBody}>
                    <View style={styles.miniCardTop}>
                        <Text style={{ fontSize: 14 }}>{cfg.icon}</Text>
                        <Text style={[styles.miniCardKat, { color: cfg.color }]}>{kategori || 'Genel'}</Text>
                    </View>
                    <Text style={styles.miniCardTitle} numberOfLines={1}>{baslik || 'Başlıksız Tur'}</Text>
                    {rota ? <Text style={styles.miniCardRota} numberOfLines={1}>📍 {rota}</Text> : null}
                    {dateStr ? <Text style={styles.miniCardDate}>📅 {dateStr}</Text> : null}
                </View>
            </TouchableOpacity>
            {onDelete && (
                <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(tourId)}>
                    <Icon name="trash" size={16} color={C.red} />
                </TouchableOpacity>
            )}
        </View>
    );
}

export default function ActivitiesScreen({ navigation }) {
    const alert = useAlert();
    const [activeTab, setActiveTab] = useState('olusturduklarim');
    const [myTours, setMyTours] = useState([]);
    const [joinedTours, setJoinedTours] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsub = navigation.addListener('focus', init);
        init();
        return unsub;
    }, [navigation]);

    const init = async () => {
        setIsLoading(true);
        const uname = await AsyncStorage.getItem('username') || '';
        if (uname) {
            try {
                const [myRes, joinRes] = await Promise.all([
                    toursAPI.getMyCreated(uname),
                    participationsAPI.getMyParticipations(uname),
                ]);
                setMyTours(myRes.data || []);
                setJoinedTours(joinRes.data || []);
            } catch (_) {}
        }
        setIsLoading(false);
    };

    const handleDeleteTour = (tourId) => {
        alert.show({
            icon: 'trash',
            title: 'Turu Sil',
            message: 'Bu turu tamamen silmek istediğine emin misin? Bu işlem geri alınamaz.',
            buttons: [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await toursAPI.delete(tourId);
                            setMyTours(prev => prev.filter(t => (t.id || t.Id) !== tourId));
                            alert.show({
                                icon: 'success',
                                title: 'Silindi',
                                message: 'Tur başarıyla silindi.',
                            });
                        } catch (_) {
                            alert.show({
                                icon: 'error',
                                title: 'Hata',
                                message: 'Tur silinirken bir hata oluştu.',
                            });
                        }
                    }
                }
            ]
        });
    };

    const goToTour = (tourId) => {
        if (tourId) navigation.navigate('TourDetail', { tourId });
    };

    const currentData = activeTab === 'olusturduklarim' ? myTours : joinedTours;
    const emptyMsg = activeTab === 'olusturduklarim' ? 'Henüz tur oluşturmadın' : 'Henüz bir tura katılmadın';

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={C.bg} />

            <View style={styles.topBar}>
                <Text style={styles.topBarTitle}>Etkinliklerim</Text>
            </View>

            <View style={styles.tabRow}>
                {TABS.map(tab => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tabBtn, activeTab === tab.key && styles.tabBtnActive]}
                        onPress={() => setActiveTab(tab.key)}
                    >
                        <Text style={styles.tabIcon}>{tab.icon}</Text>
                        <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                {isLoading ? (
                    <View style={{ paddingTop: 40, alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={C.orange} />
                    </View>
                ) : currentData.length === 0 ? (
                    <View style={styles.emptyBox}>
                        <Text style={{ fontSize: 48, marginBottom: 12 }}>🏍️</Text>
                        <Text style={styles.emptyText}>{emptyMsg}</Text>
                        {activeTab === 'olusturduklarim' && (
                            <TouchableOpacity style={styles.createTourBtn} onPress={() => navigation.navigate('CreateTour')}>
                                <Text style={styles.createTourBtnText}>+ Yeni Tur Oluştur</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    <View style={{ paddingHorizontal: 16 }}>
                        {currentData.map((item, idx) => (
                            <MiniTourCard 
                                key={item.Id || item.id || item.tourId || idx} 
                                tour={item} 
                                onPress={goToTour} 
                                onDelete={activeTab === 'olusturduklarim' ? handleDeleteTour : undefined}
                            />
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    topBar: { paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: C.border, alignItems: 'center' },
    topBarTitle: { color: C.textPrimary, fontSize: 18, fontWeight: '800' },

    tabRow: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 16, marginBottom: 16, gap: 8 },
    tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.border, paddingVertical: 10 },
    tabBtnActive: { backgroundColor: C.orangeDim, borderColor: C.orange },
    tabIcon: { fontSize: 13 },
    tabLabel: { color: C.textSecondary, fontSize: 11, fontWeight: '600' },
    tabLabelActive: { color: C.orange, fontWeight: '700' },

    emptyBox: { alignItems: 'center', paddingTop: 40, paddingHorizontal: 32 },
    emptyText: { color: C.textSecondary, fontSize: 15, textAlign: 'center', marginBottom: 20 },
    createTourBtn: { backgroundColor: C.orange, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, shadowColor: C.orange, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6 },
    createTourBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },

    miniCard: { flexDirection: 'row', backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
    miniCardStrip: { width: 4 },
    miniCardBody: { flex: 1, padding: 14 },
    miniCardTop: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    miniCardKat: { fontSize: 12, fontWeight: '600' },
    miniCardTitle: { color: C.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 4 },
    miniCardRota: { color: C.textSecondary, fontSize: 12, marginBottom: 2 },
    miniCardDate: { color: C.textMuted, fontSize: 11 },
    deleteBtn: { width: 44, height: 44, backgroundColor: C.redDim, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
});
