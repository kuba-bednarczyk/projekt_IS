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
const marketCategorySchema = z.object({
  pozycja: forceArray(pozycjaSchema),
});
const kwartalSchema = z.object({
  "@_id": z.string(),
  pierwotny_ofertowe: marketCategorySchema,
  wtorny_ofertowe: marketCategorySchema,
  pierwotny_transakcyjne: marketCategorySchema,
  wtorny_transakcyjne: marketCategorySchema,
});
//aby dodac limit na ilosc w zod odkomentowac - limit jest tylko w obszarze 1 kwartalu
// jezeli chcemy wiecej to bedzie wild ride 🦽
//   .refine(
//     (data) => {
//       const len1 = data.pierwotny_ofertowe?.pozycja?.length || 0;
//       const len2 = data.wtorny_ofertowe?.pozycja?.length || 0;
//       const len3 = data.pierwotny_transakcyjne?.pozycja?.length || 0;
//       const len4 = data.wtorny_transakcyjne?.pozycja?.length || 0;
//       return len1 === len2 && len1 === len3 && len1 === len4;
//     },
//     {
//       path: ["Kwartal"],
//     },
//   );
const pricesSchema = z.object({
  ceny_mieszkan: z.object({
    Kwartal: forceArray(kwartalSchema),
  }),
});
const ratesSchema = z.object({});
module.exports = {
  pricesSchema,
  ratesSchema,
};
