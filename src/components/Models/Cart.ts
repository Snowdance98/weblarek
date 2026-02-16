import { IProduct } from '../../types';
import type { IEvents } from '../base/Events';

export class Cart {
  private _items: IProduct[] = [];
  private _events?: IEvents;

  constructor(events?: IEvents) {
    this._events = events;
  }

  // Возвращает массив товаров в корзине
  getItems(): IProduct[] {
    return this._items;
  }

  // Добавляет товар в корзину
  addItem(item: IProduct): void {
    this._items.push(item);
    this._events?.emit('cart:changed', { items: this._items, action: 'add', item });
  }

  // Удаляет товар из корзины
  removeItem(itemToRemove: IProduct): void {
    const index = this._items.findIndex(item => item.id === itemToRemove.id);
    if (index !== -1) {
      this._items.splice(index, 1);
      this._events?.emit('cart:changed', { items: this._items, action: 'remove', item: itemToRemove });
    }
  }

  // Очищает корзину
  clear(): void {
    this._items = [];
    this._events?.emit('cart:changed', { items: this._items, action: 'clear' });
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