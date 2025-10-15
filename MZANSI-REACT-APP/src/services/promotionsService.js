// Dynamic pricing and promotions management service
import AsyncStorage from '@react-native-async-storage/async-storage';

class PromotionsService {
  constructor() {
    this.promotionsCache = new Map();
    this.pricingCache = new Map();
    this.lastUpdate = new Map();
    this.updateInterval = 15 * 60 * 1000; // 15 minutes
  }

  // Get active promotions for a store
  async getStorePromotions(storeId) {
    const cacheKey = `promotions_${storeId}`;
    const lastUpdateTime = this.lastUpdate.get(cacheKey);
    const now = Date.now();

    if (lastUpdateTime && (now - lastUpdateTime) < this.updateInterval) {
      return this.promotionsCache.get(cacheKey);
    }

    try {
      const promotions = await this.fetchStorePromotions(storeId);
      
      this.promotionsCache.set(cacheKey, promotions);
      this.lastUpdate.set(cacheKey, now);

      // Cache to AsyncStorage
      await AsyncStorage.setItem(cacheKey, JSON.stringify({
        data: promotions,
        timestamp: now
      }));

      return promotions;
    } catch (error) {
      console.error('Error fetching promotions:', error);
      return this.getDefaultPromotions(storeId);
    }
  }

  // Fetch promotions from backend (simulated)
  async fetchStorePromotions(storeId) {
    // Simulate API call with realistic South African retail promotions
    const promotionTypes = [
      {
        id: 'buy_2_get_1',
        type: 'buy_x_get_y',
        title: 'Buy 2 Get 1 Free',
        description: 'Buy any 2 items and get the 3rd one free',
        category: 'general',
        discount: 33.33,
        conditions: { minQuantity: 2, freeQuantity: 1 },
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        active: Math.random() > 0.3
      },
      {
        id: 'weekend_special',
        type: 'percentage',
        title: 'Weekend Special - 20% Off',
        description: '20% off all fresh produce this weekend',
        category: 'produce',
        discount: 20,
        conditions: { minAmount: 0, weekendOnly: true },
        validUntil: this.getNextSunday().toISOString(),
        active: this.isWeekend()
      },
      {
        id: 'bulk_discount',
        type: 'bulk',
        title: 'Bulk Buying Discount',
        description: 'Save more when you buy more - up to 15% off',
        category: 'general',
        discount: 15,
        conditions: { 
          tiers: [
            { minAmount: 200, discount: 5 },
            { minAmount: 500, discount: 10 },
            { minAmount: 1000, discount: 15 }
          ]
        },
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        active: Math.random() > 0.2
      },
      {
        id: 'first_time_buyer',
        type: 'fixed_amount',
        title: 'New Customer Special',
        description: 'R50 off your first order over R300',
        category: 'general',
        discount: 50,
        conditions: { minAmount: 300, firstTimeOnly: true },
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        active: Math.random() > 0.4
      },
      {
        id: 'loyalty_double_points',
        type: 'loyalty',
        title: 'Double Loyalty Points',
        description: 'Earn double points on all purchases today',
        category: 'loyalty',
        discount: 0,
        conditions: { loyaltyMultiplier: 2 },
        validUntil: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        active: Math.random() > 0.5
      },
      {
        id: 'free_delivery',
        type: 'delivery',
        title: 'Free Delivery',
        description: 'Free delivery on orders over R350',
        category: 'delivery',
        discount: 0,
        conditions: { minAmount: 350, freeDelivery: true },
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        active: Math.random() > 0.3
      }
    ];

    // Return 2-4 random active promotions
    const activePromotions = promotionTypes.filter(p => p.active);
    const numPromotions = Math.min(Math.floor(Math.random() * 3) + 2, activePromotions.length);
    
    return activePromotions
      .sort(() => Math.random() - 0.5)
      .slice(0, numPromotions)
      .map(promo => ({
        ...promo,
        storeId,
        createdAt: new Date().toISOString()
      }));
  }

  getDefaultPromotions(storeId) {
    return [
      {
        id: 'default_promo',
        storeId,
        type: 'percentage',
        title: 'Store Special',
        description: 'Special offers available in-store',
        category: 'general',
        discount: 10,
        conditions: { minAmount: 100 },
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        active: true,
        createdAt: new Date().toISOString()
      }
    ];
  }

