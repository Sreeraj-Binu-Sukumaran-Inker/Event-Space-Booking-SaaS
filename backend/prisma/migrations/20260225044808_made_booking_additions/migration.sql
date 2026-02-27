-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "VenueImage" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Booking_createdById_idx" ON "Booking"("createdById");

-- AddForeignKey
ALTER TABLE "VenueImage" ADD CONSTRAINT "VenueImage_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
