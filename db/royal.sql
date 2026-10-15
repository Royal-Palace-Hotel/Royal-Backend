-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Oct 15, 2026 at 08:45 AM
-- Server version: 8.4.3
-- PHP Version: 8.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `royal_palace`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_audit_log`
--

CREATE TABLE `admin_audit_log` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `summary` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin_audit_log`
--

INSERT INTO `admin_audit_log` (`id`, `user_id`, `user_email`, `action`, `entity`, `entity_id`, `summary`, `ip`, `created_at`) VALUES
('06a308be-415d-4399-80ec-6b79eff9ac7c', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'roomBlock', '7ff5f72a-7aef-4894-b65c-8363a3cb2cb5', NULL, '::1', '2026-10-05 11:13:10'),
('074a1626-ad76-41c1-891c-e9b70f727c21', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'adminUser', '9f6a78fc-ec39-4ed4-9362-9977d8bae389', NULL, '::1', '2026-10-02 08:29:58'),
('08493551-4a95-4368-be6d-236240fbd3ed', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'status', 'contactMessage', '9d914072-3a8d-4f6a-8bda-6775075cb87f', 'statut → read', '::1', '2026-10-05 07:05:10'),
('094777fd-256e-42de-9d85-5948b05839d8', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'room', 'fd2a2710-ccd5-4b1f-9efa-4a1ce7598c77', NULL, '::1', '2026-10-05 07:01:38'),
('094984fd-5e97-4b77-b7ea-e24c08c6250e', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'menuSection', '08c6fc1e-c482-4460-9164-2c552cb09e48', NULL, '::1', '2026-10-05 07:01:37'),
('09ecad3e-79d5-49a1-9b2c-a60170201ec4', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'subscriber', '0479b7b3-f8ec-4aec-9c43-cdd96e632134', NULL, '::1', '2026-10-05 09:06:11'),
('0b0b88af-7d94-48f3-8c04-23a01bac8dcf', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'status', 'contactMessage', '1cbe3361-b9d9-4170-8f28-b3bcb5f3e486', 'statut → read', '::1', '2026-10-05 07:55:32'),
('0c581127-f96b-4619-a200-e7058a404a6e', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'adminUser', '64f4cb1c-c5b8-420e-afa7-37ee4a6f0009', NULL, '::1', '2026-10-05 09:06:15'),
('0d3e36d7-2c48-43ee-92bd-b9d99e2c2922', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'galleryImage', '85b2f41f-dc74-40ff-abad-110c147d89b3', NULL, '::1', '2026-10-05 07:01:38'),
('0df42c82-8d24-4d3c-97ba-cd69e90325ff', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'galleryImage', 'cb214e4f-62e5-4848-9dd2-c90211e1a8fa', NULL, '::1', '2026-10-05 07:47:14'),
('0e95fe11-533c-4832-91ea-365d431d604f', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'menuItem', 'e45f2e24-d160-4c86-bb62-2256c91d5ed9', NULL, '::1', '2026-10-05 07:47:14'),
('0fe083bc-96e0-43bb-8eb0-433c8b240a5a', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'roomBlock', '737cca3e-f213-4d2c-b43c-d61d197ee4dd', NULL, '::1', '2026-10-05 07:47:14'),
('11baa09d-0dc2-4c05-8c4b-2abf9e14e0c2', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'export', 'contactMessages', '4 ligne(s)', '::1', '2026-10-05 11:13:05'),
('121376e8-64b8-4940-9a4e-48f28401b9fb', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'eventRoom', '8f9357f4-e923-4187-a6ca-e2993ed0199c', NULL, '::1', '2026-10-05 07:47:14'),
('129cca7a-971f-4f49-a120-ba236731b5e6', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'subscriber', '6a5527ce-1302-4274-8857-58f59e0c74e9', NULL, '::1', '2026-10-05 07:05:10'),
('12e5b8dd-c265-43cb-a61c-7143f8552774', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'adminUser', 'daeff967-a490-4153-973f-985ed4577d74', NULL, '::1', '2026-10-05 07:01:38'),
('151e40ab-9712-45ef-94b5-dec75dd962fc', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'menuSection', '241e88a0-15b4-44b2-a95a-494c79b55fec', NULL, '::1', '2026-10-02 07:22:22'),
('156586eb-8c5d-40f8-95f9-5a5ca1567b1c', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'export', 'subscribers', '1 ligne(s)', '::1', '2026-10-05 07:05:10'),
('15a92ec8-064e-4788-9e41-e4adb049150f', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'adminUser', 'bc99fae0-3b22-45d9-8098-5c7d5e399d1e', NULL, '::1', '2026-10-02 08:30:02'),
('15d7f6d8-742e-410f-b5b6-66320a5888b0', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'export', 'contactMessages', '3 ligne(s)', '::1', '2026-10-05 07:05:10'),
('1682f19a-3c2d-49d6-a0e8-19bdd981b8d1', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'menuItem', '6bbbdb8d-60e5-4ee1-9e44-d1b80013de1f', NULL, '::1', '2026-10-05 11:13:09'),
('175504d0-bc5a-4e43-a2aa-2a26af34456c', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'export', 'subscribers', '1 ligne(s)', '::1', '2026-10-05 07:47:08'),
('176016e8-3ba1-48a7-b001-3e62dd21cf8a', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'adminUser', '7df60e94-5b90-48f4-9da6-a6f7907dd30c', NULL, '::1', '2026-10-05 09:06:13'),
('17aa0780-d5d5-4116-95ce-90570a446ea7', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'spaTreatment', '889095a6-20fd-4154-9274-abde824f133a', NULL, '::1', '2026-10-05 07:01:38'),
('1808a87e-468d-4d2b-8718-d5240ef7eec4', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'export', 'subscribers', '1 ligne(s)', '::1', '2026-10-02 08:29:58'),
('1967c945-ff0d-4919-9713-c30c90146185', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'menuItem', '074efe3c-7c92-4e7c-af26-0741a19a4872', NULL, '::1', '2026-10-02 08:30:02'),
('1ac99249-66bc-4d5d-a1e5-c0320f720548', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'room', 'd3f31e36-1fef-4fc0-8321-7dc802873b62', NULL, '::1', '2026-10-05 07:47:14'),
('1cb0ad99-3c11-4311-a35e-023bb20ab64f', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'create', 'room', 'f5537b3e-6e9b-4208-a193-03bce70873a8', 'Chambre de test', '::1', '2026-10-05 11:12:59'),
('1d28dda3-956b-4579-9fee-b6c2e50bbd14', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'login', 'account', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', NULL, NULL, '2026-10-05 07:46:59'),
('1d5155a5-d5d9-43d7-ba83-afe8ed72941e', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'eventRoom', '57506ade-4cfa-4ed4-bd7b-76b9c48de758', NULL, '::1', '2026-10-02 07:22:22'),
('1d6187c5-b057-4df7-938c-3fa28e9edba0', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'export', 'subscribers', '1 ligne(s)', '::1', '2026-10-05 07:01:33'),
('1d677c52-6ccb-483e-a54c-1e41c896bc21', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'adminUser', '8387b7a1-ddb9-4ef6-a9fd-029e103e0c52', NULL, '::1', '2026-10-02 07:22:21'),
('1de3df0c-b424-4840-b5de-25d77701ed04', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'login', 'account', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', NULL, NULL, '2026-10-05 06:16:43'),
('1f694a54-a858-4683-9c7a-e2b9e65da487', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'status', 'booking', 'a654b30f-0074-4075-b73c-2e5e3643c780', 'statut → confirmed', '::1', '2026-10-05 07:52:53'),
('1fe3380c-e778-4871-8758-d2c77ac0abee', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'status', 'contactMessage', '25cf7ba1-79d8-4eb9-ad2c-3929e6873da4', 'statut → read', '::1', '2026-10-02 08:29:57'),
('20d7118f-0b75-4025-a148-0dc8ebdadf47', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'discoverItem', '8b597b04-0866-4e5f-99a8-b454b04d00f8', NULL, '::1', '2026-10-02 07:22:22'),
('213a2200-c10a-4f66-aedf-aa80a852e7d6', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'export', 'contactMessages', '3 ligne(s)', '::1', '2026-10-05 07:47:08'),
('21864c1d-ff6c-467a-9c3f-134b99124bdf', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'room', 'd3a71f66-ecb5-41b9-afc6-ce70880852d6', NULL, '::1', '2026-10-05 11:13:10'),
('224e3035-7ece-4169-b54b-cf39939f714f', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'room', '3f5d24d6-e804-4fa9-8b70-90c8c82fc98c', NULL, '::1', '2026-10-02 08:30:02'),
('22c05f5e-96ec-45a7-bd90-ba72d69f4bf2', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'adminUser', 'a5ab14cb-609e-4880-bdfd-9d3d26e644de', NULL, '::1', '2026-10-05 11:13:10'),
('24c0f10d-f731-4a2d-a3da-8b68ef4c3cc4', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'export', 'contactMessages', '3 ligne(s)', '::1', '2026-10-02 07:22:19'),
('24e522cf-9431-46a3-812c-e5b06693f491', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'eventRoom', 'da49b430-4977-46e3-b20d-b31dff78873f', NULL, '::1', '2026-10-05 09:06:16'),
('2ca51cb8-c581-4ee3-ab04-ac625c32f7db', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'export', 'contactMessages', '4 ligne(s)', '::1', '2026-10-05 07:05:12'),
('2cff464c-e151-4a0e-ae36-5f38e9a89997', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'login', 'account', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', NULL, NULL, '2026-10-02 06:41:14'),
('2d0119a5-3997-4772-97c2-37c9519f6f15', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'export', 'contactMessages', '2 ligne(s)', '::1', '2026-10-05 07:01:33'),
('2f085519-9992-4bdb-ab2c-7adf7d9cf3a5', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'room', '61a24342-e00b-4147-9146-867b8e0de999', NULL, '::1', '2026-10-05 11:13:10'),
('2fa8fb17-7d23-4c9a-9d13-26f4ae3524d0', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'room', 'dc346c6d-b9a6-4319-ad46-ab418264b576', NULL, '::1', '2026-10-05 07:05:15'),
('30b8a49c-8635-42d6-9e4a-65be12557170', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'status', 'contactMessage', '1cbe3361-b9d9-4170-8f28-b3bcb5f3e486', 'statut → replied', '::1', '2026-10-05 07:55:41'),
('30f0bcc6-87fe-49f4-9b9d-d9bdc735f834', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'adminUser', '371c7ab5-3dd6-4537-9ba8-e1b23092e3f7', NULL, '::1', '2026-10-05 11:13:08'),
('31e74afa-fe96-4def-8d89-849cd3c405a0', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'galleryImage', 'f5a93768-112c-4827-bfbb-6f955061c857', NULL, '::1', '2026-10-02 07:22:22'),
('34bbbb83-8861-4a97-9e85-3617dfa243c2', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'menuItem', '57d0f9de-cef2-4ee6-a5a0-fcce15b27cbe', NULL, '::1', '2026-10-02 07:22:22'),
('354170ff-a29e-4fec-a3d5-6a67503e6f3c', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'spaTreatment', '40c2cc6e-a164-4c3c-b65d-a6cbed90299c', NULL, '::1', '2026-10-05 07:47:14'),
('3684a9fa-a611-48e9-b8db-cc1dd92fbfa5', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'subscriber', '223531c6-d809-4a8f-aca3-76c7c5d05ee0', NULL, '::1', '2026-10-05 11:13:05'),
('381ce9c2-c72b-4cef-a422-c403ac101ec0', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'eventRoom', '6713396a-b84b-4d5e-bdab-5bccc0ad0c9e', NULL, '::1', '2026-10-05 11:13:09'),
('3c0301bd-9c0b-4dde-b46c-d36491a51632', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'export', 'contactMessages', '5 ligne(s)', '::1', '2026-10-05 09:06:13'),
('3ce02951-5a37-4f22-b601-1f62739e655c', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'status', 'booking', '4497d85e-f1b9-42b8-86f7-5a2ed18bf06d', 'statut → confirmed', '::1', '2026-10-05 11:13:04'),
('3f1c48fd-3e64-498c-a062-884961ef9e04', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'room', 'dda573b4-0cd7-4418-a3cc-0a4117fe1a59', NULL, '::1', '2026-10-05 07:05:15'),
('3fa3c22d-26e0-4407-845f-523e60591460', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'adminUser', '7df60e94-5b90-48f4-9da6-a6f7907dd30c', NULL, '::1', '2026-10-05 09:06:16'),
('412ff7e2-75f7-4b29-85f6-5f625ac59cdb', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'login', 'account', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', NULL, NULL, '2026-10-02 07:23:39'),
('42acb54f-53e1-49be-9cfb-b8825f8cd6fd', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'status', 'booking', '7aebf1f6-4646-44f1-9c71-c8db2bd5172e', 'statut → confirmed', '::1', '2026-10-05 06:26:59'),
('446c9329-455d-4220-9bf4-988d3430686c', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'status', 'booking', '5ccf7587-9931-47da-a1f9-4683c953fdf1', 'statut → confirmed', '::1', '2026-10-05 07:47:08'),
('44d239bb-12a2-43f7-96b8-2d29a6a9dc78', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'subscriber', '512312cb-894c-4476-bd22-737eb198aae1', NULL, '::1', '2026-10-02 07:22:19'),
('44eae012-a569-4a08-a18f-17997633974b', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'create', 'galleryImage', 'cb214e4f-62e5-4848-9dd2-c90211e1a8fa', '/uploads/muuy5ln2-4238eac9.png', '::1', '2026-10-05 07:47:14'),
('45dab571-d886-4c42-9792-56fd3246022f', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'status', 'booking', 'aa30efe6-7dd5-4a7f-b5d8-3ea413b51d38', 'statut → confirmed', '::1', '2026-10-02 07:22:19'),
('471df69a-5e7c-4d3f-b215-228992bc7084', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'discoverItem', '7cddf2f2-6f1d-437d-b46c-c4b19aa583a9', NULL, '::1', '2026-10-02 07:22:22'),
('4a639bb2-b279-4a98-870e-d4b47a9c066c', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'status', 'booking', '5af00e19-1f00-41c1-bd0e-9beca3ea4dd4', 'statut → confirmed', '::1', '2026-10-02 08:29:57'),
('4a775a14-d9e7-4af4-9341-d5a549f278f2', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'status', 'booking', '1252d182-7a46-450e-931d-a9aa5ee9e0a3', 'statut → confirmed', '::1', '2026-10-05 09:06:11'),
('4a8b9973-b720-4156-96bd-5b23d3915405', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'export', 'contactMessages', '4 ligne(s)', '::1', '2026-10-02 07:22:19'),
('4adf8d64-cfa6-4e2f-8831-8408398e428f', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'export', 'bookings', '14 ligne(s)', '::1', '2026-10-05 07:05:10'),
('4b58fd00-1af5-4b5b-bc8b-dac469a0e655', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'adminUser', '371c7ab5-3dd6-4537-9ba8-e1b23092e3f7', NULL, '::1', '2026-10-05 11:13:07'),
('4bd332f5-9cc3-40b3-8c80-531b43c65090', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'export', 'subscribers', '1 ligne(s)', '::1', '2026-10-02 07:22:19'),
('529e11f2-1c16-4ebd-8724-98d491788e53', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'create', 'galleryImage', '630b760a-5526-4b21-b4e8-6bef7ce17a59', '/uploads/muuwnm4f-54212d1e.png', '::1', '2026-10-05 07:05:15'),
('52d963f3-7e43-47c5-bae2-59c8b04f93fc', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'export', 'contactMessages', '1 ligne(s)', '::1', '2026-10-02 08:30:51'),
('557542a1-bc12-47c2-90e5-ed15a733f778', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'adminUser', '9f6a78fc-ec39-4ed4-9362-9977d8bae389', NULL, '::1', '2026-10-02 08:29:59'),
('55785390-8f7d-45ed-a8e2-9aead7d49e17', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'adminUser', '2a03d4ff-c572-4ec5-8128-59e4b7c95501', NULL, '::1', '2026-10-05 07:05:13'),
('56242f83-d9b9-4b61-b8e6-152d492f1e2a', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'discoverItem', '8de79227-efee-4395-bd38-9372d6d596e2', NULL, '::1', '2026-10-05 07:05:15'),
('56f83616-b801-4348-8ac4-cea9be39951e', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'adminUser', '2a03d4ff-c572-4ec5-8128-59e4b7c95501', NULL, '::1', '2026-10-05 07:05:15'),
('57fc3144-bf45-45d8-89ec-c63a4115c223', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'status', 'contactMessage', 'dbb53440-c411-43a4-bcbe-f576ce7995ce', 'statut → read', '::1', '2026-10-05 07:01:33'),
('5ded0727-b91c-4825-8811-1706c97a15c4', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'login', 'account', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', NULL, NULL, '2026-10-05 09:06:04'),
('5f27bfec-c61d-46ef-a119-f62422cb27e4', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'subscriber', '87b9c041-dcff-407c-a4a9-b3e3fe0d3977', NULL, '::1', '2026-10-02 08:29:57'),
('61f85e20-c888-4470-99f8-13a59c5a8407', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'login', 'account', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', NULL, NULL, '2026-10-05 11:10:36'),
('62944177-de08-4849-ad73-0c608ac30fd9', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'adminUser', 'b57837cc-c02d-471a-93e1-49c635aa24ef', NULL, '::1', '2026-10-05 07:47:12'),
('62f65ba4-b9d8-4c8a-ae3a-4e1236fe9900', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'create', 'galleryImage', '4deb3394-c8e8-4f2b-81ac-3a6b36e1b1dd', '/uploads/muv0z8o9-26f7f4d2.webp', '::1', '2026-10-05 09:06:16'),
('63b713dd-0abe-4783-b88f-6f072c8702da', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'status', 'contactMessage', 'c32e94ee-c248-4101-b457-8182b2299ff5', 'statut → read', '::1', '2026-10-05 09:06:11'),
('640cf084-e77e-44af-8496-24e06cb11931', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'menuSection', '3a3ad7f6-1262-4af0-a16a-e93c9500f311', NULL, '::1', '2026-10-05 07:47:14'),
('649cff83-2e56-4b9d-8f52-0fb8cee5b0d6', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'spaTreatment', 'd52e8113-adf7-4452-a2aa-4739e9140e4d', NULL, '::1', '2026-10-05 11:13:10'),
('64a0411e-6657-40fb-88c1-296c97863b84', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'login', 'account', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', NULL, NULL, '2026-10-02 06:51:00'),
('656995a7-ac81-45e8-adcd-163a1f3f9dda', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'roomBlock', 'a9ad36f9-d56e-4b06-a22a-f7aa2ba16f7c', NULL, '::1', '2026-10-05 09:06:16'),
('67d247a0-edec-456c-ad01-e3d632aad87a', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'adminUser', '7df60e94-5b90-48f4-9da6-a6f7907dd30c', NULL, '::1', '2026-10-05 09:06:14'),
('6899aa1a-5e24-40b2-9eb8-6c401897f0ca', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'galleryImage', '1ac562f9-ec85-4f5d-a999-fdb812369fb8', NULL, '::1', '2026-10-02 08:30:02'),
('68d17373-805e-44e0-8eb5-3829839f65e5', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'export', 'bookings', '10 ligne(s)', '::1', '2026-10-02 07:22:19'),
('693df676-e9a0-462f-8a5f-1a63bbc27372', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'status', 'booking', '5ee396a0-a14c-44d6-b00c-d1825262cbff', 'statut → confirmed', '::1', '2026-10-05 07:53:02'),
('6a24837b-e8b9-40d5-a754-60dc73b2b8fd', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'create', 'galleryImage', '1b36c27e-5de8-420d-bb87-6267df9b57dc', '/uploads/muv5ife0-0fb5ec63.webp', '::1', '2026-10-05 11:13:09'),
('6b1da74b-8df5-4bac-8958-ac0984312a7c', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'galleryImage', 'd65a719d-c18f-4a4f-a9fd-5477c0af07bb', NULL, '::1', '2026-10-02 07:22:22'),
('6c614ecd-9346-4fa9-8b41-b792e98309d0', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'spaTreatment', '06670207-ca94-406d-a582-b2e2f2e9272f', NULL, '::1', '2026-10-02 07:22:22'),
('6c895f88-7df4-484f-b1d8-af38922dba67', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'discoverItem', '81c80f87-dd0f-4cf4-b1d4-ea5d91bffb60', NULL, '::1', '2026-10-02 08:30:02'),
('6cb2230d-d842-44af-845e-d56ef5d4012e', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'login', 'account', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', NULL, NULL, '2026-10-05 06:51:39'),
('6d2ef223-1b51-40b4-9bbb-431b89936884', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'galleryImage', '630b760a-5526-4b21-b4e8-6bef7ce17a59', NULL, '::1', '2026-10-05 07:05:15'),
('6e2d2a36-1da5-4dc9-947f-59980cbf1293', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'adminUser', '81db5aae-3f1c-491e-9a06-9846026c8fbc', NULL, '::1', '2026-10-05 07:05:15'),
('70244323-13b7-401c-86d6-e3a880df108d', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'login', 'account', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', NULL, NULL, '2026-10-05 07:05:04'),
('70de7660-668a-41e4-86e7-86a318e305ac', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'export', 'contactMessages', '5 ligne(s)', '::1', '2026-10-05 11:13:07'),
('710b463f-22e9-4596-9ca2-a10ff73789cb', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'room', '8a3237eb-8b3f-48e7-b168-176fdef63646', NULL, '::1', '2026-10-05 09:06:16'),
('7181473a-5b2b-4d7f-b83f-06c02cf78bf9', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'status', 'contactMessage', 'b4cbedf0-eefe-4f4a-8517-bfca99dd0d36', 'statut → archived', '::1', '2026-10-02 08:30:45'),
('73557611-44f8-4a8e-ad1d-9f5a21072474', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'spaTreatment', '17817883-1924-4283-bbe3-c3b6ab09c30f', NULL, '::1', '2026-10-05 09:06:16'),
('757aa103-c130-4d1e-a8ba-989331998134', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'status', 'booking', 'c0e56ab5-2b80-4f47-9d18-71f7bf7a0df1', 'statut → confirmed', '::1', '2026-10-05 07:01:33'),
('7706eed5-25f1-4529-80f7-1e163b3d9451', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'adminUser', '81db5aae-3f1c-491e-9a06-9846026c8fbc', NULL, '::1', '2026-10-05 07:05:14'),
('7736af2a-96c0-402f-98c2-85925e9ed5fd', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'create', 'room', 'd3a71f66-ecb5-41b9-afc6-ce70880852d6', 'Test concurrence', '::1', '2026-10-05 11:13:00'),
('78488d23-f986-4dc5-b1f6-9e70f27893f3', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'login', 'account', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', NULL, NULL, '2026-10-05 07:54:28'),
('7a6f85cd-7afd-41df-9795-49014a479fb8', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'export', 'contactMessages', '3 ligne(s)', '::1', '2026-10-02 08:29:57'),
('7a7526ed-2e7d-4b4b-a369-25d5152f9611', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'room', 'bda48d5f-b595-4112-b551-2f1cfc4dcbba', NULL, '::1', '2026-10-02 07:22:22'),
('7b0fce8d-ffe2-43f6-b228-c1e131f531e6', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'status', 'booking', 'd144af95-cabb-402c-97f9-b77fcb9387e2', 'statut → confirmed', '::1', '2026-10-02 06:57:42'),
('7d1ed665-c8eb-4c5e-b330-bd6ba8af6e6b', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'export', 'bookings', '18 ligne(s)', '::1', '2026-10-05 07:47:08'),
('7ebf947e-d7d9-4556-87df-003f1b26add2', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'create', 'roomBlock', '7ff5f72a-7aef-4894-b65c-8363a3cb2cb5', '2027-08-01 → 2027-08-03', '::1', '2026-10-05 11:12:57'),
('8075f05c-b2b1-419c-9614-eb06e4640e93', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'adminUser', '8387b7a1-ddb9-4ef6-a9fd-029e103e0c52', NULL, '::1', '2026-10-02 07:22:22'),
('817081f5-aa65-43bb-b9b6-fc0f4b412b0c', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'create', 'galleryImage', 'd65a719d-c18f-4a4f-a9fd-5477c0af07bb', '/uploads/muqmy2i9-c90b6cc6.png', '::1', '2026-10-02 07:22:22'),
('81d6c28f-93ed-4e88-9350-21ada4bf721d', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'spaTreatment', '427cbd4c-f984-42c0-bf9f-f7994736ad32', NULL, '::1', '2026-10-05 07:05:15'),
('82353f07-2b7f-42e7-87a2-d0aac729b60b', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'discoverItem', 'e52e433d-f24e-41a4-afc0-b13d2a47e824', NULL, '::1', '2026-10-05 09:06:16'),
('82b30062-8a88-4cec-926e-10cec645ab17', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'export', 'bookings', '13 ligne(s)', '::1', '2026-10-05 07:01:33'),
('833fb854-98df-44c8-934f-92ccd34c7e79', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'galleryImage', 'd8e830bb-7f94-4226-9413-70426427ec80', NULL, '::1', '2026-10-05 07:01:38'),
('85740aa2-76c8-4ed1-b05c-f6383eb34d18', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'adminUser', '9f6a78fc-ec39-4ed4-9362-9977d8bae389', NULL, '::1', '2026-10-02 08:30:02'),
('85cc5718-6e7a-4f98-aa5e-3c7ff0920f0e', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'login', 'account', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', NULL, NULL, '2026-10-05 08:42:36'),
('86c104b7-7d8d-4bac-a426-8a9749ceb5e7', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'adminUser', 'b57837cc-c02d-471a-93e1-49c635aa24ef', NULL, '::1', '2026-10-05 07:47:11'),
('87289570-6b2a-4398-9f78-796f6592a1cd', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'status', 'contactMessage', 'ced87629-7dba-4409-8915-70eb5f40ea8b', 'statut → read', '::1', '2026-10-05 11:13:04'),
('8a629ef1-a181-4223-b560-53899ce36eee', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'login', 'account', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', NULL, NULL, '2026-10-05 09:06:53'),
('8aaa125d-fc92-485e-90f0-a46f1ade45a4', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'login', 'account', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', NULL, NULL, '2026-10-05 07:10:36'),
('8bd997e4-0c5f-41ba-8cca-837042f7f06e', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'login', 'account', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', NULL, NULL, '2026-10-02 07:13:42'),
('8d098220-b6dc-4e96-bce8-c33d09eb237d', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'create', 'room', '61a24342-e00b-4147-9146-867b8e0de999', 'Chambre détaillée', '::1', '2026-10-05 11:12:57'),
('8d9888ae-16db-4fe6-9345-dc0836071441', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'login', 'account', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', NULL, NULL, '2026-10-02 07:22:16'),
('8e53896e-2610-4d16-b7f7-491584658e2f', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'adminUser', 'daeff967-a490-4153-973f-985ed4577d74', NULL, '::1', '2026-10-05 07:01:37'),
('8e53b18d-de86-414a-b685-134a3b58e80b', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'galleryImage', 'adf53f5e-3742-4baf-ab22-9df7960d1c3b', NULL, '::1', '2026-10-05 07:47:14'),
('90c6785e-dd13-4096-b02e-dc4b25cf5123', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'galleryImage', '8237901e-0223-43e2-825e-a71a1cf47408', NULL, '::1', '2026-10-05 11:13:10'),
('91815fd4-252a-4c06-b4f8-ab9329fb58be', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'discoverItem', 'edf7453c-6c3c-4817-917b-f99b655655b9', NULL, '::1', '2026-10-05 07:47:14'),
('91b725c6-e5b8-41dc-a74c-5a504771591a', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'galleryImage', '3f3609ac-fd19-4846-be0f-2af08f234ccb', NULL, '::1', '2026-10-02 08:30:02'),
('92ee0837-7d43-4ef8-a05b-3ce1a719223a', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'menuSection', 'd139eaf5-2b06-40f0-9a76-a76a23117e97', NULL, '::1', '2026-10-05 11:13:09'),
('9318454c-0dc2-4a0d-ba6e-926e02ce37b5', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'login', 'account', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', NULL, NULL, '2026-10-05 11:12:56'),
('942f3acf-d0d9-4c6d-9a82-0c572787aaa1', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'room', '4070baa8-91b7-4ed5-8a81-80bde9960388', NULL, '::1', '2026-10-05 07:47:14'),
('955f26f9-2343-4f50-a140-bbaa5fc7130c', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'discoverItem', '3004aa3e-f004-482e-9787-652770523256', NULL, '::1', '2026-10-05 07:01:38'),
('959995df-6570-4dcb-9dcb-0042722e1186', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'discoverItem', '0752c09c-d2b8-4f89-9852-b5429d8b6220', NULL, '::1', '2026-10-05 11:13:10'),
('9691117d-8ee4-4f93-88a5-f33631d2fbf7', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'create', 'roomBlock', '737cca3e-f213-4d2c-b43c-d61d197ee4dd', '2027-08-01 → 2027-08-03', '::1', '2026-10-05 07:47:00'),
('98f4dc1e-2d1f-4b32-8d64-c23c54b44b1a', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'adminUser', 'bc99fae0-3b22-45d9-8098-5c7d5e399d1e', NULL, '::1', '2026-10-02 08:30:01'),
('a3d12c19-ef59-403a-a675-8f6f65a7e67c', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'subscriber', 'f0b24622-d0a6-41fa-a08b-fc89b5200134', NULL, '::1', '2026-10-05 07:47:08'),
('a79f17cb-25f8-47ee-b06d-3324365096d4', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'eventRoom', '24fce728-c0ab-49dc-b709-3a75d1bf36a2', NULL, '::1', '2026-10-05 07:05:15'),
('a7f0b5d6-fbff-4ed5-9743-2eb67aff94c3', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'menuSection', '21bbbd3d-3fde-48a1-a1b7-963143e090fa', NULL, '::1', '2026-10-05 07:05:15'),
('a873edc6-0cd9-4421-86d7-7368a99b884a', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'adminUser', '64f4cb1c-c5b8-420e-afa7-37ee4a6f0009', NULL, '::1', '2026-10-05 09:06:16'),
('a9320b5f-262c-4f03-bd7d-7a90f9208a34', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'room', 'fba34c12-2f5f-46de-98e9-a7221d6287f0', NULL, '::1', '2026-10-02 07:22:22'),
('aa077f3a-56a9-4b96-9e3d-748132761f24', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'export', 'contactMessages', '4 ligne(s)', '::1', '2026-10-05 09:06:11'),
('aca78a4c-26b2-4d91-8815-6cfa6727b91f', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'status', 'booking', 'b02790ba-d72f-4ae4-b2d1-51cd692a35a4', 'statut → confirmed', '::1', '2026-10-05 07:05:10'),
('adea4985-1c34-4728-8c42-0c54e252be01', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'discoverItem', '5308cfb0-6fdd-4f50-99d2-9013c526caa1', NULL, '::1', '2026-10-05 07:47:14'),
('aeb9951d-95ae-4e3d-bba6-ac5cd9ea9c43', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'status', 'contactMessage', '9794bbc0-79cc-4ccf-b172-7a11a59fff5e', 'statut → read', '::1', '2026-10-05 07:47:08'),
('b0fab2d8-a666-40aa-8cca-1d56910c68a5', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'export', 'contactMessages', '4 ligne(s)', '::1', '2026-10-05 07:47:11'),
('b0fbd00f-5eaf-48f1-b9a6-8b8c99aa3328', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'room', 'f5537b3e-6e9b-4208-a193-03bce70873a8', NULL, '::1', '2026-10-05 11:13:10'),
('b1083671-baa9-4eff-9f56-6536bff5af36', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'export', 'bookings', '19 ligne(s)', '::1', '2026-10-05 11:13:05'),
('b3f8c9d0-7b91-45bb-a527-749f05b4c9f3', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'adminUser', '0b6487cb-430e-4dd0-87b8-bcc4fdfdf812', NULL, '::1', '2026-10-05 07:01:34'),
('b624c54c-1502-4ca8-8bb9-f736d6026cc3', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'create', 'galleryImage', '3f3609ac-fd19-4846-be0f-2af08f234ccb', '/uploads/muqpd3ct-6e471044.png', '::1', '2026-10-02 08:30:02'),
('b6c32848-44cc-40b2-bf4b-eca4f262c819', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'adminUser', '0b6487cb-430e-4dd0-87b8-bcc4fdfdf812', NULL, '::1', '2026-10-05 07:01:34'),
('b6f711a4-d836-4946-9ea8-434d9608415f', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'create', 'galleryImage', '85b2f41f-dc74-40ff-abad-110c147d89b3', '/uploads/muuwiy6j-b97a8c86.png', '::1', '2026-10-05 07:01:37'),
('b7ca1a0e-cb2c-417c-877e-89d3aa405ce8', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'galleryImage', '4deb3394-c8e8-4f2b-81ac-3a6b36e1b1dd', NULL, '::1', '2026-10-05 09:06:16'),
('b8d32a3f-9559-494d-9c0b-7066127e402c', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'discoverItem', '850421c1-b4e7-4106-90dd-e361eae7f708', NULL, '::1', '2026-10-05 09:06:16'),
('b9f2f71f-0867-42b9-99be-dfb36117b191', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'export', 'bookings', '18 ligne(s)', '::1', '2026-10-05 09:06:11'),
('bdbd448c-56fc-4120-82d2-3161d7402bda', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'adminUser', '371c7ab5-3dd6-4537-9ba8-e1b23092e3f7', NULL, '::1', '2026-10-05 11:13:10'),
('bedcb31f-e051-4889-8f78-4f0679e31cec', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'adminUser', 'b212985a-d178-40aa-bb19-4fc4e64d28e6', NULL, '::1', '2026-10-05 07:47:14'),
('c3134ccd-e3d1-45b4-855c-e7ec7924d32d', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'login', 'account', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', NULL, NULL, '2026-10-05 07:01:29'),
('c3cb9d07-8d5c-4dd5-afbd-9fd7d7272236', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'eventRoom', 'fe12ee8b-73d0-4444-83b7-11e0e1505a1d', NULL, '::1', '2026-10-02 08:30:02'),
('cddcdf18-aabf-4682-9b9c-910594eac82c', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'room', '4e0836a5-4d11-4979-a5a2-a5987a7da30e', NULL, '::1', '2026-10-05 07:01:38'),
('ce830bb9-aa19-4a5b-94ae-409f1fd08ad9', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'login', 'account', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', NULL, NULL, '2026-10-05 07:13:20'),
('cec7c005-2893-4b2d-97b6-18575526086c', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'login', 'account', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', NULL, NULL, '2026-10-05 07:32:43'),
('cf1b192d-4638-47fe-a5f3-ec70c41da0bf', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'menuItem', '9fe667a3-3367-4604-bc6c-117e3b6671ce', NULL, '::1', '2026-10-05 09:06:16'),
('cf5d8942-de4c-436b-8b52-cd9e4d6b763c', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'status', 'booking', 'bb6b3b64-56a5-45c7-bd38-095555d387e4', 'statut → confirmed', '::1', '2026-10-05 07:52:57'),
('d114c54f-1695-47bc-819f-ed353ff4a34c', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'galleryImage', 'f32dbc9f-2ec3-4037-8a1f-1288721b2b87', NULL, '::1', '2026-10-05 07:05:15'),
('d28dcb55-d845-4522-85fb-284ef92227ed', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'room', 'a743fa51-71c0-4472-90e0-23c35ef3b8d9', NULL, '::1', '2026-10-02 08:30:02'),
('d5dfa091-eb19-4d86-81e3-2ada2933a3ed', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'adminUser', '2a03d4ff-c572-4ec5-8128-59e4b7c95501', NULL, '::1', '2026-10-05 07:05:12'),
('d6ca2fec-fe38-46fc-8dfa-00d4a2baeebf', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'adminUser', '0b6487cb-430e-4dd0-87b8-bcc4fdfdf812', NULL, '::1', '2026-10-05 07:01:38'),
('d6e22a06-fcb8-4fda-9c6b-f79324faeb52', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'discoverItem', '00fd39c1-441e-499f-88c6-02b83a3ae513', NULL, '::1', '2026-10-05 07:05:15'),
('da44e577-7341-4c4d-a4b4-5186eb9d08e2', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'adminUser', '6250a0ee-b02a-4c3d-8b91-d36cf00412a3', NULL, '::1', '2026-10-02 07:22:22'),
('daafc1fd-8d11-4d77-9519-9cf4e4b4eb63', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'export', 'subscribers', '1 ligne(s)', '::1', '2026-10-05 11:13:05'),
('db046048-c338-4e9e-8a8e-00f5366e22ed', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'menuSection', '27271ee1-275d-4c76-a686-38877ea9fb91', NULL, '::1', '2026-10-05 09:06:16'),
('db20e3a0-2ae9-4455-815d-bc2f8075d06e', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'login', 'account', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', NULL, NULL, '2026-10-02 08:29:54'),
('dd626e61-14d6-4f54-a34b-dc47c8d38ef9', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'discoverItem', '76aead2c-76f5-47c4-b817-5e18e7b4ce8b', NULL, '::1', '2026-10-05 11:13:10'),
('e103958e-5122-45df-8eb8-3b672e7e5c7a', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'adminUser', '6250a0ee-b02a-4c3d-8b91-d36cf00412a3', NULL, '::1', '2026-10-02 07:22:20'),
('e164265d-4f84-420f-be5d-22afb5078206', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'status', 'booking', '1e1effa2-76e6-4ea4-a74f-a66aad84eb6f', 'statut → confirmed', '::1', '2026-10-02 09:58:58'),
('e3175e12-6f57-4373-9881-30a92804a553', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'export', 'bookings', '10 ligne(s)', '::1', '2026-10-02 08:29:57'),
('e3180d24-4833-4824-925b-75a0693d18c3', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'menuItem', 'ed9b8d2c-499b-47d2-869e-1c367f9b87e1', NULL, '::1', '2026-10-05 07:05:15'),
('e36cee14-ea70-4bb2-9da6-fef50f31ca48', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'export', 'contactMessages', '4 ligne(s)', '::1', '2026-10-02 08:29:58'),
('e3b9d5bb-58be-4667-b2a5-35c0ab44c99e', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'eventRoom', 'db92c670-f2b0-47e0-8a2d-dfb81e0875c3', NULL, '::1', '2026-10-05 07:01:37'),
('e416cc79-9f26-48f6-8dda-a9b1538d0bdd', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'galleryImage', 'edecbad0-17ac-487e-a058-55e6158ef314', NULL, '::1', '2026-10-05 09:06:16'),
('ea9841e4-44f5-4fa8-9b0a-4d9dc8ac7f77', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'room', '15bcfa89-5ff3-4fb0-9a2e-84cb887ed795', NULL, '::1', '2026-10-05 09:06:16'),
('eaccc403-c9aa-4e9c-9c36-70338dcc9f61', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'menuSection', '8a432735-9cf8-4eb9-8476-9598a7a4d3a0', NULL, '::1', '2026-10-02 08:30:02'),
('ec4846d5-0e78-4d86-8dc7-61283afc8df4', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'create', 'roomBlock', 'a9ad36f9-d56e-4b06-a22a-f7aa2ba16f7c', '2027-08-01 → 2027-08-03', '::1', '2026-10-05 09:06:04'),
('f13cfd45-e807-4b03-a429-77ab7f882d0d', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'export', 'subscribers', '1 ligne(s)', '::1', '2026-10-05 09:06:11'),
('f1d31dec-d74b-48b0-a494-c6ac44618ff8', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'status', 'booking', '414db81e-fa38-4467-b108-e6c33026f866', 'statut → confirmed', '::1', '2026-10-02 07:02:32'),
('f2a8faa7-5c23-44e1-ad5c-67779d6af986', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'discoverItem', '699fed9e-92b8-40fe-a969-51467a9ed548', NULL, '::1', '2026-10-02 08:30:02'),
('f3c49631-2c18-4994-ae3e-f440a7859155', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'adminUser', '6250a0ee-b02a-4c3d-8b91-d36cf00412a3', NULL, '::1', '2026-10-02 07:22:20'),
('f4870b80-51ea-4b00-a8ba-87e356a36de4', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'spaTreatment', 'b0ede8d0-9103-43bc-9b17-28ff207c0d41', NULL, '::1', '2026-10-02 08:30:02'),
('f5187e08-3258-4ce6-b319-94f9bffc2e04', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'menuItem', '8474c532-e32b-4946-a3b5-f7796ff58093', NULL, '::1', '2026-10-05 07:01:37'),
('f563f522-adce-4719-8dd1-4290d25cf6b9', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'adminUser', 'b212985a-d178-40aa-bb19-4fc4e64d28e6', NULL, '::1', '2026-10-05 07:47:13'),
('f5de63b6-1673-442c-8655-6ce59bd8e4a5', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'room', 'f5537b3e-6e9b-4208-a193-03bce70873a8', 'Chambre de test modifiée', '::1', '2026-10-05 11:12:59'),
('f66be7a0-18e6-43c7-9412-4ea763f9d7ad', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'adminUser', 'b57837cc-c02d-471a-93e1-49c635aa24ef', NULL, '::1', '2026-10-05 07:47:14'),
('f76a1fc5-8887-4e08-aec5-326d2a92f430', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'login', 'account', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', NULL, NULL, '2026-10-05 09:06:37'),
('f8816d7c-84b4-4f97-95e0-689212f8a3d4', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'discoverItem', '27c7b5de-2c04-45c5-adf1-8d017e542f1b', NULL, '::1', '2026-10-05 07:01:38'),
('fc08c09d-98e2-4f18-a626-136beb56f61c', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'status', 'contactMessage', 'c300df4c-cbd4-4537-aa2c-3a5275a29190', 'statut → read', '::1', '2026-10-02 07:22:19'),
('ff98af9e-a7b4-451d-8927-0c608e1373ee', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'update', 'adminUser', 'a5ab14cb-609e-4880-bdfd-9d3d26e644de', NULL, '::1', '2026-10-05 11:13:09'),
('ffa1cc30-6dbc-41f1-9d7c-f993f558cd03', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'login', 'account', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', NULL, NULL, '2026-10-05 06:53:08'),
('ffbd9a5e-6014-409f-9cc9-a86703290248', 'a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', 'delete', 'galleryImage', '1b36c27e-5de8-420d-bb87-6267df9b57dc', NULL, '::1', '2026-10-05 11:13:10');

-- --------------------------------------------------------

--
-- Table structure for table `admin_users`
--

CREATE TABLE `admin_users` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'admin',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `last_login_at` datetime DEFAULT NULL,
  `password_changed_at` datetime DEFAULT NULL,
  `token_version` int NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin_users`
--

INSERT INTO `admin_users` (`id`, `email`, `password`, `role`, `created_at`, `updated_at`, `name`, `is_active`, `last_login_at`, `password_changed_at`, `token_version`) VALUES
('a82130ca-600d-4d08-9538-2f92e5d9abb6', 'admin@royalpalaceantsirabe.com', '$2b$10$tIdlNvPQCSxcCHQmKS4.p.vIIPM9c/rD6SwX1ncr4/FkU5cQwee/S', 'admin', '2026-10-01 08:11:39', '2026-10-05 11:12:56', NULL, 1, '2026-10-05 11:12:56', NULL, 2);

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guest_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guest_email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `guest_phone` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `check_in` datetime NOT NULL,
  `check_out` datetime NOT NULL,
  `rooms_count` int NOT NULL,
  `adults` int NOT NULL,
  `children` int NOT NULL DEFAULT '0',
  `room_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','confirmed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `source` enum('website','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'website'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `guest_name`, `guest_email`, `guest_phone`, `check_in`, `check_out`, `rooms_count`, `adults`, `children`, `room_id`, `status`, `created_at`, `updated_at`, `source`) VALUES
('1e1effa2-76e6-4ea4-a74f-a66aad84eb6f', 'Ranto', 'herimandrantofandresen@gmail.com', '+261 34 84 299 33', '2026-10-03 00:00:00', '2026-10-04 00:00:00', 1, 2, 0, 'classic', 'confirmed', '2026-10-02 09:58:27', '2026-10-02 09:58:56', 'website'),
('414db81e-fa38-4467-b108-e6c33026f866', 'lova fiderana', 'alanrakotobe30215@gmail.com', '+261 34 84 299 33', '2026-10-03 00:00:00', '2026-10-04 00:00:00', 1, 2, 0, 'classic', 'confirmed', '2026-10-02 07:02:04', '2026-10-02 07:02:32', 'website'),
('5ee396a0-a14c-44d6-b00c-d1825262cbff', 'lova fiderana', 'fiderana34@gmail.com', '+261348429933', '2026-10-29 00:00:00', '2026-10-30 00:00:00', 1, 2, 0, 'f469f8b4-e2fe-4a8a-afe6-4a2f5297d27a', 'confirmed', '2026-10-05 06:40:18', '2026-10-05 07:52:57', 'website'),
('7aebf1f6-4646-44f1-9c71-c8db2bd5172e', 'lova fiderana', 'alanrakotobe30215@gmail.com', '+261348429933', '2026-10-06 00:00:00', '2026-10-07 00:00:00', 1, 2, 0, 'classic', 'confirmed', '2026-10-05 06:25:06', '2026-10-05 06:26:57', 'website'),
('a654b30f-0074-4075-b73c-2e5e3643c780', 'Ranto', 'alanrakotobe30215@gmail.com', '+261 34 84 299 33', '2026-10-14 00:00:00', '2026-10-15 00:00:00', 1, 2, 0, 'f469f8b4-e2fe-4a8a-afe6-4a2f5297d27a', 'confirmed', '2026-10-05 06:29:44', '2026-10-05 07:52:50', 'website'),
('af1d39f1-de00-4c6c-a88c-4014adf84703', 'fiderana heritiana', 'fideranahl@gmail.com', '3409393939', '2026-10-02 00:00:00', '2026-10-03 00:00:00', 1, 2, 0, 'superior', 'confirmed', '2026-10-01 08:53:48', '2026-10-01 11:17:54', 'website'),
('bb6b3b64-56a5-45c7-bd38-095555d387e4', 'lova fiderana', 'alanrakotobe30215@gmail.com', '+261348429933', '2026-10-06 00:00:00', '2026-10-07 00:00:00', 1, 2, 0, 'classic', 'confirmed', '2026-10-05 07:08:04', '2026-10-05 07:52:53', 'website'),
('d144af95-cabb-402c-97f9-b77fcb9387e2', 'Fiderana HL', 'fideranahl@gmail.com', '+261348429933', '2026-10-02 00:00:00', '2026-10-03 00:00:00', 1, 2, 0, 'classic', 'confirmed', '2026-10-01 08:50:44', '2026-10-02 06:57:41', 'website'),
('fd4d0619-c6f7-4f59-894d-9113e84e44d2', 'Ranto', 'ranto@gmail.com', '345466654', '2026-10-02 00:00:00', '2026-10-03 00:00:00', 1, 2, 0, 'classic', 'confirmed', '2026-10-01 11:15:30', '2026-10-01 11:17:40', 'website');

-- --------------------------------------------------------

--
-- Table structure for table `contact_messages`
--

CREATE TABLE `contact_messages` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('contact','event') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('new','read','replied','archived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'new',
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_date` datetime DEFAULT NULL,
  `guest_count` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contact_messages`
--

INSERT INTO `contact_messages` (`id`, `type`, `status`, `name`, `email`, `phone`, `subject`, `message`, `event_date`, `guest_count`, `created_at`) VALUES
('1cbe3361-b9d9-4170-8f28-b3bcb5f3e486', 'event', 'replied', 'fiderana', 'fiderana34@gmail.com', '0348429933', '', 'BATEM? TESTE KELY', '2026-10-14 00:00:00', 20, '2026-10-05 07:51:49'),
('b4cbedf0-eefe-4f4a-8517-bfca99dd0d36', 'contact', 'archived', 'fiderana hl', 'fideranahl@gmail.com', '980980987098', 'TEST KELY', 'manao teste kely fotsiny aloa annn', NULL, NULL, '2026-10-01 08:51:42');

-- --------------------------------------------------------

--
-- Table structure for table `discover_items`
--

CREATE TABLE `discover_items` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('activity','attraction') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'activity',
  `key` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title_en` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `text` text COLLATE utf8mb4_unicode_ci,
  `text_en` text COLLATE utf8mb4_unicode_ci,
  `icon` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(1024) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `discover_items`
--

INSERT INTO `discover_items` (`id`, `type`, `key`, `title`, `title_en`, `text`, `text_en`, `icon`, `image`, `sort_order`, `created_at`, `updated_at`) VALUES
('a1', 'activity', 'activity1', 'Tour en pousse-pousse', 'Rickshaw Tour', 'Découvrez la ville à bord d\'un pousse-pousse coloré, moyen de transport emblématique d\'Antsirabe.', 'Discover the city aboard a colourful pousse-pousse, Antsirabe\'s iconic mode of transport.', 'CarTaxiFront', '/images/discover/antsirabe-1.jpg', 0, '2026-10-01 12:47:18', '2026-10-01 13:18:41'),
('a2', 'activity', 'activity2', 'Lac Andraikiba', 'Lake Andraikiba', 'Un lac de cratère paisible, idéal pour une promenade ou un pique-nique en pleine nature.', 'A peaceful crater lake, ideal for a walk or picnic in nature.', 'Waves', '/images/discover/antsirabe-2.jpg', 1, '2026-10-01 12:47:18', '2026-10-01 13:18:41'),
('a3', 'activity', 'activity3', 'Ateliers d\'artisanat', 'Craft Workshops', 'Visitez les ateliers de corne de zébu, de pierres précieuses et de miniatures automobiles.', 'Visit workshops for zebu horn carving, gemstones and miniature car models.', 'Hammer', '/images/discover/antsirabe-3.jpg', 2, '2026-10-01 12:47:18', '2026-10-01 13:18:41'),
('a4', 'activity', 'activity4', 'Sources thermales', 'Thermal Springs', 'Profitez des vertus des eaux thermales, réputées depuis l\'époque coloniale.', 'Enjoy the benefits of thermal waters, renowned since colonial times.', 'Droplets', '/images/discover/garden-1.jpg', 3, '2026-10-01 12:47:18', '2026-10-01 13:18:41'),
('at1', 'attraction', 'attraction1', 'Parc national de Ranomafana (à la journée)', 'Ranomafana National Park (day trip)', NULL, NULL, NULL, NULL, 0, '2026-10-01 12:47:18', '2026-10-01 13:18:41'),
('at2', 'attraction', 'attraction2', 'Route des Baobabs (excursion)', 'Avenue of the Baobabs (excursion)', NULL, NULL, NULL, NULL, 1, '2026-10-01 12:47:18', '2026-10-01 13:18:41'),
('at3', 'attraction', 'attraction3', 'Marché artisanal local', 'Local craft market', NULL, NULL, NULL, NULL, 2, '2026-10-01 12:47:18', '2026-10-01 13:18:41'),
('at4', 'attraction', 'attraction4', 'Cathédrale d\'Antsirabe', 'Antsirabe Cathedral', NULL, NULL, NULL, NULL, 3, '2026-10-01 12:47:18', '2026-10-01 13:18:41');

-- --------------------------------------------------------

--
-- Table structure for table `event_rooms`
--

CREATE TABLE `event_rooms` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `key` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name_en` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `description_en` text COLLATE utf8mb4_unicode_ci,
  `image` varchar(1024) COLLATE utf8mb4_unicode_ci NOT NULL,
  `capacity` int DEFAULT NULL,
  `schedule` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `currency` varchar(8) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `event_rooms`
--

INSERT INTO `event_rooms` (`id`, `key`, `name`, `name_en`, `description`, `description_en`, `image`, `capacity`, `schedule`, `price`, `currency`, `sort_order`, `created_at`, `updated_at`) VALUES
('2aa3e10f-d4b8-4fe9-aefb-af660aa41416', 'TBE12', 'room4', 'ronml', 'mlkjmlkjml', 'jmljmlmlk', 'm', 8787, '34', 27.00, '34', 3, '2026-10-01 12:15:00', '2026-10-01 12:15:00'),
('room1', 'room1', NULL, NULL, NULL, NULL, '/images/events/events-1.jpg', NULL, NULL, NULL, NULL, 0, '2026-10-01 09:43:37', '2026-10-01 09:43:37'),
('room2', 'room2', NULL, NULL, NULL, NULL, '/images/events/events-2.jpg', NULL, NULL, NULL, NULL, 1, '2026-10-01 09:43:37', '2026-10-01 09:43:37'),
('room3', 'room3', NULL, NULL, NULL, NULL, '/images/events/events-3.jpg', NULL, NULL, NULL, NULL, 2, '2026-10-01 09:43:37', '2026-10-01 09:43:37');

-- --------------------------------------------------------

--
-- Table structure for table `gallery_images`
--

CREATE TABLE `gallery_images` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `src` varchar(1024) COLLATE utf8mb4_unicode_ci NOT NULL,
  `alt` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `alt_en` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` enum('hero','rooms','restaurant','pool','spa','events','discover','gallery') COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `gallery_images`
--

INSERT INTO `gallery_images` (`id`, `src`, `alt`, `alt_en`, `category`, `sort_order`, `created_at`, `updated_at`) VALUES
('discover-1', '/images/discover/antsirabe-1.jpg', 'Rue d\'Antsirabe avec architecture coloniale', 'Antsirabe street with colonial architecture', 'discover', 0, '2026-10-01 12:47:18', '2026-10-01 12:47:18'),
('discover-2', '/images/discover/antsirabe-2.jpg', 'Paysage des hauts-plateaux malgaches', 'Malagasy highlands landscape', 'discover', 1, '2026-10-01 12:47:18', '2026-10-01 12:47:18'),
('discover-3', '/images/discover/antsirabe-3.jpg', 'Vue d\'Antsirabe', 'View of Antsirabe', 'discover', 2, '2026-10-01 12:47:18', '2026-10-01 12:47:18'),
('discover-4', '/images/discover/garden-1.jpg', 'Jardin tropical luxuriant', 'Lush tropical garden', 'discover', 3, '2026-10-01 12:47:18', '2026-10-01 12:47:18'),
('events-1', '/images/events/events-1.jpg', 'Salle de réunion équipée', 'Equipped meeting room', 'events', 0, '2026-10-01 12:47:18', '2026-10-01 12:47:18'),
('events-2', '/images/events/events-2.jpg', 'Salle de conférence professionnelle', 'Professional conference room', 'events', 1, '2026-10-01 12:47:18', '2026-10-01 12:47:18'),
('events-3', '/images/events/events-3.jpg', 'Espace de réception pour événements', 'Reception space for events', 'events', 2, '2026-10-01 12:47:18', '2026-10-01 12:47:18'),
('gallery-1', '/images/gallery/lobby-1.jpg', 'Hall d\'accueil élégant du Royal Palace', 'Elegant Royal Palace lobby', 'gallery', 0, '2026-10-01 12:47:18', '2026-10-01 12:47:18'),
('hero-1', '/images/hero/hero-building.jpg', 'Façade du Royal Palace Antsirabe au crépuscule', 'Royal Palace Antsirabe facade at dusk', 'hero', 0, '2026-10-01 12:47:18', '2026-10-01 12:47:18'),
('pool-1', '/images/pool/pool-1.jpg', 'Piscine entourée de palmiers', 'Pool surrounded by palm trees', 'pool', 0, '2026-10-01 12:47:18', '2026-10-01 12:47:18'),
('pool-2', '/images/pool/pool-2.jpg', 'Piscine et jardin tropical', 'Pool and tropical garden', 'pool', 1, '2026-10-01 12:47:18', '2026-10-01 12:47:18'),
('pool-3', '/images/pool/pool-3.jpg', 'Espace détente au bord de la piscine', 'Poolside lounge area', 'pool', 2, '2026-10-01 12:47:18', '2026-10-01 12:47:18'),
('restaurant-1', '/images/restaurant/restaurant-1.jpg', 'Salle du restaurant Royal Palace', 'Royal Palace dining room', 'restaurant', 0, '2026-10-01 12:47:18', '2026-10-01 12:47:18'),
('restaurant-2', '/images/restaurant/restaurant-2.jpg', 'Table dressée dans une ambiance élégante', 'Table set in an elegant setting', 'restaurant', 1, '2026-10-01 12:47:18', '2026-10-01 12:47:18'),
('restaurant-3', '/images/restaurant/food-1.jpg', 'Plat gastronomique raffiné', 'Refined gourmet dish', 'restaurant', 2, '2026-10-01 12:47:18', '2026-10-01 12:47:18'),
('restaurant-4', '/images/restaurant/breakfast-1.jpg', 'Buffet petit-déjeuner gourmand', 'Hearty breakfast buffet', 'restaurant', 3, '2026-10-01 12:47:18', '2026-10-01 12:47:18'),
('room-1', '/images/rooms/room-1.jpg', 'Chambre supérieure avec lit confortable', 'Superior room with a comfortable bed', 'rooms', 0, '2026-10-01 12:47:18', '2026-10-01 12:47:18'),
('room-2', '/images/rooms/room-2.jpg', 'Chambre deluxe élégante', 'Elegant deluxe room', 'rooms', 1, '2026-10-01 12:47:18', '2026-10-01 12:47:18'),
('room-3', '/images/rooms/room-3.jpg', 'Suite royale avec décoration raffinée', 'Royal suite with refined decor', 'rooms', 2, '2026-10-01 12:47:18', '2026-10-01 12:47:18'),
('room-4', '/images/rooms/room-4.jpg', 'Chambre classique lumineuse', 'Bright classic room', 'rooms', 3, '2026-10-01 12:47:18', '2026-10-01 12:47:18'),
('spa-1', '/images/spa/spa-1.jpg', 'Cabine de soin du spa', 'Spa treatment room', 'spa', 0, '2026-10-01 12:47:18', '2026-10-01 12:47:18'),
('spa-2', '/images/spa/spa-2.jpg', 'Ambiance zen du spa', 'Zen spa atmosphere', 'spa', 1, '2026-10-01 12:47:18', '2026-10-01 12:47:18'),
('spa-3', '/images/spa/spa-3.jpg', 'Salle de massage apaisante', 'Soothing massage room', 'spa', 2, '2026-10-01 12:47:18', '2026-10-01 12:47:18');

-- --------------------------------------------------------

--
-- Table structure for table `menu_items`
--

CREATE TABLE `menu_items` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_en` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `description_en` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `section_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `menu_items`
--

INSERT INTO `menu_items` (`id`, `name`, `name_en`, `description`, `description_en`, `price`, `sort_order`, `section_id`, `created_at`, `updated_at`) VALUES
('78602459-0979-4294-94db-20335fbbde9e', 'teste', 'farine', 'lkjmlkjmlkj', 'mlkjmlkj', 19985.00, 1, '1cfc0163-763e-4c4b-99b7-13a30c73e19f', '2026-10-01 12:00:26', '2026-10-01 12:00:26'),
('b1', 'Cocktail signature \"Royal Palace\"', '\"Royal Palace\" signature cocktail', 'Rhum arrangé maison, fruits de la passion', 'House-infused rum, passion fruit', 15000.00, 0, 'drinks', '2026-10-01 09:43:37', '2026-10-01 09:43:37'),
('b2', 'Jus frais naturel', 'Fresh natural juice', 'Ananas, mangue ou fruit de la passion', 'Pineapple, mango or passion fruit', 7000.00, 1, 'drinks', '2026-10-01 09:43:37', '2026-10-01 09:43:37'),
('b3', 'Sélection de vins', 'Wine selection', 'Vins locaux et importés au verre ou en bouteille', 'Local and imported wines by the glass or bottle', 18000.00, 2, 'drinks', '2026-10-01 09:43:37', '2026-10-01 09:43:37'),
('d1', 'Assiette de fruits tropicaux', 'Tropical fruit plate', 'Fruits frais du jardin de l\'hôtel', 'Fresh fruits from the hotel\'s garden', 9000.00, 0, 'desserts', '2026-10-01 09:43:37', '2026-10-01 09:43:37'),
('d2', 'Mousse au chocolat et vanille de Madagascar', 'Chocolate mousse with Madagascar vanilla', 'Chocolat noir 70%, éclats de vanille bourbon', '70% dark chocolate, bourbon vanilla shavings', 12000.00, 1, 'desserts', '2026-10-01 09:43:37', '2026-10-01 09:43:37'),
('m1', 'Romazava traditionnel malgache', 'Traditional Malagasy Romazava', 'Bouillon de viande et brèdes mafana, riz blanc', 'Meat broth with mafana greens, white rice', 28000.00, 0, 'mains', '2026-10-01 09:43:37', '2026-10-01 09:43:37'),
('m2', 'Poisson grillé, sauce vanille de Madagascar', 'Grilled fish, Madagascar vanilla sauce', 'Poisson du jour, sauce vanille bourbon, légumes de saison', 'Catch of the day, bourbon vanilla sauce, seasonal vegetables', 32000.00, 1, 'mains', '2026-10-01 09:43:37', '2026-10-01 09:43:37'),
('m3', 'Filet de zébu au poivre sauvage', 'Zebu filet with wild pepper', 'Poivre sauvage de Madagascar, gratin de pommes de terre', 'Madagascar wild pepper, potato gratin', 35000.00, 2, 'mains', '2026-10-01 09:43:37', '2026-10-01 09:43:37'),
('m4', 'Curry de crevettes au lait de coco', 'Shrimp curry with coconut milk', 'Riz parfumé, brochette de légumes grillés', 'Fragrant rice, grilled vegetable skewer', 34000.00, 3, 'mains', '2026-10-01 09:43:37', '2026-10-01 09:43:37'),
('s1', 'Salade de crudités du jardin', 'Garden salad', 'Légumes frais de notre potager, vinaigrette maison', 'Fresh vegetables from our garden, homemade dressing', 12000.00, 0, 'starters', '2026-10-01 09:43:37', '2026-10-01 09:43:37'),
('s2', 'Samoussas malgaches', 'Malagasy samosas', 'Trois pièces, viande ou légumes, sauce pimentée', 'Three pieces, meat or vegetable, chili sauce', 10000.00, 1, 'starters', '2026-10-01 09:43:37', '2026-10-01 09:43:37'),
('s3', 'Soupe de courge et gingembre', 'Squash and ginger soup', 'Velouté onctueux, crème fraîche', 'Creamy velouté, fresh cream', 11000.00, 2, 'starters', '2026-10-01 09:43:37', '2026-10-01 09:43:37');

-- --------------------------------------------------------

--
-- Table structure for table `menu_sections`
--

CREATE TABLE `menu_sections` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title_en` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `menu_sections`
--

INSERT INTO `menu_sections` (`id`, `title`, `title_en`, `sort_order`, `created_at`, `updated_at`) VALUES
('1cfc0163-763e-4c4b-99b7-13a30c73e19f', 'test', 'teste', 4, '2026-10-01 11:58:44', '2026-10-01 11:58:44'),
('desserts', 'Desserts', 'Desserts', 2, '2026-10-01 09:43:37', '2026-10-01 09:43:37'),
('drinks', 'Bar & Boissons', 'Bar & Drinks', 3, '2026-10-01 09:43:37', '2026-10-01 09:43:37'),
('mains', 'Plats Principaux', 'Main Courses', 1, '2026-10-01 09:43:37', '2026-10-01 09:43:37'),
('starters', 'Entrées', 'Starters', 0, '2026-10-01 09:43:37', '2026-10-01 09:43:37');

-- --------------------------------------------------------

--
-- Table structure for table `newsletter_subscribers`
--

CREATE TABLE `newsletter_subscribers` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `newsletter_subscribers`
--

INSERT INTO `newsletter_subscribers` (`id`, `email`, `created_at`) VALUES
('8c841528-7e43-4963-b103-7555bb988d37', 'fideranahl@gmail.com', '2026-10-01 08:52:28');

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `translation_key` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name_en` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `description_en` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(10,2) NOT NULL,
  `currency` varchar(8) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'EUR',
  `size` int NOT NULL,
  `max_guests` int NOT NULL,
  `total_units` int NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `view` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `view_en` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bed_type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bed_type_en` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`id`, `slug`, `translation_key`, `name`, `name_en`, `description`, `description_en`, `price`, `currency`, `size`, `max_guests`, `total_units`, `created_at`, `updated_at`, `view`, `view_en`, `bed_type`, `bed_type_en`) VALUES
('classic', 'chambre-classique', 'classic', NULL, NULL, NULL, NULL, 65.00, 'EUR', 22, 2, 10, '2026-10-01 09:43:37', '2026-10-05 13:43:26', 'Vue jardin', 'Garden view', 'Lit double ou lits jumeaux', 'Double or twin beds'),
('deluxe', 'chambre-deluxe', 'deluxe', NULL, NULL, NULL, NULL, 130.00, 'EUR', 34, 3, 6, '2026-10-01 09:43:37', '2026-10-05 13:43:26', 'Vue piscine', 'Pool view', 'Lit king size', 'King size bed'),
('f469f8b4-e2fe-4a8a-afe6-4a2f5297d27a', 'T23', 'T23', 'chambre de luxe testena', 'teste', 'ljmlkjmlkjmlkjml', 'qsdqsdfqsdfqsdfq', 20000.00, 'AR', 12, 5, 1, '2026-10-05 06:22:56', '2026-10-05 06:22:56', NULL, NULL, NULL, NULL),
('suite', 'suite-royale', 'suite', NULL, NULL, NULL, NULL, 220.00, 'EUR', 55, 4, 4, '2026-10-01 09:43:37', '2026-10-05 13:43:26', 'Vue panoramique', 'Panoramic view', 'Lit king size + canapé-lit', 'King size bed + sofa bed'),
('superior', 'chambre-superieure', 'superior', NULL, NULL, NULL, NULL, 95.00, 'EUR', 28, 3, 8, '2026-10-01 09:43:37', '2026-10-05 13:43:26', 'Vue jardin ou piscine', 'Garden or pool view', 'Lit king size', 'King size bed');

-- --------------------------------------------------------

--
-- Table structure for table `room_amenities`
--

CREATE TABLE `room_amenities` (
  `room_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amenity` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `room_amenities`
--

INSERT INTO `room_amenities` (`room_id`, `amenity`, `sort_order`) VALUES
('classic', 'ac', 0),
('classic', 'wifi', 1),
('classic', 'tv', 2),
('classic', 'bathroom', 3),
('deluxe', 'ac', 0),
('deluxe', 'wifi', 1),
('deluxe', 'tv', 2),
('deluxe', 'minibar', 3),
('deluxe', 'safe', 4),
('deluxe', 'bathroom', 5),
('deluxe', 'balcony', 6),
('f469f8b4-e2fe-4a8a-afe6-4a2f5297d27a', 'wifi, tv, minibar', 0),
('suite', 'ac', 0),
('suite', 'wifi', 1),
('suite', 'tv', 2),
('suite', 'minibar', 3),
('suite', 'safe', 4),
('suite', 'bathroom', 5),
('suite', 'balcony', 6),
('suite', 'lounge', 7),
('superior', 'ac', 0),
('superior', 'wifi', 1),
('superior', 'tv', 2),
('superior', 'minibar', 3),
('superior', 'safe', 4),
('superior', 'bathroom', 5);

-- --------------------------------------------------------

--
-- Table structure for table `room_blocks`
--

CREATE TABLE `room_blocks` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `room_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `units` int NOT NULL DEFAULT '1',
  `reason` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `room_images`
--

CREATE TABLE `room_images` (
  `room_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(1024) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `room_images`
--

INSERT INTO `room_images` (`room_id`, `image`, `sort_order`) VALUES
('classic', '/images/rooms/room-4.jpg', 0),
('classic', '/images/rooms/room-1.jpg', 1),
('deluxe', '/images/rooms/room-2.jpg', 0),
('deluxe', '/images/rooms/room-3.jpg', 1),
('f469f8b4-e2fe-4a8a-afe6-4a2f5297d27a', '/uploads/muuv4wlw-c91bc4be.jpg', 0),
('suite', '/images/rooms/room-3.jpg', 0),
('suite', '/images/rooms/room-4.jpg', 1),
('superior', '/images/rooms/room-1.jpg', 0),
('superior', '/images/rooms/room-2.jpg', 1);

-- --------------------------------------------------------

--
-- Table structure for table `spa_treatments`
--

CREATE TABLE `spa_treatments` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `key` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `duration_key` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name_en` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration_en` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `description_en` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `spa_treatments`
--

INSERT INTO `spa_treatments` (`id`, `key`, `duration_key`, `price`, `sort_order`, `created_at`, `updated_at`, `name`, `name_en`, `duration`, `duration_en`, `description`, `description_en`, `is_active`) VALUES
('t1', 'treatment1', 'treatment1Duration', 45000.00, 0, '2026-10-01 09:43:37', '2026-10-01 14:52:01', 'Massage relaxant aux huiles essentielles', 'Relaxing massage with essential oils', '60 min', '60 min', NULL, NULL, 1),
('t2', 'treatment2', 'treatment2Duration', 60000.00, 1, '2026-10-01 09:43:37', '2026-10-01 14:52:01', 'Massage aux pierres chaudes', 'Hot stone massage', '75 min', '75 min', NULL, NULL, 1),
('t3', 'treatment3', 'treatment3Duration', 40000.00, 2, '2026-10-01 09:43:37', '2026-10-01 14:52:01', 'Soin du visage hydratant', 'Hydrating facial treatment', '45 min', '45 min', NULL, NULL, 1),
('t4', 'treatment4', 'treatment4Duration', 42000.00, 3, '2026-10-01 09:43:37', '2026-10-01 14:52:01', 'Gommage corps complet', 'Full body scrub', '50 min', '50 min', NULL, NULL, 1),
('t5', 'treatment5', 'treatment5Duration', 95000.00, 4, '2026-10-01 09:43:37', '2026-10-01 14:52:01', 'Rituel duo (couple)', 'Duo ritual (couples)', '90 min', '90 min', NULL, NULL, 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_audit_log`
--
ALTER TABLE `admin_audit_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `admin_audit_log_created_idx` (`created_at`),
  ADD KEY `admin_audit_log_entity_idx` (`entity`,`entity_id`);

--
-- Indexes for table `admin_users`
--
ALTER TABLE `admin_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `admin_users_email_unique` (`email`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bookings_check_in_check_out_idx` (`check_in`,`check_out`),
  ADD KEY `bookings_room_id_idx` (`room_id`);

--
-- Indexes for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `contact_messages_type_status_idx` (`type`,`status`);

--
-- Indexes for table `discover_items`
--
ALTER TABLE `discover_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `discover_items_key_unique` (`key`),
  ADD KEY `discover_items_type_idx` (`type`,`sort_order`);

--
-- Indexes for table `event_rooms`
--
ALTER TABLE `event_rooms`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `event_rooms_key_unique` (`key`);

--
-- Indexes for table `gallery_images`
--
ALTER TABLE `gallery_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `gallery_images_category_idx` (`category`,`sort_order`);

--
-- Indexes for table `menu_items`
--
ALTER TABLE `menu_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `menu_items_section_id_idx` (`section_id`);

--
-- Indexes for table `menu_sections`
--
ALTER TABLE `menu_sections`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `newsletter_subscribers`
--
ALTER TABLE `newsletter_subscribers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `newsletter_subscribers_email_unique` (`email`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `rooms_slug_unique` (`slug`);

--
-- Indexes for table `room_amenities`
--
ALTER TABLE `room_amenities`
  ADD PRIMARY KEY (`room_id`,`sort_order`);

--
-- Indexes for table `room_blocks`
--
ALTER TABLE `room_blocks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `room_blocks_dates_idx` (`start_date`,`end_date`),
  ADD KEY `room_blocks_room_id_idx` (`room_id`);

--
-- Indexes for table `room_images`
--
ALTER TABLE `room_images`
  ADD PRIMARY KEY (`room_id`,`sort_order`);

--
-- Indexes for table `spa_treatments`
--
ALTER TABLE `spa_treatments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `spa_treatments_key_unique` (`key`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_room_fk` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`);

--
-- Constraints for table `menu_items`
--
ALTER TABLE `menu_items`
  ADD CONSTRAINT `menu_items_section_fk` FOREIGN KEY (`section_id`) REFERENCES `menu_sections` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `room_amenities`
--
ALTER TABLE `room_amenities`
  ADD CONSTRAINT `room_amenities_room_fk` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `room_blocks`
--
ALTER TABLE `room_blocks`
  ADD CONSTRAINT `room_blocks_room_fk` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `room_images`
--
ALTER TABLE `room_images`
  ADD CONSTRAINT `room_images_room_fk` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
