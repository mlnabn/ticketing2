-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 16, 2025 at 05:46 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ticketing_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2025_08_04_013649_create_workers_table', 1),
(5, '2025_08_04_015047_create_tickets_table', 1),
(6, '2025_08_04_020430_create_personal_access_tokens_table', 1),
(7, '2025_08_05_083044_add_role_and_division_to_users_table', 2),
(8, '2025_08_06_015130_rename_worker_id_to_user_id_in_tickets_table', 3),
(9, '2025_08_06_024718_drop_worker_id_foreign_from_tickets_table', 4),
(10, '2025_08_06_024030_drop_workers_table', 5),
(12, '2025_08_06_025536_add_user_id_foreign_to_tickets_table', 6),
(13, '2025_08_09_025432_add_workshop_to_tickets_table', 6),
(14, '2025_08_09_033939_remove_division_from_users_table', 7),
(15, '2025_08_11_043258_add_creator_id_to_tickets_table', 8),
(16, '2025_08_12_025251_add_timestamps_to_tickets_table', 9),
(17, '2025_08_15_105944_allow_null_user_id_in_tickets_table', 10),
(18, '2025_08_15_131953_add_requested_time_to_tickets_table', 11);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('07kdqf2uTi3dZ2IUjadgKrFnbbETtjiytNj4E05D', NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiYlpVbXQ5VnhOSkV5ODNsNkZ1b3lwWmVLdXc0UW45cHJGWDRrR1Z4OSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1754292353),
('0f59wdoEr3x8MdAezEGF5e0973aCbASN55MyOrsw', NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiUkJGUkduTEpwRll4TnE4b2hKVnlvRXVsWWtmUkg3Q2xUTVZCWWVvaSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NDE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9zYW5jdHVtL2NzcmYtY29va2llIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1754292250),
('11HYoyLKhj7KLX4gHsHFVdqCeGCoOjPvUkKRtHee', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoibGhZOW1SZXQzU3pKYjE3cXJEUGw2aDhiOHZmT2VlRlVXZEg5eXFvUCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzA6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9hcGkvdXNlciI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1754287847),
('1qpvEzXG6WNM91VBBLOBLcSjVp5oLq3NXFeFsPoP', NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoidk54MmZUZGZsaUREV1RHM0F3a2U3UEVNZWQxUHRXMEl3dldtdnJRbSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NDE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9zYW5jdHVtL2NzcmYtY29va2llIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1754292357),
('22rX4VhRxpgCYfHuJtCEIfaVS1aWxcAZrnmDQjvj', NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoib21Wd0dXSWQ0TnVDVUdIazNNNVQzY3BkVFhnT1pGWFI1bVd1RzRPaiI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1754292357),
('2ByuMJr2z8dBBNBzuHQoiYgDqicBWAuIRP62Jvx7', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiR3hnVU1tZDd1U3c3STVMb2IyUG9JTnRjWG9Ea05ONTg1NDVKWVFyTSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzA6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9hcGkvdXNlciI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1754288183),
('3kmG6OUpnZUouScEK363j6YYzWsrbHn7sQpH3Uuo', NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiRXRwNzBIa29YY3BrM3RSRDFheG9XUWplMDl4M2xSYkFHZTdac2hSRSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1754290362),
('4vmXaWhHqOoRIXg6AJIws9t4p7qFavtiFcuMYF91', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiR3FtMW1kOGl0Nmt4T3BCRUFYcjAxeTNWbVBBMzJxOHVwbUEyUlN3bSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzA6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9hcGkvdXNlciI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1754288312),
('53k66qCBivuT6iwEQjYWwEy6aGLSyYJZgB9UDZfm', NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiRFRiaXNmcWlzTjl4TW5SYVVCSm13dFU5b08yUDVsZlFoaUpjVXludCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NDE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9zYW5jdHVtL2NzcmYtY29va2llIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1754290506),
('6EZ2PutuRmy5ST4UU19EReUx4QFb9lNE9QRFAJFK', NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiVGtQOU5GRVlFTzBUVk9wNlNpeGgxRkZoTlhkdklWOVJOM1RydHRTMSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1754292316),
('6xT0gHSSQGexT8OilPeBhH3HM8Q5ZXsiXFJlnzp6', NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiR1M5M1JYQUtkNDFYbVdreHV2QVFaWjBFNmVSQUN6YXIwSVJlNnBOdSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NDE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9zYW5jdHVtL2NzcmYtY29va2llIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1754290261),
('7ikf0BDhYQNPagZiVMKOhp6dcjnFnGOXSfFByJ2Z', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoicnFsYXBWUWF6eTVmVmJyQ2Jabk1QY0I0Y1pJMzRRSWN6dUdkNXVtcCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzA6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9hcGkvdXNlciI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1754287846),
('7Q7d77hREtPX59Uh4v1n6MAejiI3bK4flmg33DWA', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiU1ZaVDlxUGtBbE9HZ1NFZWxaemRSc0tZYUFFdk1yUEZrUUhVQlU3VSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzA6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9hcGkvdXNlciI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1754288311),
('8zXBM5LvSkHuk5t3yeIpT9imjVxNmKLUrEBi5jlC', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiYnhCd2I4elkza1FiT3lwcFF1amVod3llYmkwbVcxZHJqNlVlNnJ6SSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzA6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9hcGkvdXNlciI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1754288184),
('90ttQmnC6vH8ysDFi1gVgOUAE5PN4fO1Blt65rqC', NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiMVduTHd4aW1qWWdhRk5pbTV0b2ZKdUxXQzlOcTMxYURIaFRITDdVYyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NDE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9zYW5jdHVtL2NzcmYtY29va2llIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1754290362),
('91X72TWYyi85bVPv1dvgcvDA4I9mUU8hLxMrsSTs', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoicEtHY0l6ZXJqN0I1Wmo4d05lTXBkUTRwWXpCVDl3bVdrSmhOODBObCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NDE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9zYW5jdHVtL2NzcmYtY29va2llIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1754289142),
('91YhDXXG2vVVO1s1XUdzV1GUufEuJpGHFHMjBpyN', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoibU5DODNzN2NxOEE4azRBenp3UmxSRmRPQ3ZGc1gxUFE2dDkzeWNhYSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzA6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9hcGkvdXNlciI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1754289515),
('brNNkQM8hIX4YutV33AjvuSgC0eORv1JyYYmxKyO', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiMHBMZDZQcGZWQWJVMHlKb2l1dE4yckRSRFJoRDkxdzZNdkZnMTg2aCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzA6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9hcGkvdXNlciI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1754289134),
('cD53vNgZVbUINv8ninhWa1RN7rI9APyZiR3rDGby', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoib3dac1I1SXN6U2lvZUdqZjJNQjJLdDEwNEpQZXd1UXFYelljV1RTbiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NDE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9zYW5jdHVtL2NzcmYtY29va2llIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1754283476),
('cr1nDnk2ApnQKihGikWRPb8dWMiuvhzlnj3wJprs', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoibmhLR1d1T0xBM0NBM21BaFdKSmhLNWRrNm10eGpUelNVTU9KODNGYiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzA6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9hcGkvdXNlciI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1754288422),
('dV9cGScXjjBwtWh9KKPMRqxYHVOTSNcvdPRZP6V9', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoicVlObnNoVUNIdGc4UEg2MGN3NzZ4UlFTVnhmYVlNd0NkVlVoYUN3QSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzA6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9hcGkvdXNlciI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1754289515),
('E33jR6Z3eZBlo35FCxFpiCEl0GkAXTHqd7d7NlYE', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiY2hncXoyNmJ4NnNUZWl3SWdpNlpsN29nV0l1ZUQ1V2hjUEVhbjlZcSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NDE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9zYW5jdHVtL2NzcmYtY29va2llIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1754288768),
('ExY20E5KUExxx7SFNzQV0JYfetVt8PHBRJJAIWoh', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiWG1PbGZtbTVDeTc0cFd2amRIa1V0eXdNRk9YUGYwd2ptYU4wVHRabCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NDE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9zYW5jdHVtL2NzcmYtY29va2llIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1754288764),
('FzJipy6TrwZfWIwQ9l2Ig12IE82ptfAL7RGw0d1H', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiY05PMFBKTFVDSWFqb2xsckkwdHA5TkFUSjYxdFJUVHBrc0l6SjFiUSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1754289523),
('g4zHaOZpibCFQ6GVkveME1p8uryj2NkUPIw7lECK', NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZXJpU0RuSEN0YjU4VDkwcTdRM3NjWEQzd3VyY0tUaDNNeFBYTnBIbiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NDE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9zYW5jdHVtL2NzcmYtY29va2llIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1754290025),
('IzrnKf3ZFi1CXpO0prEOt26wz5CMVbd46qsN8K0g', NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiUFdmQ1BrWEszSmNnWTlIbW81WHo4NlhheXRTQlU2S0tjTlduazA2ZiI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1754292250),
('JkJfZD7MPpsS8i1YD7d3kMvBlcesSurGqj6YDPdr', NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZkNzZUs5Tkk4aE9zb09ybnlSSFNYRUxBQU9WRVhNdzdpNDY0YXFLbiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NDE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9zYW5jdHVtL2NzcmYtY29va2llIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1754290214),
('MiXi1wZLTdjj2Pw2RAUxW3H8B7JEQT8myzRQfZcv', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiRGxQck9tRThwYXZvQ0tLUWpySjZUcFBuYzA1Z0pReWVoVVVaSlZxcCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzA6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9hcGkvdXNlciI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1754288422),
('O2cXJpmkiIwdccsydH3CkuJwlljAatHhbvaeTRA5', NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiNjRraVNwNUtwMzBEa0RBZ3BBSEwyaFlxaW1idmlWR2J2WmkxVUVSSiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NDE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9zYW5jdHVtL2NzcmYtY29va2llIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1754292353),
('Pvo4FQ0yjlNDekRwTf8AZZmR5KqeG2P9Ei4ttv6R', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZktGcmN4OUNkSm9wNm5Pa2Y0a0o0Z1pRdTFZQ0tYRW9IQWtzZUxHbCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzA6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9hcGkvdXNlciI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1754288359),
('QGQKlSNjcQYz0YJfdWkxJKNVGQ6qKQLaphr4wNrY', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiYnZGUUFYZGZ5aGVodWRGUUdQb3Z3c2tKc3ZIaEF0ZDJCOFBIcnl1MSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1754289402),
('qYzykxJLwwYK3LPZ8ohwIgxN8fMOsJzD8jW2bHCI', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiODBRcjh0dDU2aUtTNnRxS0RkcThHcTBraHZodWk1eHV6OFN1NzBGSiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NDE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9zYW5jdHVtL2NzcmYtY29va2llIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1754289522),
('R4txFlswLaOZqhqc8C4FpyQ9uTEivLFtisN0vce8', NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiNDJ4UEpsMElVNGVRcUo3cTR3UGFIMmdTRlkzeEhKT1I5SUtPNnJBWiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzA6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9hcGkvdXNlciI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1754283432),
('RfdFRBPoiV6ZKKURa2EKAI08oGygaJCXICJmKual', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiek9HWWltVm50NFFHcDlkZHQ1d1YwVG1GeVNWVmhIZndRaUNBUzJsaCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1754288764),
('rMFL84kqTy5i6ABLBwGWsqT16I1KI7C9rLHGMPZl', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoidW9PWmFFMWJ5ZUdWV1B4N0gzU2ZUN3FhSlpRcGJSdmJvVmtSUUQ1WiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzA6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9hcGkvdXNlciI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1754289242),
('sA2iyzlgtLPZmcMLJ6Be7NrAnvc8azpug245e5hU', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiaVdpN0F4NUEwZjRkYmdodmVMNXlmQmp6Q2tUcE1wdld6UXQ2QjdHdCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzA6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9hcGkvdXNlciI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1754288359),
('sPA1jEWRx7ieVn45fkoMEIHQeKLsZlVM0ZCFv6bo', NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoid0hUUHpFWDhiZXV6OGtZUzA4ek56bklITmJmTGJWMTZZamYxdWJ1dCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1754290261),
('StwV8q11jbu4YwX6Dy237XJTAkWATySva0gxRr9u', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiQ0N6cTlQeHk1TXR1Q256ZkhJNGVzOEFlZ1NTbWM2VGFDNFNNWmdkRiI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1754289319),
('SUlG2jvAudiBTnInBBgYZIpqIVgULGrBldKmI8R9', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiQXNsNjBxVnpzekp3U2dXdkVqanJzd0I2MjlrQ3cwSGpWbUUzM2x1biI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1754283476),
('t3mVdoG8brs3KTk54vGol0RHKI723cNuZPYzEQvZ', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiTEZqSm9ZRlJKa3dXYUszZThPZEdUUFl5b2x6OEs2MGRkTHY1V0FjOCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NDE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9zYW5jdHVtL2NzcmYtY29va2llIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1754289401),
('tQRgaKUfMcayZq09qObUCyj8m2SQHwjkb6AO97ke', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiMUZDb3JPY29CbTFaQ2pvWFNzME5qTVZnZElOdkRFS2tXN0dVNGVCMiI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1754289143),
('W1UzGLVZRAJoGKhXM6Umzu49UfFpTtFL5b0sKrz5', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiM1ZROXgyazJuTlYyVUZnWmphb2NXMXRyTFpOMVY0aHFvbU8yTDRRciI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzA6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9hcGkvdXNlciI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1754289134),
('WApStMkPk3otnVCPWTl33SzOqd4jWDgI4NEQ76sS', NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiNWFjbTZLd2lWdkNHQ3RDbUZzMmRvWUFkMVRuZkVoUWxhNmZEWmR4SyI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1754290214),
('wgUxoy97tzSnxZDRXp3w0WG2DWqSg3rAYHxwz283', NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiald0aTk1WW9oRG9xM01pRDZ4YVc1WDdwQmNBSTRESUJsN3RCQURQeiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzA6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9hcGkvdXNlciI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1754291675),
('WoekmAgvs2Zw16rmbgB6MeokrRtgEzSioOvc7Qai', NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoibkNhWXE1NVJWbFFYNFRjQ1hGYVlzY0F4VEZzVmpiR3c2b0o2ZnJ4QyI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1754290025),
('wQ31ryfUv4MYTd1Usxz9k9CH8HtBzfUicvavnawS', NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiUThIbXp3ZXFjNHczY0NmTUY5MTRxTWFxdjY5QzJJcnhUT0lkeGxxYiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzA6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9hcGkvdXNlciI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1754291675),
('WV6wUAtEsWVtbQBUlm1FMelRexlB60LPv091QRgw', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZXJHcWVYaG8wM0MzTkw0YU9iZ2oweENQajRaeDlTSVZvU1Jsc1FsRiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NDE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9zYW5jdHVtL2NzcmYtY29va2llIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1754289319),
('xbdGmMSvyDjqOr7sh9zRaAXs5GITL2kQituf80hR', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZE9aQk4zQm85ZFpwbE8yREFlckNGVEM2djFXVzdrU3d5RmNSSFJkNiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzA6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9hcGkvdXNlciI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1754289242),
('xUpVokZ6Pdd63gkUoNeuYvfl5aKwOlbAFaNAbREY', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiWEg0cE9OeFdSbFFMQ2JvMlVaME5YeUhFa2NhOGM2dGV5M3dkanBZNSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1754288768),
('YaHqcXqRx3cukO22fszL37CFI0OE1Vl1Z4zgOZqL', NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoia09tblZ6RzhBREJsRWk5UWJmeTBQdkRPbm9GblVQMm42bVBtRG8zVSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NDE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9zYW5jdHVtL2NzcmYtY29va2llIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1754292316),
('yvgQ9EWL9VqcU4rjV8ti7yCPUXR35vBxAzpJXPm4', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiakl4VmFJNWJRWkFIeUlyUGRBc0pBQmFxdUZtbnZrQWlOZ0tkSUlGNSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzA6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9hcGkvdXNlciI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1754283432),
('zQ4NSn1OZXabbmaG7JUKqV6JVLgpaFiiMeR7LBuF', NULL, '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoibGdCWENiczR2TFJTcjk0QXFTRmR4MU1zc2RSVHZrTTFqaEkxbnljciI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1754290506);

-- --------------------------------------------------------

--
-- Table structure for table `tickets`
--

CREATE TABLE `tickets` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `workshop` varchar(255) DEFAULT NULL,
  `requested_time` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'Belum Dikerjakan',
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `creator_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tickets`
--

INSERT INTO `tickets` (`id`, `title`, `workshop`, `requested_time`, `status`, `started_at`, `completed_at`, `user_id`, `creator_id`, `created_at`, `updated_at`) VALUES
(64, 'Hp nan', 'Canden', NULL, 'Belum Dikerjakan', NULL, NULL, 6, 7, '2025-08-11 00:00:00', '2025-08-11 00:00:00'),
(65, 'Masang 1000 Mesin CNC', 'Bener', NULL, 'Sedang Dikerjakan', NULL, NULL, 4, 4, '2025-08-11 00:37:33', '2025-08-11 01:21:42'),
(66, 'Pulang', 'Canden', NULL, 'Sedang Dikerjakan', '2025-08-11 20:03:58', NULL, 4, 2, '2025-08-11 01:07:58', '2025-08-11 20:03:58'),
(68, 'Makan', 'Canden', NULL, 'Selesai', '2025-08-12 03:05:57', '2025-08-12 03:46:38', 4, 2, '2025-08-11 01:11:20', '2025-08-12 03:46:38'),
(75, 'Ticketing', 'Canden', NULL, 'Belum Dikerjakan', NULL, NULL, 4, 7, '2025-08-12 03:47:18', '2025-08-12 03:47:18'),
(76, 'Rakit CNC', 'Nobo', NULL, 'Belum Dikerjakan', NULL, NULL, 4, 7, '2025-08-12 03:53:52', '2025-08-12 03:53:52'),
(77, 'Melanjtukan Ticketing App', 'Canden', NULL, 'Sedang Dikerjakan', '2025-08-13 02:45:08', NULL, 2, 7, '2025-08-13 02:15:28', '2025-08-13 02:45:33'),
(78, 'Membenarkan Wiring', 'Nusa Persada', NULL, 'Belum Dikerjakan', NULL, NULL, 18, 2, '2025-08-13 04:09:51', '2025-08-13 04:09:51'),
(83, 'Kerjakan Ticketing', 'Nusa Persada', NULL, 'Selesai', '2025-08-14 03:26:56', '2025-08-14 03:28:32', 2, 2, '2025-08-14 02:41:47', '2025-08-14 03:28:32'),
(84, 'asdd', 'Canden', NULL, 'Belum Dikerjakan', NULL, NULL, 4, 18, '2025-08-14 06:10:52', '2025-08-14 06:10:52'),
(85, 'lkancsdlkasndlckasncklas cnklas clkas nclkasnc lknas ckansclkan slcknaslcnalksf claksnf  HWOIFH Wo fhwoi hfow HFOIHEWOe oioiohoiewhfoi hseog fahgoa goweh foiedhgfoadgh das;ohgdoa;sdhghdgkajwfh ewaoigh fsdoiaf hoaiwgh aoi;dg hawoig hawoigf', 'Canden', NULL, 'Selesai', '2025-08-15 06:47:52', '2025-08-15 06:48:02', 4, 2, '2025-08-14 06:28:23', '2025-08-15 06:48:02'),
(87, 'Benerin Laptop', 'Bener', NULL, 'Sedang Dikerjakan', '2025-08-15 04:18:56', NULL, 7, 2, '2025-08-15 04:14:52', '2025-08-15 04:18:56'),
(88, 'Benerin Router', 'Nusa Persada', NULL, 'Belum Dikerjakan', NULL, NULL, 7, 2, '2025-08-15 04:17:31', '2025-08-15 04:17:31'),
(89, 'Ngopi', 'Canden', NULL, 'Selesai', '2025-08-15 06:52:22', '2025-08-15 06:52:26', 7, 2, '2025-08-15 06:36:49', '2025-08-15 06:52:26'),
(90, 'Istirahat', 'Canden', NULL, 'Belum Dikerjakan', NULL, NULL, 7, 2, '2025-08-15 06:53:00', '2025-08-15 06:53:00'),
(91, 'Ngevape', 'Canden', NULL, 'Belum Dikerjakan', NULL, NULL, 7, 2, '2025-08-15 06:58:34', '2025-08-15 06:58:34'),
(92, 'Rokok', 'Canden', NULL, 'Sedang Dikerjakan', '2025-08-15 07:00:56', NULL, 7, 4, '2025-08-15 07:00:34', '2025-08-15 07:00:56'),
(93, 'asda', 'Canden', NULL, 'Belum Dikerjakan', NULL, NULL, 7, 4, '2025-08-15 07:02:20', '2025-08-15 07:02:20'),
(94, 'lknlkn', 'Canden', '09:00', 'Selesai', '2025-08-15 07:07:01', '2025-08-15 07:07:09', 7, 4, '2025-08-15 07:06:46', '2025-08-15 07:07:09'),
(95, 'alkdcn', 'Bener', '08:00', 'Sedang Dikerjakan', '2025-08-16 02:48:12', NULL, 7, 4, '2025-08-15 07:07:44', '2025-08-16 02:48:12'),
(96, 'Istirahat', 'Canden', '12:12', 'Sedang Dikerjakan', '2025-08-16 01:47:45', NULL, 7, 2, '2025-08-16 01:20:41', '2025-08-16 01:47:45'),
(98, 'Nambah Absen Buat Tim Produksi', 'Bener', '10:00', 'Sedang Dikerjakan', '2025-08-16 03:05:24', NULL, 8, 4, '2025-08-16 02:51:05', '2025-08-16 03:05:24'),
(100, 'Pulang', 'Pelita', '05:05', 'Belum Dikerjakan', NULL, NULL, NULL, 4, '2025-08-16 03:41:53', '2025-08-16 03:41:53');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`, `role`) VALUES
(2, 'akasha', 'akasha1@gmail.com', NULL, '$2y$12$WOujVRTZZB802m4pk3GVLuDT8A1bVL3/nWGmXOD2Y/WN2eLvnn2bC', NULL, '2025-08-04 19:30:32', '2025-08-14 07:02:00', 'user'),
(4, 'Bintang', 'bintang@gmail.com', NULL, '$2y$12$0hEuAgGyu4o5k0M.xOuDLO21yQ6fDYBZB0eEPbvYODIp/mKBHZRJm', NULL, '2025-08-05 01:33:33', '2025-08-05 01:33:33', 'user'),
(6, 'Bagas', 'bagas@gmail.com', NULL, '$2y$12$37JT39ckdV69yrlvTaAn0u88KnHXdIJlSm.dFYbgaDMm3MxMi7sIi', NULL, '2025-08-05 23:35:21', '2025-08-16 03:01:01', 'admin'),
(7, 'Dwi', 'admin@gmail.com', NULL, '$2y$12$qpy1MaEepu34.L8XRbjsour9xDSHspMeJUJpAkSNIKqvYehoVWwa.', NULL, '2025-08-06 00:06:58', '2025-08-06 00:06:58', 'admin'),
(8, 'David', 'david@gmail.com', NULL, '$2y$12$nFpugvVQauS1q0G8ludgiuMUWLpeaG/kMQkkRIORd.blTEN726wW2', NULL, '2025-08-06 02:55:46', '2025-08-16 03:03:21', 'admin'),
(18, 'Aris', 'aris@gmail.com', NULL, '$2y$12$.pSP/V7eaYwwdGjTBTkxcOCf5tDlTjA1kPQ2xLU0FvZ9C0Zvtczzq', NULL, '2025-08-13 01:28:37', '2025-08-16 03:03:50', 'admin'),
(20, 'Maulana', 'maulana@gmail.com', NULL, '$2y$12$9T13hNQjvzdN3toyEEmy9eyOscJa5kEbRiddgyc1sR0xTK2K0sWVe', NULL, '2025-08-13 01:46:18', '2025-08-13 04:51:45', 'user'),
(21, 'Rasya', 'rasya@gmail.com', NULL, '$2y$12$l1wFoGOkzCv3eAryK96aiuwejMkfqiqs3D1F6wfbMLWqZUAC6H9Lq', NULL, '2025-08-13 02:12:20', '2025-08-16 03:01:22', 'admin'),
(22, 'Karyanti', 'karyanti@gmail.com', NULL, '$2y$12$xQmwH6z6FuufFVAB4LyTAuu7YDPzTVzZTGPE3IJSUcmCgU7cp8E3S', NULL, '2025-08-13 04:25:27', '2025-08-13 04:29:30', 'user'),
(23, 'Samsung', 'samsung@gmail.com', NULL, '$2y$12$ISwjrY52M.selaBhcALdKuGsH4tq/MZCvncpaMEZfUAjhzaAvFN9u', NULL, '2025-08-13 04:51:27', '2025-08-13 04:51:27', 'user'),
(25, 'Taufiq Hidayat', 'taufiq@gmail.com', NULL, '$2y$12$3qkDI9IWGassZ3rNuBtBhuYkZ9IblczukkesEf403Vb4CjTKYH/E.', NULL, '2025-08-14 06:58:27', '2025-08-14 06:58:27', 'user'),
(26, 'Vampir', 'vampir@gmail.com', NULL, '$2y$12$LB05EXe7hc6shfj6j0TjbeG5junbCQgw2908jUP2M0PDGCqhncTue', NULL, '2025-08-16 03:39:57', '2025-08-16 03:39:57', 'user'),
(27, 'Lala', 'lala@gmail.com', NULL, '$2y$12$IrQtlyKtj4zPtQaU3aBle.QqC4yOJPI4cRZdFrFsfhcxuS19YMGyG', NULL, '2025-08-16 03:43:29', '2025-08-16 03:43:29', 'user');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tickets_user_id_foreign` (`user_id`),
  ADD KEY `tickets_creator_id_foreign` (`creator_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tickets`
--
ALTER TABLE `tickets`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `tickets`
--
ALTER TABLE `tickets`
  ADD CONSTRAINT `tickets_creator_id_foreign` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `tickets_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
