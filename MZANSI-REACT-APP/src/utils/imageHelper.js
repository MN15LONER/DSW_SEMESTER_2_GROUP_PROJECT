// Helper to construct a relevant image URL for a product using Unsplash Source
export function getImageForProduct(product = {}) {
  const name = (product.name || '').trim();
  const category = (product.category || '').trim();

  // Build a short search term priority: name (first words) -> category -> generic 'grocery'
  let term = name || category || 'grocery';

  // If name contains multiple words, prefer the first 2-3 to keep queries focused
  const words = term.split(/\s+/).filter(Boolean);
  term = words.slice(0, 3).join(',');

  // Use Unsplash Source for on-the-fly relevant images. Size 600x600 is appropriate for product tiles.
  // Example: https://source.unsplash.com/600x600/?banana
  return `https://source.unsplash.com/600x600/?${encodeURIComponent(term)}`;
}

export default {
  getImageForProduct,
};
