-- CreateTable
CREATE TABLE "Session" (
    "id" UUID NOT NULL,
    "clubber" TEXT NOT NULL,
    "expiryTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);
