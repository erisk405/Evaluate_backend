-- AlterTable
ALTER TABLE "Period" ADD COLUMN     "backUp" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "isAction" SET DEFAULT false;