  // Calculate dynamic pricing for products
  async calculateDynamicPrice(productId, basePrice, storeId, userProfile = {}) {
    try {
      const factors = await this.getPricingFactors(productId, storeId);
      const promotions = await this.getStorePromotions(storeId);
      
      let finalPrice = basePrice;
      let appliedDiscounts = [];

      // Apply time-based pricing
      if (factors.timeBasedDiscount > 0) {
        const timeDiscount = basePrice * (factors.timeBasedDiscount / 100);
        finalPrice -= timeDiscount;
        appliedDiscounts.push({
          type: 'time_based',
          description: 'Time-sensitive discount',
          amount: timeDiscount,
          percentage: factors.timeBasedDiscount
        });
      }

      // Apply demand-based pricing
      if (factors.demandMultiplier !== 1) {
        const demandAdjustment = basePrice * (factors.demandMultiplier - 1);
        finalPrice += demandAdjustment;
        if (demandAdjustment > 0) {
          appliedDiscounts.push({
            type: 'high_demand',
            description: 'High demand surcharge',
            amount: demandAdjustment,
            percentage: (factors.demandMultiplier - 1) * 100
          });
        }
      }

      // Apply promotions
      for (const promotion of promotions) {
        const discount = this.calculatePromotionDiscount(promotion, finalPrice, userProfile);
        if (discount.applicable && discount.amount > 0) {
          finalPrice -= discount.amount;
          appliedDiscounts.push({
            type: 'promotion',
            promotionId: promotion.id,
            description: promotion.title,
            amount: discount.amount,
            percentage: discount.percentage
          });
        }
      }

      // Ensure price doesn't go below minimum
      const minimumPrice = basePrice * 0.1; // Never go below 10% of base price
      finalPrice = Math.max(finalPrice, minimumPrice);

      return {
        productId,
        basePrice,
        finalPrice: Math.round(finalPrice * 100) / 100, // Round to 2 decimal places
        savings: Math.round((basePrice - finalPrice) * 100) / 100,
        savingsPercentage: Math.round(((basePrice - finalPrice) / basePrice) * 100),
        appliedDiscounts,
        factors,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error calculating dynamic price:', error);
      return {
        productId,
        basePrice,
        finalPrice: basePrice,
        savings: 0,
        savingsPercentage: 0,
        appliedDiscounts: [],
        error: error.message
      };
    }
  }

  // Get pricing factors (demand, time, inventory, etc.)
  async getPricingFactors(productId, storeId) {
    const hour = new Date().getHours();
    const dayOfWeek = new Date().getDay();
    
    return {
      // Time-based factors
      timeBasedDiscount: this.getTimeBasedDiscount(hour, dayOfWeek),
      
      // Demand-based factors (simulate based on time and randomness)
      demandMultiplier: this.getDemandMultiplier(hour, dayOfWeek),
      
      // Inventory factors
      inventoryLevel: Math.random(), // 0-1, where 1 is full stock
      
      // Competition factors
      competitorPricing: Math.random() * 0.2 - 0.1, // -10% to +10%
      
      // Seasonal factors
      seasonalMultiplier: this.getSeasonalMultiplier(),
      
      // Store-specific factors
      storePerformance: Math.random() * 0.1, // 0-10% adjustment
    };
  }

  getTimeBasedDiscount(hour, dayOfWeek) {
    // Higher discounts during off-peak hours
    if (hour >= 22 || hour <= 6) return 15; // Late night/early morning
    if (hour >= 14 && hour <= 16) return 10; // Afternoon lull
    if (dayOfWeek === 1 || dayOfWeek === 2) return 5; // Monday/Tuesday
    return 0;
  }

  getDemandMultiplier(hour, dayOfWeek) {
    // Higher prices during peak hours
    if ((hour >= 17 && hour <= 19) || (hour >= 11 && hour <= 13)) return 1.1; // Peak hours
    if (dayOfWeek === 5 || dayOfWeek === 6) return 1.05; // Friday/Saturday
    return 1.0;
  }

  getSeasonalMultiplier() {
    const month = new Date().getMonth();
    // Simulate seasonal pricing (e.g., higher prices in December)
    if (month === 11) return 1.1; // December
    if (month >= 5 && month <= 7) return 0.95; // Winter months
    return 1.0;
  }

  // Calculate promotion discount
  calculatePromotionDiscount(promotion, price, userProfile) {
    if (!promotion.active || new Date() > new Date(promotion.validUntil)) {
      return { applicable: false, amount: 0, percentage: 0 };
    }

    // Check conditions
    if (promotion.conditions.firstTimeOnly && userProfile.isReturningCustomer) {
      return { applicable: false, amount: 0, percentage: 0 };
    }

    if (promotion.conditions.minAmount && price < promotion.conditions.minAmount) {
      return { applicable: false, amount: 0, percentage: 0 };
    }

    if (promotion.conditions.weekendOnly && !this.isWeekend()) {
      return { applicable: false, amount: 0, percentage: 0 };
    }

    // Calculate discount based on type
    switch (promotion.type) {
      case 'percentage':
        const percentageAmount = price * (promotion.discount / 100);
        return {
          applicable: true,
          amount: percentageAmount,
          percentage: promotion.discount
        };

      case 'fixed_amount':
        return {
          applicable: true,
          amount: Math.min(promotion.discount, price),
          percentage: (promotion.discount / price) * 100
        };

      case 'bulk':
        const tier = promotion.conditions.tiers
          .reverse()
          .find(t => price >= t.minAmount);
        if (tier) {
          const bulkAmount = price * (tier.discount / 100);
          return {
            applicable: true,
            amount: bulkAmount,
            percentage: tier.discount
          };
        }
        return { applicable: false, amount: 0, percentage: 0 };

      default:
        return { applicable: false, amount: 0, percentage: 0 };
    }
  }

  // Get personalized promotions based on user behavior
  async getPersonalizedPromotions(userId, userProfile) {
    try {
      // Simulate personalized promotions based on user data
      const personalizedPromotions = [];

      // Frequent shopper promotion
      if (userProfile.orderCount > 10) {
        personalizedPromotions.push({
          id: 'loyal_customer',
          type: 'percentage',
          title: 'Loyal Customer Reward',
          description: '15% off your next order - Thank you for your loyalty!',
          discount: 15,
          conditions: { personalizedFor: userId },
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          active: true,
          personalized: true
        });
      }

      // Category-based promotion
      if (userProfile.favoriteCategory) {
        personalizedPromotions.push({
          id: 'category_special',
          type: 'percentage',
          title: `${userProfile.favoriteCategory} Special`,
          description: `10% off all ${userProfile.favoriteCategory.toLowerCase()} items`,
          discount: 10,
          conditions: { category: userProfile.favoriteCategory },
          validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          active: true,
          personalized: true
        });
      }

      // Birthday promotion
      if (this.isBirthdayMonth(userProfile.birthDate)) {
        personalizedPromotions.push({
          id: 'birthday_special',
          type: 'fixed_amount',
          title: 'Happy Birthday!',
          description: 'R100 off your birthday month order',
          discount: 100,
          conditions: { minAmount: 300, birthdayMonth: true },
          validUntil: this.getEndOfMonth().toISOString(),
          active: true,
          personalized: true
        });
      }

      return personalizedPromotions;
    } catch (error) {
      console.error('Error getting personalized promotions:', error);
      return [];
    }
  }

  // Apply promotion to cart
  applyPromotionToCart(cart, promotion) {
    let totalDiscount = 0;
    const updatedItems = cart.items.map(item => {
      const discount = this.calculatePromotionDiscount(
        promotion, 
        item.price * item.quantity,
        {}
      );
      
      if (discount.applicable) {
        totalDiscount += discount.amount;
        return {
          ...item,
          appliedPromotion: {
            id: promotion.id,
            title: promotion.title,
            discount: discount.amount
          }
        };
      }
      return item;
    });

    return {
      ...cart,
      items: updatedItems,
      promotions: [...(cart.promotions || []), promotion],
      totalDiscount: (cart.totalDiscount || 0) + totalDiscount,
      total: cart.subtotal - ((cart.totalDiscount || 0) + totalDiscount)
    };
  }

  // Utility functions
  isWeekend() {
    const day = new Date().getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  }

  getNextSunday() {
    const today = new Date();
    const daysUntilSunday = 7 - today.getDay();
    const nextSunday = new Date(today);
    nextSunday.setDate(today.getDate() + daysUntilSunday);
    nextSunday.setHours(23, 59, 59, 999);
    return nextSunday;
  }

  isBirthdayMonth(birthDate) {
    if (!birthDate) return false;
    const birth = new Date(birthDate);
    const now = new Date();
    return birth.getMonth() === now.getMonth();
  }

  getEndOfMonth() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  // Clear cache
  clearCache() {
    this.promotionsCache.clear();
    this.pricingCache.clear();
    this.lastUpdate.clear();
  }

  // Get promotion analytics
  async getPromotionAnalytics(storeId, dateRange) {
    // Simulate promotion performance analytics
    return {
      totalPromotions: Math.floor(Math.random() * 10) + 5,
      activePromotions: Math.floor(Math.random() * 5) + 2,
      totalRedemptions: Math.floor(Math.random() * 1000) + 100,
      totalSavings: Math.floor(Math.random() * 50000) + 10000,
      topPerformingPromotion: {
        id: 'weekend_special',
        title: 'Weekend Special - 20% Off',
        redemptions: Math.floor(Math.random() * 200) + 50,
        savings: Math.floor(Math.random() * 10000) + 2000
      },
      conversionRate: (Math.random() * 0.3 + 0.1).toFixed(2), // 10-40%
      averageOrderIncrease: (Math.random() * 50 + 20).toFixed(2) // 20-70%
    };
  }
}

export const promotionsService = new PromotionsService();

// Helper functions for formatting
export const formatDiscount = (discount, type = 'percentage') => {
  if (type === 'percentage') {
    return `${discount}% OFF`;
  } else if (type === 'fixed_amount') {
    return `R${discount} OFF`;
  }
  return `${discount} OFF`;
};

export const formatSavings = (savings) => {
  return `You save R${savings.toFixed(2)}`;
};

export const isPromotionValid = (promotion) => {
  return promotion.active && new Date() <= new Date(promotion.validUntil);
};
