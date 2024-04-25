-- CreateTable
CREATE TABLE "favotite_comic" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "comicId" INTEGER NOT NULL,

    CONSTRAINT "favotite_comic_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "favotite_comic" ADD CONSTRAINT "favotite_comic_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favotite_comic" ADD CONSTRAINT "favotite_comic_comicId_fkey" FOREIGN KEY ("comicId") REFERENCES "comic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
