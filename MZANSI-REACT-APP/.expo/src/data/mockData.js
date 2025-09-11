// Mock data for the prototype - but we will replace with Firebase calls later this is just temporay data 

export const SOUTH_AFRICAN_LOCATIONS = [
  'Johannesburg, Gauteng',
  'Cape Town, Western Cape',
  'Durban, KwaZulu-Natal',
  'Pretoria, Gauteng',
  'Bloemfontein, Free State',
  'Port Elizabeth, Eastern Cape',
  'Polokwane, Limpopo',
  'Nelspruit, Mpumalanga',
  'Kimberley, Northern Cape',
  'Rustenburg, North West',
];

export const mockStores = [
  {
    id: '1',
    name: 'Pick n Pay Sandton',
    category: 'Supermarket',
    location: 'Johannesburg, Gauteng',
    rating: 4.2,
    reviews: 1250,
    deliveryTime: 'Same day',
    image: 'https://via.placeholder.com/300x200/4CAF50/white?text=Pick+n+Pay',
    flyerImage: 'https://via.placeholder.com/400x300/4CAF50/white?text=Weekly+Specials',
    promotions: [
      'Buy 2 Get 1 Free on selected items',
      '20% off Fresh Produce this weekend',
      'Free delivery on orders over R350'
    ],
    isOpen: true,
    description: 'Your neighborhood Pick n Pay with fresh groceries and daily essentials.'
  },
  {
    id: '2',
    name: 'Checkers Hyper Eastgate',
    category: 'Hypermarket',
    location: 'Johannesburg, Gauteng',
    rating: 4.0,
    reviews: 890,
    deliveryTime: 'Same day',
    image: 'https://via.placeholder.com/300x200/2196F3/white?text=Checkers',
    flyerImage: 'https://via.placeholder.com/400x300/2196F3/white?text=Great+Deals',
    promotions: [
      'R10 off when you spend R200+',
      'Half price meat specials',
      'Bulk buying discounts available'
    ],
    isOpen: true,
    description: 'One-stop shop for groceries, clothing, and household items.'
  },
  {
    id: '3',
    name: 'Woolworths Food Rosebank',
    category: 'Premium Groceries',
    location: 'Johannesburg, Gauteng',
    rating: 4.5,
    reviews: 650,
    deliveryTime: '2-4 hours',
    image: 'https://via.placeholder.com/300x200/9C27B0/white?text=Woolworths',
    flyerImage: 'https://via.placeholder.com/400x300/9C27B0/white?text=Quality+Food',
    promotions: [
      'Premium quality organic produce',
      'Ready meals 25% off',
      'Wine pairing deals'
    ],
    isOpen: true,
    description: 'Premium quality food and ingredients for discerning customers.'
  },
  {
    id: '4',
    name: 'Shoprite Soweto',
    category: 'Supermarket',
    location: 'Johannesburg, Gauteng',
    rating: 3.8,
    reviews: 1100,
    deliveryTime: 'Same day',
    image: 'https://via.placeholder.com/300x200/FF5722/white?text=Shoprite',
    flyerImage: 'https://via.placeholder.com/400x300/FF5722/white?text=Low+Prices',
    promotions: [
      'Lowest prices guaranteed',
      'Bulk family packs available',
      'Monthly specials on household items'
    ],
    isOpen: true,
    description: 'Affordable groceries and household essentials for the whole family.'
  },
  {
    id: '5',
    name: 'Mr Price Clothing Menlyn',
    category: 'Clothing',
    location: 'Pretoria, Gauteng',
    rating: 4.1,
    reviews: 780,
    deliveryTime: '3-7 days',
    image: 'https://via.placeholder.com/300x200/E91E63/white?text=Mr+Price',
    flyerImage: 'https://via.placeholder.com/400x300/E91E63/white?text=Fashion+Sale',
    promotions: [
      'Up to 50% off summer collection',
      'Back to school specials',
      'Buy 3 pay for 2 on selected items'
    ],
    isOpen: true,
    description: 'Trendy, affordable fashion for the whole family.'
  },
  {
    id: '6',
    name: 'Makro Woodmead',
    category: 'Wholesale',
    location: 'Johannesburg, Gauteng',
    rating: 4.3,
    reviews: 450,
    deliveryTime: '1-2 days',
    image: 'https://via.placeholder.com/300x200/607D8B/white?text=Makro',
    flyerImage: 'https://via.placeholder.com/400x300/607D8B/white?text=Wholesale+Deals',
    promotions: [
      'Bulk buying discounts',
      'Business account benefits',
      'Monthly catalog specials'
    ],
    isOpen: true,
    description: 'Wholesale shopping for businesses and bulk buyers.'
  }
];

