
export function getImageForProduct(product = {}) {
  const name = (product.name || '').trim();
  const category = (product.category || '').trim();

  let term = name || category || 'grocery';

  const words = term.split(/\s+/).filter(Boolean);
  term = words.slice(0, 3).join(',');

  return `https://source.unsplash.com/600x600/?${encodeURIComponent(term)}`;
}

export default {
  getImageForProduct,
};