const { z } = require("zod");
const userSchema = z.object({
  nickname: z.string().min(3).max(30).optional(),
  email: z.string().email().optional(),
  role: z
    .string()
    .transform((val) => val.toUpperCase())
    .pipe(z.enum(["USER", "ADMIN"]))
    .optional(),
  password: z.string().min(8).max(72).optional(),
  profilePicture: z.string().base64().nullish(),
  //jak profile picture nie dziala to zmienic base64() na url()
});
module.exports = {
  userSchema,
};
