const { z } = require("zod");

// /prices
const pricesSchema = z.object({
  ystart: z.coerce
    .number()
    .min(2014, "Rok początkowy musi być >= 2014.")
    .max(2026, "Rok początkowy nie może przekroczyć 2026.")
    .optional(),
  qstart: z.coerce
    .number()
    .min(1, "Kwartał musi wynosić od 1 do 4.")
    .max(4, "Kwartał musi wynosić od 1 do 4.")
    .default(1),

  yend: z.coerce
    .number()
    .min(2014, "Rok końcowy musi być >= 2014.")
    .max(2026, "Rok końcowy nie może przekroczyć 2026.")
    .optional(),

  qend: z.coerce
    .number()
    .min(1, "Kwartał musi wynosić od 1 do 4.")
    .max(4, "Kwartał musi wynosić od 1 do 4.")
    .default(4),

  marketType: z
    .string({
      message: "Rynek jest wymagany.",
    })
    .refine((val) => ["pierwotny", "wtórny"].includes(val.toLowerCase()), {
      message: "Rynek musi być 'pierwotny' lub 'wtórny'.",
    })
    .transform((val) => val.toLowerCase())
    .optional(),
  priceType: z
    .string({
      message: "Typ ceny jest wymagany.",
    })
    .refine((val) => ["transakcyjne", "ofertowe"].includes(val.toLowerCase()), {
      message: "Nieznany typ ceny. Dostępne to: transakcyjne, ofertowe",
    })
    .transform((val) => val.toLowerCase())
    .optional(),
});

// /rates
const ratesSchema = z.object({
  ystart: z.coerce
    .number()
    .min(2014, "Rok początkowy musi być >= 2014.")
    .max(2026, "Rok początkowy nie może przekroczyć 2026.")
    .optional(),

  mstart: z.coerce
    .number()
    .min(1, "Miesiąc początkowy musi być od 1 do 12.")
    .max(12, "Miesiąc początkowy musi być od 1 do 12.")
    .default(1),

  yend: z.coerce
    .number()
    .min(2014, "Rok końcowy musi być >= 2014.")
    .max(2026, "Rok końcowy nie może przekroczyć 2026.")
    .optional(),

  mend: z.coerce
    .number()
    .min(1, "Miesiąc końcowy musi być od 1 do 12.")
    .max(12, "Miesiąc końcowy musi być od 1 do 12.")
    .default(12),
});

// /calculator
const calculatorSchema = z.object({
  cityId: z.coerce
    .number({
      message: "ID miasta musi być liczbą.",
    })
    .positive("ID miasta musi być dodatnią liczbą."),

  year: z.coerce
    .number({
      message: "Rok musi być liczbą.",
    })
    .min(2014, "Rok musi być większy niż 2013.")
    .max(2026, "Rok nie może być większy niż 2026."),

  quarter: z.coerce
    .number()
    .min(1, "Kwartał musi wynosić od 1 do 4.")
    .max(4, "Kwartał musi wynosić od 1 do 4.")
    .default(1),

  area: z.coerce
    .number({
      message: "Powierzchnia mieszkania musi być liczbą.",
    })
    .positive("Powierzchnia mieszkania musi być większa od zera."),

  years: z.coerce
    .number({
      message: "Lata kredytu muszą być liczbą.",
    })
    .min(1, "Okres kredytowania to minimum 1 rok.")
    .max(40, "Okres kredytowania to maksimum 40 lat."),
  marketType: z
    .string({
      message: "Rynek jest wymagany.",
    })
    .refine((val) => ["pierwotny", "wtórny"].includes(val.toLowerCase()), {
      message: "Rynek musi być 'pierwotny' lub 'wtórny'.",
    })
    .transform((val) => val.toLowerCase()),
});
module.exports = {
  pricesSchema,
  ratesSchema,
  calculatorSchema,
};
