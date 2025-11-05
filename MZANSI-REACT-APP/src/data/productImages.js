export const CURATED_PRODUCT_IMAGES = {
  Food: [
    'https:
    'https:
    'https:
    'https:
    'https:
  ],
  Clothing: [
    'https:
    'https:
    'https:
    'https:
  ],
  Electronics: [
    'https:
    'https:
    'https:
  ]
};
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