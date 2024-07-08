-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_headOfDepartment_id_fkey" FOREIGN KEY ("headOfDepartment_id") REFERENCES "User"("uid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_deputyDirector_id_fkey" FOREIGN KEY ("deputyDirector_id") REFERENCES "User"("uid") ON DELETE SET NULL ON UPDATE CASCADE;
