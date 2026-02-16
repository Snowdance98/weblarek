import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';
import type { IEvents } from '../base/Events';

interface IHeaderView {
  counter: number;
}

export class Header extends Component<IHeaderView> {
  private readonly basketButton: HTMLButtonElement;
  private readonly counterElement: HTMLElement;

  constructor(container: HTMLElement, private readonly events: IEvents) {
    super(container);

    this.basketButton = ensureElement<HTMLButtonElement>('.header__basket', container);
    this.counterElement = ensureElement<HTMLElement>('.header__basket-counter', container);

    this.basketButton.addEventListener('click', () => {
      this.events.emit('basket:open');
    });
  }

  set counter(value: number) {
    this.counterElement.textContent = String(value);
  }
}

