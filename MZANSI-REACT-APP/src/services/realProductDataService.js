// Real product data service with South African pricing and categories
import { mockStores } from '../data/mockData';
import { unsplashService } from './unsplashApi';

class RealProductDataService {
  constructor() {
    this.productCache = new Map();
    this.priceCache = new Map();
    this.lastUpdate = new Map();
    this.updateInterval = 60 * 60 * 1000; // 1 hour
  }

  // Get products by category with real South African data
  async getProductsByCategory(category, limit = 20) {
    const cacheKey = `products_${category}_${limit}`;
    const lastUpdateTime = this.lastUpdate.get(cacheKey);
    const now = Date.now();

    if (lastUpdateTime && (now - lastUpdateTime) < this.updateInterval) {
      return this.productCache.get(cacheKey);
    }

    try {
      let products = [];
      
      switch (category.toLowerCase()) {
        case 'food':
          products = await this.getFoodProducts(limit);
          break;
        case 'clothing':
          products = await this.getClothingProducts(limit);
          break;
        case 'electronics':
          products = await this.getElectronicsProducts(limit);
          break;
        case 'health':
          products = await this.getHealthProducts(limit);
          break;
        default:
          products = await this.getMixedProducts(limit);
      }

      // Add realistic South African pricing and deals
      products = await this.addPricingAndDeals(products);
      
      // Add store information and images
      products = await this.addStoreInfoAndImages(products, category);
      
      // Cache results
      this.productCache.set(cacheKey, products);
      this.lastUpdate.set(cacheKey, now);

      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      return this.getFallbackProducts(category, limit);
    }
  }

  // Food products with South African brands and pricing
  async getFoodProducts(limit) {
    const foodProducts = [
      // Dairy & Eggs
      { name: 'Clover Fresh Milk 2L', brand: 'Clover', category: 'Dairy', basePrice: 28.99, unit: '2L' },
      { name: 'Parmalat UHT Milk 1L', brand: 'Parmalat', category: 'Dairy', basePrice: 18.50, unit: '1L' },
      { name: 'Free Range Eggs 18s', brand: 'Farmer Brown', category: 'Dairy', basePrice: 65.99, unit: '18 pack' },
      { name: 'Danone Yoghurt 175g', brand: 'Danone', category: 'Dairy', basePrice: 12.99, unit: '175g' },
      
      // Bread & Bakery
      { name: 'Albany Superior White Bread', brand: 'Albany', category: 'Bakery', basePrice: 16.99, unit: '700g' },
      { name: 'Sasko Brown Bread', brand: 'Sasko', category: 'Bakery', basePrice: 15.99, unit: '700g' },
      { name: 'Croissants 6 Pack', brand: 'Woolworths', category: 'Bakery', basePrice: 24.99, unit: '6 pack' },
      
      // Meat & Poultry
      { name: 'Chicken Breast Fillets', brand: 'Rainbow', category: 'Meat', basePrice: 89.99, unit: 'per kg' },
      { name: 'Beef Mince', brand: 'Butchery', category: 'Meat', basePrice: 79.99, unit: 'per kg' },
      { name: 'Boerewors 500g', brand: 'Eskort', category: 'Meat', basePrice: 45.99, unit: '500g' },
      
      // Fruits & Vegetables
      { name: 'Bananas', brand: 'Fresh Produce', category: 'Produce', basePrice: 19.99, unit: 'per kg' },
      { name: 'Apples Red Delicious', brand: 'Fresh Produce', category: 'Produce', basePrice: 29.99, unit: 'per kg' },
      { name: 'Potatoes 2kg Bag', brand: 'Fresh Produce', category: 'Produce', basePrice: 24.99, unit: '2kg' },
      { name: 'Carrots 1kg', brand: 'Fresh Produce', category: 'Produce', basePrice: 12.99, unit: '1kg' },
      
      // Pantry Staples
      { name: 'White Star Maize Meal 2.5kg', brand: 'White Star', category: 'Pantry', basePrice: 32.99, unit: '2.5kg' },
      { name: 'Tastic Rice 2kg', brand: 'Tastic', category: 'Pantry', basePrice: 45.99, unit: '2kg' },
      { name: 'Sunfoil Cooking Oil 2L', brand: 'Sunfoil', category: 'Pantry', basePrice: 42.99, unit: '2L' },
      { name: 'Jungle Oats 1kg', brand: 'Jungle', category: 'Pantry', basePrice: 28.99, unit: '1kg' },
      
      // Beverages
      { name: 'Coca-Cola 2L', brand: 'Coca-Cola', category: 'Beverages', basePrice: 22.99, unit: '2L' },
      { name: 'Rooibos Tea 40 Bags', brand: 'Freshpak', category: 'Beverages', basePrice: 18.99, unit: '40 bags' },
      { name: 'Mageu 1L', brand: 'Inkomazi', category: 'Beverages', basePrice: 14.99, unit: '1L' },
      
      // Snacks
      { name: 'Simba Chips 120g', brand: 'Simba', category: 'Snacks', basePrice: 16.99, unit: '120g' },
      { name: 'Biltong 100g', brand: 'Kalahari', category: 'Snacks', basePrice: 45.99, unit: '100g' },
      { name: 'Rusks 500g', brand: 'Ouma', category: 'Snacks', basePrice: 24.99, unit: '500g' }
    ];

    return this.shuffleArray(foodProducts).slice(0, limit);
  }

