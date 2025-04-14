// Simple script to set environment variables and run the createRooms script
import { spawn } from 'child_process';

// Set the MongoDB URI environment variable
process.env.MONGODB_URI = "mongodb+srv://ravisirvi609:Comfort%408989@comfort-stay-pg.bpxnpxt.mongodb.net/?retryWrites=true&w=majority&appName=comfort-stay-pg";

// Run the createRooms script with the environment variable set
const child = spawn('npx', ['tsx', 'src/scripts/createRooms.ts'], {
  stdio: 'inherit',
  env: process.env
});

child.on('close', (code) => {
  process.exit(code);
}); 