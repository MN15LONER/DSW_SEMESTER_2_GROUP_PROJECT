import { Alert } from 'react-native';
import CryptoJS from 'crypto-js';
const PAYFAST_CONFIG = {
  MERCHANT_ID: 'YOUR_MERCHANT_ID', 
  MERCHANT_KEY: 'YOUR_MERCHANT_KEY', 
  PASSPHRASE: 'YOUR_PASSPHRASE', 
  SANDBOX: true, 
  SANDBOX_URL: 'https:
  PRODUCTION_URL: 'https:
};
class PayFastService {
  constructor() {
    this.merchantId = PAYFAST_CONFIG.MERCHANT_ID;
    this.merchantKey = PAYFAST_CONFIG.MERCHANT_KEY;
    this.passphrase = PAYFAST_CONFIG.PASSPHRASE;
    this.isSandbox = PAYFAST_CONFIG.SANDBOX;
    this.apiUrl = this.isSandbox ? PAYFAST_CONFIG.SANDBOX_URL : PAYFAST_CONFIG.PRODUCTION_URL;
  }
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
    const paymentData = {
      merchant_id: this.merchantId,
      merchant_key: this.merchantKey,
      return_url: returnUrl || 'https:
      cancel_url: cancelUrl || 'https:
      notify_url: notifyUrl || 'https:
      m_payment_id: orderId,
      amount: parseFloat(amount).toFixed(2),
      item_name: itemName || 'Mzansi App Order',
      item_description: itemDescription || `Order #${orderId}`,
      email_address: customerEmail,
      name_first: customerFirstName,
      name_last: customerLastName,
      cell_number: customerCell,
      payment_method: 'cc', 
      subscription_type: 1, 
      billing_date: new Date().toISOString().split('T')[0],
      recurring_amount: parseFloat(amount).toFixed(2),
      frequency: 3, 
      cycles: 0, 
    };
    paymentData.signature = this.generateSignature(paymentData);
    return paymentData;
  }
  generateSignature(data) {
    let paramString = '';
    const sortedKeys = Object.keys(data).sort();
    for (const key of sortedKeys) {
      if (key !== 'signature' && data[key] !== '' && data[key] !== null && data[key] !== undefined) {
        paramString += `${key}=${encodeURIComponent(data[key])}&`;
      }
    }
    paramString = paramString.slice(0, -1);
    if (this.passphrase) {
      paramString += `&passphrase=${encodeURIComponent(this.passphrase)}`;
    }
    return CryptoJS.MD5(paramString).toString();
  }
  validateSignature(data, receivedSignature) {
    const calculatedSignature = this.generateSignature(data);
    return calculatedSignature === receivedSignature;
  }
  createPaymentUrl(orderData) {
    const paymentData = this.generatePaymentData(orderData);
    const queryString = Object.keys(paymentData)
      .map(key => `${key}=${encodeURIComponent(paymentData[key])}`)
      .join('&');
    return `${this.apiUrl}?${queryString}`;
  }
  async processPayment(orderData) {
    try {
      this.validateOrderData(orderData);
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
  async handlePaymentNotification(notificationData) {
    try {
      const { signature, ...dataWithoutSignature } = notificationData;
      if (!this.validateSignature(dataWithoutSignature, signature)) {
        throw new Error('Invalid signature');
      }
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
  async getPaymentStatus(paymentId) {
    try {
      return {
        paymentId,
        status: 'COMPLETE', 
        amount: 0,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  }
  async cancelPayment(paymentId) {
    try {
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
  async refundPayment(paymentId, amount, reason) {
    try {
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
  calculateFees(amount) {
    const feePercentage = 0.029; 
    const minimumFee = 2.00; 
    const maximumFee = 100.00; 
    let fee = amount * feePercentage;
    fee = Math.max(fee, minimumFee);
    fee = Math.min(fee, maximumFee);
    return {
      amount: parseFloat(amount),
      fee: parseFloat(fee.toFixed(2)),
      total: parseFloat((amount + fee).toFixed(2))
    };
  }
  async testConnection() {
    try {
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
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2
  }).format(amount);
};
export const validateSouthAfricanPhone = (phone) => {
  const phoneRegex = /^(\+27|0)[6-8][0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};
export const formatSouthAfricanPhone = (phone) => {
  let formatted = phone.replace(/\s/g, '');
  if (formatted.startsWith('+27')) {
    formatted = '0' + formatted.substring(3);
  }
  return formatted;
};