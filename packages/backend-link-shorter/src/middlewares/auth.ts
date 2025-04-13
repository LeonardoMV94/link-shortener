import type { MiddlewareHandler } from 'hono'
import { verifyToken } from '../utils/jwt'

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  // Leer la cookie 'token'
  const cookie = c.req.header('Cookie') || ''
  if (!cookie) {
    return c.json({ error: 'Unauthorized cookie' }, 401)
  }
  const token = cookie
    .split(';')
    .map(v => v.trim())
    .find(v => v.startsWith('token='))
    ?.split('=')[1]
  if (!token) {
    return c.json({ error: 'Unauthorized token' }, 401)
  }

  try {
    const payload = await verifyToken(token, c.env)
    c.set('user', { email: payload.sub, name: payload.name, picture: payload.picture })
    return await next()
  } catch {
    return c.json({ error: 'Invalid token' }, 401)
  }
}