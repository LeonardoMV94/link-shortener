import { sign, verify } from 'hono/jwt'
import type { Bindings } from '../types'

const getExpirationTime = (days: number) => {
  return Math.floor(Date.now() / 1000) + 60 * 60 * 24 * days
}

export const generateToken = (data: { sub: string, picture: string, name: string }, jwtSecret: string) => {
  const payload = { 
    sub: data.sub, 
    picture: data.picture, 
    name: data.name, 
    exp: getExpirationTime(7)
  }
  return sign(payload, jwtSecret, 'HS256')
}

export const verifyToken = (token: string, env: Bindings) => {
  return verify(token, env.JWT_SECRET)
}