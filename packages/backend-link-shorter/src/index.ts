import { Hono } from 'hono';
import authRoutes from './routes/auth';
import shortenerRoutes from './routes/shorter';
import type { Bindings, Variables } from './types';
import { corsMiddleware } from './middlewares/cors';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.use('*', corsMiddleware);

app.route('/auth', authRoutes);
app.route('/', shortenerRoutes);

// Manejar rutas no existentes
app.notFound((c) => c.json({ error: 'Not Found' }, 404));

export default app;
