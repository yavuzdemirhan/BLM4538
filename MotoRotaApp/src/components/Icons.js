/**
 * İkon yönetim katmanı — Emoji ↔ VectorIcon geçişi kolayca yapılabilir.
 *
 * GERI DÖNMEK İÇİN: USE_VECTOR_ICONS = false yapın, tüm uygulama tekrar
 * emoji kullanmaya başlar. Hiçbir ekranda değişiklik gerekmez.
 */
import React from 'react';
import { Text } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

// ─── ANAHTAR: true = vektör ikon,  false = emoji ──────────────────────────────
const USE_VECTOR_ICONS = true;

// ─── İkon haritası ────────────────────────────────────────────────────────────
const ICON_MAP = {
    // Tab bar
    motorcycle:    { emoji: '🏍️', lib: MaterialCommunityIcons, name: 'motorbike' },
    calendar:      { emoji: '📅', lib: MaterialCommunityIcons, name: 'calendar-month' },
    profile:       { emoji: '👤', lib: MaterialCommunityIcons, name: 'account-circle-outline' },
    admin:         { emoji: '🛡️', lib: MaterialCommunityIcons, name: 'shield-crown-outline' },

    // Kategori
    sport:         { emoji: '🏎️', lib: MaterialCommunityIcons, name: 'car-sports' },
    naked:         { emoji: '⚡',  lib: MaterialCommunityIcons, name: 'flash' },
    adventure:     { emoji: '🏔️', lib: MaterialCommunityIcons, name: 'image-filter-hdr' },
    touring:       { emoji: '🛣️', lib: MaterialCommunityIcons, name: 'road-variant' },
    cruiser:       { emoji: '🌅', lib: MaterialCommunityIcons, name: 'weather-sunset' },
    enduro:        { emoji: '🌲', lib: MaterialCommunityIcons, name: 'pine-tree' },
    general:       { emoji: '🏍️', lib: MaterialCommunityIcons, name: 'motorbike' },

    // Genel UI
    back:          { emoji: '←',  lib: Ionicons, name: 'chevron-back' },
    share:         { emoji: '📤', lib: Ionicons, name: 'share-outline' },
    heart:         { emoji: '❤️', lib: MaterialCommunityIcons, name: 'heart' },
    heartOutline:  { emoji: '🤍', lib: MaterialCommunityIcons, name: 'heart-outline' },
    star:          { emoji: '★',  lib: MaterialCommunityIcons, name: 'star' },
    starOutline:   { emoji: '☆',  lib: MaterialCommunityIcons, name: 'star-outline' },
    search:        { emoji: '🔍', lib: Ionicons, name: 'search' },
    close:         { emoji: '✕',  lib: Ionicons, name: 'close' },
    add:           { emoji: '+',  lib: Ionicons, name: 'add' },
    mapPin:        { emoji: '📍', lib: MaterialCommunityIcons, name: 'map-marker' },
    eye:           { emoji: '👁',  lib: MaterialCommunityIcons, name: 'eye-outline' },
    flag:          { emoji: '🏁', lib: MaterialCommunityIcons, name: 'flag-checkered' },
    check:         { emoji: '✅', lib: Ionicons, name: 'checkmark-circle' },
    checkShield:   { emoji: '✓',  lib: MaterialCommunityIcons, name: 'check-bold' },
    trash:         { emoji: '🗑',  lib: Ionicons, name: 'trash-outline' },
    clock:         { emoji: '🕐', lib: MaterialCommunityIcons, name: 'clock-outline' },
    route:         { emoji: '🗺️', lib: MaterialCommunityIcons, name: 'map-legend' },
    comment:       { emoji: '💬', lib: MaterialCommunityIcons, name: 'comment-text-outline' },
    pending:       { emoji: '⏳', lib: MaterialCommunityIcons, name: 'timer-sand' },
    garage:        { emoji: '🏍️', lib: MaterialCommunityIcons, name: 'garage-variant' },
    logout:        { emoji: '🚪', lib: MaterialCommunityIcons, name: 'logout' },
    party:         { emoji: '🎉', lib: MaterialCommunityIcons, name: 'party-popper' },
    refresh:       { emoji: '🔄', lib: MaterialCommunityIcons, name: 'refresh' },
    mail:          { emoji: '✉️', lib: MaterialCommunityIcons, name: 'send' },
    info:          { emoji: 'ℹ️', lib: MaterialCommunityIcons, name: 'information-outline' },
    warning:       { emoji: '⚠️', lib: MaterialCommunityIcons, name: 'alert-outline' },
    success:       { emoji: '✅', lib: MaterialCommunityIcons, name: 'check-circle-outline' },
    error:         { emoji: '❌', lib: MaterialCommunityIcons, name: 'close-circle-outline' },
    follow:        { emoji: '+',  lib: MaterialCommunityIcons, name: 'account-plus-outline' },
    following:     { emoji: '✓',  lib: MaterialCommunityIcons, name: 'account-check-outline' },
    description:   { emoji: '📝', lib: MaterialCommunityIcons, name: 'text-box-outline' },
    rating:        { emoji: '⭐', lib: MaterialCommunityIcons, name: 'star-circle-outline' },
    tour:          { emoji: '🏍️', lib: MaterialCommunityIcons, name: 'map-marker-path' },
    person:        { emoji: '👤', lib: MaterialCommunityIcons, name: 'account-outline' },
    door:          { emoji: '🚪', lib: MaterialCommunityIcons, name: 'door-open' },
};

/**
 * Evrensel ikon bileşeni.
 *
 * @param {string} name   – ICON_MAP'teki anahtar
 * @param {number} size   – Piksel boyutu (varsayılan 20)
 * @param {string} color  – Renk (varsayılan #F0F0F5)
 * @param {object} style  – Ek stil
 */
export default function Icon({ name, size = 20, color = '#F0F0F5', style }) {
    const entry = ICON_MAP[name];
    if (!entry) {
        return <Text style={[{ fontSize: size, color }, style]}>?</Text>;
    }

    if (!USE_VECTOR_ICONS) {
        return <Text style={[{ fontSize: size, color }, style]}>{entry.emoji}</Text>;
    }

    const IconComponent = entry.lib;
    return <IconComponent name={entry.name} size={size} color={color} style={style} />;
}

/**
 * Tab bar ikonları için özel bileşen (react-navigation uyumlu).
 */
export function TabIcon({ name, size = 24, color }) {
    return <Icon name={name} size={size} color={color} />;
}

/**
 * Emoji metnini döndürür (ikon kullanılmayan küçük yerler için).
 */
export function getEmoji(name) {
    return ICON_MAP[name]?.emoji || '?';
}

// İkon haritasındaki tüm anahtarlar
export const ICON_NAMES = Object.keys(ICON_MAP);
