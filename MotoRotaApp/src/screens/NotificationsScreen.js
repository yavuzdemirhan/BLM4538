import React, { useState, useEffect } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView,
    StatusBar, RefreshControl, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationsAPI } from '../services/api';
import Icon from '../components/Icons';

const C = {
    bg: '#0A0A0F', surface: '#13131A', surfaceHigh: '#1C1C28',
    border: '#1E1E2E', orange: '#FF6B35', orangeDim: '#FF6B3520',
    textPrimary: '#F0F0F5', textSecondary: '#8585A0', textMuted: '#3A3A55',
    green: '#34D399', greenDim: '#34D39920', red: '#F87171', redDim: '#F8717120',
};

export default function NotificationsScreen({ navigation }) {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [username, setUsername] = useState('');

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        const uname = await AsyncStorage.getItem('username') || '';
        setUsername(uname);
        if (uname) {
            await fetchNotifications(uname);
        }
        setIsLoading(false);
    };

    const fetchNotifications = async (uname) => {
        try {
            const res = await notificationsAPI.getMyNotifications(uname);
            setNotifications(res.data || []);
        } catch (_) {}
    };

    const onRefresh = async () => {
        setIsRefreshing(true);
        if (username) {
            await fetchNotifications(username);
        }
        setIsRefreshing(false);
    };

    const handleMarkAsRead = async (item) => {
        if (item.isRead || item.IsRead) return;
        
        // Optimistik güncelleme
        setNotifications(prev => prev.map(n => {
            const nId = n.id || n.Id;
            const itemId = item.id || item.Id;
            if (nId === itemId) {
                return { ...n, isRead: true, IsRead: true };
            }
            return n;
        }));

        try {
            await notificationsAPI.markAsRead(item.id || item.Id);
        } catch (_) {
            // Hata durumunda geri al
            setNotifications(prev => prev.map(n => {
                const nId = n.id || n.Id;
                const itemId = item.id || item.Id;
                if (nId === itemId) {
                    return { ...n, isRead: false, IsRead: false };
                }
                return n;
            }));
        }
    };

    const renderItem = ({ item }) => {
        const isRead = item.isRead ?? item.IsRead ?? false;
        const msg = item.message || item.Message || '';
        const date = item.createdAt || item.CreatedAt;
        const dateStr = date
            ? new Date(date).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
            : '';

        return (
            <TouchableOpacity
                style={[styles.notiCard, !isRead && styles.notiCardUnread]}
                onPress={() => handleMarkAsRead(item)}
                activeOpacity={0.8}
            >
                <View style={[styles.bellContainer, !isRead && styles.bellContainerUnread]}>
                    <Icon name="bell" size={18} color={!isRead ? C.orange : C.textSecondary} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.notiText, !isRead && styles.notiTextUnread]}>{msg}</Text>
                    <Text style={styles.notiDate}>{dateStr}</Text>
                </View>
                {!isRead && <View style={styles.unreadDot} />}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={C.bg} />

            {/* Header */}
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="back" size={20} color={C.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.topBarTitle}>Bildirimler</Text>
                <View style={{ width: 40 }} />
            </View>

            {isLoading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={C.orange} />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item, idx) => String(item.id || item.Id || idx)}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={onRefresh}
                            tintColor={C.orange}
                            colors={[C.orange]}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="bell" size={48} color={C.textMuted} />
                            <Text style={styles.emptyText}>Henüz bildiriminiz yok</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: C.border },
    topBarTitle: { color: C.textPrimary, fontSize: 18, fontWeight: '800', textAlign: 'center' },
    backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 16 },
    notiCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 14, marginBottom: 12, gap: 12 },
    notiCardUnread: { borderColor: C.orange + '40', backgroundColor: C.surfaceHigh },
    bellContainer: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.border, justifyContent: 'center', alignItems: 'center' },
    bellContainerUnread: { backgroundColor: C.orangeDim },
    notiText: { color: C.textSecondary, fontSize: 14, lineHeight: 20 },
    notiTextUnread: { color: C.textPrimary, fontWeight: '600' },
    notiDate: { color: C.textMuted, fontSize: 11, marginTop: 4 },
    unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.orange },
    emptyContainer: { alignItems: 'center', paddingTop: 80, gap: 12 },
    emptyText: { color: C.textSecondary, fontSize: 15 },
});
