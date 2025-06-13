-- AlterTable
ALTER TABLE "User" ADD COLUMN     "businessCategory" TEXT,
ADD COLUMN     "businessName" TEXT,
ADD COLUMN     "phoneNo" TEXT,
ADD COLUMN     "physicalStore" BOOLEAN,
ADD COLUMN     "resetPasswordExpiresAt" TIMESTAMP(3),
ADD COLUMN     "resetPasswordToken" TEXT,
ADD COLUMN     "storeUrl" TEXT,
ADD COLUMN     "verificationExpiresAt" TIMESTAMP(3),
ADD COLUMN     "verificationToken" TEXT,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;
