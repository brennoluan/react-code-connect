import { createRequire } from "module";
import path from "path";

const require = createRequire(import.meta.url);

const jsonServer = require("json-server");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const fs = require("fs");

const server = jsonServer.create();

// ========================================
// DATABASE
// ========================================

const dbPath = path.join(process.cwd(), "database.json");

// Criar database.json automaticamente
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(
    dbPath,
    JSON.stringify(
      {
        users: [],
        devs: [],
      },
      null,
      2,
    ),
  );

  console.log("📁 database.json criado automaticamente");
}

const router = jsonServer.router(dbPath);
const defaults = jsonServer.defaults;

// Garantir collections
const db = router.db;

if (!db.get("users").value()) {
  db.set("users", []).write();
}

if (!db.get("devs").value()) {
  db.set("devs", []).write();
}

// ========================================
// JWT
// ========================================

const ACCESS_TOKEN_SECRET = "seu-access-token-secret-super-secreto";

const REFRESH_TOKEN_SECRET = "seu-refresh-token-secret-ainda-mais-secreto";

// ========================================
// CORS
// ========================================

server.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");

  res.header("Access-Control-Allow-Credentials", "true");

  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  );

  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// ========================================
// MIDDLEWARES
// ========================================

server.use(defaults());
server.use(cookieParser());
server.use(jsonServer.bodyParser);

// ========================================
// LOGIN
// ========================================

server.post("/login", async (req, res) => {
  console.log("🔐 Custom login route hit");

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email e senha são obrigatórios",
    });
  }

  try {
    const bcrypt = require("bcryptjs");

    const user = db.get("users").find({ email }).value();

    if (!user) {
      console.log("❌ User not found:", email);

      return res.status(400).json({
        message: "Email ou senha incorretos",
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      console.log("❌ Invalid password");

      return res.status(400).json({
        message: "Email ou senha incorretos",
      });
    }

    console.log("✅ Login successful for:", email);

    const accessToken = jwt.sign(
      {
        sub: user.id.toString(),
        email: user.email,
      },
      ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      },
    );

    const refreshToken = jwt.sign(
      {
        userId: user.id.toString(),
      },
      REFRESH_TOKEN_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log("🍪 Refresh token cookie set");

    return res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || user.email.split("@")[0],
      },
    });
  } catch (error) {
    console.log("❌ Login error:", error);

    return res.status(500).json({
      message: "Erro ao fazer login",
    });
  }
});

// ========================================
// REGISTER
// ========================================

server.post("/register", async (req, res) => {
  console.log("📝 Custom register route hit");

  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({
      message: "Email, senha e nome são obrigatórios",
    });
  }

  try {
    const bcrypt = require("bcryptjs");

    // Verificar usuário existente
    const existingUser = db.get("users").find({ email }).value();

    if (existingUser) {
      console.log("❌ User already exists:", email);

      return res.status(400).json({
        message: "Usuário já cadastrado com este email",
      });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buscar usuários atuais
    let users = db.get("users").value();

    // Garantia extra
    if (!users) {
      db.set("users", []).write();
      users = [];
    }

    // Criar usuário
    const newUser = {
      id: users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1,

      email,
      password: hashedPassword,
      name,
    };

    // Salvar usuário
    db.get("users").push(newUser).write();

    // Forçar persistência
    await db.write();

    console.log("📁 Database saved");
    console.log("✅ User registered successfully:", email);

    // Gerar tokens
    const accessToken = jwt.sign(
      {
        sub: newUser.id.toString(),
        email: newUser.email,
      },
      ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      },
    );

    const refreshToken = jwt.sign(
      {
        userId: newUser.id.toString(),
      },
      REFRESH_TOKEN_SECRET,
      {
        expiresIn: "7d",
      },
    );

    // Cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log("🍪 Refresh token cookie set");

    return res.json({
      accessToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
    });
  } catch (error) {
    console.log("❌ Register error:", error);

    return res.status(500).json({
      message: "Erro ao criar conta",
    });
  }
});

// ========================================
// REFRESH TOKEN
// ========================================

server.post("/auth/refresh", (req, res) => {
  console.log("🔄 Refresh token request received");

  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    console.log("❌ Refresh token not found");

    return res.status(401).json({
      message: "Refresh token não encontrado",
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

    const user = db
      .get("users")
      .find({
        id: Number(decoded.userId),
      })
      .value();

    if (!user) {
      console.log("❌ User not found");

      return res.status(401).json({
        message: "Usuário não encontrado",
      });
    }

    const newAccessToken = jwt.sign(
      {
        sub: user.id.toString(),
        email: user.email,
      },
      ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      },
    );

    console.log("✅ New access token generated for:", user.email);

    return res.json({
      accessToken: newAccessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || user.email.split("@")[0],
      },
    });
  } catch (error) {
    console.log("❌ Refresh token error:", error);

    return res.status(401).json({
      message: "Refresh token inválido ou expirado",
    });
  }
});

// ========================================
// JSON SERVER ROUTES
// ========================================

server.db = db;

server.use(router);

// ========================================
// START SERVER
// ========================================

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`\n🚀 JSON Server with auth running at http://localhost:${PORT}`);

  console.log(`📡 CORS enabled for: http://localhost:5173`);

  console.log(`🍪 Cookies enabled with credentials`);

  console.log(`📁 Database file: ${dbPath}\n`);
});
