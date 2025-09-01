"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/components/theme/ThemeProvider';

export default function AppearancePage() {
  const { theme, setTheme } = useTheme();
  const [fontSize, setFontSize] = useState('16');
  const [layoutDensity, setLayoutDensity] = useState('comfortable');
  const [animations, setAnimations] = useState(true);

  useEffect(() => {
    // Font size'ı CSS custom property olarak uygula
    document.documentElement.style.setProperty('--base-font-size', `${fontSize}px`);
  }, [fontSize]);

  useEffect(() => {
    // Layout density'yi CSS custom property olarak uygula
    const densityMap = {
      compact: '0.75',
      comfortable: '1',
      spacious: '1.25'
    };
    document.documentElement.style.setProperty('--layout-density', densityMap[layoutDensity as keyof typeof densityMap]);
  }, [layoutDensity]);

  useEffect(() => {
    // Animasyonları etkinleştir/devre dışı bırak
    if (animations) {
      document.documentElement.style.removeProperty('--transition-duration');
    } else {
      document.documentElement.style.setProperty('--transition-duration', '0ms');
    }
  }, [animations]);

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-6">
      {/* Başlık */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
          Görünüm Ayarları
        </h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Uygulamanın görünüm ve hissini kişiselleştirin
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ayarlar Paneli */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Tema Seçimi */}
          <div className="space-y-4 p-6 rounded-xl border" style={{ 
            backgroundColor: 'var(--color-surface)', 
            borderColor: 'var(--color-border)' 
          }}>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                Tema
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Açık veya koyu tema seçin
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setTheme('light')}
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  theme === 'light' 
                    ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20' 
                    : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
                }`}
                style={{ backgroundColor: 'var(--color-surface-alt)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium" style={{ color: 'var(--color-text)' }}>Açık</span>
                  {theme === 'light' && (
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-gray-200 rounded"></div>
                  <div className="h-2 bg-gray-100 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                </div>
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  theme === 'dark' 
                    ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20' 
                    : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
                }`}
                style={{ backgroundColor: 'var(--color-surface-alt)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium" style={{ color: 'var(--color-text)' }}>Koyu</span>
                  {theme === 'dark' && (
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-gray-600 rounded"></div>
                  <div className="h-2 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-600 rounded w-1/2"></div>
                </div>
              </button>
            </div>
          </div>

          {/* Font Boyutu */}
          <div className="space-y-4 p-6 rounded-xl border" style={{ 
            backgroundColor: 'var(--color-surface)', 
            borderColor: 'var(--color-border)' 
          }}>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                Font Boyutu
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Metin boyutunu ayarlayın
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--color-text)' }}>Küçük</span>
                <input
                  type="range"
                  min="12"
                  max="20"
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  className="flex-1 mx-4"
                />
                <span style={{ color: 'var(--color-text)' }}>Büyük</span>
              </div>
              <div className="text-center">
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
                  {fontSize}px
                </span>
              </div>
            </div>
          </div>

          {/* Layout Yoğunluğu */}
          <div className="space-y-4 p-6 rounded-xl border" style={{ 
            backgroundColor: 'var(--color-surface)', 
            borderColor: 'var(--color-border)' 
          }}>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                Layout Yoğunluğu
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Arayüz elemanları arasındaki boşlukları ayarlayın
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: 'compact', label: 'Sıkı' },
                { value: 'comfortable', label: 'Rahat' },
                { value: 'spacious', label: 'Geniş' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setLayoutDensity(option.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    layoutDensity === option.value 
                      ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20' 
                      : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
                  }`}
                  style={{ backgroundColor: 'var(--color-surface-alt)' }}
                >
                  <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Animasyonlar */}
          <div className="space-y-4 p-6 rounded-xl border" style={{ 
            backgroundColor: 'var(--color-surface)', 
            borderColor: 'var(--color-border)' 
          }}>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                Animasyonlar
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Geçiş animasyonlarını etkinleştirin veya devre dışı bırakın
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <span style={{ color: 'var(--color-text)' }}>Animasyonları etkinleştir</span>
              <button
                onClick={() => setAnimations(!animations)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  animations ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    animations ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

        </div>

        {/* Önizleme Paneli */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
              Önizleme
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Değişikliklerin canlı önizlemesi
            </p>
          </div>

          <div className="p-4 rounded-xl border" style={{ 
            backgroundColor: 'var(--color-surface)', 
            borderColor: 'var(--color-border)' 
          }}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold" style={{ color: 'var(--color-text)' }}>
                  Örnek Kart
                </h4>
                <span className="text-sm px-2 py-1 rounded" style={{ 
                  color: 'var(--color-success)', 
                  backgroundColor: 'var(--color-success-bg)' 
                }}>
                  Aktif
                </span>
              </div>
              
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Bu örnek metin, seçilen ayarların nasıl göründüğünü görmenize yardımcı olur.
              </p>
              
              <div className="flex gap-2">
                <button className="px-3 py-1 rounded text-sm" style={{ 
                  backgroundColor: 'var(--color-primary)', 
                  color: 'var(--color-primary-fg)' 
                }}>
                  Birincil
                </button>
                <button className="px-3 py-1 rounded text-sm border" style={{ 
                  borderColor: 'var(--color-border)', 
                  color: 'var(--color-text)' 
                }}>
                  İkincil
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-warning-bg)' }}>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--color-warning)' }}></div>
              <div>
                <h5 className="font-medium" style={{ color: 'var(--color-text)' }}>
                  Bilgilendirme
                </h5>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  Ayarlar anlık olarak uygulanır
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
