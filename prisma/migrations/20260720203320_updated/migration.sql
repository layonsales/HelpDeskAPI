-- DropForeignKey
ALTER TABLE "public"."Call_Service" DROP CONSTRAINT "Call_Service_added_by_fkey";

-- AlterTable
ALTER TABLE "Call_Service" ALTER COLUMN "added_by" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Call_Service" ADD CONSTRAINT "Call_Service_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "Technical"("id") ON DELETE SET NULL ON UPDATE CASCADE;
