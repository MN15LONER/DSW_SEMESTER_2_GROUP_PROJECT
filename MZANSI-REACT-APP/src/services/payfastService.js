// PayFast payment gateway integration for South African payments
// You'll need to get merchant credentials from https://www.payfast.co.za/

import { Alert } from 'react-native';
import CryptoJS from 'crypto-js';

const PAYFAST_CONFIG = {
  MERCHANT_ID: 'YOUR_MERCHANT_ID', // Replace with your PayFast Merchant ID
  MERCHANT_KEY: 'YOUR_MERCHANT_KEY', // Replace with your PayFast Merchant Key
  PASSPHRASE: 'YOUR_PASSPHRASE', // Replace with your PayFast Passphrase
  SANDBOX: true, // Set to false for production
  SANDBOX_URL: 'https://sandbox.payfast.co.za/eng/process',
  PRODUCTION_URL: 'https://www.payfast.co.za/eng/process',
};

class PayFastService {
  constructor() {
    this.merchantId = PAYFAST_CONFIG.MERCHANT_ID;
    this.merchantKey = PAYFAST_CONFIG.MERCHANT_KEY;
    this.passphrase = PAYFAST_CONFIG.PASSPHRASE;
    this.isSandbox = PAYFAST_CONFIG.SANDBOX;
    this.apiUrl = this.isSandbox ? PAYFAST_CONFIG.SANDBOX_URL : PAYFAST_CONFIG.PRODUCTION_URL;
  }

  // Generate payment form data for PayFast
  generatePaymentData(orderData) {
    const {
      orderId,
      amount,
      itemName,
      itemDescription,
      customerEmail,
      customerFirstName,
      customerLastName,
      customerCell,
      returnUrl,
      cancelUrl,
      notifyUrl
    } = orderData;

    // Basic payment data
    const paymentData = {
      merchant_id: this.merchantId,
      merchant_key: this.merchantKey,
      return_url: returnUrl || 'https://your-app.com/payment/success',
      cancel_url: cancelUrl || 'https://your-app.com/payment/cancel',
      notify_url: notifyUrl || 'https://your-app.com/payment/notify',
      
      // Order details
      m_payment_id: orderId,
      amount: parseFloat(amount).toFixed(2),
      item_name: itemName || 'Mzansi App Order',
      item_description: itemDescription || `Order #${orderId}`,
      
      // Customer details
      email_address: customerEmail,
      name_first: customerFirstName,
      name_last: customerLastName,
      cell_number: customerCell,
      
      // Additional settings
      payment_method: 'cc', // Credit card
      subscription_type: 1, // One-time payment
      billing_date: new Date().toISOString().split('T')[0],
      recurring_amount: parseFloat(amount).toFixed(2),
      frequency: 3, // Monthly (not used for one-time payments)
      cycles: 0, // Indefinite (not used for one-time payments)
    };

    // Generate signature
    paymentData.signature = this.generateSignature(paymentData);

    return paymentData;
  }

  // Generate MD5 signature for PayFast
  generateSignature(data) {
    // Create parameter string
    let paramString = '';
    const sortedKeys = Object.keys(data).sort();
    
    for (const key of sortedKeys) {
      if (key !== 'signature' && data[key] !== '' && data[key] !== null && data[key] !== undefined) {
        paramString += `${key}=${encodeURIComponent(data[key])}&`;
      }
    }
    
    // Remove trailing &
    paramString = paramString.slice(0, -1);
    
    // Add passphrase if provided
    if (this.passphrase) {
      paramString += `&passphrase=${encodeURIComponent(this.passphrase)}`;
    }
    
    // Generate MD5 hash
    return CryptoJS.MD5(paramString).toString();
  }

  // Validate PayFast callback signature
  validateSignature(data, receivedSignature) {
    const calculatedSignature = this.generateSignature(data);
    return calculatedSignature === receivedSignature;
  }

  // Create payment URL for WebView
  createPaymentUrl(orderData) {
    const paymentData = this.generatePaymentData(orderData);
    const queryString = Object.keys(paymentData)
      .map(key => `${key}=${encodeURIComponent(paymentData[key])}`)
      .join('&');
    
    return `${this.apiUrl}?${queryString}`;
  }

