const { z } = require("zod");

// /prices
const pricesSchema = z.object({
  ystart: z.coerce.number().min(2014).max(2026).optional(),
  qstart: z.coerce.number().min(1).max(4).default(1),

  yend: z.coerce.number().min(2014).max(2026).optional(),

  qend: z.coerce.number().min(1).max(4).default(4),

  marketType: z
    .string()
    .transform((val) => val.toLowerCase())
    .pipe(z.enum(["pierwotny", "wtórny"]))
    .optional(),
  priceType: z
    .string()
    .transform((val) => val.toLowerCase())
    .pipe(z.enum(["transakcyjne", "ofertowe"]))
    .optional(),
});

// /rates
const ratesSchema = z.object({
  ystart: z.coerce.number().min(2014).max(2026).optional(),

  mstart: z.coerce.number().min(1).max(12).default(1),

  yend: z.coerce.number().min(2014).max(2026).optional(),

  mend: z.coerce.number().min(1).max(12).default(12),
});

// /calculator
const calculatorSchema = z.object({
  cityId: z.coerce.number().positive(),

  year: z.coerce.number().min(2014).max(2026),

  quarter: z.coerce.number().min(1).max(4).default(1),

  area: z.coerce.number().positive(),

  years: z.coerce.number().min(1).max(40),
  marketType: z
    .string()
    .transform((val) => val.toLowerCase())
    .pipe(z.enum(["pierwotny", "wtórny"])),
});
module.exports = {
  pricesSchema,
  ratesSchema,
  calculatorSchema,
};
