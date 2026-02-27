-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN "createdById" TEXT;

-- CreateIndex
CREATE INDEX "Tenant_createdById_idx" ON "Tenant"("createdById");

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
