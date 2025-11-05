
const BRAND_LOGO_URLS = {
  'Pick n Pay': 'https://logo.clearbit.com/pnp.co.za',
  'Shoprite': 'https://logo.clearbit.com/shoprite.co.za',
  'Checkers': 'https://logo.clearbit.com/checkers.co.za',
  'Woolworths Food': 'https://logo.clearbit.com/woolworths.co.za',
  'SPAR': 'https://logo.clearbit.com/spar.co.za',
  'Food Lovers': 'https://logo.clearbit.com/foodloversmarket.co.za',
  'BOXER': 'https://logo.clearbit.com/boxer.co.za',
  'Makro Food': 'https://logo.clearbit.com/makro.co.za',
  'OK Foods': 'https://logo.clearbit.com/okfoods.co.za',
  'Cambridge Foods': 'https://logo.clearbit.com/cambridge.co.za',
  'Mr Price': 'https://logo.clearbit.com/mrp.com',
  'Truworths': 'https://logo.clearbit.com/truworths.co.za',
  'Foschini': 'https://logo.clearbit.com/foschini.co.za',
  'Ackermans': 'https://logo.clearbit.com/ackermans.co.za',
  'Edgars': 'https://logo.clearbit.com/edgars.co.za',
  'PEP': 'https://logo.clearbit.com/pepstores.com',
  'Jet': 'https://logo.clearbit.com/jet.co.za',
  'Exact': 'https://logo.clearbit.com/exact.co.za',
  'Cotton On': 'https://logo.clearbit.com/cottonon.com',
  'H&M': 'https://logo.clearbit.com/hm.com',
  'Incredible Connection': 'https://logo.clearbit.com/incredible.co.za',
  'Game Electronics': 'https://logo.clearbit.com/game.co.za',
  'Makro Tech': 'https://logo.clearbit.com/makro.co.za',
  'Takealot Pickup': 'https://logo.clearbit.com/takealot.com',
  'Vodacom Shop': 'https://logo.clearbit.com/vodacom.co.za',
  'MTN Store': 'https://logo.clearbit.com/mtn.co.za',
  'Cell C': 'https://logo.clearbit.com/cellc.co.za',
  'iStore': 'https://logo.clearbit.com/istore.co.za',
  'Computer Mania': 'https://logo.clearbit.com/computermania.co.za',
};

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

const FOOD_BRANDS = [
  'Pick n Pay',
  'Shoprite', 
  'Checkers',
  'Woolworths Food',
  'SPAR',
  'Food Lovers',
  'BOXER',
  'Makro Food',
  'OK Foods',
  'Cambridge Foods'
];

const CLOTHING_BRANDS = [
  'Mr Price',
  'Truworths',
  'Foschini',
  'Ackermans',
  'Edgars',
  'PEP',
  'Jet',
  'Exact',
  'Cotton On',
  'H&M'
];

const ELECTRONICS_BRANDS = [
  'Incredible Connection',
  'Game Electronics',
  'Makro Tech',
  'Takealot Pickup',
  'Vodacom Shop',
  'MTN Store',
  'Cell C',
  'iStore',
  'Computer Mania'
];

const randomBetween = (min, max) => Math.random() * (max - min) + min;
const pick = (arr, i) => arr[i % arr.length];
const jitter = (val, delta = 0.02) => val + randomBetween(-delta, delta);

let storeAutoId = 1000;
const nextId = () => String(storeAutoId++);

const createStore = (category, brand, cityInfo, index) => {
  const id = nextId();
  const cityName = cityInfo.city.split(',')[0];
  const name = `${brand} ${cityName}`;
  const latitude = jitter(cityInfo.lat, 0.03);
  const longitude = jitter(cityInfo.lng, 0.03);
  const rating = Math.round(randomBetween(3.8, 4.7) * 10) / 10;
  const reviews = Math.floor(randomBetween(180, 1500));
  const phone = `+27 11 ${Math.floor(100 + Math.random() * 900)} ${Math.floor(1000 + Math.random() * 9000)}`;
  const isOpen = Math.random() > 0.15; // 85% stores are open

    const logoUrl = BRAND_LOGO_URLS[brand] || null;

  let deliveryTime;
  if (category === 'Food') {
    deliveryTime = '20-45 min';
  } else if (category === 'Clothing') {
    deliveryTime = '2-5 days';
  } else {
    deliveryTime = '1-3 days';
  }

  let image, flyerImage;
  if (category === 'Food') {
    image = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400';
    flyerImage = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400';
  } else if (category === 'Clothing') {
    image = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400';
    flyerImage = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400';
  } else {
    image = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400';
    flyerImage = 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400';
  }

  const promotions = [];
  if (Math.random() > 0.3) {
    promotions.push('Weekly specials available');
  }
  if (Math.random() > 0.5) {
    promotions.push('Bundle deals - Buy more, save more');
  }
  if (category === 'Food' && Math.random() > 0.4) {
    promotions.push('Free delivery over R350');
  }
  if (category === 'Clothing' && Math.random() > 0.6) {
    promotions.push('Summer sale - Up to 50% off');
  }
  if (category === 'Electronics' && Math.random() > 0.5) {
    promotions.push('Trade-in available on select items');
  }

  return {
    id,
    name,
    brand, // IMPORTANT: Always include brand field
    category,
    location: cityInfo.city,
    latitude,
    longitude,
    address: `${cityName}, ${cityInfo.city}`,
    phone,
    rating,
    reviews,
    deliveryTime,
    distance: `${Math.round(randomBetween(1.2, 15.8) * 10) / 10} km`,
    image,
    flyerImage,
    logoUrl,
    promotions,
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
    description: `${name} - Your trusted ${category.toLowerCase()} store in ${cityName}`,
    services: category === 'Food' 
      ? ['Grocery', 'Fresh Produce', 'Bakery', 'Deli']
      : category === 'Clothing'
      ? ['Men', 'Women', 'Kids', 'Accessories']
      : ['Computers', 'Phones', 'Accessories', 'Repairs']
  };
};

