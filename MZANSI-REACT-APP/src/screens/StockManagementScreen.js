import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  Modal,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { firebaseService } from '../services/firebase';
const StockManagementScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockModalVisible, setStockModalVisible] = useState(false);
  const [newStock, setNewStock] = useState('');
  const [filter, setFilter] = useState('all'); 
  useEffect(() => {
    loadProducts();
  }, []);
  const loadProducts = async () => {
    try {
      setLoading(true);
      const storeProducts = await firebaseService.products.getByStore(user.storeId || 'default-store');
      setProducts(storeProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };
  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };
  const handleUpdateStock = async () => {
    if (!selectedProduct || !newStock.trim()) return;
    const stockQuantity = parseInt(newStock);
    if (isNaN(stockQuantity) || stockQuantity < 0) {
      Alert.alert('Invalid Input', 'Please enter a valid stock quantity');
      return;
    }
    try {
      await firebaseService.stock.updateProductStock(selectedProduct.id, stockQuantity);
      setProducts(prevProducts =>
        prevProducts.map(product =>
          product.id === selectedProduct.id
            ? { ...product, stockQuantity, inStock: stockQuantity > 0 }
            : product
        )
      );
      setStockModalVisible(false);
      setNewStock('');
      setSelectedProduct(null);
      Alert.alert('Success', 'Stock updated successfully');
    } catch (error) {
      console.error('Error updating stock:', error);
      Alert.alert('Error', 'Failed to update stock');
    }
  };
  const openStockModal = (product) => {
    setSelectedProduct(product);
    setNewStock(product.stockQuantity?.toString() || '0');
    setStockModalVisible(true);
  };
  const getFilteredProducts = () => {
    switch (filter) {
      case 'low':
        return products.filter(product => product.stockQuantity <= 5 && product.stockQuantity > 0);
      case 'out':
        return products.filter(product => !product.inStock || product.stockQuantity === 0);
      default:
        return products;
    }
  };
  const renderProductItem = ({ item: product }) => (
    <View style={styles.productCard}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productCategory}>{product.category}</Text>
        <Text style={styles.productPrice}>R{product.price.toFixed(2)}</Text>
      </View>
      <View style={styles.stockInfo}>
        <View style={[
          styles.stockBadge,
          { backgroundColor: getStockColor(product.stockQuantity, product.inStock) }
        ]}>
          <Text style={styles.stockText}>
            {product.inStock ? `${product.stockQuantity || 0} in stock` : 'Out of stock'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.updateButton}
          onPress={() => openStockModal(product)}
        >
          <Ionicons name="create-outline" size={16} color="#007AFF" />
          <Text style={styles.updateButtonText}>Update</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  const getStockColor = (quantity, inStock) => {
    if (!inStock || quantity === 0) return '#FF3B30';
    if (quantity <= 5) return '#FF9500';
    return '#34C759';
  };
  const filters = [
    { key: 'all', label: 'All Products', count: products.length },
    { key: 'low', label: 'Low Stock', count: products.filter(p => p.stockQuantity <= 5 && p.stockQuantity > 0).length },
    { key: 'out', label: 'Out of Stock', count: products.filter(p => !p.inStock || p.stockQuantity === 0).length },
  ];
  const filteredProducts = getFilteredProducts();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Stock Management</Text>
          <Text style={styles.headerSubtitle}>Manage your inventory</Text>
        </View>
        <View style={styles.headerRight} />
      </View>
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((filterItem) => (
            <TouchableOpacity
              key={filterItem.key}
              style={[
                styles.filterTab,
                filter === filterItem.key && styles.activeFilterTab
              ]}
              onPress={() => setFilter(filterItem.key)}
            >
              <Text style={[
                styles.filterText,
                filter === filterItem.key && styles.activeFilterText
              ]}>
                {filterItem.label}
              </Text>
              <View style={[
                styles.filterBadge,
                filter === filterItem.key && styles.activeFilterBadge
              ]}>
                <Text style={[
                  styles.filterBadgeText,
                  filter === filterItem.key && styles.activeFilterBadgeText
                ]}>
                  {filterItem.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.productsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={64} color="#8E8E93" />
            <Text style={styles.emptyStateText}>No products found</Text>
            <Text style={styles.emptyStateSubtext}>
              {filter === 'all' 
                ? 'Add products to manage your inventory'
                : `No products with ${filter === 'low' ? 'low stock' : 'out of stock'}`
              }
            </Text>
          </View>
        }
      />
      {}
      <Modal
        visible={stockModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setStockModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Stock</Text>
              <TouchableOpacity
                onPress={() => setStockModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            {selectedProduct && (
              <>
                <View style={styles.productDetails}>
                  <Text style={styles.modalProductName}>{selectedProduct.name}</Text>
                  <Text style={styles.modalProductCategory}>{selectedProduct.category}</Text>
                  <Text style={styles.currentStock}>
                    Current Stock: {selectedProduct.stockQuantity || 0}
                  </Text>
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>New Stock Quantity</Text>
                  <TextInput
                    style={styles.stockInput}
                    placeholder="Enter stock quantity"
                    value={newStock}
                    onChangeText={setNewStock}
                    keyboardType="numeric"
                    autoFocus
                  />
                </View>
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setStockModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.updateStockButton}
                    onPress={handleUpdateStock}
                  >
                    <Text style={styles.updateStockButtonText}>Update Stock</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  headerRight: {
    width: 40,
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeFilterTab: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginRight: 8,
  },
  activeFilterText: {
    color: '#fff',
  },
  filterBadge: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  activeFilterBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  activeFilterBadgeText: {
    color: '#fff',
  },
  productsList: {
    padding: 16,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  stockInfo: {
    alignItems: 'flex-end',
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  stockText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  updateButtonText: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  productDetails: {
    marginBottom: 20,
  },
  modalProductName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  modalProductCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  currentStock: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  stockInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  updateStockButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: '#007AFF',
  },
  updateStockButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
export default StockManagementScreen;