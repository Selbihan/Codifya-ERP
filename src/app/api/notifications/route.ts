import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Simulated notifications - gerçek sistemde veritabanından gelecek
    const notifications = [
      {
        id: 1,
        title: 'Yeni Sipariş',
        message: 'SP-2024-001 numaralı sipariş alındı',
        type: 'success',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 dakika önce
        read: false
      },
      {
        id: 2,
        title: 'Stok Uyarısı',
        message: 'Laptop Pro stoku kritik seviyede (5 adet kaldı)',
        type: 'warning',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 dakika önce
        read: false
      },
      {
        id: 3,
        title: 'Ödeme Bildirimi',
        message: 'ABC Şirketi - 15.000 TL ödeme alındı',
        type: 'info',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 saat önce
        read: true
      },
      {
        id: 4,
        title: 'Sistem Bakımı',
        message: 'Sistem bakımı 23:00-01:00 arası planlandı',
        type: 'info',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 saat önce
        read: true
      },
      {
        id: 5,
        title: 'Yeni Müşteri',
        message: 'XYZ Ltd. şirketi müşteri olarak eklendi',
        type: 'success',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 saat önce
        read: true
      }
    ]

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount: notifications.filter(n => !n.read).length
    })
  } catch (error) {
    console.error('Notification API error:', error)
    return NextResponse.json(
      { success: false, message: 'Bildirimler alınırken hata oluştu' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, notificationId } = body

    if (action === 'markAsRead' && notificationId) {
      // Burada normalde veritabanında güncelleme yapılır
      console.log(`Notification ${notificationId} marked as read`)
      
      return NextResponse.json({
        success: true,
        message: 'Bildirim okundu olarak işaretlendi'
      })
    }

    if (action === 'markAllAsRead') {
      // Burada normalde tüm bildirimleri okundu olarak işaretler
      console.log('All notifications marked as read')
      
      return NextResponse.json({
        success: true,
        message: 'Tüm bildirimler okundu olarak işaretlendi'
      })
    }

    if (action === 'delete' && notificationId) {
      // Burada normalde veritabanından silme yapılır
      console.log(`Notification ${notificationId} deleted`)
      
      return NextResponse.json({
        success: true,
        message: 'Bildirim silindi'
      })
    }

    return NextResponse.json(
      { success: false, message: 'Geçersiz işlem' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Notification action error:', error)
    return NextResponse.json(
      { success: false, message: 'İşlem gerçekleştirilemedi' },
      { status: 500 }
    )
  }
}
