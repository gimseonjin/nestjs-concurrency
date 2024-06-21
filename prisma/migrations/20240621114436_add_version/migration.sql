-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_stocks" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_stocks" ("id", "productId", "quantity") SELECT "id", "productId", "quantity" FROM "stocks";
DROP TABLE "stocks";
ALTER TABLE "new_stocks" RENAME TO "stocks";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
