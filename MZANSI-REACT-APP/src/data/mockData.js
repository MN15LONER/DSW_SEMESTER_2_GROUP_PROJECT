// Gauteng-focused comprehensive mock data for Food, Clothing, Electronics, Health

// Cities in Gauteng with approximate coordinates
const GAUTENG_CITIES = [
  { city: 'Johannesburg, Gauteng', lat: -26.2041, lng: 28.0473 },
  { city: 'Soweto, Gauteng', lat: -26.2485, lng: 27.8540 },
  { city: 'Sandton, Gauteng', lat: -26.1076, lng: 28.0567 },
  { city: 'Midrand, Gauteng', lat: -25.9970, lng: 28.1260 },
  { city: 'Centurion, Gauteng', lat: -25.8744, lng: 28.1706 },
  { city: 'Pretoria, Gauteng', lat: -25.7479, lng: 28.2293 },
  { city: 'Randburg, Gauteng', lat: -26.0936, lng: 28.0064 },
  { city: 'Roodepoort, Gauteng', lat: -26.1625, lng: 27.8725 },
  { city: 'Boksburg, Gauteng', lat: -26.2130, lng: 28.2590 },
  { city: 'Alberton, Gauteng', lat: -26.2679, lng: 28.1227 },
];

export const SOUTH_AFRICAN_LOCATIONS = GAUTENG_CITIES.map(c => c.city);
export const mockLocations = SOUTH_AFRICAN_LOCATIONS;

// Brand pools per category
const BRAND_NAMES = {
  Food: ['Pick n Pay', 'Shoprite', 'Checkers', 'Woolworths Food', 'Spar', 'Food Lover\'s', 'Boxer', 'Makro Food', 'OK Foods', 'Cambridge Foods'],
  Clothing: ['Mr Price', 'Truworths', 'Foschini', 'Ackermans', 'Edgars', 'PEP', 'Jet', 'Exact', 'Cotton On', 'H&M'],
  Electronics: ['Incredible Connection', 'HiFi Corp', 'Game Electronics', 'Makro Tech', 'Takealot Pickup', 'Vodacom Shop', 'MTN Store', 'Cell C', 'iStore', 'Computer Mania'],
  Health: ['Clicks', 'Dis-Chem', 'MediRite', 'PharmaCo', 'Wellness Warehouse', 'Alpha Pharmacy', 'MedPlus', 'Health Mart', 'Life Pharmacy', 'Care Pharmacy'],
};

// Helpers
const randomBetween = (min, max) => Math.random() * (max - min) + min;
const pick = (arr, i) => arr[i % arr.length];
const jitter = (val, delta = 0.02) => val + randomBetween(-delta, delta);

let storeAutoId = 1000;
const nextId = () => String(storeAutoId++);

const createStore = (category, brand, cityInfo, suffix) => {
  const id = nextId();
  const name = `${brand} ${suffix}`.trim();
  const latitude = jitter(cityInfo.lat, 0.03);
  const longitude = jitter(cityInfo.lng, 0.03);
  const rating = Math.round(randomBetween(3.6, 4.8) * 10) / 10;
  const reviews = Math.floor(randomBetween(150, 2200));
  const deliveryTime = category === 'Food' ? 'Same day' : category === 'Electronics' ? '1-3 days' : '3-7 days';
  const phone = `+27 11 ${Math.floor(100  + Math.random()*900)} ${Math.floor(1000 + Math.random()*9000)}`;
  const isOpen = true;
  const baseImg = 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop';
  const flyerImg = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop';
  const address = `${cityInfo.city}`;
  return {
    id,
    name,
    category,
    location: cityInfo.city,
    latitude,
    longitude,
    address,
    phone,
    rating,
    reviews,
    deliveryTime,
    image: baseImg,
    flyerImage: flyerImg,
    promotions: [
      'Weekly specials available',
      'Bundle and save',
      'Free delivery over R350'
    ],
    isOpen,
    openingHours: {
      monday: '08:00 - 20:00',
      tuesday: '08:00 - 20:00',
      wednesday: '08:00 - 20:00',
      thursday: '08:00 - 20:00',
      friday: '08:00 - 21:00',
      saturday: '08:00 - 21:00',
      sunday: '09:00 - 18:00'
    },
    description: `${name} serving ${cityInfo.city}`
  };
};

const generateStoresForCategory = (category) => {
  const brands = BRAND_NAMES[category];
  const stores = [];
  for (let i = 0; i < 10; i++) {
    const brand = pick(brands, i);
    const cityInfo = pick(GAUTENG_CITIES, i);
    const suffix = cityInfo.city.split(',')[0];
    stores.push(createStore(category, brand, cityInfo, suffix));
  }
  return stores;
};

export const mockStores = [
  ...generateStoresForCategory('Food'),
  ...generateStoresForCategory('Clothing'),
  ...generateStoresForCategory('Electronics'),
  ...generateStoresForCategory('Health'),
];

