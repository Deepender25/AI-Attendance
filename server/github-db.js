
import { Octokit } from 'octokit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Lazy initialization or check
const getOctokit = () => {
    if (!process.env.GITHUB_TOKEN) {
        throw new Error("GITHUB_TOKEN is missing in environment variables");
    }
    return new Octokit({
        auth: process.env.GITHUB_TOKEN,
    });
};

const OWNER = process.env.GITHUB_OWNER;
const REPO = process.env.GITHUB_REPO;
const USERS_PATH = 'data/users.json';

const getFileContent = async (path) => {
    const octokit = getOctokit();
    if (!OWNER || !REPO) throw new Error("GITHUB_OWNER or GITHUB_REPO missing");

    try {
        const { data } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner: OWNER,
            repo: REPO,
            path: path,
            headers: { 'X-GitHub-Api-Version': '2022-11-28' },
        });
        return data;
    } catch (error) {
        if (error.status === 404) return null;
        throw error;
    }
};

const saveFileContent = async (path, content, message) => {
    const octokit = getOctokit();
    if (!OWNER || !REPO) throw new Error("GITHUB_OWNER or GITHUB_REPO missing");

    const fileData = await getFileContent(path);
    const contentEncoded = Buffer.from(JSON.stringify(content, null, 2)).toString('base64');

    await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
        owner: OWNER,
        repo: REPO,
        path: path,
        message: message,
        content: contentEncoded,
        sha: fileData ? fileData.sha : undefined,
        headers: { 'X-GitHub-Api-Version': '2022-11-28' },
    });
};

// --- User Management ---
export const getUsers = async () => {
    const fileData = await getFileContent(USERS_PATH);
    if (!fileData) return [];
    const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
    return JSON.parse(content);
};

export const saveUser = async (newUser) => {
    const users = await getUsers();
    const updatedUsers = [...users, newUser];
    await saveFileContent(USERS_PATH, updatedUsers, `Add user ${newUser.email}`);
    return newUser;
};

export const updateUser = async (updatedUser) => {
    const users = await getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index === -1) throw new Error('User not found');

    users[index] = updatedUser;
    await saveFileContent(USERS_PATH, users, `Update user ${updatedUser.email}`);
    return updatedUser;
};

// --- Data Management ---
export const getData = async (userId) => {
    const path = `data/storage_${userId}.json`;
    const fileData = await getFileContent(path);
    if (!fileData) return { schedule: [], records: [] }; // Default empty state
    const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
    return JSON.parse(content);
};

export const saveData = async (userId, data) => {
    const path = `data/storage_${userId}.json`;
    await saveFileContent(path, data, `Update data for user ${userId}`);
    return data;
};
