/*
  Warnings:

  - A unique constraint covering the columns `[period_id,user_id]` on the table `History` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "History_period_id_user_id_key" ON "History"("period_id", "user_id");