  // Clothing products with South African retailers
  async getClothingProducts(limit) {
    const clothingProducts = [
      // Men's Clothing
      { name: 'Men\'s Polo Shirt', brand: 'Woolworths', category: 'Men\'s Wear', basePrice: 199.99, unit: 'each' },
      { name: 'Jeans Regular Fit', brand: 'Edgars', category: 'Men\'s Wear', basePrice: 399.99, unit: 'each' },
      { name: 'Formal Shirt White', brand: 'Markham', category: 'Men\'s Wear', basePrice: 299.99, unit: 'each' },
      { name: 'Sneakers', brand: 'Totalsports', category: 'Footwear', basePrice: 899.99, unit: 'pair' },
      
      // Women's Clothing
      { name: 'Ladies Blouse', brand: 'Foschini', category: 'Women\'s Wear', basePrice: 249.99, unit: 'each' },
      { name: 'Skinny Jeans', brand: 'Truworths', category: 'Women\'s Wear', basePrice: 449.99, unit: 'each' },
      { name: 'Summer Dress', brand: 'Woolworths', category: 'Women\'s Wear', basePrice: 599.99, unit: 'each' },
      { name: 'High Heels', brand: 'Ackermans', category: 'Footwear', basePrice: 299.99, unit: 'pair' },
      
      // Kids Clothing
      { name: 'Kids T-Shirt', brand: 'PEP', category: 'Kids Wear', basePrice: 79.99, unit: 'each' },
      { name: 'School Shoes', brand: 'Bata', category: 'Kids Wear', basePrice: 199.99, unit: 'pair' },
      { name: 'Kids Shorts', brand: 'Ackermans', category: 'Kids Wear', basePrice: 99.99, unit: 'each' },
      
      // Accessories
      { name: 'Leather Belt', brand: 'Edgars', category: 'Accessories', basePrice: 149.99, unit: 'each' },
      { name: 'Handbag', brand: 'Foschini', category: 'Accessories', basePrice: 399.99, unit: 'each' },
      { name: 'Sunglasses', brand: 'Sunglass Hut', category: 'Accessories', basePrice: 799.99, unit: 'pair' }
    ];

    return this.shuffleArray(clothingProducts).slice(0, limit);
  }