export const mockProducts = {
  '1': [ 
    {
      id: 'p1',
      name: 'Fresh Bananas (1kg)',
      price: 24.99,
      category: 'Fresh Produce',
      image: 'https://via.placeholder.com/150x150/FFC107/black?text=Bananas',
      isSpecial: true,
      originalPrice: 29.99,
      description: 'Fresh, ripe bananas perfect for snacking'
    },
    {
      id: 'p2',
      name: 'Full Cream Milk (2L)',
      price: 32.99,
      category: 'Dairy',
      image: 'https://via.placeholder.com/150x150/FFFFFF/black?text=Milk',
      isSpecial: false,
      description: 'Fresh full cream milk, locally sourced'
    },
    {
      id: 'p3',
      name: 'Brown Bread (700g)',
      price: 16.99,
      category: 'Bakery',
      image: 'https://via.placeholder.com/150x150/8D6E63/white?text=Bread',
      isSpecial: true,
      originalPrice: 19.99,
      description: 'Freshly baked brown bread, high in fiber'
    },
    {
      id: 'p4',
      name: 'Chicken Breast (1kg)',
      price: 89.99,
      category: 'Meat',
      image: 'https://via.placeholder.com/150x150/FDD835/black?text=Chicken',
      isSpecial: false,
      description: 'Fresh chicken breast fillets'
    },
    {
      id: 'p5',
      name: 'Tomatoes (1kg)',
      price: 18.99,
      category: 'Fresh Produce',
      image: 'https://via.placeholder.com/150x150/F44336/white?text=Tomatoes',
      isSpecial: true,
      originalPrice: 24.99,
      description: 'Fresh vine tomatoes, locally grown'
    }
  ],
  '2': [ 
    {
      id: 'c1',
      name: 'Beef Mince (1kg)',
      price: 79.99,
      category: 'Meat',
      image: 'https://via.placeholder.com/150x150/795548/white?text=Mince',
      isSpecial: true,
      originalPrice: 94.99,
      description: 'Lean beef mince, perfect for family meals'
    },
    {
      id: 'c2',
      name: 'Rice (2kg)',
      price: 45.99,
      category: 'Pantry',
      image: 'https://via.placeholder.com/150x150/FFEB3B/black?text=Rice',
      isSpecial: false,
      description: 'Premium long grain white rice'
    },
    {
      id: 'c3',
      name: 'Eggs (18 pack)',
      price: 52.99,
      category: 'Dairy',
      image: 'https://via.placeholder.com/150x150/FFFFFF/black?text=Eggs',
      isSpecial: true,
      originalPrice: 58.99,
      description: 'Fresh large eggs from free-range chickens'
    }
  ],
  '3': [ 
    {
      id: 'w1',
      name: 'Organic Avocados (4 pack)',
      price: 49.99,
      category: 'Fresh Produce',
      image: 'https://images.unsplash.com/photo-1601039641847-7857b994d704?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      isSpecial: false,
      description: 'Organic avocados, perfectly ripe'
    },
    {
      id: 'w2',
      name: 'Artisan Sourdough Bread',
      price: 32.99,
      category: 'Bakery',
      image: 'https://via.placeholder.com/150x150/8D6E63/white?text=Sourdough',
      isSpecial: false,
      description: 'Handcrafted sourdough bread, baked fresh daily'
    }
  ],
  '4': [ 
    {
      id: 's1',
      name: 'Potatoes (2kg)',
      price: 22.99,
      category: 'Fresh Produce',
      image: 'https://via.placeholder.com/150x150/8D6E63/white?text=Potatoes',
      isSpecial: true,
      originalPrice: 27.99,
      description: 'Fresh potatoes, perfect for any meal'
    },
    {
      id: 's2',
      name: 'Cooking Oil (750ml)',
      price: 28.99,
      category: 'Pantry',
      image: 'https://via.placeholder.com/150x150/FFC107/black?text=Oil',
      isSpecial: false,
      description: 'Premium sunflower cooking oil'
    }
  ]
};

export const getMockStores = (location) => {
  if (!location) return mockStores;
  return mockStores.filter(store => 
    store.location.toLowerCase().includes(location.toLowerCase())
  );
};

export const getStoreProducts = (storeId) => {
  return mockProducts[storeId] || [];
};

// This is the we are using fornow for Firebase structure mockup - for reference when implementing real database
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