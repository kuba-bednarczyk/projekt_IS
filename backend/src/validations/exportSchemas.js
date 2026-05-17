const { z } = require("zod");
const exportSchema = z.object({
  cityId: z.coerce
    .number({
      message: "ID miasta musi być liczbą.",
    })
    .positive("ID miasta musi być dodatnią liczbą."),
  marketType: z
    .string({
      message: "Rynek jest wymagany.",
    })
    .refine((val) => ["pierwotny", "wtórny"].includes(val.toLowerCase()), {
      message: "Rynek musi być 'pierwotny' lub 'wtórny'.",
    })
    .transform((val) => val.toLowerCase()),
  priceType: z
    .string({
      message: "Typ ceny jest wymagany.",
    })
    .refine((val) => ["transakcyjne", "ofertowe"].includes(val.toLowerCase()), {
      message: "Nieznany typ ceny. Dostępne to: transakcyjne, ofertowe",
    })
    .transform((val) => val.toLowerCase()),
});
module.exports = {
  exportSchema,
};
