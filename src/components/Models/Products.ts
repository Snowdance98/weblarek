import { IProduct } from '../../types';

export class Products {
  private _items: IProduct[] = [];
  private _selectedItem: IProduct | null = null;

  constructor() {}

  // Сохраняет массив товаров
  setItems(items: IProduct[]): void {
    this._items = items;
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
  }

  // Возвращает товар для детального отображения
  getSelectedItem(): IProduct | null {
    return this._selectedItem;
  }
}