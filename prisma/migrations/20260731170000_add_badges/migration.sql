-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "productIds" TEXT NOT NULL,
    "position" TEXT NOT NULL DEFAULT 'top-left',
    "backgroundColor" TEXT NOT NULL DEFAULT '#111827',
    "textColor" TEXT NOT NULL DEFAULT '#ffffff',
    "fontSize" INTEGER NOT NULL DEFAULT 14,
    "borderRadius" INTEGER NOT NULL DEFAULT 6,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Badge_shop_idx" ON "Badge"("shop");
