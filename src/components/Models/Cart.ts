import { IProduct } from '../../types';

export class Cart {
  private _items: IProduct[] = [];

  constructor() {}

  // Возвращает массив товаров в корзине
  getItems(): IProduct[] {
    return this._items;
  }

  // Добавляет товар в корзину
  addItem(item: IProduct): void {
    this._items.push(item);
  }

  // Удаляет товар из корзины
  removeItem(itemToRemove: IProduct): void {
    const index = this._items.findIndex(item => item.id === itemToRemove.id);
    if (index !== -1) {
      this._items.splice(index, 1);
    }
  }

  // Очищает корзину
  clear(): void {
    this._items = [];
  }

  // Возвращает общую стоимость всех товаров в корзине
  getTotalPrice(): number {
    return this._items.reduce((total, item) => {
      return total + (item.price || 0);
    }, 0);
  }

  // Возвращает количество товаров в корзине
  getItemsCount(): number {
    return this._items.length;
  }

  // Проверяет наличие товара в корзине по его id
  isInCart(id: string): boolean {
    return this._items.some(item => item.id === id);
  }
}