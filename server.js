import { createRequire } from "module";
const require = createRequire(import.meta.url);

const jsonServer = require("json-server");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const server = jsonServer.create();
const router = jsonServer.router("database.json");
const defaults = jsonServer.defaults();

// Secrets para JWT
const ACCESS_TOKEN_SECRET = "seu-access-token-secret-super-secreto";
const REFRESH_TOKEN_SECRET = "seu-refresh-token-secret-ainda-mais-secreto";

// Note: Permissões gerenciadas manualmente nas rotas customizadas

// CORS deve vir PRIMEIRO, antes de qualquer outro middleware
server.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Set-Cookie"],
  }),
);

// Adicionar headers CORS manualmente para garantir
server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  );
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Tratar preflight OPTIONS requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// Agora sim os outros middlewares
server.use(defaults);
server.use(cookieParser());
server.use(jsonServer.bodyParser);

// Rota customizada de login - SUBSTITUI a padrão do json-server-auth
server.post("/login", async (req, res) => {
  console.log("🔐 Custom login route hit");
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email e senha são obrigatórios" });
  }

  try {
    const bcrypt = require("bcryptjs");
    const db = router.db;

    // Buscar usuário
    const user = db.get("users").find({ email }).value();

    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(400).json({ message: "Email ou senha incorretos" });
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      console.log("❌ Invalid password");
      return res.status(400).json({ message: "Email ou senha incorretos" });
    }

    console.log("✅ Login successful for:", email);

    // Gerar tokens
    const accessToken = jwt.sign(
      { sub: user.id.toString(), email: user.email },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      { userId: user.id.toString() },
      REFRESH_TOKEN_SECRET,
      {
        expiresIn: "7d",
      },
    );

    // Definir cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log("🍪 Refresh token cookie set");

    // Retornar resposta
    return res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || user.email.split("@")[0],
      },
    });
  } catch (error) {
    console.log("❌ Login error:", error.message);
    return res.status(500).json({ message: "Erro ao fazer login" });
  }
});

// Rota customizada de registro
server.post("/register", async (req, res) => {
  console.log("📝 Custom register route hit");
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res
      .status(400)
      .json({ message: "Email, senha e nome são obrigatórios" });
  }

  try {
    const bcrypt = require("bcryptjs");
    const db = router.db;

    // Verificar se usuário já existe
    const existingUser = db.get("users").find({ email }).value();

    if (existingUser) {
      console.log("❌ User already exists:", email);
      return res
        .status(400)
        .json({ message: "Usuário já cadastrado com este email" });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar novo usuário
    const newUser = {
      id: db.get("users").size().value() + 1,
      email,
      password: hashedPassword,
      name,
    };

    // Salvar no banco
    db.get("users").push(newUser).write();

    console.log("✅ User registered successfully:", email);

    // Gerar tokens (auto-login após registro)
    const accessToken = jwt.sign(
      { sub: newUser.id.toString(), email: newUser.email },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      { userId: newUser.id.toString() },
      REFRESH_TOKEN_SECRET,
      {
        expiresIn: "7d",
      },
    );

    // Definir cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log("🍪 Refresh token cookie set for new user");

    // Retornar resposta
    return res.json({
      accessToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
    });
  } catch (error) {
    console.log("❌ Register error:", error.message);
    return res.status(500).json({ message: "Erro ao criar conta" });
  }
});

// Rota de refresh ANTES do auth.rewriter
server.post("/auth/refresh", (req, res) => {
  console.log("🔄 Refresh token request received");
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    console.log("❌ Refresh token not found in cookies");
    return res.status(401).json({ message: "Refresh token não encontrado" });
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    console.log("✅ Refresh token válido:", decoded);

    const db = router.db;
    const user = db.get("users").find({ id: decoded.userId }).value();

    if (!user) {
      console.log("❌ User not found:", decoded.userId);
      return res.status(401).json({ message: "Usuário não encontrado" });
    }

    const newAccessToken = jwt.sign(
      {
        sub: user.id,
        email: user.email,
      },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" },
    );

    console.log("✅ New access token generated for user:", user.email);

    return res.json({
      accessToken: newAccessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || user.email.split("@")[0],
      },
    });
  } catch (error) {
    console.log("❌ Refresh token error:", error.message);
    return res
      .status(401)
      .json({ message: "Refresh token inválido ou expirado" });
  }
});

// Bind database to server
server.db = router.db;

// Usar apenas o router (sem json-server-auth que sobrescreve nossas rotas)
// Nossas rotas customizadas de /login e /auth/refresh já foram definidas acima
server.use(router);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n🚀 JSON Server with auth running at http://localhost:${PORT}`);
  console.log(`📡 CORS enabled for: http://localhost:5173`);
  console.log(`🍪 Cookies enabled with credentials\n`);
});
