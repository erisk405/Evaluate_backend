/*
  Warnings:

  - A unique constraint covering the columns `[content]` on the table `FormQuestion` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FormQuestion_content_key" ON "FormQuestion"("content");
