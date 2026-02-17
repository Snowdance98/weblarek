import { ensureElement } from '../../utils/utils';
import { CardBase, type ICardBaseView } from './CardBase';

interface ICardBasketView extends Partial<ICardBaseView> {
  index: number;
}

/**
 * Карточка товара в корзине (template#card-basket).
 * Не знает id товара — обработчик удаления передаётся снаружи.
 */
export class CardBasket extends CardBase<ICardBasketView> {
  private readonly indexElement: HTMLElement;
  private readonly deleteButton: HTMLButtonElement;

  constructor(container: HTMLElement, onRemove: () => void) {
    super(container);

    this.indexElement = ensureElement<HTMLElement>('.basket__item-index', container);
    this.deleteButton = ensureElement<HTMLButtonElement>('.basket__item-delete', container);

    this.deleteButton.addEventListener('click', onRemove);
  }

  set index(value: number) {
    this.indexElement.textContent = String(value);
  }
}

