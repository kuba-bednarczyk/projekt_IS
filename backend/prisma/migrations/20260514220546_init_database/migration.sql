-- CreateTable
CREATE TABLE "City" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HousingPrice" (
    "id" SERIAL NOT NULL,
    "cityId" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "quarter" INTEGER NOT NULL,
    "marketType" TEXT NOT NULL,
    "priceType" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "HousingPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterestRate" (
    "id" SERIAL NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "rateType" TEXT NOT NULL,
    "rateValue" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "InterestRate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "City_name_key" ON "City"("name");

-- CreateIndex
CREATE INDEX "HousingPrice_year_quarter_idx" ON "HousingPrice"("year", "quarter");

-- CreateIndex
CREATE INDEX "InterestRate_validFrom_idx" ON "InterestRate"("validFrom");

-- AddForeignKey
ALTER TABLE "HousingPrice" ADD CONSTRAINT "HousingPrice_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;
