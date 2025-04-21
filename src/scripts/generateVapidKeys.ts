/**
 * This script generates VAPID keys for push notifications
 * Run this script with: npx tsx src/scripts/generateVapidKeys.ts
 */

import webpush from "web-push";
import fs from "fs";
import path from "path";

// Generate VAPID keys
const vapidKeys = webpush.generateVAPIDKeys();

console.log("\nVAPID Keys generated successfully!\n");
console.log("Public Key:", vapidKeys.publicKey);
console.log("Private Key:", vapidKeys.privateKey);
console.log("\nAdd these to your .env.local file:\n");
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`CONTACT_EMAIL=dev@ravindrachoudhary.in`);

// Optionally save to .env.local if it exists
const envPath = path.join(process.cwd(), ".env.local");

if (fs.existsSync(envPath)) {
  try {
    let envContent = fs.readFileSync(envPath, "utf8");

    // Check if the keys already exist and replace them
    if (envContent.includes("NEXT_PUBLIC_VAPID_PUBLIC_KEY=")) {
      envContent = envContent.replace(
        /NEXT_PUBLIC_VAPID_PUBLIC_KEY=.*/,
        `NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`
      );
    } else {
      envContent += `\nNEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`;
    }

    if (envContent.includes("VAPID_PRIVATE_KEY=")) {
      envContent = envContent.replace(
        /VAPID_PRIVATE_KEY=.*/,
        `VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`
      );
    } else {
      envContent += `\nVAPID_PRIVATE_KEY=${vapidKeys.privateKey}`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log(
      "\nKeys have been automatically added to your .env.local file!"
    );
  } catch (error) {
    console.error("Error updating .env.local file:", error);
  }
} else {
  console.log("\nNo .env.local file found. Please add the keys manually.");
}
