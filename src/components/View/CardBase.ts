import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';
import { formatPrice } from './utils';

export interface ICardBaseView {
  title: string;
  price: number | null;
}

/**
 * Базовый класс карточки товара — общее для всех трёх карточек.
 * Хранит только ссылки на элементы разметки, данных не хранит.
 */
export abstract class CardBase<T extends Partial<ICardBaseView> = Partial<ICardBaseView>> extends Component<T> {
  protected readonly titleElement: HTMLElement;
  protected readonly priceElement: HTMLElement;

  protected constructor(container: HTMLElement) {
    super(container);

    this.titleElement = ensureElement<HTMLElement>('.card__title', container);
    this.priceElement = ensureElement<HTMLElement>('.card__price', container);
  }

  set title(value: string) {
    this.titleElement.textContent = value;
  }

  set price(value: number | null) {
    this.priceElement.textContent = formatPrice(value);
  }
}

