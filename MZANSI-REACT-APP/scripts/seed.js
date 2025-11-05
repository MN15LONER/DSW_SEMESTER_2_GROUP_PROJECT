
import { seedFirebaseData } from '../src/utils/seedFirebase.js';

(async () => {
  console.log('🚀 Running Firebase seeding script...');
  const result = await seedFirebaseData();
  console.log('✅ Seeding finished:', result);
  process.exit();
})();
