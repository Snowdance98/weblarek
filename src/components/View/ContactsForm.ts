import type { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';
import { FormBase } from './FormBase';

interface IContactsFormView {
  email: string;
  phone: string;
  valid: boolean;
  errors: string;
}

export class ContactsForm extends FormBase {
  private readonly emailInput: HTMLInputElement;
  private readonly phoneInput: HTMLInputElement;

  constructor(container: HTMLFormElement, events: IEvents) {
    super(container, events);

    this.emailInput = ensureElement<HTMLInputElement>('input[name="email"]', container);
    this.phoneInput = ensureElement<HTMLInputElement>('input[name="phone"]', container);

    this.emailInput.addEventListener('input', () => {
      this.events.emit('contacts:email-change', { email: this.emailInput.value });
    });

    this.phoneInput.addEventListener('input', () => {
      this.events.emit('contacts:phone-change', { phone: this.phoneInput.value });
    });

    this.form.addEventListener('submit', (evt) => {
      evt.preventDefault();
      this.events.emit('contacts:submit');
    });
  }

  set email(value: string) {
    this.emailInput.value = value;
  }

  set phone(value: string) {
    this.phoneInput.value = value;
  }

  render(data?: Partial<IContactsFormView>): HTMLElement {
    return super.render(data as any);
  }
}

