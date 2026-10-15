-- INPOS 15 Oktober 2026: diterapkan SEKALI pada database versi sebelumnya.
-- BACKUP FULL MySQL dan uji pada staging terlebih dahulu.
-- JANGAN dijalankan pada database baru yang sudah dibuat dari schema.prisma terkini.
-- Konfirmasi nama index/kolom yang belum ada sebelum menjalankan SQL ini.
ALTER TABLE `StoreOrder` ADD COLUMN `requestId` VARCHAR(90) NULL;
CREATE UNIQUE INDEX `StoreOrder_tenantId_requestId_key` ON `StoreOrder`(`tenantId`, `requestId`);
CREATE INDEX `Product_tenantId_name_id_idx` ON `Product`(`tenantId`, `name`, `id`);
CREATE INDEX `Product_tenantId_active_name_idx` ON `Product`(`tenantId`, `active`, `name`);
CREATE INDEX `User_tenantId_role_idx` ON `User`(`tenantId`, `role`);
CREATE INDEX `StoreOrder_tenantId_status_createdAt_idx` ON `StoreOrder`(`tenantId`, `status`, `createdAt`);
CREATE INDEX `Invoice_status_createdAt_idx` ON `Invoice`(`status`, `createdAt`);
