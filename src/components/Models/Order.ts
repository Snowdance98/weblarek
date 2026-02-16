import { IBuyer, TPayment, IValidationResult } from '../../types';
import type { IEvents } from '../base/Events';

export class Order {
  private _payment: TPayment = 'online';
  private _email: string = '';
  private _phone: string = '';
  private _address: string = '';
  private _events?: IEvents;

  constructor(events?: IEvents) {
    this._events = events;
  }

  // Сохраняет данные покупателя (можно сохранять частично)
  setData(data: Partial<IBuyer>): void {
    const changed: Partial<IBuyer> = {};
    if (data.payment !== undefined) {
      this._payment = data.payment;
      changed.payment = data.payment;
    }
    if (data.email !== undefined) {
      this._email = data.email;
      changed.email = data.email;
    }
    if (data.phone !== undefined) {
      this._phone = data.phone;
      changed.phone = data.phone;
    }
    if (data.address !== undefined) {
      this._address = data.address;
      changed.address = data.address;
    }

    if (Object.keys(changed).length > 0) {
      this._events?.emit('order:changed', changed);
    }
  }

  // Возвращает все данные покупателя
  getData(): IBuyer {
    return {
      payment: this._payment,
      email: this._email,
      phone: this._phone,
      address: this._address
    };
  }

  // Очищает все данные покупателя
  clear(): void {
    this._payment = 'online';
    this._email = '';
    this._phone = '';
    this._address = '';
    this._events?.emit('order:cleared');
  }

  // Проверяет валидность всех полей и возвращает объект с ошибками
  validate(): IValidationResult {
    const errors: IValidationResult = {};

    if (!this._payment) {
      errors.payment = 'Не выбран способ оплаты';
    }

    if (!this._email) {
      errors.email = 'Укажите email';
    }

    if (!this._phone.trim()) {
      errors.phone = 'Укажите телефон';
    }

    if (!this._address.trim()) {
      errors.address = 'Укажите адрес';
    }

    return errors;
  }

  // Дополнительные методы для получения отдельных полей (опционально)
  getPayment(): TPayment {
    return this._payment;
  }

  getEmail(): string {
    return this._email;
  }

  getPhone(): string {
    return this._phone;
  }

  getAddress(): string {
    return this._address;
  }
}