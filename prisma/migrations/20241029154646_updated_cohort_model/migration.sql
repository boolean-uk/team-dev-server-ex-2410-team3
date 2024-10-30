/*
  Warnings:

  - Added the required column `endDate` to the `Cohort` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Cohort` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Cohort` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_cohortId_fkey";

-- AlterTable
ALTER TABLE "Cohort" ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "_CohortToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CohortToUser_AB_unique" ON "_CohortToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_CohortToUser_B_index" ON "_CohortToUser"("B");

-- AddForeignKey
ALTER TABLE "_CohortToUser" ADD CONSTRAINT "_CohortToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Cohort"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CohortToUser" ADD CONSTRAINT "_CohortToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
