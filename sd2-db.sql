-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Mar 22, 2026 at 08:29 PM
-- Server version: 9.6.0
-- PHP Version: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sd2-db`
--

-- --------------------------------------------------------

--
-- Table structure for table `Event`
--

CREATE TABLE `Event` (
  `post_id` int NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `event_date` date DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `duration` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `Event`
--

INSERT INTO `Event` (`post_id`, `location`, `event_date`, `start_date`, `end_date`, `start_time`, `duration`) VALUES
(2, 'Computer Science Building Room 101', '2026-04-01', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `Members`
--

CREATE TABLE `Members` (
  `student_id` int NOT NULL,
  `society_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `Members`
--

INSERT INTO `Members` (`student_id`, `society_id`) VALUES
(1, 1),
(2, 1),
(1, 2),
(3, 3);

-- --------------------------------------------------------

--
-- Table structure for table `Poll`
--

CREATE TABLE `Poll` (
  `post_id` int NOT NULL,
  `close_time` datetime DEFAULT NULL,
  `allow_multiple` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Poll_Choice`
--

CREATE TABLE `Poll_Choice` (
  `student_id` int NOT NULL,
  `post_id` int NOT NULL,
  `option_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Poll_Options`
--

CREATE TABLE `Poll_Options` (
  `option_id` int NOT NULL,
  `post_id` int NOT NULL,
  `option_title` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Post`
--

CREATE TABLE `Post` (
  `post_id` int NOT NULL,
  `society_id` int NOT NULL,
  `type` enum('announcement','event','poll') NOT NULL,
  `content` text NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `Post`
--

INSERT INTO `Post` (`post_id`, `society_id`, `type`, `content`, `created_at`) VALUES
(1, 1, 'announcement', 'Welcome to Chess Club! Meetings every Thursday at 6pm', '2026-03-22 19:29:31'),
(2, 2, 'event', 'Hackathon this Friday! Sign up now', '2026-03-22 19:29:31'),
(3, 2, 'announcement', 'New members welcome - no experience needed', '2026-03-22 19:29:31');

-- --------------------------------------------------------

--
-- Table structure for table `RSVP`
--

CREATE TABLE `RSVP` (
  `student_id` int NOT NULL,
  `post_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Society`
--

CREATE TABLE `Society` (
  `society_id` int NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `about_us_text` text,
  `logo_url` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `Society`
--

INSERT INTO `Society` (`society_id`, `password`, `email`, `about_us_text`, `logo_url`) VALUES
(1, 'password123', 'chess@roehampton.ac.uk', 'Weekly chess matches for all levels', ''),
(2, 'password123', 'coding@roehampton.ac.uk', 'Hackathons, talks and project nights', ''),
(3, 'password123', 'film@roehampton.ac.uk', 'Watch and discuss classic and indie films', ''),
(4, 'password123', 'running@roehampton.ac.uk', 'Morning runs around campus', '');

-- --------------------------------------------------------

--
-- Table structure for table `Student`
--

CREATE TABLE `Student` (
  `student_id` int NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `Student`
--

INSERT INTO `Student` (`student_id`, `password`, `email`, `first_name`, `last_name`) VALUES
(1, 'password123', 'johnny@roehampton.ac.uk', 'Johnny', 'Student'),
(2, 'password123', 'emily@roehampton.ac.uk', 'Emily', 'Chen'),
(3, 'password123', 'liam@roehampton.ac.uk', 'Liam', 'OConnor'),
(4, 'password123', 'dylan@roehampton.ac.uk', 'Dylan', 'Moore');

-- --------------------------------------------------------

--
-- Table structure for table `test_table`
--

CREATE TABLE `test_table` (
  `name` varchar(255) NOT NULL,
  `id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `test_table`
--

INSERT INTO `test_table` (`name`, `id`) VALUES
('James', 1),
('Cody', 2),
('Brad', 3),
('John', 4),
('Dylan', 5),
('Jordan', 6);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Event`
--
ALTER TABLE `Event`
  ADD PRIMARY KEY (`post_id`);

--
-- Indexes for table `Members`
--
ALTER TABLE `Members`
  ADD PRIMARY KEY (`student_id`,`society_id`),
  ADD KEY `fk_members_society` (`society_id`);

--
-- Indexes for table `Poll`
--
ALTER TABLE `Poll`
  ADD PRIMARY KEY (`post_id`);

--
-- Indexes for table `Poll_Choice`
--
ALTER TABLE `Poll_Choice`
  ADD PRIMARY KEY (`student_id`,`post_id`,`option_id`),
  ADD KEY `fk_pollchoice_poll` (`post_id`),
  ADD KEY `fk_pollchoice_option` (`option_id`);

--
-- Indexes for table `Poll_Options`
--
ALTER TABLE `Poll_Options`
  ADD PRIMARY KEY (`option_id`),
  ADD KEY `fk_polloptions_poll` (`post_id`);

--
-- Indexes for table `Post`
--
ALTER TABLE `Post`
  ADD PRIMARY KEY (`post_id`),
  ADD KEY `fk_post_society` (`society_id`);

--
-- Indexes for table `RSVP`
--
ALTER TABLE `RSVP`
  ADD PRIMARY KEY (`student_id`,`post_id`),
  ADD KEY `fk_rsvp_event` (`post_id`);

--
-- Indexes for table `Society`
--
ALTER TABLE `Society`
  ADD PRIMARY KEY (`society_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `Student`
--
ALTER TABLE `Student`
  ADD PRIMARY KEY (`student_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `test_table`
--
ALTER TABLE `test_table`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Poll_Options`
--
ALTER TABLE `Poll_Options`
  MODIFY `option_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Post`
--
ALTER TABLE `Post`
  MODIFY `post_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `Society`
--
ALTER TABLE `Society`
  MODIFY `society_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `Student`
--
ALTER TABLE `Student`
  MODIFY `student_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `test_table`
--
ALTER TABLE `test_table`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Event`
--
ALTER TABLE `Event`
  ADD CONSTRAINT `fk_event_post` FOREIGN KEY (`post_id`) REFERENCES `Post` (`post_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Members`
--
ALTER TABLE `Members`
  ADD CONSTRAINT `fk_members_society` FOREIGN KEY (`society_id`) REFERENCES `Society` (`society_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_members_student` FOREIGN KEY (`student_id`) REFERENCES `Student` (`student_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Poll`
--
ALTER TABLE `Poll`
  ADD CONSTRAINT `fk_poll_post` FOREIGN KEY (`post_id`) REFERENCES `Post` (`post_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Poll_Choice`
--
ALTER TABLE `Poll_Choice`
  ADD CONSTRAINT `fk_pollchoice_option` FOREIGN KEY (`option_id`) REFERENCES `Poll_Options` (`option_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_pollchoice_poll` FOREIGN KEY (`post_id`) REFERENCES `Poll` (`post_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_pollchoice_student` FOREIGN KEY (`student_id`) REFERENCES `Student` (`student_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Poll_Options`
--
ALTER TABLE `Poll_Options`
  ADD CONSTRAINT `fk_polloptions_poll` FOREIGN KEY (`post_id`) REFERENCES `Poll` (`post_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Post`
--
ALTER TABLE `Post`
  ADD CONSTRAINT `fk_post_society` FOREIGN KEY (`society_id`) REFERENCES `Society` (`society_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `RSVP`
--
ALTER TABLE `RSVP`
  ADD CONSTRAINT `fk_rsvp_event` FOREIGN KEY (`post_id`) REFERENCES `Event` (`post_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_rsvp_student` FOREIGN KEY (`student_id`) REFERENCES `Student` (`student_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