  // Electronics with South African pricing
  async getElectronicsProducts(limit) {
    const electronicsProducts = [
      // Mobile & Tablets
      { name: 'Samsung Galaxy A54', brand: 'Samsung', category: 'Mobile', basePrice: 6999.99, unit: 'each' },
      { name: 'iPhone 13', brand: 'Apple', category: 'Mobile', basePrice: 14999.99, unit: 'each' },
      { name: 'Huawei P40 Lite', brand: 'Huawei', category: 'Mobile', basePrice: 4999.99, unit: 'each' },
      { name: 'iPad 9th Gen', brand: 'Apple', category: 'Tablets', basePrice: 8999.99, unit: 'each' },
      
      // Home Appliances
      { name: 'LG Washing Machine 8kg', brand: 'LG', category: 'Appliances', basePrice: 7999.99, unit: 'each' },
      { name: 'Samsung Fridge 300L', brand: 'Samsung', category: 'Appliances', basePrice: 12999.99, unit: 'each' },
      { name: 'Defy Microwave 28L', brand: 'Defy', category: 'Appliances', basePrice: 1999.99, unit: 'each' },
      { name: 'Russell Hobbs Kettle', brand: 'Russell Hobbs', category: 'Small Appliances', basePrice: 399.99, unit: 'each' },
      
      // Audio & TV
      { name: 'Samsung 55" Smart TV', brand: 'Samsung', category: 'TV & Audio', basePrice: 9999.99, unit: 'each' },
      { name: 'JBL Bluetooth Speaker', brand: 'JBL', category: 'TV & Audio', basePrice: 1299.99, unit: 'each' },
      { name: 'Sony Headphones', brand: 'Sony', category: 'TV & Audio', basePrice: 899.99, unit: 'each' },
      
      // Computing
      { name: 'HP Laptop 15.6"', brand: 'HP', category: 'Computing', basePrice: 8999.99, unit: 'each' },
      { name: 'Logitech Wireless Mouse', brand: 'Logitech', category: 'Computing', basePrice: 299.99, unit: 'each' },
      { name: 'Gaming Keyboard', brand: 'Razer', category: 'Computing', basePrice: 1499.99, unit: 'each' }
    ];

    return this.shuffleArray(electronicsProducts).slice(0, limit);
  }

  // Health & beauty products
  async getHealthProducts(limit) {
    const healthProducts = [
      // Personal Care
      { name: 'Colgate Toothpaste 100ml', brand: 'Colgate', category: 'Oral Care', basePrice: 24.99, unit: '100ml' },
      { name: 'Head & Shoulders Shampoo', brand: 'Head & Shoulders', category: 'Hair Care', basePrice: 89.99, unit: '400ml' },
      { name: 'Dove Soap 4 Pack', brand: 'Dove', category: 'Body Care', basePrice: 45.99, unit: '4 pack' },
      { name: 'Nivea Body Lotion 400ml', brand: 'Nivea', category: 'Body Care', basePrice: 79.99, unit: '400ml' },
      
      // Vitamins & Supplements
      { name: 'Vitamin C 1000mg', brand: 'Clicks', category: 'Vitamins', basePrice: 149.99, unit: '30 tablets' },
      { name: 'Multivitamins', brand: 'Dis-Chem', category: 'Vitamins', basePrice: 199.99, unit: '60 tablets' },
      { name: 'Omega 3 Fish Oil', brand: 'Solal', category: 'Supplements', basePrice: 299.99, unit: '60 capsules' },
      
      // Medicine & First Aid
      { name: 'Panado 24 Tablets', brand: 'Panado', category: 'Medicine', basePrice: 34.99, unit: '24 tablets' },
      { name: 'Allergex 30 Tablets', brand: 'Allergex', category: 'Medicine', basePrice: 89.99, unit: '30 tablets' },
      { name: 'First Aid Kit', brand: 'Clicks', category: 'First Aid', basePrice: 199.99, unit: 'kit' },
      
      // Baby Care
      { name: 'Pampers Nappies Size 3', brand: 'Pampers', category: 'Baby Care', basePrice: 199.99, unit: '44 pack' },
      { name: 'Johnson\'s Baby Lotion', brand: 'Johnson\'s', category: 'Baby Care', basePrice: 69.99, unit: '300ml' },
      { name: 'Baby Formula 900g', brand: 'Nan', category: 'Baby Care', basePrice: 299.99, unit: '900g' }
    ];

    return this.shuffleArray(healthProducts).slice(0, limit);
  }

