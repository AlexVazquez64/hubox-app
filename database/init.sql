-- ─────────────────────────────────────────────────────
--  Hubox Contact Form — Database Schema
--  Engine: MySQL 8.0  |  Charset: utf8mb4
-- ─────────────────────────────────────────────────────

CREATE DATABASE IF NOT EXISTS hubox_contacts
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE hubox_contacts;

-- ─────────────────────────────────────────────────────
--  users — authenticated admin users (via Google OAuth)
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            CHAR(36)        NOT NULL  DEFAULT (UUID()),
  google_id     VARCHAR(128)    NOT NULL,
  email         VARCHAR(255)    NOT NULL,
  display_name  VARCHAR(150)    NOT NULL,
  avatar_url    VARCHAR(500)             DEFAULT NULL,
  role          ENUM('admin','viewer')   NOT NULL DEFAULT 'viewer',
  last_login_at DATETIME                 DEFAULT NULL,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT pk_users          PRIMARY KEY (id),
  CONSTRAINT uq_users_google   UNIQUE      (google_id),
  CONSTRAINT uq_users_email    UNIQUE      (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────
--  contacts — public form submissions
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contacts (
  id            CHAR(36)        NOT NULL  DEFAULT (UUID()),
  full_name     VARCHAR(150)    NOT NULL,
  email         VARCHAR(255)    NOT NULL,
  phone         VARCHAR(20)               DEFAULT NULL,
  company       VARCHAR(150)              DEFAULT NULL,
  message       TEXT            NOT NULL,
  source        ENUM('web','api','import') NOT NULL DEFAULT 'web',
  status        ENUM('new','contacted','archived') NOT NULL DEFAULT 'new',
  ip_address    VARCHAR(45)               DEFAULT NULL,
  created_at    DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT pk_contacts        PRIMARY KEY (id),
  INDEX         idx_contacts_email  (email),
  INDEX         idx_contacts_status (status),
  INDEX         idx_contacts_date   (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────
--  audit_logs — immutable record of admin actions
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id          CHAR(36)        NOT NULL  DEFAULT (UUID()),
  user_id     CHAR(36)                  DEFAULT NULL,
  action      VARCHAR(100)    NOT NULL,
  entity      VARCHAR(50)     NOT NULL,
  entity_id   CHAR(36)                  DEFAULT NULL,
  meta        JSON                      DEFAULT NULL,
  created_at  DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT pk_audit_logs        PRIMARY KEY (id),
  CONSTRAINT fk_audit_user        FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_audit_entity  (entity, entity_id),
  INDEX idx_audit_user    (user_id),
  INDEX idx_audit_date    (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────
--  refresh_tokens — JWT rotation / revocation support
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          CHAR(36)        NOT NULL  DEFAULT (UUID()),
  user_id     CHAR(36)        NOT NULL,
  token_hash  VARCHAR(256)    NOT NULL,
  expires_at  DATETIME        NOT NULL,
  revoked     TINYINT(1)      NOT NULL  DEFAULT 0,
  created_at  DATETIME        NOT NULL  DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT pk_refresh_tokens      PRIMARY KEY (id),
  CONSTRAINT uq_token_hash          UNIQUE      (token_hash),
  CONSTRAINT fk_refresh_user        FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_refresh_user    (user_id),
  INDEX idx_refresh_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
