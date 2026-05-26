const { z } = require("zod");
const exportSchema = z.object({
  cityId: z.coerce.number().positive().optional(),
  yearStart: z.coerce.number(),
  yearEnd: z.coerce.number(),
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
module.exports = {
  exportSchema,
};