// Product generator per category
const PRODUCT_TEMPLATES = {
  Food: [
    { name: 'Fresh Bananas (1kg)', category: 'Fresh Produce', price: [19.99, 29.99] },
    { name: 'Full Cream Milk (2L)', category: 'Dairy', price: [28.99, 39.99] },
    { name: 'Brown Bread (700g)', category: 'Bakery', price: [14.99, 21.99] },
    { name: 'Chicken Breast (1kg)', category: 'Meat', price: [79.99, 109.99] },
    { name: 'Tomatoes (1kg)', category: 'Fresh Produce', price: [16.99, 26.99] },
  ],
  Clothing: [
    { name: 'Men\'s T-Shirt', category: 'Tops', price: [59.99, 199.99] },
    { name: 'Women\'s Jeans', category: 'Bottoms', price: [199.99, 499.99] },
    { name: 'Sneakers', category: 'Footwear', price: [399.99, 1499.99] },
    { name: 'Hoodie', category: 'Outerwear', price: [249.99, 699.99] },
    { name: 'Socks (5 pack)', category: 'Accessories', price: [49.99, 129.99] },
  ],
  Electronics: [
    { name: 'Smartphone', category: 'Mobiles', price: [1999.99, 12999.99] },
    { name: 'Bluetooth Headphones', category: 'Audio', price: [299.99, 2999.99] },
    { name: 'Smart TV 43"', category: 'TV', price: [3999.99, 8999.99] },
    { name: 'Laptop 15.6"', category: 'Computers', price: [6999.99, 19999.99] },
    { name: 'Power Bank 10,000mAh', category: 'Accessories', price: [199.99, 699.99] },
  ],
  Health: [
    { name: 'Vitamin C 500mg (60s)', category: 'Vitamins', price: [49.99, 129.99] },
    { name: 'Pain Relief Tablets (24s)', category: 'Medicines', price: [29.99, 89.99] },
    { name: 'Hand Sanitizer (500ml)', category: 'Hygiene', price: [29.99, 79.99] },
    { name: 'Baby Wipes (80s)', category: 'Baby', price: [24.99, 69.99] },
    { name: 'Shampoo (400ml)', category: 'Personal Care', price: [39.99, 129.99] },
  ],
};

const productImage = (seed) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/200/200`;
const productId = (storeId, idx) => `${storeId}-p-${idx}`;

const generatedProductsCache = new Map();

const generateProductsForStore = (store, count = 20) => {
  const templates = PRODUCT_TEMPLATES[store.category] || PRODUCT_TEMPLATES.Food;
  const products = [];
  for (let i = 0; i < count; i++) {
    const tpl = pick(templates, i);
    const price = Math.round(randomBetween(tpl.price[0], tpl.price[1]) * 100) / 100;
    const isSpecial = Math.random() < 0.35;
    const originalPrice = isSpecial ? Math.round(price * randomBetween(1.05, 1.25) * 100) / 100 : undefined;
    products.push({
      id: productId(store.id, i),
      name: tpl.name,
      price,
      category: tpl.category,
      image: productImage(`${store.id}-${i}`),
      isSpecial,
      originalPrice,
      description: `${tpl.name} available at ${store.name}`,
      inStock: Math.random() > 0.1
    });
  }
  return products;
};

export const mockProducts = {};

export const getMockStores = (location) => {
  if (!location) return mockStores;
  return mockStores.filter(store => store.location.toLowerCase().includes(location.toLowerCase()));
};

export const getStoreProducts = (storeId) => {
  if (mockProducts[storeId] && mockProducts[storeId].length > 0) {
    return mockProducts[storeId];
  }
  // Find store and generate products on demand
  const store = mockStores.find(s => s.id === storeId);
  if (!store) return [];
  const cached = generatedProductsCache.get(storeId);
  if (cached) return cached;
  const products = generateProductsForStore(store, 24);
  generatedProductsCache.set(storeId, products);
  return products;
};

// This is the we are using for now for Firebase structure mockup - for reference when implementing real database
export const firebaseStructure = {
  stores: {
    storeId: {
      name: 'string',
      category: 'string',
      location: 'string',
      coordinates: { lat: 'number', lng: 'number' },
      rating: 'number',
      reviews: 'number',
      deliveryTime: 'string',
      image: 'string',
      flyerImage: 'string',
      promotions: ['array of strings'],
      isOpen: 'boolean',
      description: 'string',
      createdAt: 'timestamp',
      updatedAt: 'timestamp'
    }
  },
  products: {
    productId: {
      storeId: 'string',
      name: 'string',
      price: 'number',
      category: 'string',
      image: 'string',
      isSpecial: 'boolean',
      originalPrice: 'number',
      description: 'string',
      inStock: 'boolean',
      createdAt: 'timestamp'
    }
  },
  orders: {
    orderId: {
      userId: 'string',
      storeId: 'string',
      items: ['array of product objects'],
      total: 'number',
      status: 'string', // pending, confirmed, delivered
      deliveryAddress: 'string',
      createdAt: 'timestamp'
    }
  }
};