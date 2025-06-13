/*
  Warnings:

  - A unique constraint covering the columns `[storeUrl]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "User_storeUrl_key" ON "User"("storeUrl");
