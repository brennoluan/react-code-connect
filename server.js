import { createRequire } from "module";

import dotenv from "dotenv";
dotenv.config();

const require = createRequire(import.meta.url);

const jsonServer = require("json-server");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { google } = require("googleapis");

const server = jsonServer.create();
const router = jsonServer.router("database.json");
const defaults = jsonServer.defaults();

// Secrets para JWT
const ACCESS_TOKEN_SECRET = "seu-access-token-secret-super-secreto";
const REFRESH_TOKEN_SECRET = "seu-refresh-token-secret-ainda-mais-secreto";

// Configuração do Google OAuth
const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID || "your-google-client-id";
const GOOGLE_CLIENT_SECRET =
  process.env.GOOGLE_CLIENT_SECRET || "your-google-client-secret";
const GOOGLE_REDIRECT_URI = "http://localhost:3001/auth/google/callback";

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
);

// Note: Permissões gerenciadas manualmente nas rotas customizadas

// CORS deve vir PRIMEIRO, antes de qualquer outro middleware
server.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Set-Cookie"],
  }),
);

// Adicionar headers CORS manualmente para garantir
server.use((req, res, next) => {
  const origin = req.headers.origin;
  if (
    origin === "http://localhost:5173" ||
    origin === "http://localhost:5174"
  ) {
    res.header("Access-Control-Allow-Origin", origin);
  }
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
      return res.status(400).json({ message: "Email ou senha incorretos" });
    }

    // Verificar se é usuário OAuth (sem senha)
    if (!user.password) {
      return res.status(400).json({
        message:
          'Esta conta usa login social. Use o botão "Entrar com Google".',
      });
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(400).json({ message: "Email ou senha incorretos" });
    }

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

    // Retornar resposta
    return res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || user.email.split("@")[0],
        description: user.description || null,
        categories: user.categories || [],
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao fazer login" });
  }
});

// Rota customizada de registro
server.post("/register", async (req, res) => {
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

    // Retornar resposta
    return res.json({
      accessToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        description: null,
        categories: [],
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao criar conta" });
  }
});

// Rota de refresh ANTES do auth.rewriter
server.post("/auth/refresh", (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token não encontrado" });
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

    const db = router.db;
    // Converter userId de string para número
    const userId = parseInt(decoded.userId, 10);
    const user = db.get("users").find({ id: userId }).value();

    if (!user) {
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

    return res.json({
      accessToken: newAccessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || user.email.split("@")[0],
        description: user.description || null,
        categories: user.categories || [],
      },
    });
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Refresh token inválido ou expirado" });
  }
});

// ==================== GOOGLE OAUTH ROUTES ====================

// Rota para iniciar o fluxo OAuth com Google
server.get("/auth/google", (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    prompt: "consent",
  });

  res.redirect(authUrl);
});

// Rota de callback do Google OAuth
server.get("/auth/google/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.redirect("http://localhost:5173/login?error=no_code");
  }

  try {
    // Trocar código por tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Buscar informações do usuário
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    const db = router.db;

    // Buscar ou criar usuário
    let user = db.get("users").find({ googleId: data.id }).value();

    if (!user) {
      // Verificar se já existe usuário com o mesmo email
      user = db.get("users").find({ email: data.email }).value();

      if (user) {
        // Atualizar usuário existente com googleId
        db.get("users")
          .find({ email: data.email })
          .assign({
            googleId: data.id,
          })
          .write();

        user = db.get("users").find({ email: data.email }).value();
      } else {
        // Criar novo usuário
        const newUser = {
          id: db.get("users").size().value() + 1,
          email: data.email,
          name: data.name,
          googleId: data.id,
          password: null, // OAuth users não tem senha
        };

        db.get("users").push(newUser).write();
        user = newUser;
      }
    }

    // Gerar tokens JWT
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

    // Redirecionar para o frontend com o access token
    const redirectUrl = `http://localhost:5173/auth/callback?token=${accessToken}`;
    res.redirect(redirectUrl);
  } catch (error) {
    return res.redirect("http://localhost:5173/login?error=auth_failed");
  }
});

// ==================== PROFILE ROUTES ====================

// Rota para atualizar perfil do usuário
server.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, password, description, categories } = req.body;

  try {
    const bcrypt = require("bcryptjs");
    const db = router.db;

    // Buscar usuário atual
    const user = db
      .get("users")
      .find({ id: parseInt(id, 10) })
      .value();

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Validar email se foi alterado
    if (email && email !== user.email) {
      const existingUser = db.get("users").find({ email }).value();
      if (existingUser) {
        return res.status(400).json({ message: "Este email já está em uso" });
      }
    }

    // Preparar dados de atualização
    const updateData = {
      ...user,
    };

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (description !== undefined) updateData.description = description;
    if (categories !== undefined) updateData.categories = categories;

    // Atualizar senha se fornecida
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // Atualizar no banco
    db.get("users")
      .find({ id: parseInt(id, 10) })
      .assign(updateData)
      .write();

    // Buscar usuário atualizado
    const updatedUser = db
      .get("users")
      .find({ id: parseInt(id, 10) })
      .value();

    // Retornar usuário atualizado (sem senha)
    return res.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        description: updatedUser.description || null,
        categories: updatedUser.categories || [],
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao atualizar perfil" });
  }
});

// Bind database to server
server.db = router.db;

// Usar apenas o router (sem json-server-auth que sobrescreve nossas rotas)
// Nossas rotas customizadas de /login e /auth/refresh já foram definidas acima
server.use(router);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`JSON Server running at http://localhost:${PORT}`);
});
