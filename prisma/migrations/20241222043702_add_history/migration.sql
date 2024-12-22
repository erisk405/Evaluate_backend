/*
  Warnings:

  - The primary key for the `HistoryDetail` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `history_detail_id` on the `HistoryDetail` table. All the data in the column will be lost.
  - You are about to drop the column `question` on the `HistoryDetail` table. All the data in the column will be lost.
  - You are about to drop the `HistoryScore` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `total_SD` to the `History` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_mean` to the `History` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `HistoryDetail` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `level` to the `HistoryDetail` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "HistoryScore" DROP CONSTRAINT "HistoryScore_history_detail_id_fkey";

-- AlterTable
ALTER TABLE "History" ADD COLUMN     "total_SD" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "total_mean" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "HistoryDetail" DROP CONSTRAINT "HistoryDetail_pkey",
DROP COLUMN "history_detail_id",
DROP COLUMN "question",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "level" "VisionFormLevel" NOT NULL,
ADD CONSTRAINT "HistoryDetail_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "HistoryScore";

-- CreateTable
CREATE TABLE "HistoryQuestionScore" (
    "id" TEXT NOT NULL,
    "history_detail_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "type_name" TEXT NOT NULL,
    "mean" DOUBLE PRECISION NOT NULL,
    "SD" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "HistoryQuestionScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoryFormScore" (
    "id" TEXT NOT NULL,
    "history_detail_id" TEXT NOT NULL,
    "type_name" TEXT NOT NULL,
    "total_SD_per_type" DOUBLE PRECISION NOT NULL,
    "total_mean_per_type" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "HistoryFormScore_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HistoryQuestionScore" ADD CONSTRAINT "HistoryQuestionScore_history_detail_id_fkey" FOREIGN KEY ("history_detail_id") REFERENCES "HistoryDetail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoryFormScore" ADD CONSTRAINT "HistoryFormScore_history_detail_id_fkey" FOREIGN KEY ("history_detail_id") REFERENCES "HistoryDetail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
