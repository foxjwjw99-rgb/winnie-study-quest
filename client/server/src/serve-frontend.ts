import express from 'express';
import path from 'path';

export function serveFrontend(app: express.Application) {
  // Serve static files from the React app build
  const distPath = path.join(__dirname, '../../dist');
  app.use(express.static(distPath));

  // All non-API routes should serve the React app
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}
