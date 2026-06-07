import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Android emülatörde localhost = 10.0.2.2
// HTTP portu (5046) → self-signed SSL sertifika sorunu olmaz
const BASE_URL =
    Platform.OS === 'android'
        ? 'http://10.0.2.2:5046/api'
        : 'http://localhost:5046/api';

const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
});

// Geliştirme logları
apiClient.interceptors.request.use(async config => {
    console.log(`[API] ${config.method?.toUpperCase()} → ${config.baseURL}${config.url}`);
    // Token varsa Authorization header'a ekle
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    response => response,
    error => {
        console.log('[API] Hata:', error.response?.status, error.response?.data || error.message);
        return Promise.reject(error);
    }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
    login: (email, password) =>
        apiClient.post('/Account/login', { email, password }),

    register: (username, email, password) =>
        apiClient.post('/Account/register', { username, email, password }),
};

// ─── Tours ───────────────────────────────────────────────────────────────────
export const toursAPI = {
    /** Tüm turları listele (public) */
    getAll: () => apiClient.get('/Tours'),

    /** Tek tur detayı (public) */
    getById: (id) => apiClient.get(`/Tours/${id}`),

    /** Yeni tur oluştur (auth gerekli) */
    create: (tourData) => apiClient.post('/Tours', tourData),

    /** Turu sil (auth gerekli) */
    delete: (id) => apiClient.delete(`/Tours/${id}`),

    /** Kullanıcının oluşturduğu turlar */
    getMyCreated: (username) => apiClient.get(`/Tours/my-created/${username}`),
};

// ─── Participations ───────────────────────────────────────────────────────────
export const participationsAPI = {
    /** Tura katıl */
    join: (tourId, username, tourTitle) =>
        apiClient.post('/Participations', { tourId, username, tourTitle }),

    /** Turdan ayrıl */
    leave: (tourId, username) =>
        apiClient.delete('/Participations/leave', { params: { tourId, username } }),

    /** Katılım durumunu kontrol et */
    checkStatus: (tourId, username) =>
        apiClient.get('/Participations/check', { params: { tourId, username } }),

    /** Kullanıcının katıldığı turlar */
    getMyParticipations: (username) =>
        apiClient.get(`/Participations/${username}`),
};

// ─── Favorites ────────────────────────────────────────────────────────────────
export const favoritesAPI = {
    /** Favori ekle/çıkar (toggle) */
    toggle: (tourId, username, tourTitle, tourImage) =>
        apiClient.post('/Favorites', { tourId, username, tourTitle, tourImage }),

    /** Kullanıcının favori listesi */
    getMyFavorites: (username) =>
        apiClient.get(`/Favorites/${username}`),
};

// ─── Ratings ──────────────────────────────────────────────────────────────────
export const ratingsAPI = {
    /** Tur puanla (1-5) */
    rate: (tourId, username, score) =>
        apiClient.post('/Ratings', { tourId, username, score }),

    /** Turun ortalama puanı */
    getAverage: (tourId) =>
        apiClient.get(`/Ratings/average/${tourId}`),
};

// ─── RouteStops ───────────────────────────────────────────────────────────────
export const routeStopsAPI = {
    /** Tura ait durakları listele */
    getStops: (tourId) =>
        apiClient.get(`/RouteStops/${tourId}`),

    /** Yeni durak ekle (auth gerekli) */
    addStop: (stop) =>
        apiClient.post('/RouteStops', stop),

    /** Durak sil (auth gerekli) */
    deleteStop: (stopId) =>
        apiClient.delete(`/RouteStops/${stopId}`),
};

// ─── Garage ───────────────────────────────────────────────────────────────────
export const garageAPI = {
    /** Kullanıcının motorlarını listele */
    getMyBikes: (username) =>
        apiClient.get(`/Garage/${username}`),

    /** Yeni motor ekle */
    addBike: (bike) =>
        apiClient.post('/Garage', bike),

    /** Motor sil */
    deleteBike: (id) =>
        apiClient.delete(`/Garage/${id}`),
};

// ─── Comments ─────────────────────────────────────────────────────────────────
export const commentsAPI = {
    /** Tura ait onaylanmış yorumları listele */
    getByTour: (tourId) =>
        apiClient.get(`/Comments/${tourId}`),

    /** Yorum gönder (auth gerekli) */
    post: (tourId, username, content) =>
        apiClient.post('/Comments', { tourId, username, content }),

    /** Yorum sil (auth gerekli) */
    deleteComment: (id) =>
        apiClient.delete(`/Comments/${id}`),

    /** Onay bekleyen yorumları listele (Admin) */
    getPending: () =>
        apiClient.get('/Comments/pending'),

    /** Yorumu onayla (Admin) */
    approve: (id) =>
        apiClient.post(`/Comments/approve/${id}`),
};

// ─── Follows ──────────────────────────────────────────────────────────────────
export const followsAPI = {
    /** Takip et / takipten çık (toggle) */
    toggle: (followerUsername, followingUsername) =>
        apiClient.post('/Follows/toggle', { followerUsername, followingUsername }),

    /** Takipçi ve takip edilen sayısı */
    getStats: (username) =>
        apiClient.get(`/Follows/stats/${username}`),

    /** Takip durumunu kontrol et */
    checkFollow: (follower, followed) =>
        apiClient.get('/Follows/check', { params: { follower, followed } }),
};

// ─── Emergency ────────────────────────────────────────────────────────────────
export const emergencyAPI = {
    /** Acil durum bilgilerini getir */
    getInfo: (username) =>
        apiClient.get(`/Emergency/${username}`),

    /** Acil durum bilgilerini kaydet */
    saveInfo: (info) =>
        apiClient.post('/Emergency', info),
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationsAPI = {
    /** Kullanıcının bildirimlerini getir */
    getMyNotifications: (username) =>
        apiClient.get(`/Notifications/${username}`),

    /** Bildirimi okundu olarak işaretle */
    markAsRead: (id) =>
        apiClient.post(`/Notifications/mark-read/${id}`),
};

export default apiClient;

