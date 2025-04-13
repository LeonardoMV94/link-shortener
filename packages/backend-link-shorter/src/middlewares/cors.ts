import { MiddlewareHandler } from 'hono';
import { cors } from 'hono/cors';

export const corsMiddleware: MiddlewareHandler = async (c, next) => {

  const corsHandler = cors({
    origin: ['https://api.short.pctester.cl', 'https://short.pctester.cl'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    
    credentials: true
  });

  return corsHandler(c, next);
};
