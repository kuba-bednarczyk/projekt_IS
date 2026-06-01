const request = require("supertest");
const express = require("express");
const prisma = require("../config/db");
const userRoutes = require("../routes/userRoutes");

jest.mock("../config/db", () => ({
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
    findFirst: jest.fn(),
  },
}));
jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hash_secret_hash"),
}));

jest.mock("../validations/userSchemas", () => ({
  userSchema: {
    safeParse: (data) => ({ success: true, data }),
    partial: () => ({
      safeParse: (data) => ({ success: true, data }),
    }),
  },
}));

jest.mock("../middleware/auth", () => ({
  verifyToken: (req, res, next) => {
    req.user = { id: 999, role: "ADMIN" };
    next();
  },
  requireOwnerOrAdmin: (req, res, next) => next(),
  requireRole: () => (req, res, next) => next(),
}));

const app = express();
app.use(express.json());
app.use("/users", userRoutes);

// Grupa testów GET
describe("Użytkownicy - Endpointy GET", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("GET /users powinien zwrócić 200 i listę użytkowników", async () => {
    prisma.user.findMany.mockResolvedValue([
      { id: 1, nickname: "Admin", role: "ADMIN" },
      { id: 2, nickname: "ZwyklyUser", role: "USER" },
    ]);

    const response = await request(app).get("/users");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.length).toBe(2);
    expect(response.body.data[0].nickname).toBe("Admin");
  });

  test("GET /users/:id powinien zwrócić 200 i dane pojedynczego użytkownika", async () => {
    prisma.user.findUnique.mockResolvedValue({
      nickname: "TestUser",
      email: "test@example.com",
      role: "USER",
      createdAt: new Date().toISOString(),
    });

    const response = await request(app).get("/users/1");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.nickname).toBe("TestUser");
  });

  test("GET /users/:id/picture powinien zwrócić 200 i zdjęcie profilowe w formacie base64", async () => {
    const fakeImageBuffer = Buffer.from("iVBORw0KGgoAAA", "base64");

    prisma.user.findUnique.mockResolvedValue({
      profilePicture: fakeImageBuffer,
    });

    const response = await request(app).get("/users/1/picture");

    expect(response.status).toBe(200);
    expect(response.body.profilePicture).toContain(
      "data:image/png;base64,iVBORw0KGgo",
    );
  });
});
// Grupa testów POST
describe("Użytkownicy - Endpointy POST", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("POST /users powinien zwrócić 201 i utworzyć użytkownika", async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    prisma.user.create.mockResolvedValue({
      id: 3,
      nickname: "NowyUser",
      email: "nowy@example.com",
      role: "USER",
    });

    const response = await request(app).post("/users").send({
      email: "nowy@example.com",
      password: "123",
      nickname: "NowyUser",
      role: "USER",
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.nickname).toBe("NowyUser");
  });
});
// Grupa testów DELETE
describe("Użytkownicy - Endpoint DELETE", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("DELETE /users/:id powinien zwrócić 200 i usunąć użytkownika", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      nickname: "DoUsuniecia",
    });
    prisma.user.delete.mockResolvedValue({});

    const response = await request(app).delete("/users/1");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Użytkownik został usunięty");
  });
});
// Grupa testowa patch
describe("Użytkownicy - Endpoint PATCH", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("PATCH /users/:id powinien zwrócić 200 i zaktualizować dane użytkownika", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 1, nickname: "StaryNick" });

    prisma.user.findFirst.mockResolvedValue(null);

    prisma.user.update.mockResolvedValue({
      id: 1,
      nickname: "ZaktualizowanyNick",
      email: "test@example.com",
      role: "USER",
    });

    const response = await request(app)
      .patch("/users/1")
      .send({ nickname: "ZaktualizowanyNick" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.nickname).toBe("ZaktualizowanyNick");
  });
});
