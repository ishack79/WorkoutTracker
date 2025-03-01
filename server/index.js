import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create workouts.json if it doesn't exist
const workoutsFile = path.join(dataDir, 'workouts.json');
if (!fs.existsSync(workoutsFile)) {
  fs.writeFileSync(workoutsFile, JSON.stringify([]));
}

app.use(cors());
app.use(bodyParser.json());

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, '../dist')));

// Get all workouts
app.get('/api/workouts', (req, res) => {
  try {
    const data = fs.readFileSync(workoutsFile, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading workouts file:', error);
    res.status(500).json({ error: 'Failed to read workouts' });
  }
});

// Save workouts
app.post('/api/workouts', (req, res) => {
  try {
    const workouts = req.body;
    fs.writeFileSync(workoutsFile, JSON.stringify(workouts, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error('Error writing workouts file:', error);
    res.status(500).json({ error: 'Failed to save workouts' });
  }
});

// Start the Vite dev server
import { spawn } from 'child_process';
const viteProcess = spawn('npx', ['vite'], { 
  stdio: 'inherit',
  shell: true
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Vite dev server running on http://localhost:5173`);
});

// Handle process termination
process.on('SIGINT', () => {
  viteProcess.kill();
  process.exit();
});