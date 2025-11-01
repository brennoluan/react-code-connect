import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const jsonServer = require('json-server');
const auth = require('json-server-auth');
const cors = require('cors');

const server = jsonServer.create();
const router = jsonServer.router('database.json');
const defaults = jsonServer.defaults();

// Permissions: 600 -> only owner can read/write; 644 -> anyone can read, only owner can write
const rules = {
	users: 600,
	devs: 644,
};

server.use(cors());
server.use(defaults);

// Rewriter must come before auth and router
server.use(auth.rewriter(rules));

// Bind the router db to the app for json-server-auth
server.db = router.db;

server.use(auth);
server.use(router);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
	console.log(`JSON Server with auth running at http://localhost:${PORT}`);
});
