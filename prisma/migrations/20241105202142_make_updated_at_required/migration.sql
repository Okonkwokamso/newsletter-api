/*
  Warnings:

  - Made the column `updatedAt` on table `Newsletter` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Newsletter" ALTER COLUMN "updatedAt" SET NOT NULL;
