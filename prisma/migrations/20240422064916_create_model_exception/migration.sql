-- CreateTable
CREATE TABLE "exception_log" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "stackTrace" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exception_log_pkey" PRIMARY KEY ("id")
);
