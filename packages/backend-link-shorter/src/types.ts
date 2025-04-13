export type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
  GOOGLE_SECRET: string;
  GOOGLE_ID: string;
  PAGE_URL: string;
  BACKEND_URL: string;
};

export type Variables = {
  user: {
    id: string;
    email: string;
    sub: string;
    name: string;
    picture: string;
    provider: string;
  };
};
