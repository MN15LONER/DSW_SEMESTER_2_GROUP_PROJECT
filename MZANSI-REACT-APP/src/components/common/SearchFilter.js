import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Button, Chip, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../styles/colors';

const CATEGORIES = [
  'All',
  'Supermarket',
  'Hypermarket',
  'Premium Groceries',
  'Clothing',
  'Wholesale',
  'Electronics',
];

const PRICE_RANGES = [
  { label: 'All Prices', min: 0, max: Infinity },
  { label: 'Under R50', min: 0, max: 50 },
  { label: 'R50 - R100', min: 50, max: 100 },
  { label: 'R100 - R200', min: 100, max: 200 },
  { label: 'Over R200', min: 200, max: Infinity },
];

const SORT_OPTIONS = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Rating', value: 'rating' },
  { label: 'Distance', value: 'distance' },
];

export default function SearchFilter({ 
  visible, 
  onClose, 
  onApplyFilters,
  initialFilters = {}
}) {
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category || 'All');
  const [selectedPriceRange, setSelectedPriceRange] = useState(initialFilters.priceRange || 0);
  const [selectedSort, setSelectedSort] = useState(initialFilters.sort || 'relevance');
  const [showSpecialsOnly, setShowSpecialsOnly] = useState(initialFilters.specialsOnly || false);
  const [showOpenOnly, setShowOpenOnly] = useState(initialFilters.openOnly || false);

  const handleApply = () => {
    const filters = {
      category: selectedCategory,
      priceRange: selectedPriceRange,
      sort: selectedSort,
      specialsOnly: showSpecialsOnly,
      openOnly: showOpenOnly,
    };
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    setSelectedCategory('All');
    setSelectedPriceRange(0);
    setSelectedSort('relevance');
    setShowSpecialsOnly(false);
    setShowOpenOnly(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={COLORS.gray} />
          </TouchableOpacity>
          <Text style={styles.title}>Filter & Sort</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category</Text>
            <View style={styles.chipContainer}>
              {CATEGORIES.map((category) => (
                <Chip
                  key={category}
                  style={[
                    styles.chip,
                    selectedCategory === category && styles.selectedChip
                  ]}
                  textStyle={[
                    styles.chipText,
                    selectedCategory === category && styles.selectedChipText
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  {category}
                </Chip>
              ))}
            </View>
          </View>

          <Divider style={styles.divider} />

          {}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Range</Text>
            <View style={styles.chipContainer}>
              {PRICE_RANGES.map((range, index) => (
                <Chip
                  key={index}
                  style={[
                    styles.chip,
                    selectedPriceRange === index && styles.selectedChip
                  ]}
                  textStyle={[
                    styles.chipText,
                    selectedPriceRange === index && styles.selectedChipText
                  ]}
                  onPress={() => setSelectedPriceRange(index)}
                >
                  {range.label}
                </Chip>
              ))}
            </View>
          </View>

          <Divider style={styles.divider} />

          {}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sort By</Text>
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.sortOption}
                onPress={() => setSelectedSort(option.value)}
              >
                <Text style={styles.sortOptionText}>{option.label}</Text>
                <Ionicons
                  name={selectedSort === option.value ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={selectedSort === option.value ? COLORS.primary : COLORS.gray}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Divider style={styles.divider} />

          {}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Filters</Text>

            <TouchableOpacity
              style={styles.toggleOption}
              onPress={() => setShowSpecialsOnly(!showSpecialsOnly)}
            >
              <Text style={styles.toggleText}>Show specials only</Text>
              <Ionicons
                name={showSpecialsOnly ? 'checkbox' : 'checkbox-outline'}
                size={20}
                color={showSpecialsOnly ? COLORS.primary : COLORS.gray}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toggleOption}
              onPress={() => setShowOpenOnly(!showOpenOnly)}
            >
              <Text style={styles.toggleText}>Show open stores only</Text>
              <Ionicons
                name={showOpenOnly ? 'checkbox' : 'checkbox-outline'}
                size={20}
                color={showOpenOnly ? COLORS.primary : COLORS.gray}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {}
        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={handleApply}
            style={styles.applyButton}
            contentStyle={styles.applyButtonContent}
          >
            Apply Filters
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  resetText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    backgroundColor: COLORS.white,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: COLORS.lightGray,
    marginBottom: 8,
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.gray,
  },
  selectedChipText: {
    color: COLORS.white,
  },
  divider: {
    height: 8,
    backgroundColor: COLORS.background,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  sortOptionText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  toggleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  toggleText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  footer: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
  },
  applyButtonContent: {
    height: 48,
  },
});
