-- DropForeignKey
ALTER TABLE `accounts` DROP FOREIGN KEY `accounts_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `scheduling` DROP FOREIGN KEY `scheduling_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `sessions` DROP FOREIGN KEY `sessions_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `user_time_interval` DROP FOREIGN KEY `user_time_interval_user_id_fkey`;

-- RenameIndex
ALTER TABLE `accounts` RENAME INDEX `accounts_user_id_fkey` TO `accounts_user_id_idx`;

-- RenameIndex
ALTER TABLE `scheduling` RENAME INDEX `scheduling_user_id_fkey` TO `scheduling_user_id_idx`;

-- RenameIndex
ALTER TABLE `sessions` RENAME INDEX `sessions_user_id_fkey` TO `sessions_user_id_idx`;

-- RenameIndex
ALTER TABLE `user_time_interval` RENAME INDEX `user_time_interval_user_id_fkey` TO `user_time_interval_user_id_idx`;
