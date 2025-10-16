// Comprehensive mock data for major South African retailers
export const MAJOR_SA_STORES = [
  // Pick n Pay Stores
  {
    id: 'pnp_sandton',
    name: 'Pick n Pay Sandton City',
    brand: 'Pick n Pay',
    category: 'Food',
    location: 'Sandton City, Johannesburg',
    coordinates: { latitude: -26.1076, longitude: 28.0567 },
    address: 'Sandton City Shopping Centre, Rivonia Rd, Sandhurst, Sandton, 2196',
    phone: '+27 11 217 6000',
    hours: 'Mon-Sun: 8:00 AM - 9:00 PM',
    services: ['Grocery', 'Pharmacy', 'Bakery', 'Deli', 'Online Shopping'],
    rating: 4.2,
    deliveryTime: '30-45 min',
    distance: '2.1 km',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    specialties: ['Fresh Produce', 'Smart Shopper Rewards', 'Halaal Products']
  },
  {
    id: 'pnp_cape_gate',
    name: 'Pick n Pay Cape Gate',
    brand: 'Pick n Pay',
    category: 'Food',
    location: 'Cape Gate, Cape Town',
    coordinates: { latitude: -33.8567, longitude: 18.5108 },
    address: 'Cape Gate Centre, Okavango Rd, Brackenfell, Cape Town, 7560',
    phone: '+27 21 981 0300',
    hours: 'Mon-Sun: 8:00 AM - 9:00 PM',
    services: ['Grocery', 'Pharmacy', 'Bakery', 'Liquor Store'],
    rating: 4.1,
    deliveryTime: '25-40 min',
    distance: '5.3 km',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    specialties: ['Fresh Produce', 'Smart Shopper Rewards', 'Wine Selection']
  },

  // Checkers Stores
  {
    id: 'checkers_rosebank',
    name: 'Checkers Rosebank',
    brand: 'Checkers',
    category: 'Food',
    location: 'Rosebank, Johannesburg',
    coordinates: { latitude: -26.1467, longitude: 28.0436 },
    address: 'The Zone @ Rosebank, 173 Oxford Rd, Rosebank, Johannesburg, 2196',
    phone: '+27 11 788 8900',
    hours: 'Mon-Sun: 7:00 AM - 10:00 PM',
    services: ['Grocery', 'Butchery', 'Bakery', 'Deli', 'Sixty60 Delivery'],
    rating: 4.3,
    deliveryTime: '20-35 min',
    distance: '1.8 km',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    specialties: ['Premium Products', 'Sixty60 App', 'Fresh Meat']
  },
  {
    id: 'checkers_v&a',
    name: 'Checkers V&A Waterfront',
    brand: 'Checkers',
    category: 'Food',
    location: 'V&A Waterfront, Cape Town',
    coordinates: { latitude: -33.9025, longitude: 18.4187 },
    address: 'Victoria Wharf Shopping Centre, V&A Waterfront, Cape Town, 8001',
    phone: '+27 21 408 7600',
    hours: 'Mon-Sun: 8:00 AM - 10:00 PM',
    services: ['Grocery', 'Butchery', 'Bakery', 'Sixty60 Delivery'],
    rating: 4.4,
    deliveryTime: '15-30 min',
    distance: '3.2 km',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    specialties: ['Tourist Friendly', 'Premium Selection', 'Sixty60 App']
  },

  // Woolworths Stores
  {
    id: 'woolworths_hyde_park',
    name: 'Woolworths Hyde Park',
    brand: 'Woolworths',
    category: 'Food',
    location: 'Hyde Park, Johannesburg',
    coordinates: { latitude: -26.1176, longitude: 28.0167 },
    address: 'Hyde Park Corner, Jan Smuts Ave, Hyde Park, Johannesburg, 2196',
    phone: '+27 11 325 5000',
    hours: 'Mon-Sun: 8:00 AM - 8:00 PM',
    services: ['Premium Grocery', 'Fashion', 'Beauty', 'Home', 'Café'],
    rating: 4.5,
    deliveryTime: '35-50 min',
    distance: '4.1 km',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
    specialties: ['Premium Quality', 'Organic Products', 'Fashion & Food']
  },
  {
    id: 'woolworths_canal_walk',
    name: 'Woolworths Canal Walk',
    brand: 'Woolworths',
    category: 'Food',
    location: 'Canal Walk, Cape Town',
    coordinates: { latitude: -33.8876, longitude: 18.5108 },
    address: 'Canal Walk Shopping Centre, Century City, Cape Town, 7441',
    phone: '+27 21 555 3000',
    hours: 'Mon-Sun: 9:00 AM - 9:00 PM',
    services: ['Premium Grocery', 'Fashion', 'Beauty', 'Home'],
    rating: 4.4,
    deliveryTime: '40-55 min',
    distance: '6.8 km',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
    specialties: ['Premium Quality', 'Sustainable Products', 'Fashion Hub']
  },

  // Shoprite Stores
  {
    id: 'shoprite_eastgate',
    name: 'Shoprite Eastgate',
    brand: 'Shoprite',
    category: 'Food',
    location: 'Eastgate, Johannesburg',
    coordinates: { latitude: -26.1876, longitude: 28.1567 },
    address: 'Eastgate Shopping Centre, 43 Bradford Rd, Bedfordview, 2008',
    phone: '+27 11 456 7800',
    hours: 'Mon-Sun: 8:00 AM - 8:00 PM',
    services: ['Grocery', 'Pharmacy', 'Liquor Store', 'Money Market'],
    rating: 4.0,
    deliveryTime: '25-40 min',
    distance: '7.2 km',
    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400',
    specialties: ['Affordable Prices', 'Bulk Buying', 'Money Services']
  },
  {
    id: 'shoprite_blue_route',
    name: 'Shoprite Blue Route Mall',
    brand: 'Shoprite',
    category: 'Food',
    location: 'Tokai, Cape Town',
    coordinates: { latitude: -34.0567, longitude: 18.4678 },
    address: 'Blue Route Mall, Tokai Rd, Tokai, Cape Town, 7945',
    phone: '+27 21 712 0400',
    hours: 'Mon-Sun: 8:00 AM - 8:00 PM',
    services: ['Grocery', 'Pharmacy', 'Liquor Store', 'Bakery'],
    rating: 3.9,
    deliveryTime: '30-45 min',
    distance: '12.1 km',
    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400',
    specialties: ['Value for Money', 'Family Shopping', 'Fresh Produce']
  },

  // Makro Stores
  {
    id: 'makro_woodmead',
    name: 'Makro Woodmead',
    brand: 'Makro',
    category: 'Food',
    location: 'Woodmead, Johannesburg',
    coordinates: { latitude: -26.0567, longitude: 28.0876 },
    address: '315 Witkoppen Rd, Paulshof, Sandton, 2191',
    phone: '+27 11 570 1000',
    hours: 'Mon-Fri: 7:00 AM - 6:00 PM, Sat: 7:00 AM - 5:00 PM, Sun: 8:00 AM - 4:00 PM',
    services: ['Wholesale', 'Bulk Shopping', 'Business Supplies', 'Fresh Food'],
    rating: 4.1,
    deliveryTime: '45-60 min',
    distance: '8.9 km',
    image: 'https://images.unsplash.com/photo-1604719312566-878b4d80e5c8?w=400',
    specialties: ['Bulk Purchases', 'Business Solutions', 'Wholesale Prices']
  },
  {
    id: 'makro_cape_town',
    name: 'Makro Cape Town',
    brand: 'Makro',
    category: 'Food',
    location: 'Montague Gardens, Cape Town',
    coordinates: { latitude: -33.8567, longitude: 18.5234 },
    address: '1 Montague Dr, Montague Gardens, Cape Town, 7441',
    phone: '+27 21 552 8000',
    hours: 'Mon-Fri: 7:00 AM - 6:00 PM, Sat: 7:00 AM - 5:00 PM, Sun: 8:00 AM - 4:00 PM',
    services: ['Wholesale', 'Bulk Shopping', 'Business Supplies', 'Electronics'],
    rating: 4.0,
    deliveryTime: '50-65 min',
    distance: '15.3 km',
    image: 'https://images.unsplash.com/photo-1604719312566-878b4d80e5c8?w=400',
    specialties: ['Wholesale Trading', 'Business Equipment', 'Bulk Food']
  }
  ,
  // Clothing Stores
  {
    id: 'mr_price_sandton',
    name: 'Mr Price Sandton City',
    brand: 'Mr Price',
    category: 'Clothing',
    location: 'Sandton City, Johannesburg',
    coordinates: { latitude: -26.1076, longitude: 28.0567 },
    address: 'Sandton City, Rivonia Rd, Sandhurst, Sandton, 2196',
    phone: '+27 11 217 6200',
    hours: 'Mon-Sun: 9:00 AM - 8:00 PM',
    services: ['Men', 'Women', 'Kids', 'Accessories'],
    rating: 4.2,
    deliveryTime: '1-3 days',
    distance: '2.2 km',
    image: 'https://images.unsplash.com/photo-1520975867597-0f39ed121e8b?w=400',
    specialties: ['Affordable Fashion', 'Seasonal Deals']
  },
  {
    id: 'truworths_rosebank',
    name: 'Truworths Rosebank Mall',
    brand: 'Truworths',
    category: 'Clothing',
    location: 'Rosebank, Johannesburg',
    coordinates: { latitude: -26.1467, longitude: 28.0436 },
    address: 'Rosebank Mall, 50 Bath Ave, Rosebank, Johannesburg, 2196',
    phone: '+27 11 788 9100',
    hours: 'Mon-Sun: 9:00 AM - 7:00 PM',
    services: ['Men', 'Women', 'Shoes', 'Accessories'],
    rating: 4.1,
    deliveryTime: '3-5 days',
    distance: '2.9 km',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400',
    specialties: ['Formal Wear', 'Quality Fabrics']
  },
  {
    id: 'foschini_hyde_park',
    name: 'Foschini Hyde Park',
    brand: 'Foschini',
    category: 'Clothing',
    location: 'Hyde Park, Johannesburg',
    coordinates: { latitude: -26.1176, longitude: 28.0167 },
    address: 'Hyde Park Corner, Jan Smuts Ave, Hyde Park, Johannesburg, 2196',
    phone: '+27 11 325 5200',
    hours: 'Mon-Sun: 9:00 AM - 7:00 PM',
    services: ['Women', 'Beauty', 'Accessories'],
    rating: 4.3,
    deliveryTime: '2-4 days',
    distance: '4.3 km',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
    specialties: ['Women Fashion', 'Beauty Range']
  },
  // Electronics Stores
  {
    id: 'incredible_connection_woodmead',
    name: 'Incredible Connection Woodmead',
    brand: 'Incredible Connection',
    category: 'Electronics',
    location: 'Woodmead, Johannesburg',
    coordinates: { latitude: -26.0567, longitude: 28.0876 },
    address: 'Woodmead Retail Park, Woodmead Dr, Paulshof, Sandton, 2191',
    phone: '+27 11 804 1550',
    hours: 'Mon-Sun: 9:00 AM - 6:00 PM',
    services: ['Computers', 'Phones', 'Accessories', 'Repairs'],
    rating: 4.2,
    deliveryTime: '1-3 days',
    distance: '6.4 km',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
    specialties: ['Laptops', 'Smartphones', 'Tech Support']
  },
  {
    id: 'hi_fi_corp_eastgate',
    name: 'HiFi Corp Eastgate',
    brand: 'HiFi Corp',
    category: 'Electronics',
    location: 'Eastgate, Johannesburg',
    coordinates: { latitude: -26.1876, longitude: 28.1567 },
    address: 'Eastgate Shopping Centre, Bradford Rd, Bedfordview, 2008',
    phone: '+27 11 456 7900',
    hours: 'Mon-Sun: 9:00 AM - 7:00 PM',
    services: ['TV & Audio', 'Appliances', 'Computers'],
    rating: 4.0,
    deliveryTime: '2-4 days',
    distance: '7.5 km',
    image: 'https://images.unsplash.com/photo-1517059224940-d4af9eec41e5?w=400',
    specialties: ['TV Deals', 'Audio Systems']
  },
  {
    id: 'istore_sandton',
    name: 'iStore Sandton City',
    brand: 'iStore',
    category: 'Electronics',
    location: 'Sandton City, Johannesburg',
    coordinates: { latitude: -26.1076, longitude: 28.0567 },
    address: 'Sandton City Shopping Centre, Rivonia Rd, Sandton, 2196',
    phone: '+27 11 217 6205',
    hours: 'Mon-Sun: 9:00 AM - 8:00 PM',
    services: ['Apple Products', 'Repairs', 'Trade-in'],
    rating: 4.4,
    deliveryTime: '1-3 days',
    distance: '2.0 km',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
    specialties: ['Apple Ecosystem', 'Authorised Service']
  }
];

