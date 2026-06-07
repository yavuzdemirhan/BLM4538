// ─── Design Tokens ────────────────────────────────────────────────────────────
export const C = {
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
    purple: '#A78BFA',
    purpleDim: '#A78BFA20',
    blue: '#60A5FA',
    blueDim: '#60A5FA20',
    yellow: '#FBBF24',
    yellowDim: '#FBBF2420',
};

// ─── Kategori Konfigürasyonu ──────────────────────────────────────────────────
export const CATEGORY_CONFIG = {
    Sport:     { color: C.orange, bg: C.orangeDim, icon: '🏍️', iconName: 'sport' },
    Naked:     { color: C.purple, bg: C.purpleDim, icon: '🛵',  iconName: 'naked' },
    Adventure: { color: C.green,  bg: C.greenDim,  icon: '🌄️', iconName: 'adventure' },
    Touring:   { color: C.blue,   bg: C.blueDim,   icon: '🗺️', iconName: 'touring' },
    Cruiser:   { color: C.yellow, bg: C.yellowDim, icon: '🏖',  iconName: 'cruiser' },
    Enduro:    { color: C.red,    bg: C.redDim,    icon: '🏕',  iconName: 'enduro' },
};

export function getCategoryConfig(cat) {
    return CATEGORY_CONFIG[cat] || { color: C.textSecondary, bg: C.surfaceHigh, icon: '🏍️', iconName: 'general' };
}

// ─── Kategori Görselleri ──────────────────────────────────────────────────────
export const CATEGORY_IMAGES = {
    Sport:     require('./assets/categories/sport.png'),
    Naked:     require('./assets/categories/naked.png'),
    Adventure: require('./assets/categories/adventure.png'),
    Touring:   require('./assets/categories/touring.png'),
    Cruiser:   require('./assets/categories/cruiser.png'),
    Enduro:    require('./assets/categories/enduro.png'),
};

export function getCategoryImage(cat) {
    return CATEGORY_IMAGES[cat] || CATEGORY_IMAGES.Sport;
}

// ─── AsyncStorage Keys ────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
    TOKEN:    'userToken',
    USERNAME: 'username',
    EMAIL:    'userEmail',
    ROLE:     'userRole',
};
