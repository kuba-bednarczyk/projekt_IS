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
    .string()
    .transform((val) => val.toLowerCase())
    .pipe(
      z.enum(["pierwotny", "wtórny"], {
        errorMap: () => ({
          message: "Nieznany rynek. Dostępne to: pierwotny, wtórny",
        }),
      }),
    )
    .optional(),
  priceType: z
    .string()
    .transform((val) => val.toLowerCase())
    .pipe(
      z.enum(["transakcyjne", "ofertowe"], {
        errorMap: () => ({
          message: "Nieznany typ ceny. Dostępne to: transakcyjne, ofertowe",
        }),
      }),
    )
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
    .number({ invalid_type_error: "ID miasta musi być podane jako liczba." })
    .positive("ID miasta musi być dodatnią liczbą."),

  year: z.coerce
    .number({ invalid_type_error: "Rok musi być podany jako liczba." })
    .min(2014, "Rok musi być większy niż 2013.")
    .max(2026, "Rok nie może być większy niż 2026."),

  quarter: z.coerce
    .number()
    .min(1, "Kwartał musi wynosić od 1 do 4.")
    .max(4, "Kwartał musi wynosić od 1 do 4.")
    .default(1),

  area: z.coerce
    .number({ invalid_type_error: "Podaj poprawną powierzchnię." })
    .positive("Powierzchnia mieszkania musi być większa od zera."),

  years: z.coerce
    .number({ invalid_type_error: "Podaj poprawne lata kredytu." })
    .min(1, "Okres kredytowania to minimum 1 rok.")
    .max(40, "Okres kredytowania to maksimum 40 lat."),
  marketType: z
    .string()
    .transform((val) => val.toLowerCase())
    .pipe(
      z.enum(["pierwotny", "wtórny"], {
        errorMap: () => ({
          message: "Rynek musi być 'pierwotny' lub 'wtórny'.",
        }),
      }),
    ),
});
module.exports = {
  pricesSchema,
  ratesSchema,
  calculatorSchema,
};