// Comprehensive product data across all stores
export const COMPREHENSIVE_PRODUCTS = [
  // Grocery Essentials
  {
    id: 'bread_white_700g',
    name: 'White Bread 700g',
    brand: 'Albany',
    category: 'Bakery',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
    stores: [
      { storeId: 'pnp_sandton', price: 16.99, inStock: true, promotion: null },
      { storeId: 'checkers_rosebank', price: 15.99, inStock: true, promotion: { type: 'discount', value: 10, originalPrice: 17.99 } },
      { storeId: 'woolworths_hyde_park', price: 22.99, inStock: true, promotion: null },
      { storeId: 'shoprite_eastgate', price: 14.99, inStock: true, promotion: null },
      { storeId: 'makro_woodmead', price: 13.99, inStock: true, promotion: { type: 'bulk', minQty: 6 } }
    ],
    rating: 4.2,
    reviews: 156,
    description: 'Fresh daily baked white bread, perfect for sandwiches and toast.'
  },
  {
    id: 'milk_fresh_2l',
    name: 'Fresh Milk 2L',
    brand: 'Clover',
    category: 'Dairy',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',
    stores: [
      { storeId: 'pnp_sandton', price: 32.99, inStock: true, promotion: null },
      { storeId: 'checkers_rosebank', price: 31.99, inStock: true, promotion: null },
      { storeId: 'woolworths_hyde_park', price: 36.99, inStock: true, promotion: null },
      { storeId: 'shoprite_eastgate', price: 29.99, inStock: true, promotion: { type: 'special', label: 'Weekend Special' } },
      { storeId: 'makro_woodmead', price: 28.99, inStock: true, promotion: null }
    ],
    rating: 4.5,
    reviews: 289,
    description: 'Fresh full cream milk, rich in calcium and vitamins.'
  },
  {
    id: 'eggs_large_18pack',
    name: 'Large Eggs 18 Pack',
    brand: 'Nulaid',
    category: 'Dairy',
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400',
    stores: [
      { storeId: 'pnp_sandton', price: 54.99, inStock: true, promotion: null },
      { storeId: 'checkers_rosebank', price: 52.99, inStock: true, promotion: null },
      { storeId: 'woolworths_hyde_park', price: 64.99, inStock: true, promotion: null },
      { storeId: 'shoprite_eastgate', price: 49.99, inStock: true, promotion: { type: 'discount', value: 15, originalPrice: 58.99 } },
      { storeId: 'makro_woodmead', price: 47.99, inStock: true, promotion: null }
    ],
    rating: 4.3,
    reviews: 203,
    description: 'Fresh large eggs from free-range chickens, perfect for baking and cooking.'
  },

  // Meat & Poultry
  {
    id: 'chicken_breast_1kg',
    name: 'Chicken Breast Fillets 1kg',
    brand: 'Rainbow',
    category: 'Meat',
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400',
    stores: [
      { storeId: 'pnp_sandton', price: 89.99, inStock: true, promotion: null },
      { storeId: 'checkers_rosebank', price: 85.99, inStock: true, promotion: { type: 'discount', value: 20, originalPrice: 105.99 } },
      { storeId: 'woolworths_hyde_park', price: 119.99, inStock: true, promotion: null },
      { storeId: 'shoprite_eastgate', price: 79.99, inStock: true, promotion: null },
      { storeId: 'makro_woodmead', price: 74.99, inStock: true, promotion: { type: 'bulk', minQty: 3 } }
    ],
    rating: 4.4,
    reviews: 178,
    description: 'Premium chicken breast fillets, skinless and boneless.'
  },
  {
    id: 'beef_mince_500g',
    name: 'Lean Beef Mince 500g',
    brand: 'Butcher Block',
    category: 'Meat',
    image: 'https://images.unsplash.com/photo-1588347818481-c7c4b1b6a8a6?w=400',
    stores: [
      { storeId: 'pnp_sandton', price: 65.99, inStock: true, promotion: null },
      { storeId: 'checkers_rosebank', price: 62.99, inStock: true, promotion: null },
      { storeId: 'woolworths_hyde_park', price: 79.99, inStock: true, promotion: null },
      { storeId: 'shoprite_eastgate', price: 58.99, inStock: true, promotion: { type: 'special', label: 'Braai Special' } },
      { storeId: 'makro_woodmead', price: 55.99, inStock: false, promotion: null }
    ],
    rating: 4.1,
    reviews: 134,
    description: 'Fresh lean beef mince, perfect for burgers, bolognese, and meatballs.'
  },

  // Fruits & Vegetables
  {
    id: 'bananas_1kg',
    name: 'Bananas 1kg',
    brand: 'Fresh Produce',
    category: 'Fruit',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400',
    stores: [
      { storeId: 'pnp_sandton', price: 24.99, inStock: true, promotion: null },
      { storeId: 'checkers_rosebank', price: 22.99, inStock: true, promotion: null },
      { storeId: 'woolworths_hyde_park', price: 29.99, inStock: true, promotion: null },
      { storeId: 'shoprite_eastgate', price: 19.99, inStock: true, promotion: { type: 'special', label: 'Fresh Friday' } },
      { storeId: 'makro_woodmead', price: 18.99, inStock: true, promotion: null }
    ],
    rating: 4.0,
    reviews: 89,
    description: 'Fresh ripe bananas, rich in potassium and natural energy.'
  },
  {
    id: 'potatoes_2kg',
    name: 'Potatoes 2kg Bag',
    brand: 'Farm Fresh',
    category: 'Vegetables',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400',
    stores: [
      { storeId: 'pnp_sandton', price: 34.99, inStock: true, promotion: null },
      { storeId: 'checkers_rosebank', price: 32.99, inStock: true, promotion: null },
      { storeId: 'woolworths_hyde_park', price: 42.99, inStock: true, promotion: null },
      { storeId: 'shoprite_eastgate', price: 28.99, inStock: true, promotion: null },
      { storeId: 'makro_woodmead', price: 26.99, inStock: true, promotion: { type: 'bulk', minQty: 5 } }
    ],
    rating: 4.2,
    reviews: 67,
    description: 'Fresh washed potatoes, perfect for roasting, mashing, or frying.'
  },

  // Beverages
  {
    id: 'coca_cola_2l',
    name: 'Coca-Cola 2L',
    brand: 'Coca-Cola',
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400',
    stores: [
      { storeId: 'pnp_sandton', price: 24.99, inStock: true, promotion: null },
      { storeId: 'checkers_rosebank', price: 22.99, inStock: true, promotion: { type: 'combo', description: '2 for R40' } },
      { storeId: 'woolworths_hyde_park', price: 26.99, inStock: true, promotion: null },
      { storeId: 'shoprite_eastgate', price: 21.99, inStock: true, promotion: null },
      { storeId: 'makro_woodmead', price: 19.99, inStock: true, promotion: { type: 'bulk', minQty: 12 } }
    ],
    rating: 4.3,
    reviews: 245,
    description: 'Classic Coca-Cola soft drink, refreshing and ice-cold.'
  }
];

