import { storagePut } from '../server/storage';
import { getDb } from '../server/db';
import { counselors } from '../drizzle/schema';
import { like } from 'drizzle-orm';
import * as fs from 'fs';

async function uploadAndUpdate() {
  const pbPath = './client/public/counselors/carlos_ivan_pb.jpg';
  const colorPath = './client/public/counselors/carlos_ivan_color.jpg';
  
  const pbBuffer = fs.readFileSync(pbPath);
  const colorBuffer = fs.readFileSync(colorPath);
  
  const timestamp = Date.now();
  
  console.log('Uploading P&B image...');
  const pbResult = await storagePut(
    `counselors/carlos_ivan_pb_${timestamp}.jpg`,
    pbBuffer,
    'image/jpeg'
  );
  console.log('P&B uploaded:', pbResult.url);
  
  console.log('Uploading color image...');
  const colorResult = await storagePut(
    `counselors/carlos_ivan_color_${timestamp}.jpg`,
    colorBuffer,
    'image/jpeg'
  );
  console.log('Color uploaded:', colorResult.url);
  
  // Get database connection
  const db = await getDb();
  if (!db) {
    console.error('Database connection not available');
    process.exit(1);
  }
  
  // Find Carlos Ivan counselor
  console.log('Finding Carlos Ivan counselor...');
  const carlosIvan = await db.select().from(counselors).where(like(counselors.name, '%Ivan%'));
  console.log('Found:', carlosIvan.length, 'counselors');
  
  if (carlosIvan.length > 0) {
    console.log('Counselor ID:', carlosIvan[0].id, carlosIvan[0].name);
    
    // Update the counselor with new photos
    await db.update(counselors)
      .set({
        homePhotoUrl: pbResult.url,
        bioPhotoUrl: colorResult.url
      })
      .where(like(counselors.name, '%Ivan%'));
    
    console.log('Updated counselor photos successfully!');
  } else {
    console.log('Carlos Ivan counselor not found');
  }
  
  process.exit(0);
}

uploadAndUpdate().catch(console.error);
