import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Serve static docs from frontend/public/docs-html
const docsPath = path.join(__dirname, '../frontend/public/docs-html');

app.use(express.static(docsPath));

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(docsPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`📚 Nuvary Docs rodando na porta ${PORT}`);
  console.log(`📂 Servindo: ${docsPath}`);
});
