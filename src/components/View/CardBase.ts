import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';
import { applyCategoryModifier, buildImageUrl, formatPrice } from './utils';

export interface ICardView {
  id: string;
  title: string;
  price: number | null;
  image: string;
  category: string;
}

/**
 * Базовый класс карточки товара. Содержит общие DOM-элементы и сеттеры.
 * В полях не хранит данные, только ссылки на элементы разметки.
 */
export abstract class CardBase<T extends Partial<ICardView> = Partial<ICardView>> extends Component<T> {
  protected readonly titleElement: HTMLElement;
  protected readonly priceElement: HTMLElement;
  protected readonly categoryElement?: HTMLElement;
  protected readonly imageElement?: HTMLImageElement;

  protected constructor(container: HTMLElement) {
    super(container);

    this.titleElement = ensureElement<HTMLElement>('.card__title', container);
    this.priceElement = ensureElement<HTMLElement>('.card__price', container);

    // category/image могут отсутствовать в некоторых шаблонах
    this.categoryElement = container.querySelector<HTMLElement>('.card__category') ?? undefined;
    this.imageElement = container.querySelector<HTMLImageElement>('.card__image') ?? undefined;
  }

  set id(value: string) {
    this.container.dataset.id = value;
  }

  protected getIdFromDom(): string {
    return this.container.dataset.id ?? '';
  }

  set title(value: string) {
    this.titleElement.textContent = value;
  }

  set price(value: number | null) {
    this.priceElement.textContent = formatPrice(value);
  }

  set category(value: string) {
    if (!this.categoryElement) return;
    this.categoryElement.textContent = value;
    applyCategoryModifier(this.categoryElement, value);
  }

  set image(value: string) {
    if (!this.imageElement) return;
    this.imageElement.src = buildImageUrl(value);
    this.imageElement.alt = this.titleElement.textContent ?? '';
  }
}

