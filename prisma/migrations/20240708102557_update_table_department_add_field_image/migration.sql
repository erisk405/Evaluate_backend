-- AlterTable
ALTER TABLE "Department" ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "image" DROP NOT NULL,
ALTER COLUMN "image" DROP DEFAULT;
