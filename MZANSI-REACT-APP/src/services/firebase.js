import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc, orderBy, limit } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';


const firebaseConfig = {
  apiKey: "AIzaSyDsxqzXw5XEifHbelAYHqdkMUPoZVvg6ro",
  authDomain: "mzansi-react.firebaseapp.com",
  projectId: "mzansi-react",
  storageBucket: "mzansi-react-storage",
  messagingSenderId: "239626456292",
  appId: "1:239626456292:web:7bdfeebb778f7cededf0f1"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app, 'gs://mzansi-react-storage');

// Track whether we've already warned about Firestore permission issues to avoid log spam
let _warnedFirestorePermissions = false;

// Firebase Services
export const firebaseService = {
  // STORES
  stores: {
    getAll: async () => {
      try {
        const storesRef = collection(db, 'stores');
        const snapshot = await getDocs(storesRef);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        // If permission error, warn once and fallback to mock data to keep the app usable in dev
        if (! _warnedFirestorePermissions && /permission/i.test(error.message)) {
          console.warn('Firestore permission error detected. Falling back to mock stores.');
          _warnedFirestorePermissions = true;
        } else if (!/permission/i.test(error.message)) {
          console.error('Error fetching stores:', error);
        }
        // Fallback to mock data
        const { mockStores } = await import('../data/mockData');
        return mockStores;
      }
    },

    getByLocation: async (location) => {
      try {
        const storesRef = collection(db, 'stores');
        const q = query(storesRef, where('location', '==', location));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        if (! _warnedFirestorePermissions && /permission/i.test(error.message)) {
          console.warn('Firestore permission error detected. Falling back to mock stores by location.');
          _warnedFirestorePermissions = true;
        } else if (!/permission/i.test(error.message)) {
          console.error('Error fetching stores by location:', error);
        }
        // Fallback to mock data
        const { getMockStores } = await import('../data/mockData');
        return getMockStores(location);
      }
    },

    getById: async (storeId) => {
      try {
        const storeRef = doc(db, 'stores', storeId);
        const snapshot = await getDoc(storeRef);
        return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
      } catch (error) {
        console.error('Error fetching store:', error);
        return null;
      }
    },

    create: async (storeData) => {
      try {
        const storesRef = collection(db, 'stores');
        const docRef = await addDoc(storesRef, {
          ...storeData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        return docRef.id;
      } catch (error) {
        console.error('Error creating store:', error);
        throw error;
      }
    }
  },

  // PRODUCTS
  products: {
    getByStore: async (storeId) => {
      try {
        const productsRef = collection(db, 'products');
        const q = query(productsRef, where('storeId', '==', storeId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        if (! _warnedFirestorePermissions && /permission/i.test(error.message)) {
          console.warn('Firestore permission error detected. Falling back to mock products.');
          _warnedFirestorePermissions = true;
        } else if (!/permission/i.test(error.message)) {
          console.error('Error fetching products:', error);
        }
        // Fallback to mock data
        const { getStoreProducts } = await import('../data/mockData');
        return getStoreProducts(storeId);
      }
    },

    getById: async (productId) => {
      try {
        const productRef = doc(db, 'products', productId);
        const snapshot = await getDoc(productRef);
        return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
      } catch (error) {
        console.error('Error fetching product:', error);
        return null;
      }
    },

    create: async (productData) => {
      try {
        const productsRef = collection(db, 'products');
        const docRef = await addDoc(productsRef, {
          ...productData,
          createdAt: new Date()
        });
        return docRef.id;
      } catch (error) {
        console.error('Error creating product:', error);
        throw error;
      }
    }
  },

  // ORDERS
  orders: {
    create: async (orderData) => {
      try {
        const ordersRef = collection(db, 'orders');
        const docRef = await addDoc(ordersRef, {
          ...orderData,
          createdAt: new Date(),
          status: 'pending'
        });
        return docRef.id;
      } catch (error) {
        console.error('Error creating order:', error);
        // For prototype, return mock order ID
        return 'order_' + Date.now();
      }
    },

    getByUser: async (userId) => {
      try {
        const ordersRef = collection(db, 'orders');
        const q = query(
          ordersRef, 
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
          const snapshot = await getDocs(q);
          return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
          if (! _warnedFirestorePermissions && /permission/i.test(error.message)) {
            console.warn('Firestore permission error detected. Falling back to empty orders.');
            _warnedFirestorePermissions = true;
          } else if (!/permission/i.test(error.message)) {
            console.error('Error fetching user orders:', error);
          }
        return [];
      }
    },

    updateStatus: async (orderId, status) => {
      try {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, { 
          status,
          updatedAt: new Date()
        });
        return true;
      } catch (error) {
        console.error('Error updating order status:', error);
        return false;
      }
    }
  },

  // USERS
  users: {
    create: async (userId, userData) => {
      try {
        const userRef = doc(db, 'users', userId);
        await addDoc(userRef, {
          ...userData,
          createdAt: new Date()
        });
        return true;
      } catch (error) {
        console.error('Error creating user:', error);
        return false;
      }
    },

    get: async (userId) => {
      try {
        const userRef = doc(db, 'users', userId);
        const snapshot = await getDoc(userRef);
        return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
      } catch (error) {
        if (! _warnedFirestorePermissions && /permission/i.test(error.message)) {
          console.warn('Firestore permission error detected when fetching user. Falling back to null user.');
          _warnedFirestorePermissions = true;
        } else if (!/permission/i.test(error.message)) {
          console.error('Error fetching user:', error);
        }
        return null;
      }
    },

    update: async (userId, userData) => {
      try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          ...userData,
          updatedAt: new Date()
        });
        return true;
      } catch (error) {
        console.error('Error updating user:', error);
        return false;
      }
    }
  },

  // ADDRESSES
  addresses: {
    getByUser: async (userId) => {
      try {
        const addressesRef = collection(db, 'addresses');
        const q = query(addressesRef, where('userId', '==', userId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        if (! _warnedFirestorePermissions && /permission/i.test(error.message)) {
          console.warn('Firestore permission error detected when fetching addresses. Falling back to empty list.');
          _warnedFirestorePermissions = true;
        } else if (!/permission/i.test(error.message)) {
          console.error('Error fetching addresses:', error);
        }
        return [];
      }
    },

    create: async (userId, addressData) => {
      try {
        const addressesRef = collection(db, 'addresses');
        const docRef = await addDoc(addressesRef, {
          ...addressData,
          userId,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        return docRef.id;
      } catch (error) {
        console.error('Error creating address:', error);
        throw error;
      }
    },

    update: async (addressId, addressData) => {
      try {
        const addressRef = doc(db, 'addresses', addressId);
        await updateDoc(addressRef, {
          ...addressData,
          updatedAt: new Date()
        });
        return true;
      } catch (error) {
        console.error('Error updating address:', error);
        throw error;
      }
    },

    delete: async (addressId) => {
      try {
        const addressRef = doc(db, 'addresses', addressId);
        await deleteDoc(addressRef);
        return true;
      } catch (error) {
        console.error('Error deleting address:', error);
        throw error;
      }
    }
  },

  // PAYMENT METHODS
  paymentMethods: {
    getByUser: async (userId) => {
      try {
        const paymentMethodsRef = collection(db, 'paymentMethods');
        const q = query(paymentMethodsRef, where('userId', '==', userId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        if (! _warnedFirestorePermissions && /permission/i.test(error.message)) {
          console.warn('Firestore permission error detected when fetching payment methods. Falling back to empty list.');
          _warnedFirestorePermissions = true;
        } else if (!/permission/i.test(error.message)) {
          console.error('Error fetching payment methods:', error);
        }
        return [];
      }
    },

    create: async (userId, paymentMethodData) => {
      try {
        const paymentMethodsRef = collection(db, 'paymentMethods');
        // Don't store sensitive data like CVV in production
        const { cvv, ...safeData } = paymentMethodData;
        const docRef = await addDoc(paymentMethodsRef, {
          ...safeData,
          userId,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        return docRef.id;
      } catch (error) {
        console.error('Error creating payment method:', error);
        throw error;
      }
    },

    update: async (paymentMethodId, paymentMethodData) => {
      try {
        const paymentMethodRef = doc(db, 'paymentMethods', paymentMethodId);
        // Don't store sensitive data like CVV in production
        const { cvv, ...safeData } = paymentMethodData;
        await updateDoc(paymentMethodRef, {
          ...safeData,
          updatedAt: new Date()
        });
        return true;
      } catch (error) {
        console.error('Error updating payment method:', error);
        throw error;
      }
    },

    delete: async (paymentMethodId) => {
      try {
        const paymentMethodRef = doc(db, 'paymentMethods', paymentMethodId);
        await deleteDoc(paymentMethodRef);
        return true;
      } catch (error) {
        console.error('Error deleting payment method:', error);
        throw error;
      }
    }
  }
};