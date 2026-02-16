import type { IEvents } from '../base/Events';
import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';

interface IBasketView {
  items: HTMLElement[];
  total: number;
  canSubmit: boolean;
}

export class BasketView extends Component<IBasketView> {
  private readonly list: HTMLUListElement;
  private readonly totalPrice: HTMLElement;
  private readonly submitButton: HTMLButtonElement;

  constructor(container: HTMLElement, private readonly events: IEvents) {
    super(container);

    this.list = ensureElement<HTMLUListElement>('.basket__list', container);
    this.totalPrice = ensureElement<HTMLElement>('.basket__price', container);
    this.submitButton = ensureElement<HTMLButtonElement>('.basket__button', container);

    this.submitButton.addEventListener('click', () => {
      this.events.emit('basket:submit');
    });
  }

  set items(value: HTMLElement[]) {
    this.list.replaceChildren(...value);
  }

  set total(value: number) {
    this.totalPrice.textContent = `${value} синапсов`;
  }

  set canSubmit(value: boolean) {
    this.submitButton.disabled = !value;
  }
}

