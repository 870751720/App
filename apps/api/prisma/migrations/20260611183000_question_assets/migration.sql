CREATE TABLE `question_assets` (
  `id` VARCHAR(191) NOT NULL,
  `userId` INTEGER NOT NULL,
  `sourceId` VARCHAR(191) NOT NULL,
  `fileName` VARCHAR(191) NOT NULL,
  `mimeType` VARCHAR(191) NOT NULL,
  `byteSize` INTEGER NOT NULL,
  `extractedText` TEXT NOT NULL,
  `status` ENUM('PENDING_REVIEW', 'OCR_TEXT_PROVIDED', 'TEXT_EXTRACTED', 'NEEDS_MANUAL_TEXT') NOT NULL,
  `createdAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `question_assets`
  ADD CONSTRAINT `question_assets_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `question_assets_sourceId_fkey`
  FOREIGN KEY (`sourceId`) REFERENCES `question_sources`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
