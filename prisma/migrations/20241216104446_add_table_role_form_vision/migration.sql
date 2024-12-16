-- CreateEnum
CREATE TYPE "VisionFormLevel" AS ENUM ('VISION_1', 'VISION_2');

-- CreateTable
CREATE TABLE "RoleFormVision" (
    "role_form_id" TEXT NOT NULL,
    "form_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "level" "VisionFormLevel" NOT NULL,

    CONSTRAINT "RoleFormVision_pkey" PRIMARY KEY ("role_form_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoleFormVision_form_id_role_id_key" ON "RoleFormVision"("form_id", "role_id");

-- AddForeignKey
ALTER TABLE "RoleFormVision" ADD CONSTRAINT "RoleFormVision_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "Form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleFormVision" ADD CONSTRAINT "RoleFormVision_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
