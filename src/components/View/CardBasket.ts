import type { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';
import { CardBase, type ICardView } from './CardBase';

interface ICardBasketView extends Partial<ICardView> {
  index: number;
}

/**
 * Карточка товара в корзине (template#card-basket).
 */
export class CardBasket extends CardBase<ICardBasketView> {
  private readonly indexElement: HTMLElement;
  private readonly deleteButton: HTMLButtonElement;

  constructor(container: HTMLElement, private readonly events: IEvents) {
    super(container);

    this.indexElement = ensureElement<HTMLElement>('.basket__item-index', container);
    this.deleteButton = ensureElement<HTMLButtonElement>('.basket__item-delete', container);

    this.deleteButton.addEventListener('click', () => {
      this.events.emit('basket:remove', { id: this.getIdFromDom() });
    });
  }

  set index(value: number) {
    this.indexElement.textContent = String(value);
  }
}

