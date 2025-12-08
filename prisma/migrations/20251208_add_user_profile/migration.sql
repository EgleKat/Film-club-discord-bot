-- CreateTable
CREATE TABLE "UserProfile" (
    "username" TEXT NOT NULL,
    "imageUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("username")
);
