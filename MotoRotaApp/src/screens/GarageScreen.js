import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView,
    StatusBar, ScrollView, ActivityIndicator, Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { garageAPI } from '../services/api';
import { useAlert } from '../components/CustomAlert';
import Icon from '../components/Icons';

const C = {
    bg: '#0A0A0F', surface: '#13131A', surfaceHigh: '#1C1C28',
    border: '#1E1E2E', orange: '#FF6B35', orangeDim: '#FF6B3520',
    textPrimary: '#F0F0F5', textSecondary: '#8585A0', textMuted: '#3A3A55',
    green: '#34D399', greenDim: '#34D39920', red: '#F87171', redDim: '#F8717120',
};

export default function GarageScreen({ navigation }) {
    const alert = useAlert();
    const [username, setUsername] = useState('');
    const [bikes, setBikes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddMode, setIsAddMode] = useState(false);

    // Form states
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState('');
    const [engineCc, setEngineCc] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        loadBikes();
    }, []);

    const loadBikes = async () => {
        setIsLoading(true);
        const uname = await AsyncStorage.getItem('username') || '';
        setUsername(uname);
        if (uname) {
            try {
                const res = await garageAPI.getMyBikes(uname);
                setBikes(res.data || []);
            } catch (_) {}
        }
        setIsLoading(false);
    };

    const handleAddBike = async () => {
        if (!brand.trim() || !model.trim() || !year.trim() || !engineCc.trim()) {
            alert.show({
                icon: 'warning',
                title: 'Eksik Alan',
                message: 'Lütfen tüm zorunlu alanları doldurun.',
            });
            return;
        }

        const yearNum = parseInt(year, 10);
        const ccNum = parseInt(engineCc, 10);
        if (isNaN(yearNum) || isNaN(ccNum)) {
            alert.show({
                icon: 'warning',
                title: 'Hatalı Format',
                message: 'Yıl ve CC sadece sayı olmalıdır.',
            });
            return;
        }

        setIsAdding(true);
        try {
            const res = await garageAPI.addBike({
                ownerUsername: username,
                brand: brand.trim(),
                model: model.trim(),
                year: yearNum,
                engineCc: ccNum,
                imageUrl: imageUrl.trim(),
            });
            setBikes(prev => [...prev, res.data]);
            setIsAddMode(false);
            setBrand(''); setModel(''); setYear(''); setEngineCc(''); setImageUrl('');
        } catch (_) {
            alert.show({
                icon: 'error',
                title: 'Hata',
                message: 'Motor eklenemedi.',
            });
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteBike = (id) => {
        alert.show({
            icon: 'trash',
            title: 'Motoru Sil',
            message: 'Bu motoru garajından silmek istediğine emin misin?',
            buttons: [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await garageAPI.deleteBike(id);
                            setBikes(prev => prev.filter(b => (b.id || b.Id) !== id));
                        } catch (_) {
                            alert.show({
                                icon: 'error',
                                title: 'Hata',
                                message: 'Motor silinemedi.',
                            });
                        }
                    },
                },
            ],
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={C.bg} />

            {/* Top Bar */}
            <View style={styles.topBar}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Icon name="back" size={20} color={C.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.topBarTitle}>Garajım</Text>
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => setIsAddMode(!isAddMode)}
                >
                    <Text style={styles.addBtnText}>{isAddMode ? 'İptal' : '+ Ekle'}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
                
                {/* Hero */}
                <View style={styles.hero}>
                    <Icon name="motorcycle" size={48} color={C.orange} style={{ marginBottom: 8 }} />
                    <Text style={styles.heroTitle}>Garaj</Text>
                    <Text style={styles.heroSub}>{username} adlı kullanıcının motorları</Text>
                </View>

                {/* Ekleme Formu */}
                {isAddMode && (
                    <View style={styles.formCard}>
                        <Text style={styles.formTitle}>Yeni Motor Ekle</Text>
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Marka *</Text>
                            <TextInput style={styles.input} placeholder="Örn: Yamaha" placeholderTextColor={C.textMuted} value={brand} onChangeText={setBrand} />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Model *</Text>
                            <TextInput style={styles.input} placeholder="Örn: MT-07" placeholderTextColor={C.textMuted} value={model} onChangeText={setModel} />
                        </View>
                        
                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Yıl *</Text>
                                <TextInput style={styles.input} placeholder="Örn: 2023" placeholderTextColor={C.textMuted} value={year} onChangeText={setYear} keyboardType="numeric" maxLength={4} />
                            </View>
                            <View style={{ width: 12 }} />
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>CC *</Text>
                                <TextInput style={styles.input} placeholder="Örn: 689" placeholderTextColor={C.textMuted} value={engineCc} onChangeText={setEngineCc} keyboardType="numeric" />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Görsel URL (İsteğe Bağlı)</Text>
                            <TextInput style={styles.input} placeholder="https://..." placeholderTextColor={C.textMuted} value={imageUrl} onChangeText={setImageUrl} />
                        </View>

                        <TouchableOpacity style={[styles.submitBtn, isAdding && { opacity: 0.6 }]} onPress={handleAddBike} disabled={isAdding}>
                            {isAdding ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.submitBtnText}>Motoru Garaja Ekle</Text>}
                        </TouchableOpacity>
                    </View>
                )}

                {/* Motor Listesi */}
                {isLoading ? (
                    <ActivityIndicator size="large" color={C.orange} style={{ marginTop: 40 }} />
                ) : bikes.length === 0 && !isAddMode ? (
                    <View style={styles.emptyBox}>
                        <Icon name="motorcycle" size={40} color={C.textMuted} style={{ marginBottom: 12 }} />
                        <Text style={styles.emptyText}>Garajın şu an boş.</Text>
                        <Text style={styles.emptySub}>Hemen ilk motorunu ekle!</Text>
                    </View>
                ) : (
                    <View style={styles.bikesList}>
                        {bikes.map((bike, idx) => {
                            const bId = bike.id || bike.Id;
                            const bBrand = bike.brand || bike.Brand;
                            const bModel = bike.model || bike.Model;
                            const bYear = bike.year || bike.Year;
                            const bCc = bike.engineCc || bike.EngineCc;
                            const bImg = bike.imageUrl || bike.ImageUrl;

                            return (
                                <View key={bId || idx} style={styles.bikeCard}>
                                    <View style={styles.bikeImageContainer}>
                                        {bImg ? (
                                            <Image source={{ uri: bImg }} style={styles.bikeImage} />
                                        ) : (
                                            <View style={styles.bikeImagePlaceholder}>
                                                <Icon name="motorcycle" size={32} color={C.textMuted} />
                                            </View>
                                        )}
                                    </View>
                                    
                                    <View style={styles.bikeInfo}>
                                        <Text style={styles.bikeBrand}>{bBrand}</Text>
                                        <Text style={styles.bikeModel}>{bModel}</Text>
                                        
                                        <View style={styles.bikeSpecs}>
                                            <View style={styles.specBadge}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                    <Icon name="calendar" size={11} color={C.textSecondary} />
                                                    <Text style={styles.specBadgeText}>{bYear}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.specBadge}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                    <Text style={{ fontSize: 11 }}>⚙️</Text>
                                                    <Text style={styles.specBadgeText}>{bCc} cc</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>

                                    <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteBike(bId)}>
                                        <Icon name="trash" size={16} color={C.red} />
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>
                )}
                
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
    backBtn: { width: 40, height: 40, backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.border, justifyContent: 'center', alignItems: 'center' },
    backBtnText: { color: C.textPrimary, fontSize: 20 },
    topBarTitle: { color: C.textPrimary, fontSize: 17, fontWeight: '700' },
    addBtn: { backgroundColor: C.orangeDim, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
    addBtnText: { color: C.orange, fontSize: 13, fontWeight: '700' },

    hero: { alignItems: 'center', marginBottom: 24, paddingTop: 12 },
    heroTitle: { color: C.textPrimary, fontSize: 28, fontWeight: '800' },
    heroSub: { color: C.textSecondary, fontSize: 14, marginTop: 4 },

    formCard: { backgroundColor: C.surfaceHigh, borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: C.border },
    formTitle: { color: C.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 16 },
    inputGroup: { marginBottom: 12 },
    label: { color: C.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 6 },
    input: { backgroundColor: C.surface, color: C.textPrimary, borderRadius: 10, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
    row: { flexDirection: 'row' },
    submitBtn: { backgroundColor: C.orange, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
    submitBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },

    emptyBox: { alignItems: 'center', paddingTop: 40 },
    emptyText: { color: C.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 4 },
    emptySub: { color: C.textSecondary, fontSize: 14 },

    bikesList: { gap: 16 },
    bikeCard: { flexDirection: 'row', backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
    bikeImageContainer: { width: 100, backgroundColor: C.surfaceHigh, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: C.border },
    bikeImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    bikeImagePlaceholder: { padding: 20 },
    bikeInfo: { flex: 1, padding: 16 },
    bikeBrand: { color: C.textSecondary, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
    bikeModel: { color: C.textPrimary, fontSize: 18, fontWeight: '800', marginBottom: 8 },
    bikeSpecs: { flexDirection: 'row', gap: 8 },
    specBadge: { backgroundColor: C.surfaceHigh, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
    specBadgeText: { color: C.textPrimary, fontSize: 11, fontWeight: '600' },
    
    deleteBtn: { position: 'absolute', top: 12, right: 12, width: 32, height: 32, backgroundColor: C.redDim, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
});
