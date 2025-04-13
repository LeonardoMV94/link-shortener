-- Crear tabla de usuarios para autenticación con Google


DROP TABLE IF EXISTS links;
DROP TABLE IF EXISTS users;

-- Crear tabla de usuarios
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  picture TEXT,
  provider TEXT NOT NULL,
  provider_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT,
  last_login TEXT
);

-- Crear índices para la tabla users
CREATE INDEX idx_users_email ON users(email);

-- Crear tabla de enlaces con relación a usuarios
CREATE TABLE links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  url TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  title TEXT,
  description TEXT,
  clicks INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Crear índices para la tabla links
CREATE INDEX idx_links_code ON links(code);
CREATE INDEX idx_links_user_id ON links(user_id);