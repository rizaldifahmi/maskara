import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import url from 'url';
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3001;
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});
app.post('/api/register', (req, res) => {
    res.status(404).json({ error: 'Registration is disabled for security.' });
});
if (import.meta.url === url.pathToFileURL(process.argv[1]).href) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
export default app;
