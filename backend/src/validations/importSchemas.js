const { z } = require("zod");
const forceArray = (schema) => {
  return z.union([z.array(schema), schema]).transform((val) => {
    return Array.isArray(val) ? val : [val];
  });
};
const pozycjaSchema = z.object({
  "@_id": z.string(),
  "@_cena": z.string().regex(/^\d+(?:,\d+)?$/), //numer w stringu z przecinkiem np 4881,00
});
const rateItemSchema = z.object({
  "@_id": z.string(),
  "@_oprocentowanie": z.string().regex(/^\d+(?:,\d+)?$/),
});
const marketCategorySchema = z.object({
  pozycja: forceArray(pozycjaSchema),
});
const pozycjeGroupSchema = z.object({
  "@_obowiazuje_od": z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  pozycja: forceArray(rateItemSchema),
});
const kwartalSchema = z.object({
  "@_id": z.string(),
  pierwotny_ofertowe: marketCategorySchema,
  wtorny_ofertowe: marketCategorySchema,
  pierwotny_transakcyjne: marketCategorySchema,
  wtorny_transakcyjne: marketCategorySchema,
});
const pricesSchema = z
  .object({
    ceny_mieszkan: z.object({
      Kwartal: forceArray(kwartalSchema),
    }),
  })
  .superRefine((data, e) => {
    const kwartals = data.ceny_mieszkan.Kwartal;
    if (!kwartals || kwartals.length === 0) return;
    const globalBaseline = kwartals[0].pierwotny_ofertowe?.pozycja?.length || 0;
    kwartals.forEach((kwartal, kIndex) => {
      const categoriesToCheck = [
        { name: "pierwotny_ofertowe", data: kwartal.pierwotny_ofertowe },
        { name: "wtorny_ofertowe", data: kwartal.wtorny_ofertowe },
        {
          name: "pierwotny_transakcyjne",
          data: kwartal.pierwotny_transakcyjne,
        },
        { name: "wtorny_transakcyjne", data: kwartal.wtorny_transakcyjne },
      ];
      categoriesToCheck.forEach((category) => {
        const currentLength = category.data?.pozycja?.length || 0;
        if (currentLength !== globalBaseline) {
          e.addIssue({
            message: "Incoherent file",
            path: ["ceny_mieszkan", "Kwartal", kIndex, category.name],
          });
        }
      });
    });
  });
const ratesSchema = z.object({
  stopy_procentowe_archiwum: z.object({
    pozycje: forceArray(pozycjeGroupSchema),
  }),
});
module.exports = {
  pricesSchema,
  ratesSchema,
};
