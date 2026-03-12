import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { extractTextFromBuffer, callOpenAIForExtraction } from './utils.js';

dotenv.config();

const app = express();
app.use(cors());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 } // 10MB limit, single file
});

app.post('/api/extract', (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      console.error('Upload error', err);
      // Multer file size limit
      if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'file too large (max 10MB)' });
      return res.status(400).json({ error: err.message || 'upload error' });
    }

    try {
      if (!req.file) return res.status(400).json({ error: 'no file uploaded' });

      const text = await extractTextFromBuffer(req.file.buffer, req.file.originalname, req.file.mimetype);

      if (!text || text.trim().length === 0) {
        return res.status(422).json({ error: 'no text could be extracted from the uploaded file' });
      }

      const { parsed, raw } = await callOpenAIForExtraction(text);
      return res.json({ ok: true, data: parsed, raw });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: String(err) });
    }
  });
});

app.get('/', (req, res) => res.send('AI Insurance Backend running'));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
