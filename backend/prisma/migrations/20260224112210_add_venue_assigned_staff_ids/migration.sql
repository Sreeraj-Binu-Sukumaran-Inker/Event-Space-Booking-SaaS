-- AlterTable
ALTER TABLE "Venue" ADD COLUMN     "assignedStaffIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
