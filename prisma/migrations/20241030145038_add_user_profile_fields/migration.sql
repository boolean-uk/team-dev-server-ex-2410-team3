/*
  Warnings:

  - Made the column `specialism` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Profile" ALTER COLUMN "firstName" DROP DEFAULT,
ALTER COLUMN "lastName" DROP DEFAULT,
ALTER COLUMN "bio" DROP DEFAULT,
ALTER COLUMN "githubUsername" DROP DEFAULT,
ALTER COLUMN "mobile" DROP DEFAULT,
ALTER COLUMN "profilePicture" DROP DEFAULT,
ALTER COLUMN "username" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "specialism" SET NOT NULL;
