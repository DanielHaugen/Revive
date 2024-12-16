-- DropForeignKey
ALTER TABLE "Step" DROP CONSTRAINT "Step_playbookId_fkey";

-- AddForeignKey
ALTER TABLE "Step" ADD CONSTRAINT "Step_playbookId_fkey" FOREIGN KEY ("playbookId") REFERENCES "Playbook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "Target" DROP CONSTRAINT "Target_stepId_fkey";

-- AddForeignKey
ALTER TABLE "Target" ADD CONSTRAINT "Target_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "Step"("id") ON DELETE CASCADE ON UPDATE CASCADE;