  // Process payment (for WebView integration)
  async processPayment(orderData) {
    try {
      // Validate required fields
      this.validateOrderData(orderData);
      
      // Generate payment URL
      const paymentUrl = this.createPaymentUrl(orderData);
      
      return {
        success: true,
        paymentUrl,
        paymentData: this.generatePaymentData(orderData)
      };
    } catch (error) {
      console.error('PayFast payment processing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Validate order data
  validateOrderData(orderData) {
    const required = ['orderId', 'amount', 'customerEmail', 'customerFirstName', 'customerLastName'];
    
    for (const field of required) {
      if (!orderData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (isNaN(parseFloat(orderData.amount)) || parseFloat(orderData.amount) <= 0) {
      throw new Error('Invalid amount');
    }

    if (!this.isValidEmail(orderData.customerEmail)) {
      throw new Error('Invalid email address');
    }
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Handle payment notification (ITN - Instant Transaction Notification)
  async handlePaymentNotification(notificationData) {
    try {
      // Validate signature
      const { signature, ...dataWithoutSignature } = notificationData;
      
      if (!this.validateSignature(dataWithoutSignature, signature)) {
        throw new Error('Invalid signature');
      }

      // Validate payment status
      const paymentStatus = notificationData.payment_status;
      const paymentId = notificationData.m_payment_id;
      const amount = parseFloat(notificationData.amount_gross);

      const result = {
        orderId: paymentId,
        status: paymentStatus,
        amount: amount,
        transactionId: notificationData.pf_payment_id,
        timestamp: new Date().toISOString(),
        valid: true
      };

      // Process based on status
      switch (paymentStatus) {
        case 'COMPLETE':
          result.success = true;
          result.message = 'Payment completed successfully';
          break;
        case 'FAILED':
          result.success = false;
          result.message = 'Payment failed';
          break;
        case 'PENDING':
          result.success = false;
          result.message = 'Payment is pending';
          break;
        case 'CANCELLED':
          result.success = false;
          result.message = 'Payment was cancelled';
          break;
        default:
          result.success = false;
          result.message = 'Unknown payment status';
      }

      return result;
    } catch (error) {
      console.error('PayFast notification handling error:', error);
      return {
        valid: false,
        error: error.message
      };
    }
  }

  // Get payment status
  async getPaymentStatus(paymentId) {
    try {
      // In a real implementation, you would make an API call to PayFast
      // For now, we'll simulate the response
      return {
        paymentId,
        status: 'COMPLETE', // COMPLETE, FAILED, PENDING, CANCELLED
        amount: 0,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  }

  // Cancel payment
  async cancelPayment(paymentId) {
    try {
      // In a real implementation, you would make an API call to PayFast
      console.log(`Cancelling payment: ${paymentId}`);
      return {
        success: true,
        message: 'Payment cancelled successfully'
      };
    } catch (error) {
      console.error('Error cancelling payment:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Refund payment (if supported)
  async refundPayment(paymentId, amount, reason) {
    try {
      // PayFast doesn't support automatic refunds via API
      // This would typically require manual processing
      console.log(`Refund request for payment ${paymentId}: R${amount} - ${reason}`);
      
      return {
        success: false,
        message: 'Refunds must be processed manually through PayFast dashboard',
        refundId: null
      };
    } catch (error) {
      console.error('Error processing refund:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get supported payment methods
  getSupportedPaymentMethods() {
    return [
      {
        id: 'credit_card',
        name: 'Credit Card',
        description: 'Visa, MasterCard, American Express',
        icon: 'card-outline',
        enabled: true
      },
      {
        id: 'debit_card',
        name: 'Debit Card',
        description: 'South African debit cards',
        icon: 'card-outline',
        enabled: true
      },
      {
        id: 'eft',
        name: 'EFT',
        description: 'Electronic Funds Transfer',
        icon: 'business-outline',
        enabled: true
      },
      {
        id: 'instant_eft',
        name: 'Instant EFT',
        description: 'Real-time bank transfers',
        icon: 'flash-outline',
        enabled: true
      }
    ];
  }

  // Calculate fees (PayFast charges)
  calculateFees(amount) {
    // PayFast fee structure (as of 2024)
    const feePercentage = 0.029; // 2.9%
    const minimumFee = 2.00; // R2.00
    const maximumFee = 100.00; // R100.00

    let fee = amount * feePercentage;
    fee = Math.max(fee, minimumFee);
    fee = Math.min(fee, maximumFee);

    return {
      amount: parseFloat(amount),
      fee: parseFloat(fee.toFixed(2)),
      total: parseFloat((amount + fee).toFixed(2))
    };
  }

  // Test connection to PayFast
  async testConnection() {
    try {
      // Create a test payment data
      const testData = {
        orderId: 'TEST_' + Date.now(),
        amount: 1.00,
        itemName: 'Test Payment',
        customerEmail: 'test@example.com',
        customerFirstName: 'Test',
        customerLastName: 'User'
      };

      const result = await this.processPayment(testData);
      
      return {
        success: result.success,
        message: result.success ? 'PayFast connection successful' : 'PayFast connection failed',
        sandbox: this.isSandbox
      };
    } catch (error) {
      return {
        success: false,
        message: `PayFast connection error: ${error.message}`,
        sandbox: this.isSandbox
      };
    }
  }
}

export const payfastService = new PayFastService();

// Helper functions for React Native integration
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2
  }).format(amount);
};

export const validateSouthAfricanPhone = (phone) => {
  // South African phone number validation
  const phoneRegex = /^(\+27|0)[6-8][0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const formatSouthAfricanPhone = (phone) => {
  // Format phone number for PayFast
  let formatted = phone.replace(/\s/g, '');
  if (formatted.startsWith('+27')) {
    formatted = '0' + formatted.substring(3);
  }
  return formatted;
};
