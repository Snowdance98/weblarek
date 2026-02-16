import type { IEvents } from '../base/Events';
import { CardBase, type ICardView } from './CardBase';

/**
 * Карточка товара в каталоге (template#card-catalog).
 */
export class CardCatalog extends CardBase<Partial<ICardView>> {
  constructor(container: HTMLButtonElement, private readonly events: IEvents) {
    super(container);

    this.container.addEventListener('click', () => {
      this.events.emit('card:select', { id: this.getIdFromDom() });
    });
  }
}

