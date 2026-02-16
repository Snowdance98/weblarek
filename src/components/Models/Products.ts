import { IProduct } from '../../types';
import type { IEvents } from '../base/Events';

export class Products {
  private _items: IProduct[] = [];
  private _selectedItem: IProduct | null = null;
  private _events?: IEvents;

  constructor(events?: IEvents) {
    this._events = events;
  }

  // Сохраняет массив товаров
  setItems(items: IProduct[]): void {
    this._items = items;
    this._events?.emit('products:items-changed', { items });
  }

  // Возвращает массив всех товаров
  getItems(): IProduct[] {
    return this._items;
  }

  // Возвращает товар по id
  getItem(id: string): IProduct | undefined {
    return this._items.find(item => item.id === id);
  }

  // Сохраняет товар для детального отображения
  setSelectedItem(item: IProduct | null): void {
    this._selectedItem = item;
    this._events?.emit('products:selected-changed', { item });
  }

  // Возвращает товар для детального отображения
  getSelectedItem(): IProduct | null {
    return this._selectedItem;
  }
}