/*
  Warnings:

  - A unique constraint covering the columns `[customDomain]` on the table `Tenant` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "activeLayout" TEXT NOT NULL DEFAULT 'BASIC',
ADD COLUMN     "customDomain" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_customDomain_key" ON "Tenant"("customDomain");
