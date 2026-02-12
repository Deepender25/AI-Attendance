
import express from 'express';
import { getData, saveData } from '../github-db.js';

const router = express.Router();

// Middleware to simulate auth check (pass userId in header/body for now)
// ideally use JWT from login, but for MVP we use passed ID

router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const data = await getData(userId);
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

router.post('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const data = req.body; // { schedule: [], records: [] }
        await saveData(userId, data);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

export default router;
