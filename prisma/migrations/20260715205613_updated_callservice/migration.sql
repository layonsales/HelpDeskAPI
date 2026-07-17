/*
  Warnings:

  - A unique constraint covering the columns `[call_id,service_id]` on the table `Call_Service` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Call_Service_call_id_service_id_key" ON "Call_Service"("call_id", "service_id");