// Daily deals and promotions
export const DAILY_DEALS = [
  {
    id: 'deal_weekend_meat',
    title: 'Weekend Braai Special',
    description: 'Up to 30% off selected meat products',
    validUntil: '2024-01-21',
    stores: ['checkers_rosebank', 'shoprite_eastgate'],
    category: 'Meat',
    discount: 30,
    image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400',
    terms: 'Valid on weekends only. While stocks last.'
  },
  {
    id: 'deal_fresh_friday',
    title: 'Fresh Friday Produce',
    description: '20% off all fresh fruits and vegetables',
    validUntil: '2024-01-19',
    stores: ['pnp_sandton', 'shoprite_eastgate'],
    category: 'Fruit',
    discount: 20,
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
    terms: 'Valid on Fridays only. Excludes pre-packed items.'
  },
  {
    id: 'deal_bulk_savings',
    title: 'Makro Bulk Savings',
    description: 'Buy 6 or more items and save 15%',
    validUntil: '2024-01-31',
    stores: ['makro_woodmead', 'makro_cape_town'],
    category: 'All',
    discount: 15,
    image: 'https://images.unsplash.com/photo-1604719312566-878b4d80e5c8?w=400',
    terms: 'Minimum 6 items required. Excludes alcohol and tobacco.'
  },
  {
    id: 'deal_smart_shopper',
    title: 'Smart Shopper Double Points',
    description: 'Earn double points on all purchases',
    validUntil: '2024-01-25',
    stores: ['pnp_sandton', 'pnp_cape_gate'],
    category: 'All',
    discount: 0,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    terms: 'Valid for Smart Shopper members only. Points credited within 48 hours.'
  }
];

// Location data for South Africa
export const SOUTH_AFRICAN_LOCATIONS = [
  'Sandton, Johannesburg',
  'Rosebank, Johannesburg',
  'Hyde Park, Johannesburg',
  'Eastgate, Johannesburg',
  'Woodmead, Johannesburg'
];

export const mockLocations = SOUTH_AFRICAN_LOCATIONS;
export const mockStores = MAJOR_SA_STORES;
export const mockProducts = COMPREHENSIVE_PRODUCTS;
