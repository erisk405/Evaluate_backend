/*
  Warnings:

  - A unique constraint covering the columns `[userId,roleId]` on the table `RoleRequest` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RoleRequest_userId_roleId_key" ON "RoleRequest"("userId", "roleId");
