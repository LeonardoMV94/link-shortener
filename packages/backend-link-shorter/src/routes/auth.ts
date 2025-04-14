import { Hono, Next, Context } from 'hono';
import { deleteCookie } from 'hono/cookie';
import { generateToken } from '../utils/jwt';
import type { Bindings, Variables } from '../types';
import { googleAuth } from '@hono/oauth-providers/google';
import { authMiddleware } from '../middlewares/auth';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

const googleMiddleware = async (c: Context, next: Next) => {
  return googleAuth({
    client_id: c.env.GOOGLE_ID,
    client_secret: c.env.GOOGLE_SECRET,
    scope: ['openid', 'email', 'profile'],
    redirect_uri: `${c.env.BACKEND_URL}/auth/google/callback`
  })(c, next);
};

app.get('/google', googleMiddleware);

app.get('/google/callback', googleMiddleware, async (c) => {
  const token = c.get('token');
  const grantedScopes = c.get('granted-scopes');
  const user = c.get('user-google');
  console.log('user', user);
  console.log('grantedScopes', grantedScopes);
  console.log('token', token);
  if (!user || !user.email) {
    return c.json(
      { error: 'No se pudo obtener la información del usuario' },
      400
    );
  }

  try {
    // Verificar si el usuario ya existe en la base de datos
    const existingUser = await c.env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    )
      .bind(user.email)
      .first();

    if (!existingUser) {
      // Si el usuario no existe, lo insertamos
      await c.env.DB.prepare(
        'INSERT INTO users (email, name, picture, provider, created_at) VALUES (?, ?, ?, ?, ?)'
      )
        .bind(
          user.email,
          user.name || '',
          user.picture || '',
          'google',
          new Date().toISOString()
        )
        .run();
    } else {
      // Si el usuario ya existe, actualizamos su información
      await c.env.DB.prepare(
        'UPDATE users SET name = ?, picture = ?, updated_at = ? WHERE email = ?'
      )
        .bind(
          user.name || existingUser.name,
          user.picture || existingUser.picture,
          new Date().toISOString(),
          user.email
        )
        .run();
    }

    // Generar JWT para la sesión con los datos del usuario
    const sessionToken = await generateToken(
      {
        name: user.name || '',
        picture: user.picture || '',
        sub: user.email || ''
      },
      c.env.JWT_SECRET
    );

    c.header(
      'Set-Cookie',
      `token=${sessionToken}; HttpOnly; Secure; SameSite=None; Path=/; Domain=pctester.cl; Max-Age=604800`
    );

    return c.redirect(`${c.env.PAGE_URL}`);
  } catch (error) {
    console.error('Error al guardar usuario:', error);
    return c.json({ error: 'Error al procesar la autenticación' }, 500);
  }
});

app.get('/me', authMiddleware, (c) => {
  const user = c.get('user');
  return c.json({ user });
});

app.get('/logout', (c) => {
  
  deleteCookie(c, 'token', {
    domain: 'pctester.cl', 
    path: '/', 
    sameSite: 'None', 
    secure: true, 
    httpOnly: true, 
    expires: new Date(0)
  });

  // Redirigir al frontend (por ejemplo, a la página de inicio o de login)
  return c.redirect(`${c.env.PAGE_URL}`);
});

export default app;
