import { categoryMap, CDN_URL } from '../../utils/constants';

export function formatPrice(price: number | null): string {
  return price === null ? 'Бесценно' : `${price} синапсов`;
}

export function buildImageUrl(path: string): string {
  // В данных картинка приходит как "/name.svg"
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${CDN_URL}${normalized}`;
}

export function applyCategoryModifier(el: HTMLElement, category: string) {
  // Сначала снимаем все модификаторы, которые мы могли установить ранее
  Object.values(categoryMap).forEach((className) => el.classList.remove(className));
  const modifier = categoryMap[category as keyof typeof categoryMap];
  if (modifier) {
    el.classList.add(modifier);
  }
}

