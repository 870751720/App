CREATE TABLE `users` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `role` ENUM('OWNER', 'ADMIN', 'USER') NOT NULL DEFAULT 'USER',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `users_email_key`(`email`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `knowledge_points` (
  `id` VARCHAR(191) NOT NULL,
  `subject` ENUM('CHINESE', 'MATH', 'ENGLISH', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY') NOT NULL,
  `chapter` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `parentId` VARCHAR(191) NULL,
  `examWeight` INTEGER NOT NULL,

  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `mastery_records` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `userId` INTEGER NOT NULL,
  `knowledgePointId` VARCHAR(191) NOT NULL,
  `level` ENUM('UNSTARTED', 'UNDERSTOOD', 'BASIC', 'STABLE') NOT NULL,
  `score` INTEGER NOT NULL,
  `attempts` INTEGER NOT NULL,
  `correctAttempts` INTEGER NOT NULL,
  `lastPracticedAt` DATETIME(3) NULL,

  UNIQUE INDEX `mastery_records_userId_knowledgePointId_key`(`userId`, `knowledgePointId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `question_sources` (
  `id` VARCHAR(191) NOT NULL,
  `userId` INTEGER NOT NULL,
  `type` ENUM('MANUAL', 'IMAGE_OCR', 'PDF_IMPORT', 'WEB_IMPORT', 'GAOKAO_PAPER', 'AI_GENERATED', 'MISTAKE_VARIANT') NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `provider` VARCHAR(191) NOT NULL,
  `licenseScope` ENUM('PERSONAL_ONLY', 'AUTHORIZED', 'PUBLIC_REFERENCE', 'AI_GENERATED') NOT NULL,
  `importedAt` DATETIME(3) NOT NULL,
  `note` VARCHAR(191) NOT NULL,

  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `questions` (
  `id` VARCHAR(191) NOT NULL,
  `sourceId` VARCHAR(191) NOT NULL,
  `subject` ENUM('CHINESE', 'MATH', 'ENGLISH', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY') NOT NULL,
  `type` ENUM('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'FILL_BLANK', 'CALCULATION', 'ESSAY', 'EXPERIMENT') NOT NULL,
  `difficulty` INTEGER NOT NULL,
  `stem` TEXT NOT NULL,
  `answer` TEXT NOT NULL,
  `analysis` TEXT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `question_knowledge_points` (
  `questionId` VARCHAR(191) NOT NULL,
  `knowledgePointId` VARCHAR(191) NOT NULL,

  PRIMARY KEY (`questionId`, `knowledgePointId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `mistakes` (
  `id` VARCHAR(191) NOT NULL,
  `userId` INTEGER NOT NULL,
  `questionId` VARCHAR(191) NOT NULL,
  `subject` ENUM('CHINESE', 'MATH', 'ENGLISH', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY') NOT NULL,
  `studentAnswer` TEXT NOT NULL,
  `scoreLost` DOUBLE NOT NULL,
  `causes` JSON NOT NULL,
  `diagnosis` TEXT NOT NULL,
  `nextRule` TEXT NOT NULL,
  `reviewStage` INTEGER NOT NULL,
  `createdAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `mistake_knowledge_points` (
  `mistakeId` VARCHAR(191) NOT NULL,
  `knowledgePointId` VARCHAR(191) NOT NULL,

  PRIMARY KEY (`mistakeId`, `knowledgePointId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `study_tasks` (
  `id` VARCHAR(191) NOT NULL,
  `userId` INTEGER NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `subject` ENUM('CHINESE', 'MATH', 'ENGLISH', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY') NOT NULL,
  `knowledgePointId` VARCHAR(191) NOT NULL,
  `minutes` INTEGER NOT NULL,
  `priority` INTEGER NOT NULL,
  `reason` TEXT NOT NULL,
  `status` ENUM('PENDING', 'DONE') NOT NULL,

  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `exam_records` (
  `id` VARCHAR(191) NOT NULL,
  `userId` INTEGER NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `takenAt` DATETIME(3) NOT NULL,
  `scores` JSON NOT NULL,
  `total` INTEGER NOT NULL,
  `summary` TEXT NOT NULL,

  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `knowledge_points`
  ADD CONSTRAINT `knowledge_points_parentId_fkey`
  FOREIGN KEY (`parentId`) REFERENCES `knowledge_points`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `mastery_records`
  ADD CONSTRAINT `mastery_records_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `mastery_records_knowledgePointId_fkey`
  FOREIGN KEY (`knowledgePointId`) REFERENCES `knowledge_points`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `question_sources`
  ADD CONSTRAINT `question_sources_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `questions`
  ADD CONSTRAINT `questions_sourceId_fkey`
  FOREIGN KEY (`sourceId`) REFERENCES `question_sources`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `question_knowledge_points`
  ADD CONSTRAINT `question_knowledge_points_questionId_fkey`
  FOREIGN KEY (`questionId`) REFERENCES `questions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `question_knowledge_points_knowledgePointId_fkey`
  FOREIGN KEY (`knowledgePointId`) REFERENCES `knowledge_points`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `mistakes`
  ADD CONSTRAINT `mistakes_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `mistakes_questionId_fkey`
  FOREIGN KEY (`questionId`) REFERENCES `questions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `mistake_knowledge_points`
  ADD CONSTRAINT `mistake_knowledge_points_mistakeId_fkey`
  FOREIGN KEY (`mistakeId`) REFERENCES `mistakes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `mistake_knowledge_points_knowledgePointId_fkey`
  FOREIGN KEY (`knowledgePointId`) REFERENCES `knowledge_points`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `study_tasks`
  ADD CONSTRAINT `study_tasks_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `exam_records`
  ADD CONSTRAINT `exam_records_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