const generateStoresForCategory = (category, brands, count = 10) => {
  const stores = [];
  for (let i = 0; i < count; i++) {
    const brand = pick(brands, i);
    const cityInfo = pick(GAUTENG_CITIES, i);
    stores.push(createStore(category, brand, cityInfo, i));
  }
  return stores;
};

export const mockStores = [
  ...generateStoresForCategory('Food', FOOD_BRANDS, 10),
  ...generateStoresForCategory('Clothing', CLOTHING_BRANDS, 10),
  ...generateStoresForCategory('Electronics', ELECTRONICS_BRANDS, 9),
];

const PRODUCT_TEMPLATES = {
  Food: [
    { name: 'Fresh Bananas (1kg)', category: 'Fresh Produce', price: [19.99, 29.99] },
    { name: 'Full Cream Milk (2L)', category: 'Dairy', price: [28.99, 39.99] },
    { name: 'Brown Bread (700g)', category: 'Bakery', price: [14.99, 21.99] },
    { name: 'Chicken Breast (1kg)', category: 'Meat', price: [79.99, 109.99] },
    { name: 'Tomatoes (1kg)', category: 'Fresh Produce', price: [16.99, 26.99] },
    { name: 'Rice (2kg)', category: 'Grains', price: [39.99, 59.99] },
    { name: 'Eggs (18 pack)', category: 'Dairy', price: [44.99, 64.99] },
    { name: 'Potatoes (2kg)', category: 'Fresh Produce', price: [24.99, 39.99] },
  ],
  Clothing: [
    { name: 'Men\'s T-Shirt', category: 'Tops', price: [59.99, 199.99] },
    { name: 'Women\'s Jeans', category: 'Bottoms', price: [199.99, 499.99] },
    { name: 'Sneakers', category: 'Footwear', price: [399.99, 1499.99] },
    { name: 'Hoodie', category: 'Outerwear', price: [249.99, 699.99] },
    { name: 'Socks (5 pack)', category: 'Accessories', price: [49.99, 129.99] },
    { name: 'Dress', category: 'Women', price: [299.99, 899.99] },
    { name: 'Formal Shirt', category: 'Men', price: [199.99, 599.99] },
  ],
  Electronics: [
    { name: 'Smartphone', category: 'Mobiles', price: [1999.99, 12999.99] },
    { name: 'Bluetooth Headphones', category: 'Audio', price: [299.99, 2999.99] },
    { name: 'Smart TV 43"', category: 'TV', price: [3999.99, 8999.99] },
    { name: 'Laptop 15.6"', category: 'Computers', price: [6999.99, 19999.99] },
    { name: 'Power Bank 10,000mAh', category: 'Accessories', price: [199.99, 699.99] },
    { name: 'Wireless Mouse', category: 'Accessories', price: [149.99, 499.99] },
    { name: 'USB-C Cable', category: 'Accessories', price: [49.99, 199.99] },
  ],
};

const productImage = (category) => {
  const images = {
    'Fresh Produce': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300',
    'Dairy': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300',
    'Bakery': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300',
    'Meat': 'https://images.unsplash.com/photo-1588347818481-c7c4b1b6a8a6?w=300',
    'Tops': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300',
    'Bottoms': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300',
    'Footwear': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300',
    'Mobiles': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300',
    'Audio': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
    'Computers': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300',
  };
  return images[category] || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300';
};

const generatedProductsCache = new Map();

export const generateProductsForStore = (store, count = 20) => {
  const templates = PRODUCT_TEMPLATES[store.category] || PRODUCT_TEMPLATES.Food;
  const products = [];

  for (let i = 0; i < count; i++) {
    const tpl = pick(templates, i);
    const price = Math.round(randomBetween(tpl.price[0], tpl.price[1]) * 100) / 100;
    const isSpecial = i < 5 ? true : Math.random() < 0.3;
    const originalPrice = isSpecial ? Math.round(price * randomBetween(1.1, 1.3) * 100) / 100 : null;

    products.push({
      id: `${store.id}-p-${i}`,
      name: tpl.name,
      price,
      category: tpl.category,
      image: productImage(tpl.category),
      isSpecial,
      originalPrice,
      description: `${tpl.name} available at ${store.name}`,
      inStock: Math.random() > 0.05,
      brand: store.brand,
      storeId: store.id,
      storeName: store.name
    });
  }

  return products;
};

export const mockProducts = {};

export const getMockStores = (location) => {
  if (!location) return mockStores;
  const normalizedLocation = location.toLowerCase().trim();
  return mockStores.filter(store => 
    store.location.toLowerCase().includes(normalizedLocation) ||
    store.address.toLowerCase().includes(normalizedLocation) ||
    store.name.toLowerCase().includes(normalizedLocation)
  );
};

export const getStoreProducts = (storeId) => {
  const cached = generatedProductsCache.get(storeId);
  if (cached) return cached;

  const store = mockStores.find(s => s.id === storeId);
  if (!store) return [];

  const products = generateProductsForStore(store, 24);
  generatedProductsCache.set(storeId, products);
  return products;
};

export const firebaseStructure = {
  stores: {
    storeId: {
      name: 'string',
      brand: 'string',
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
  }
};