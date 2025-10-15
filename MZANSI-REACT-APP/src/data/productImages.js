// Curated per-category image lists to provide deterministic, high-quality mock images
export const CURATED_PRODUCT_IMAGES = {
  Food: [
    'https://images.unsplash.com/photo-1542831371-d531d36971e6?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1516685018646-5498f9b5b2d5?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=600&fit=crop'
  ],
  Clothing: [
    'https://images.unsplash.com/photo-1521335629791-ce4aec67dd47?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1520975698512-3f66f3f6f6f6?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1520975698512-3f66f3f6f6f7?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1520975698512-3f66f3f6f6f8?w=600&h=600&fit=crop'
  ],
  Electronics: [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=600&h=600&fit=crop'
  ]
};

// Deterministic pick based on a hash of the key (product name + category)
function hashStringToIndex(key, length) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash) + key.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % length;
}

export function pickCuratedImage(productName, category) {
  const list = CURATED_PRODUCT_IMAGES[category] || CURATED_PRODUCT_IMAGES.Food;
  const idx = hashStringToIndex((productName || '') + '|' + (category || ''), list.length);
  return list[idx];
}

export default {
  CURATED_PRODUCT_IMAGES,
  pickCuratedImage,
};
