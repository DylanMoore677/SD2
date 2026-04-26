-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Apr 26, 2026 at 02:32 AM
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
(8, NULL, NULL, NULL, NULL, NULL, NULL),
(10, NULL, NULL, NULL, NULL, NULL, NULL),
(11, NULL, NULL, NULL, NULL, NULL, NULL),
(13, NULL, NULL, NULL, NULL, NULL, NULL),
(16, NULL, NULL, NULL, NULL, NULL, NULL),
(18, NULL, NULL, NULL, NULL, NULL, NULL),
(20, NULL, NULL, NULL, NULL, NULL, NULL),
(21, NULL, NULL, NULL, NULL, NULL, NULL),
(22, NULL, NULL, NULL, NULL, NULL, NULL),
(24, NULL, NULL, NULL, NULL, NULL, NULL);

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
(7, 6),
(14, 6),
(18, 6),
(7, 7),
(8, 7),
(9, 7),
(18, 7),
(8, 8),
(11, 8),
(18, 8),
(7, 9),
(9, 9),
(14, 9),
(9, 10),
(14, 10),
(18, 10),
(9, 11),
(11, 11),
(14, 11);

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
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `title` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `Post`
--

INSERT INTO `Post` (`post_id`, `society_id`, `type`, `content`, `created_at`, `title`) VALUES
(8, 6, 'event', 'Join us for a relaxed open studio session where you can bring your own project or try something new. We’ll provide basic materials, music, and a space to create alongside others. No experience needed—just show up and get creative.', '2026-04-26 01:21:07', 'Open Studio Night'),
(9, 6, 'announcement', 'We’re looking for student artwork to feature in our upcoming campus exhibition. All mediums are welcome including digital, painting, photography, and mixed media. Submit your work through the form by Friday.', '2026-04-26 01:21:23', 'Call for Exhibition Submissions'),
(10, 6, 'event', 'A casual weekly meet-up for drawing enthusiasts. Each session will feature a new theme or prompt to spark ideas. Great for improving skills and meeting fellow artists.', '2026-04-26 01:21:36', 'Weekly Sketch Jam'),
(11, 7, 'event', 'Our biggest event of the semester is here. Form teams, build a project in 24 hours, and pitch to industry judges. Open to all skill levels with mentors available throughout.', '2026-04-26 01:23:09', 'Hackathon 2026 Kickoff'),
(12, 7, 'announcement', 'We’ve launched our official Discord server for all members. Join to stay updated on events, collaborate on projects, and connect with other students in tech.', '2026-04-26 01:23:19', 'New Discord Community Launch'),
(13, 8, 'event', 'Help us make campus greener by joining our clean-up initiative. Gloves and bags will be provided. Meet outside the main courtyard at 10am.', '2026-04-26 01:24:23', 'Campus Clean-Up Day'),
(14, 8, 'announcement', 'We’re recruiting volunteers to help run our upcoming awareness campaign on reducing waste. Great opportunity to gain experience and make an impact.', '2026-04-26 01:24:36', 'Sustainability Campaign Volunteers Needed'),
(15, 8, 'announcement', 'THE PLANET IS ON FIRE', '2026-04-26 01:25:00', 'HELP HELP'),
(16, 9, 'event', 'Come unwind with us at our weekly game night. We’ll have a mix of multiplayer games, party games, and casual competitions. Snacks provided.', '2026-04-26 01:25:35', 'Friday Game Night'),
(17, 9, 'announcement', 'We’re recruiting players for our competitive esports teams. If you’re serious about competing, sign up for tryouts this week.', '2026-04-26 01:25:51', 'Esports Team Tryouts Open'),
(18, 9, 'event', 'Compete in our Smash Bros tournament for a chance to win prizes and bragging rights. All skill levels welcome.', '2026-04-26 01:26:03', 'Tournament: Smash Bros Showdown'),
(19, 10, 'announcement', 'New to campus? Join us for a casual meet and greet to connect with other international students and learn about upcoming events.', '2026-04-26 01:26:41', 'Welcome Week Meet & Greet'),
(20, 10, 'event', 'Experience dishes from around the world at our annual food festival. Members are encouraged to bring and share food from their home countries.', '2026-04-26 01:26:54', 'Cultural Food Festival'),
(21, 10, 'event', 'Join us for a group trip exploring the city’s key landmarks. A great way to meet people and get familiar with your new surroundings.', '2026-04-26 01:27:10', 'City Exploration Day'),
(22, 11, 'event', 'Take a break from your studies and join us for a guided mindfulness session. Designed to help reduce stress and improve focus.', '2026-04-26 01:27:45', 'Mindfulness & Meditation Session'),
(23, 11, 'announcement', 'We’ll be hosting a series of events focused on mental health awareness. Stay tuned for workshops, guest speakers, and support sessions.', '2026-04-26 01:28:01', 'Mental Health Awareness Week'),
(24, 11, 'event', 'A guest lecturer will explore the science behind motivation and how to apply it in everyday life. Open discussion to follow.', '2026-04-26 01:28:22', 'Understanding Motivation');

