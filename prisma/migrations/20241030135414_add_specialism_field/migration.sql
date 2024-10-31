/*
  Warnings:

  - You are about to drop the column `githubUrl` on the `Profile` table. All the data in the column will be lost.
  - Made the column `bio` on table `Profile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Cohort" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "endDate" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "startDate" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "githubUrl",
ADD COLUMN     "githubUsername" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "mobile" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "profilePicture" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "username" TEXT NOT NULL DEFAULT E'',
ALTER COLUMN "firstName" SET DEFAULT E'',
ALTER COLUMN "lastName" SET DEFAULT E'',
ALTER COLUMN "bio" SET NOT NULL,
ALTER COLUMN "bio" SET DEFAULT E'';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "specialism" TEXT;
