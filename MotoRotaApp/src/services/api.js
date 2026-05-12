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
    join: (tourId, username) =>
        apiClient.post('/Participations', { tourId, username }),

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
    toggle: (tourId, username) =>
        apiClient.post('/Favorites', { tourId, username }),

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

export default apiClient;
