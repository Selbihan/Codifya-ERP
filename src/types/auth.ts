// Kimlik Doğrulama (Auth) Tipleri ve Arayüzleri
// Giriş/çıkış, kayıt, kullanıcı yönetimi ile ilgili tüm tip tanımları

import { BaseEntity, AuditableEntity } from './baseModels'

// Kullanıcı Rolü Enum - Sisteme giriş yapabilen kullanıcı türleri
export enum UserRole {
  ADMIN = 'ADMIN',      // Yönetici - tüm yetkilere sahip
  MANAGER = 'MANAGER',  // Müdür - sınırlı yönetici yetkileri
  USER = 'USER'         // Normal kullanıcı - temel yetkiler
}

// Kullanıcı Varlık Arayüzü - Veritabanındaki kullanıcı tablosunun yapısı
export interface User extends BaseEntity {
  id: number;                 // Kullanıcı kimlik numarası (PK)
  email: string;              // E-posta adresi
  password: string;           // Şifrelenmiş şifre
  name: string;               // Ad soyad
  username: string;           // Kullanıcı adı
  role: UserRole;             // Kullanıcı rolü
  code: string;               // Kullanıcı kodu (unique)
  department?: string;        // Departman bilgisi
  language?: string;          // Dil tercihi
  isActive: boolean;          // Aktiflik durumu
  createdAt: Date;            // Oluşturulma zamanı
  updatedAt: Date;            // Güncellenme zamanı
  createDate?: Date;          // Ekstra oluşturulma zamanı (opsiyonel)
  updateDate?: Date;          // Ekstra güncellenme zamanı (opsiyonel)
  createdBy?: number;         // Oluşturan kullanıcı (opsiyonel)
  updatedBy?: number;         // Güncelleyen kullanıcı (opsiyonel)
  deletedAt?: Date;           // Silinme zamanı (opsiyonel)
  deletedBy?: number;         // Sileyen kullanıcı (opsiyonel)
}

// Giriş İsteği Arayüzü - Kullanıcı giriş yaparken gönderilen veriler
export interface LoginRequest {
  username: string        // Kullanıcı adı veya email
  password: string        // Şifre
  rememberMe?: boolean    // Beni hatırla seçeneği (isteğe bağlı)
}

// Kayıt İsteği Arayüzü - Yeni kullanıcı kaydı için gereken veriler
export interface RegisterRequest {
  email: string           // E-posta adresi (zorunlu)
  password: string        // Şifre (zorunlu)
  firstName: string       // Ad
  lastName: string        // Soyad
  username: string        // Kullanıcı adı (zorunlu)
  role?: UserRole         // Kullanıcı rolü (isteğe bağlı, varsayılan USER)
}

// Kimlik Doğrulama Yanıt Arayüzü - Başarılı giriş/kayıt sonrası dönen veriler
export interface AuthResponse {
  message: string         // İşlem sonucu mesajı
  token: string           // JWT token (oturum için)
  user: UserInfo          // Kullanıcı bilgileri (şifre olmadan)
}

// Kullanıcı Bilgi Arayüzü - Hassas bilgiler olmadan kullanıcı verileri
export interface UserInfo {
  id: number              // Kullanıcı kimlik numarası
  email: string           // E-posta adresi
  name: string            // Ad soyad
  username?: string       // Kullanıcı adı
  code?: string           // Kullanıcı kodu
  role: UserRole          // Kullanıcı rolü
  department?: string     // Departman
  language?: string       // Dil tercihi
}

// JWT Token İçeriği - Token içinde saklanan bilgiler
export interface JWTPayload {
  userId: number          // Kullanıcı kimlik numarası
  email: string           // E-posta adresi
  role: UserRole          // Kullanıcı rolü
  iat?: number           // Token oluşturma zamanı
  exp?: number           // Token son kullanma zamanı
}

// Auth Context Durum Arayüzü - React Context'te saklanan durum bilgileri
export interface AuthContextState {
  user: UserInfo | null       // Giriş yapmış kullanıcı bilgileri (null = giriş yapmamış)
  isLoading: boolean          // Yükleniyor durumu
  isAuthenticated: boolean    // Kullanıcı giriş yapmış mı?
}

// Auth Context Aksiyonlar Arayüzü - React Context'te kullanılacak fonksiyonlar
export interface AuthContextActions {
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    username: string
    role?: string
  }) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<{ success: boolean; message: string }>
  checkAuthStatus: () => Promise<void>
}

// Auth Context Arayüzü - State ve actions'ları birleştiren arayüz
export interface AuthContextType extends AuthContextState, AuthContextActions {}

// API Hata Yanıt Arayüzü - Hata durumlarında dönen veri yapısı
export interface AuthError {
  error: string           // Hata mesajı
  details?: string        // Detaylı hata açıklaması (isteğe bağlı)
  code?: number          // Hata kodu (isteğe bağlı)
}

// Şifre Sıfırlama İsteği - E-posta ile şifre sıfırlama
export interface PasswordResetRequest {
  email: string           // Şifre sıfırlanacak hesabın e-postası
}

// Şifre Sıfırlama Onay Arayüzü - Yeni şifre belirleme
export interface PasswordResetConfirm {
  token: string           // Şifre sıfırlama token'ı
  newPassword: string     // Yeni şifre
}

// Şifre Değiştirme Arayüzü - Mevcut şifreyi değiştirme
export interface ChangePasswordRequest {
  currentPassword: string   // Mevcut şifre
  newPassword: string       // Yeni şifre
  confirmPassword: string   // Yeni şifre tekrarı
}

// Kullanıcı Güncelleme İsteği - Kullanıcı profilini güncelleme
export interface UserUpdateRequest {
  name?: string             // Ad soyad (isteğe bağlı)
  email?: string            // E-posta (isteğe bağlı)
  department?: string       // Departman (isteğe bağlı)
  language?: string         // Dil tercihi (isteğe bağlı)
}

// Form Durumu Arayüzü - Giriş/kayıt formlarında kullanılan durum
export interface AuthFormState {
  isLoading: boolean        // Form işlem halinde mi?
  error: string | null      // Hata mesajı (varsa)
  success: string | null    // Başarı mesajı (varsa)
}

// Yerel Depolama Anahtarları - Tarayıcıda saklanan verilerin anahtarları
export const AUTH_STORAGE_KEYS = {
  TOKEN: 'auth_token',          // JWT token anahtarı
  USER: 'auth_user',            // Kullanıcı bilgileri anahtarı
  REMEMBER_ME: 'auth_remember_me' // Beni hatırla anahtarı
} as const

// API Uç Noktaları - Auth işlemleri için kullanılan API adresleri
export const AUTH_ENDPOINTS = {
  LOGIN: '/api/auth/login',                     // Giriş yap
  REGISTER: '/api/auth/register',               // Kayıt ol
  LOGOUT: '/api/auth/logout',                   // Çıkış yap
  PROFILE: '/api/auth/profile',                 // Profil bilgileri
  REFRESH: '/api/auth/refresh',                 // Token yenile
  PASSWORD_RESET: '/api/auth/password-reset',   // Şifre sıfırlama
  PASSWORD_CONFIRM: '/api/auth/password-confirm', // Şifre sıfırlama onay
  CHANGE_PASSWORD: '/api/auth/change-password'  // Şifre değiştir
} as const
