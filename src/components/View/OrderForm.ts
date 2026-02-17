import type { IEvents } from '../base/Events';
import { ensureElement, ensureAllElements } from '../../utils/utils';
import { FormBase } from './FormBase';

type TPaymentUI = 'card' | 'cash';

interface IOrderFormView {
  payment: TPaymentUI;
  address: string;
  valid: boolean;
  errors: string;
}

export class OrderForm extends FormBase {
  private readonly paymentButtons: HTMLButtonElement[];
  private readonly addressInput: HTMLInputElement;

  constructor(container: HTMLFormElement, events: IEvents) {
    super(container, events);

    this.paymentButtons = ensureAllElements<HTMLButtonElement>('.order__buttons button', container);
    this.addressInput = ensureElement<HTMLInputElement>('input[name="address"]', container);

    this.paymentButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        // View не решает, что выбрать — только сообщает о действии пользователя
        const payment = btn.name as TPaymentUI; // 'card' | 'cash'
        this.events.emit('order:payment-select', { payment });
      });
    });

    this.addressInput.addEventListener('input', () => {
      this.events.emit('order:address-change', { address: this.addressInput.value });
    });

    // Отдельное событие шага
    this.form.addEventListener('submit', (evt) => {
      evt.preventDefault();
      this.events.emit('order:submit');
    });
  }

  /**
   * Подсветка выбранного способа оплаты.
   * Используется модификатор 'button_alt-active' (требование задания).
   */
  set payment(value: TPaymentUI) {
    this.paymentButtons.forEach((btn) => {
      const isActive = btn.name === value;
      btn.classList.toggle('button_alt-active', isActive);
    });
  }

  set address(value: string) {
    this.addressInput.value = value;
  }

  render(data?: Partial<IOrderFormView>): HTMLElement {
    return super.render(data as any);
  }
}

