const { z } = require("zod");

const userSchema = z.object({
  nickname: z
    .string({ invalid_type_error: "Nazwa użytkownika musi być tekstem." })
    .min(3, "Nazwa użytkownika musi mieć minimum 3 znaki.")
    .max(30, "Nazwa użytkownika może mieć maksymalnie 30 znaków.")
    .optional(),
    
  email: z
    .string({ invalid_type_error: "E-mail musi być tekstem." })
    .email("Podano niepoprawny format adresu e-mail.")
    .optional(),
    
  role: z
    .string()
    .transform((val) => val.toUpperCase())
    .pipe(z.enum(["USER", "ADMIN"]))
    .optional(),
    
  password: z
    .string({ invalid_type_error: "Hasło musi być tekstem." })
    .min(8, "Hasło jest za krótkie. Musi mieć minimum 8 znaków.")
    .max(72, "Hasło jest zbyt długie (max 72 znaki).")
    .optional(),
    
  profilePicture: z.string().nullish(),
});

module.exports = {
  userSchema,
};