  // Add realistic South African pricing and promotional deals
  async addPricingAndDeals(products) {
    return products.map(product => {
      // Add some price variation (±20%)
      const priceVariation = (Math.random() - 0.5) * 0.4; // -20% to +20%
      const currentPrice = product.basePrice * (1 + priceVariation);
      
      // Generate random deals
      const hasPromotion = Math.random() > 0.7; // 30% chance of promotion
      let promotionType = null;
      let promotionPrice = currentPrice;
      let savings = 0;

      if (hasPromotion) {
        const promoTypes = ['percentage', 'buy_one_get_one', 'bulk_discount', 'fixed_amount'];
        promotionType = promoTypes[Math.floor(Math.random() * promoTypes.length)];
        
        switch (promotionType) {
          case 'percentage':
            const discount = Math.floor(Math.random() * 30) + 10; // 10-40% off
            promotionPrice = currentPrice * (1 - discount / 100);
            savings = currentPrice - promotionPrice;
            break;
          case 'buy_one_get_one':
            promotionPrice = currentPrice * 0.5; // Effectively 50% off
            savings = currentPrice - promotionPrice;
            break;
          case 'bulk_discount':
            promotionPrice = currentPrice * 0.85; // 15% bulk discount
            savings = currentPrice - promotionPrice;
            break;
          case 'fixed_amount':
            const fixedDiscount = Math.min(currentPrice * 0.3, 50); // Max R50 off
            promotionPrice = currentPrice - fixedDiscount;
            savings = fixedDiscount;
            break;
        }
      }

      return {
        id: `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...product,
        price: Math.round(currentPrice * 100) / 100,
        originalPrice: hasPromotion ? Math.round(currentPrice * 100) / 100 : null,
        promotionPrice: hasPromotion ? Math.round(promotionPrice * 100) / 100 : null,
        savings: hasPromotion ? Math.round(savings * 100) / 100 : 0,
        promotionType,
        hasPromotion,
        inStock: Math.random() > 0.05, // 95% chance in stock
        stockLevel: Math.floor(Math.random() * 100) + 1,
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0-5.0 rating
        reviews: Math.floor(Math.random() * 500) + 10,
        image: this.getProductImageUrl(product.name, product.category),
        description: this.generateProductDescription(product),
        nutritionalInfo: product.category === 'Food' ? this.generateNutritionalInfo() : null,
        specifications: product.category === 'Electronics' ? this.generateSpecifications(product) : null
      };
    });
  }

  // Generate product descriptions
  generateProductDescription(product) {
    const descriptions = {
      'Dairy': `Fresh ${product.name} from ${product.brand}. High quality dairy product perfect for daily consumption.`,
      'Bakery': `Freshly baked ${product.name} from ${product.brand}. Soft, delicious, and made with quality ingredients.`,
      'Meat': `Premium ${product.name} from ${product.brand}. Fresh, high-quality meat perfect for family meals.`,
      'Produce': `Fresh ${product.name} sourced from local farms. Nutritious and delicious, perfect for healthy eating.`,
      'Pantry': `Essential ${product.name} from ${product.brand}. A kitchen staple for South African households.`,
      'Beverages': `Refreshing ${product.name} from ${product.brand}. Perfect for any time of day.`,
      'Snacks': `Delicious ${product.name} from ${product.brand}. Perfect for snacking or sharing with friends.`,
      'Electronics': `High-quality ${product.name} from ${product.brand}. Latest technology with excellent performance.`,
      'Clothing': `Stylish ${product.name} from ${product.brand}. Comfortable, durable, and fashionable.`,
      'Health': `Quality ${product.name} from ${product.brand}. Trusted healthcare product for your wellbeing.`
    };

    return descriptions[product.category] || `Quality ${product.name} from ${product.brand}.`;
  }

  // Generate nutritional information for food products
  generateNutritionalInfo() {
    return {
      energy: Math.floor(Math.random() * 300) + 100 + ' kJ',
      protein: Math.floor(Math.random() * 20) + 2 + 'g',
      carbohydrates: Math.floor(Math.random() * 50) + 10 + 'g',
      fat: Math.floor(Math.random() * 15) + 1 + 'g',
      fiber: Math.floor(Math.random() * 10) + 1 + 'g',
      sodium: Math.floor(Math.random() * 500) + 50 + 'mg'
    };
  }

  // Generate specifications for electronics
  generateSpecifications(product) {
    const specs = {
      'Mobile': {
        'Screen Size': '6.1 inches',
        'Storage': '128GB',
        'RAM': '6GB',
        'Camera': '48MP',
        'Battery': '4000mAh'
      },
      'TV & Audio': {
        'Display': '4K Ultra HD',
        'Smart TV': 'Yes',
        'HDR': 'HDR10+',
        'Connectivity': 'Wi-Fi, Bluetooth',
        'Warranty': '2 Years'
      },
      'Appliances': {
        'Energy Rating': 'A++',
        'Capacity': product.name.includes('kg') ? product.name.match(/\d+kg/)?.[0] : 'Standard',
        'Warranty': '2 Years',
        'Color': 'White/Silver',
        'Dimensions': '60cm x 85cm x 60cm'
      }
    };

    return specs[product.category] || {
      'Brand': product.brand,
      'Warranty': '1 Year',
      'Color': 'Various'
    };
  }

  // Get product image URL
  getProductImageUrl(productName, category) {
    // Use Unsplash for realistic product images
    const searchTerms = {
      'Dairy': 'milk dairy products',
      'Bakery': 'bread bakery',
      'Meat': 'meat butcher',
      'Produce': 'fruits vegetables',
      'Pantry': 'grocery pantry',
      'Beverages': 'drinks beverages',
      'Snacks': 'snacks chips',
      'Electronics': 'electronics gadgets',
      'Clothing': 'clothing fashion',
      'Health': 'health pharmacy'
    };

    const searchTerm = searchTerms[category] || productName;
    return `https://images.unsplash.com/photo-${Date.now()}?w=300&h=300&fit=crop&q=80`;
  }

  // Utility functions
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  getFallbackProducts(category, limit) {
    // Return basic fallback products if API fails
    return Array.from({ length: Math.min(limit, 10) }, (_, index) => ({
      id: `fallback_${category}_${index}`,
      name: `${category} Product ${index + 1}`,
      brand: 'Generic',
      category: category,
      price: Math.floor(Math.random() * 100) + 10,
      unit: 'each',
      inStock: true,
      rating: 4.0,
      reviews: 50,
      hasPromotion: false,
      image: 'https://via.placeholder.com/300x300/cccccc/666666?text=Product'
    }));
  }

  getMixedProducts(limit) {
    // Return a mix of products from all categories
    const categories = ['food', 'clothing', 'electronics', 'health'];
    const productsPerCategory = Math.ceil(limit / categories.length);
    
    return Promise.all(
      categories.map(category => this[`get${category.charAt(0).toUpperCase() + category.slice(1)}Products`](productsPerCategory))
    ).then(results => 
      this.shuffleArray(results.flat()).slice(0, limit)
    );
  }

  // Add store information and images to products
  async addStoreInfoAndImages(products, category) {
    const categoryStores = mockStores.filter(store => 
      store.category.toLowerCase() === category.toLowerCase()
    );
    
    const updatedProducts = await Promise.all(products.map(async (product, index) => {
      // Assign a store to each product
      const store = categoryStores[index % categoryStores.length] || mockStores[0];
      
      // Get real image from Unsplash
      let productImage = product.image;
      try {
        const searchTerm = `${product.name} ${category}`.replace(/[^a-zA-Z0-9\s]/g, '');
        const images = await unsplashService.searchPhotos(searchTerm, 1);
        if (images && images.length > 0) {
          productImage = images[0].url || images[0].urls?.regular || product.image;
        }
      } catch (error) {
        console.log(`Using fallback image for ${product.name}`);
        // Keep the existing fallback image
      }
      
      return {
        ...product,
        storeId: store.id,
        storeName: store.name,
        storeRating: store.rating,
        storeDeliveryTime: store.deliveryTime,
        storeDistance: store.distance,
        image: productImage
      };
    }));
    
    return updatedProducts;
  }

  // Clear cache
  clearCache() {
    this.productCache.clear();
    this.priceCache.clear();
    this.lastUpdate.clear();
  }
}

export const realProductDataService = new RealProductDataService();

// Helper functions for formatting
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2
  }).format(price);
};

export const formatSavings = (savings) => {
  return `Save ${formatPrice(savings)}`;
};

export const getPromotionLabel = (product) => {
  if (!product.hasPromotion) return null;
  
  switch (product.promotionType) {
    case 'percentage':
      const percentage = Math.round(((product.price - product.promotionPrice) / product.price) * 100);
      return `${percentage}% OFF`;
    case 'buy_one_get_one':
      return 'BUY 1 GET 1';
    case 'bulk_discount':
      return 'BULK DISCOUNT';
    case 'fixed_amount':
      return `${formatSavings(product.savings)} OFF`;
    default:
      return 'SPECIAL OFFER';
  }
};
