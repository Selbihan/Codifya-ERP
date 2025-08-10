// Register Controller - Kullanıcı kayıt işlemi için API controller
import { NextApiRequest, NextApiResponse } from 'next'
import { AuthService } from '../services/authService'
import { RegisterRequest } from '@/types/auth'

const authService = new AuthService()

export default async function registerController(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    const userData: RegisterRequest = req.body
    const result = await authService.register(userData)
    return res.status(201).json(result)
  } catch (error: any) {
    return res.status(400).json({ message: error.message || 'Kayıt işlemi başarısız' })
  }
}