-- --------------------------------------------------------

--
-- Table structure for table `RSVP`
--

CREATE TABLE `RSVP` (
  `student_id` int NOT NULL,
  `post_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `RSVP`
--

INSERT INTO `RSVP` (`student_id`, `post_id`) VALUES
(14, 8),
(18, 8),
(7, 10),
(14, 10),
(7, 11),
(8, 11),
(8, 13),
(11, 13),
(18, 13),
(7, 16),
(9, 18),
(14, 18),
(9, 20),
(14, 20),
(18, 20),
(9, 21),
(9, 22),
(11, 22),
(14, 22),
(9, 24);

-- --------------------------------------------------------

--
-- Table structure for table `Society`
--

CREATE TABLE `Society` (
  `society_id` int NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `about_us_text` text,
  `logo_url` varchar(500) DEFAULT NULL,
  `name` varchar(255) NOT NULL DEFAULT 'Unnamed Society'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `Society`
--

INSERT INTO `Society` (`society_id`, `password`, `email`, `about_us_text`, `logo_url`, `name`) VALUES
(6, '$2b$10$EdIjbHDdwYpQAoCJnAPtjOes3RjKe6pn5PPaPA9siwvsMPj9C4vnO', 'arts@roehampton.ac.uk', 'The Creative Arts Society is a space for students who want to explore, create, and share their artistic passions in a supportive and collaborative environment. We welcome all forms of creativity—from painting and digital art to photography, writing, and performance.\r\n\r\nOur mission is to make art accessible to everyone, regardless of experience level. Whether you’re a beginner looking to try something new or an experienced artist wanting to showcase your work, this society provides the tools, community, and inspiration to help you grow.\r\n\r\nWe host weekly workshops, collaborative projects, exhibitions, and social events designed to connect creatives across campus. Above all, we believe creativity thrives when people feel safe to express themselves.', NULL, 'Creative Arts Society'),
(7, '$2b$10$kC3mJGvwFuW9mF6uO4hEq./Fl/sSXTqroDPTivKppLKL6VYqoehbm', 'tech@roehampton.ac.uk', 'The Tech & Innovation Society brings together students interested in technology, startups, and the future of digital innovation. Our community includes coders, designers, entrepreneurs, and anyone curious about how technology shapes the world.\r\n\r\nWe aim to bridge the gap between theory and practice by offering hands-on experiences through hackathons, coding workshops, startup pitch nights, and industry networking events.\r\n\r\nWhether you\'re building your first app, exploring AI, or looking to break into the tech industry, our society provides opportunities to learn, collaborate, and turn ideas into reality.', NULL, 'Tech & Innovation Society'),
(8, '$2b$10$5SfE/qUpp.Eik4tZEZgo0O/mmsaSS8yUrMZW5c5EytvWjKdohcfcu', 'sustainability@roehampton.ac.uk', 'The Sustainability & Impact Society is dedicated to creating a more environmentally and socially responsible campus community. We focus on raising awareness, driving action, and empowering students to make a positive difference.\r\n\r\nOur initiatives range from clean-up events and sustainability campaigns to panel discussions on climate change, ethical consumption, and corporate responsibility.\r\n\r\nWe believe that small actions can lead to meaningful change, and we encourage members to take part in projects that contribute to a more sustainable future—both on campus and beyond.', NULL, 'Sustainability & Impact Society'),
(9, '$2b$10$sfBSslr6OAaEx6Fh9YwM7OBbU6yfpHNoHiZDs9uZ6s0ehe1JF.yuG', 'esports@roehampton.ac.uk', 'The Gaming & Esports Society is a community for students who love gaming—whether casually or competitively. From console and PC games to tabletop and mobile gaming, we celebrate all forms of play.\r\n\r\nWe host regular tournaments, game nights, and esports competitions, as well as social events where members can connect and unwind.\r\n\r\nOur goal is to create an inclusive and fun environment where gamers of all skill levels can meet like-minded people, develop teamwork skills, and enjoy their favourite games together.', NULL, 'Gaming & Esports Society'),
(10, '$2b$10$rzky5HHTkLdbZ7c4gKMeveo3o.5t0HHHndpVf6hBFsboMH9Tcrgfm', 'international@roehampton.ac.uk', 'The International Students Society supports and celebrates the diverse cultural backgrounds of students from around the world. We aim to create a welcoming environment where international students can connect, share experiences, and feel at home.\r\n\r\nWe organise cultural events, social gatherings, and support sessions to help students navigate university life, build friendships, and explore new opportunities.\r\n\r\nWhether you’re new to the country or simply interested in different cultures, this society is a place to belong, learn, and grow together.', NULL, 'International Students Society'),
(11, '$2b$10$K7UbTQJuT96yjBibIkkC9OOR4dNsaivVmRuIFAWeLmAhyHCQsgHu.', 'psychology@roehampton.ac.uk', 'The Psychology & Wellbeing Society is focused on promoting mental health awareness and understanding human behaviour. We bring together students interested in psychology, self-development, and wellbeing.\r\n\r\nThrough workshops, guest speakers, and discussion groups, we explore topics such as stress management, motivation, relationships, and personal growth.\r\n\r\nOur goal is to create a supportive space where students can learn practical tools to improve their wellbeing while engaging in meaningful conversations about mental health.', NULL, 'Psychology & Wellbeing Society');

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
(7, '$2b$10$R.FH9cCRtqaHvdhEazCF9OTmZcnLu3dJL2/VmhRfajmavHh9nQ5kK', 'dylan@roehampton.ac.uk', 'Dylan', 'Moore'),
(8, '$2b$10$DBtuceX8FuozO0864Tk8c.CaeIMICBZf6GsD/pCr3qcQH2crMYUHi', 'lily@roehampton.ac.uk', 'Lily', 'James'),
(9, '$2b$10$hnilruF6YeNM4FebTD76tOFRdnE1HnprSrr74pnnSuJ4z5rj/kVmu', 'greg@roehampton.ac.uk', 'Greg', 'Mumble'),
(11, '$2b$10$AQo7vBZzEVK9vFAVazF45ubccOqjo72tLYTmxlMX7avL3IVAs24ea', 'hudson@roehampton.ac.uk', 'Hudson', 'Mckinsey'),
(12, '$2b$10$tyFM09POpRRSkKZbijW2He4XUeFLDVlCzgQrB2GZyjedBXSm.Bb8a', 'christian@roehampton.ac.uk', 'Christian', 'Levy'),
(13, '$2b$10$sUxzjPXnsgY9yT40kt40WuhvZ0CC2TbuPkqRaeee1HvoVQlIbNqoO', 'isabella@roehampton.ac.uk', 'Isabella', 'Laroza'),
(14, '$2b$10$7gTJ0xyRB4VMbPoHvQRMbehhYwBoZTEMKpsoCfOac6bDlCmpxivcC', 'verena@roehampton.ac.uk', 'Verena', 'Hofstra'),
(15, '$2b$10$tLWVqlMk4SD9NXKw7/KMducIfgQ.D1Sl0xFrNpCwfCcASZsnzjPsi', 'shawn@roehampton.ac.uk', 'Shawn', 'Mayor'),
(16, '$2b$10$HkkJx80w0FW2LjSCw75tX.Qa4XFWGFpdT/SaSzNID2xMDnx609Gs2', 'taco@roehampton.ac.uk', 'Taco', 'Tuesday'),
(17, '$2b$10$UAyPxn4YPVsaAImXWdrx7O2/JpWKAHRew5ORZaX9Q9lll0DWt6VhO', 'barney@roehampton.ac.uk', 'Barney', 'Stinson'),
(18, '$2b$10$pyu2CZv4SKPfoIf8.GC4wOK.Nuzl4Gzxki298Ey7tWONPG8CfJqUO', 'ted@roehampton.ac.uk', 'Ted', 'Mosby');

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
  ADD KEY `fk_rsvp_Post` (`post_id`);

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
  MODIFY `post_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `Society`
--
ALTER TABLE `Society`
  MODIFY `society_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `Student`
--
ALTER TABLE `Student`
  MODIFY `student_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

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
  ADD CONSTRAINT `fk_rsvp_Post` FOREIGN KEY (`post_id`) REFERENCES `Post` (`post_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_rsvp_student` FOREIGN KEY (`student_id`) REFERENCES `Student` (`student_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
