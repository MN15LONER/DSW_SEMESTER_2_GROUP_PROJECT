
import { firebaseService } from '../services/firebase.js';
import { mockStores, mockProducts } from '../data/mockData.js';

export const seedFirebaseData = async () => {
  console.log('🌱 Starting Firebase data seeding...');

  try {

    console.log('📦 Seeding stores...');
    const storePromises = mockStores.map(async (store) => {
      const { id, ...storeData } = store; // Remove the mock ID
      const firebaseId = await firebaseService.stores.create(storeData);
      console.log(`✅ Created store: ${store.name} (ID: ${firebaseId})`);
      return { mockId: id, firebaseId };
    });

    const storeMapping = await Promise.all(storePromises);
    console.log(`✅ Successfully seeded ${storeMapping.length} stores`);

    console.log('🛍️ Seeding products...');
    let productCount = 0;

    for (const [mockStoreId, products] of Object.entries(mockProducts)) {
      const mapping = storeMapping.find(s => s.mockId === mockStoreId);
      const firebaseStoreId = mapping?.firebaseId;

      if (firebaseStoreId && products) {
        const productPromises = products.map(async (product) => {
          const { id, ...productData } = product; // Remove mock ID
          const firebaseId = await firebaseService.products.create({
            ...productData,
            storeId: firebaseStoreId
          });
          console.log(`✅ Created product: ${product.name}`);
          return firebaseId;
        });

        await Promise.all(productPromises);
        productCount += products.length;
      }
    }

    console.log(`✅ Successfully seeded ${productCount} products`);
    console.log('🎉 Firebase seeding completed successfully!');

    return {
      success: true,
      storesCount: storeMapping.length,
      productsCount: productCount
    };

  } catch (error) {
    console.error('❌ Error seeding Firebase:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const clearFirebaseData = async () => {
  console.log('🗑️ WARNING: This will clear all Firebase data!');
  console.log('Clear function not implemented for safety');
};
