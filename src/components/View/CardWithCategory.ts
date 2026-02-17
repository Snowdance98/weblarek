import { ensureElement } from '../../utils/utils';
import { applyCategoryModifier, buildImageUrl } from './utils';
import { CardBase, type ICardBaseView } from './CardBase';

export interface ICardWithCategoryView extends ICardBaseView {
  image: string;
  category: string;
}

/**
 * Базовый класс для карточек, у которых есть картинка и категория.
 * Используется для карточки каталога и карточки-превью.
 */
export abstract class CardWithCategory<T extends Partial<ICardWithCategoryView> = Partial<ICardWithCategoryView>>
  extends CardBase<T> {
  protected readonly categoryElement: HTMLElement;
  protected readonly imageElement: HTMLImageElement;

  protected constructor(container: HTMLElement) {
    super(container);

    this.categoryElement = ensureElement<HTMLElement>('.card__category', container);
    this.imageElement = ensureElement<HTMLImageElement>('.card__image', container);
  }

  set category(value: string) {
    this.categoryElement.textContent = value;
    applyCategoryModifier(this.categoryElement, value);
  }

  set image(value: string) {
    this.imageElement.src = buildImageUrl(value);
    this.imageElement.alt = this.titleElement.textContent ?? '';
  }
}

