-- CreateTable
CREATE TABLE "Evaluate" (
    "id" TEXT NOT NULL,
    "evaluates_uid" TEXT NOT NULL,
    "evaluated_uid" TEXT NOT NULL,
    "form_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evaluate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Form" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Form_question" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "form_id" TEXT NOT NULL,
    "question_type_id" TEXT NOT NULL,

    CONSTRAINT "Form_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question_type" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "Question_type_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Form_name_key" ON "Form"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Form_question_name_key" ON "Form_question"("name");

-- AddForeignKey
ALTER TABLE "Evaluate" ADD CONSTRAINT "Evaluate_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "Form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluate" ADD CONSTRAINT "Evaluate_evaluates_uid_fkey" FOREIGN KEY ("evaluates_uid") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluate" ADD CONSTRAINT "Evaluate_evaluated_uid_fkey" FOREIGN KEY ("evaluated_uid") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Form_question" ADD CONSTRAINT "Form_question_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "Form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Form_question" ADD CONSTRAINT "Form_question_question_type_id_fkey" FOREIGN KEY ("question_type_id") REFERENCES "Question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
