import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { sendOTP } from '../mailer.js';
import { getUsers, saveUser, updateUser } from '../github-db.js';

const router = express.Router();

// In-memory store for Registration OTPs
const otpStore = new Map();
// In-memory store for Email Update OTPs
const emailUpdateStore = new Map();

// Generate random 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

router.get('/ping', (req, res) => res.send('pong'));

// 1. Send OTP (Registration)
router.post('/send-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const users = await getUsers();
    if (users.find(u => u.email === email)) {
        return res.status(409).json({ error: 'User already exists. Please login.' });
    }

    const otp = generateOTP();
    const success = await sendOTP(email, otp);

    if (success) {
        otpStore.set(email, {
            otp,
            expires: Date.now() + 10 * 60 * 1000 // 10 mins
        });
        res.json({ message: 'OTP sent successfully' });
    } else {
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

// 2. Verify OTP (Registration)
router.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    const stored = otpStore.get(email);

    if (!stored) return res.status(400).json({ error: 'OTP expired or not sent' });
    if (Date.now() > stored.expires) {
        otpStore.delete(email);
        return res.status(400).json({ error: 'OTP expired' });
    }
    if (stored.otp !== otp) {
        return res.status(400).json({ error: 'Invalid OTP' });
    }

    res.json({ message: 'OTP verified' });
});

// 3. Register
router.post('/register', async (req, res) => {
    const { email, otp, password, name } = req.body;

    const stored = otpStore.get(email);
    if (!stored || stored.otp !== otp) {
        return res.status(400).json({ error: 'Invalid or expired OTP session' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: uuidv4(),
            email,
            name,
            passwordHash: hashedPassword,
            createdAt: new Date().toISOString()
        };

        await saveUser(newUser);
        otpStore.delete(email);

        res.status(201).json({ user: { id: newUser.id, email: newUser.email, name: newUser.name } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// 4. Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const users = await getUsers();
        const user = users.find(u => u.email === email);

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        res.json({
            user: { id: user.id, email: user.email, name: user.name }
        });

    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// ==========================================
// PROFILE ROUTES
// ==========================================

// 5. Update Password
router.post('/update-password', async (req, res) => {
    const { userId, oldPassword, newPassword } = req.body;
    try {
        const users = await getUsers();
        const user = users.find(u => u.id === userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!isMatch) return res.status(401).json({ error: 'Incorrect current password' });

        user.passwordHash = await bcrypt.hash(newPassword, 10);
        await updateUser(user);

        res.json({ message: 'Password updated successfully' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to update password' });
    }
});

// 6. Update Profile (Name only)
router.post('/update-profile', async (req, res) => {
    const { userId, name } = req.body;
    try {
        const users = await getUsers();
        const user = users.find(u => u.id === userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.name = name || user.name;

        await updateUser(user);

        res.json({
            message: 'Profile updated successfully',
            user: { id: user.id, email: user.email, name: user.name }
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// 7. Request Email Update (Send OTP to new email)
router.post('/request-email-update', async (req, res) => {
    const { userId, newEmail } = req.body;
    try {
        if (!newEmail) return res.status(400).json({ error: 'New email is required' });

        const users = await getUsers();
        // Check if new email is already taken by ANOTHER user
        const existing = users.find(u => u.email === newEmail && u.id !== userId);
        if (existing) return res.status(409).json({ error: 'Email already in use' });

        const otp = generateOTP();
        const success = await sendOTP(newEmail, otp);

        if (success) {
            emailUpdateStore.set(userId, {
                newEmail,
                otp,
                expires: Date.now() + 10 * 60 * 1000 // 10 mins
            });
            res.json({ message: 'Verification code sent to new email' });
        } else {
            res.status(500).json({ error: 'Failed to send verification code' });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to request email update' });
    }
});

// 8. Verify & Update Email
router.post('/verify-email-update', async (req, res) => {
    const { userId, otp } = req.body;
    try {
        const pendingUpdate = emailUpdateStore.get(userId);

        if (!pendingUpdate) return res.status(400).json({ error: 'No pending email update found' });
        if (Date.now() > pendingUpdate.expires) {
            emailUpdateStore.delete(userId);
            return res.status(400).json({ error: 'Verification code expired' });
        }
        if (pendingUpdate.otp !== otp) {
            return res.status(400).json({ error: 'Invalid verification code' });
        }

        // Perform the update
        const users = await getUsers();
        const user = users.find(u => u.id === userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.email = pendingUpdate.newEmail;
        await updateUser(user);

        emailUpdateStore.delete(userId);

        res.json({
            message: 'Email updated successfully',
            user: { id: user.id, email: user.email, name: user.name }
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to update email' });
    }
});

export default router;
