import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * API endpoint for the dashboard.
 */
app.get('/api/users', async (req, res) => {
  // Simula uma requisição de rede.
  await new Promise(resolve => setTimeout(resolve, 500));

  // Permite testar o estado de erro manualmente.
  if (req.query['fail'] === 'true') {
    res.status(500).json({
      message: 'Falha simulada ao carregar usuários.'
    });
    return;
  }

  res.json([
    { id: 1, name: 'Gabriel', active: true },
    { id: 2, name: 'João', active: false },
    { id: 3, name: 'Maria', active: true },
    { id: 4, name: 'Carlos', active: true }
  ]);
});


app.get('/api/search/users', async (req, res) => {
  // Simula latência de rede para testarmos o comportamento assíncrono.
  await new Promise(resolve => setTimeout(resolve, 500));

  const users = [
    { id: 1, name: 'Gabriel', active: true },
    { id: 2, name: 'João', active: false },
    { id: 3, name: 'Maria', active: true },
    { id: 4, name: 'Carlos', active: true },
    { id: 5, name: 'Ana', active: false },
  ];

  const search = String(req.query['search'] ?? '')
    .trim()
    .toLowerCase();

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search)
  );

  res.json(filteredUsers);
});


/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
