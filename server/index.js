
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix Environment Path logic
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env.local');

console.log(`Loading .env from: ${envPath}`);
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error("Error loading .env file:", result.error);
}

// Import routes AFTER loading env vars to ensure dependencies get the values
import authRoutes from './routes/auth.js';
import dataRoutes from './routes/data.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Debug Middleware to log requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Basic health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date(),
        envCheck: {
            hasGithubToken: !!process.env.GITHUB_TOKEN,
            hasGmail: !!process.env.GMAIL_USER,
            owner: process.env.GITHUB_OWNER
        }
    });
});

app.use('/auth', authRoutes);
app.use('/api/data', dataRoutes);

// Export the app for Vercel serverless function
export default app;

// Only listen if running locally
if (process.env.NODE_ENV !== 'production' && process.argv[1] === fileURLToPath(import.meta.url)) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Owner: ${process.env.GITHUB_OWNER}`);
    });
}
