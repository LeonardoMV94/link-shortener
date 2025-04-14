import { Hono } from 'hono';
import { authMiddleware } from '../middlewares/auth';
import type { Bindings, Variables } from '../types';
import { generateShortCode } from '../utils/code';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Ruta para acortar URLs
app.post('/acortador', authMiddleware, async (c) => {
  const user = c.get('user');
  console.log('acortador user: ', user);
  const { url } = await c.req.json<{ url: string }>();
  const code = generateShortCode();

  const result = await c.env.DB.prepare(
    'SELECT id FROM users WHERE email = ?'
  )
    .bind(user.email)
    .first<{ id: number }>();
  if(!result) {
    return c.json({ error: 'User not found' }, 404);
  }

  const resultUrl = await c.env.DB.prepare(
    'SELECT code FROM links WHERE url = ?'
  )
    .bind(url)
    .first<{ code: string, url: string }>();
  if (resultUrl) {
    console.log('URL ya existe: ', resultUrl.url);
    return c.json({ shortUrl:  `${c.env.PAGE_URL}/${resultUrl.code}` ,message: 'URL ya existe' });
  }
  await c.env.DB.prepare(
    'INSERT INTO links (code, url,user_id) VALUES (?, ?, ?)'
  )
    .bind(code, url, result.id)
    .run();

  return c.json({ shortUrl: `${c.env.PAGE_URL}/${code}`, message: 'URL insertada' });
});

// Redirección pública
app.get('/:code', async (c) => {
  const code = c.req.param('code');
  console.log('code: ', code);
  const result = await c.env.DB.prepare(
    'SELECT id, url FROM links WHERE code = ?'
  )
    .bind(code)
    .first<{ url: string; id: number }>();

  if (!result) {
    return c.json({ error: 'URL not found' }, 404);
  }

  // Incrementamos el contador de clics en una operación separada
  await c.env.DB.prepare('UPDATE links SET clicks = clicks + 1 WHERE id = ?')
    .bind(result.id)
    .run();

  return c.redirect(result.url);
});

export default app;
