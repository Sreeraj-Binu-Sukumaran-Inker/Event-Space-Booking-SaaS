-- AlterTable
ALTER TABLE "Venue" ADD COLUMN     "eventTypes" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "VenueFacility" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "venueId" TEXT NOT NULL,

    CONSTRAINT "VenueFacility_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VenueFacility_venueId_idx" ON "VenueFacility"("venueId");

-- AddForeignKey
ALTER TABLE "VenueFacility" ADD CONSTRAINT "VenueFacility_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
