-- DropForeignKey
ALTER TABLE "public"."Call" DROP CONSTRAINT "Call_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Call_Service" DROP CONSTRAINT "Call_Service_call_id_fkey";

-- AddForeignKey
ALTER TABLE "Call" ADD CONSTRAINT "Call_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Call_Service" ADD CONSTRAINT "Call_Service_call_id_fkey" FOREIGN KEY ("call_id") REFERENCES "Call"("id") ON DELETE CASCADE ON UPDATE CASCADE;
