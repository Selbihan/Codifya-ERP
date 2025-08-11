import { NextRequest, NextResponse } from 'next/server'

// Payment sistemi geçici olarak devre dışı
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { success: false, message: 'Payment sistemi geçici olarak devre dışı' },
    { status: 503 }
  )
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { success: false, message: 'Payment sistemi geçici olarak devre dışı' },
    { status: 503 }
  )
} 