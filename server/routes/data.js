
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
        const newData = req.body; // { schedule, records }

        // 1. Fetch existing data to prevent overwriting with empty state
        const existingData = await getData(userId);

        // 2. Merge: use new data if provided, otherwise fallback to existing
        const mergedData = {
            schedule: newData.schedule !== undefined ? newData.schedule : existingData.schedule,
            records: newData.records !== undefined ? newData.records : existingData.records
        };

        // 3. Save merged data
        await saveData(userId, mergedData);
        res.json({ success: true, data: mergedData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

export default router;
