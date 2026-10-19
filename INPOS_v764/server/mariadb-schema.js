'use strict';
// Tabel dibuat tanpa menghapus data yang sudah ada. Semua metadata menggunakan waktu ISO string.
const schema = [
`CREATE TABLE IF NOT EXISTS tenants (
 id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
 code VARCHAR(16) NOT NULL UNIQUE, slug VARCHAR(40) NOT NULL UNIQUE,
 name VARCHAR(200) NOT NULL, owner VARCHAR(200) NOT NULL,
 phone VARCHAR(40) NOT NULL, email VARCHAR(200) NOT NULL,
 address TEXT, referral VARCHAR(64) DEFAULT '',
 suspended TINYINT NOT NULL DEFAULT 0, subscription_end VARCHAR(20) DEFAULT '', tax_end VARCHAR(20) DEFAULT '',
 created_at VARCHAR(40) NOT NULL,
 referral_code VARCHAR(24) NOT NULL DEFAULT '', referral_code_edited TINYINT NOT NULL DEFAULT 0,
 referral_active TINYINT NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
`CREATE TABLE IF NOT EXISTS users (
 id VARCHAR(100) NOT NULL,tenant_id BIGINT NOT NULL,
 username VARCHAR(100) NOT NULL UNIQUE,phone VARCHAR(40) UNIQUE,
 display_name VARCHAR(200) NOT NULL,role VARCHAR(40) NOT NULL,
 pin_hash VARCHAR(255) NOT NULL,active TINYINT DEFAULT 1,permissions LONGTEXT,
 PRIMARY KEY(tenant_id,id), CONSTRAINT fk_users_tenant FOREIGN KEY(tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
`CREATE TABLE IF NOT EXISTS sessions (
 token_hash CHAR(64) NOT NULL PRIMARY KEY,user_id VARCHAR(100) NOT NULL,
 tenant_id BIGINT NULL,role VARCHAR(40) NOT NULL,expires_at BIGINT NOT NULL,
 created_at BIGINT NOT NULL, KEY idx_sessions_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
`CREATE TABLE IF NOT EXISTS states (
 tenant_id BIGINT NOT NULL PRIMARY KEY,revision BIGINT NOT NULL DEFAULT 1,
 json LONGTEXT NOT NULL,updated_at VARCHAR(40) NOT NULL,
 CONSTRAINT fk_states_tenant FOREIGN KEY(tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
`CREATE TABLE IF NOT EXISTS admin_state (
 id INT NOT NULL PRIMARY KEY,revision BIGINT NOT NULL DEFAULT 1,
 json LONGTEXT NOT NULL,updated_at VARCHAR(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
`CREATE TABLE IF NOT EXISTS credentials (
 name VARCHAR(100) NOT NULL PRIMARY KEY,pin_hash VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
`CREATE TABLE IF NOT EXISTS pin_requests (
 id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,tenant_id BIGINT NOT NULL,
 user_id VARCHAR(100) NOT NULL,username VARCHAR(100) NOT NULL,
 status VARCHAR(24) NOT NULL DEFAULT 'pending',created_at VARCHAR(40) NOT NULL,
 updated_at VARCHAR(40),CONSTRAINT fk_pin_tenant FOREIGN KEY(tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
`CREATE TABLE IF NOT EXISTS referral_withdrawals (
 id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,tenant_id BIGINT NOT NULL,
 amount BIGINT NOT NULL,bank VARCHAR(80) NOT NULL,
 account_number VARCHAR(40) NOT NULL,account_name VARCHAR(120) NOT NULL,
 status VARCHAR(20) NOT NULL DEFAULT 'pending',note TEXT,
 created_at VARCHAR(40) NOT NULL,handled_at VARCHAR(40) DEFAULT '',
 KEY idx_referral_withdrawals_tenant (tenant_id,status),
 CONSTRAINT fk_withdrawals_tenant FOREIGN KEY(tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
`CREATE TABLE IF NOT EXISTS broadcast_reads (
 tenant_id BIGINT NOT NULL,user_id VARCHAR(100) NOT NULL,broadcast_id VARCHAR(80) NOT NULL,read_at VARCHAR(40) NOT NULL,
 PRIMARY KEY(tenant_id,user_id,broadcast_id), CONSTRAINT fk_broadcast_read_tenant FOREIGN KEY(tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
`CREATE TABLE IF NOT EXISTS inpos_migration (
 id INT NOT NULL PRIMARY KEY,source_sha256 CHAR(64) NOT NULL,created_at VARCHAR(40) NOT NULL,
 row_counts LONGTEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
];
const tables=['tenants','users','sessions','states','admin_state','credentials','pin_requests','referral_withdrawals'];
module.exports={schema,tables};
