ALTER TABLE `knowledge_points`
  MODIFY `subject` ENUM('CHINESE', 'MATH', 'ENGLISH', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY', 'GEOGRAPHY') NOT NULL;

ALTER TABLE `questions`
  MODIFY `subject` ENUM('CHINESE', 'MATH', 'ENGLISH', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY', 'GEOGRAPHY') NOT NULL;

ALTER TABLE `mistakes`
  MODIFY `subject` ENUM('CHINESE', 'MATH', 'ENGLISH', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY', 'GEOGRAPHY') NOT NULL;

ALTER TABLE `study_tasks`
  MODIFY `subject` ENUM('CHINESE', 'MATH', 'ENGLISH', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY', 'GEOGRAPHY') NOT NULL;

UPDATE `knowledge_points`
SET
  `id` = 'geography-climate',
  `subject` = 'GEOGRAPHY',
  `chapter` = '自然地理',
  `name` = '气候类型与区域特征'
WHERE `id` = 'biology-genetics';

UPDATE `knowledge_points`
SET `subject` = 'GEOGRAPHY'
WHERE `subject` = 'BIOLOGY';

UPDATE `questions`
SET `subject` = 'GEOGRAPHY'
WHERE `subject` = 'BIOLOGY';

UPDATE `mistakes`
SET `subject` = 'GEOGRAPHY'
WHERE `subject` = 'BIOLOGY';

UPDATE `study_tasks`
SET `subject` = 'GEOGRAPHY'
WHERE `subject` = 'BIOLOGY';

UPDATE `exam_records`
SET `scores` = JSON_SET(
  JSON_REMOVE(`scores`, '$.biology'),
  '$.geography',
  CAST(JSON_UNQUOTE(JSON_EXTRACT(`scores`, '$.biology')) AS UNSIGNED)
)
WHERE JSON_EXTRACT(`scores`, '$.biology') IS NOT NULL;

ALTER TABLE `knowledge_points`
  MODIFY `subject` ENUM('CHINESE', 'MATH', 'ENGLISH', 'PHYSICS', 'CHEMISTRY', 'GEOGRAPHY') NOT NULL;

ALTER TABLE `questions`
  MODIFY `subject` ENUM('CHINESE', 'MATH', 'ENGLISH', 'PHYSICS', 'CHEMISTRY', 'GEOGRAPHY') NOT NULL;

ALTER TABLE `mistakes`
  MODIFY `subject` ENUM('CHINESE', 'MATH', 'ENGLISH', 'PHYSICS', 'CHEMISTRY', 'GEOGRAPHY') NOT NULL;

ALTER TABLE `study_tasks`
  MODIFY `subject` ENUM('CHINESE', 'MATH', 'ENGLISH', 'PHYSICS', 'CHEMISTRY', 'GEOGRAPHY') NOT NULL;
