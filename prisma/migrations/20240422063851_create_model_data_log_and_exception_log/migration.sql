-- CreateTable
CREATE TABLE "data_log" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "userId" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "data_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exception_log" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "stackTrace" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exception_log_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "data_log" ADD CONSTRAINT "data_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
