import { ensureElement } from '../../utils/utils';
import { CardWithCategory, type ICardWithCategoryView } from './CardWithCategory';

interface ICardPreviewView extends Partial<ICardWithCategoryView> {
  description: string;
  buttonText: string;
  buttonDisabled: boolean;
}

/**
 * Карточка-превью товара (template#card-preview).
 * Не хранит id товара — обработчик покупки передаётся снаружи.
 */
export class CardPreview extends CardWithCategory<ICardPreviewView> {
  private readonly descriptionElement: HTMLElement;
  private readonly actionButton: HTMLButtonElement;

  constructor(container: HTMLElement, onBuy: () => void) {
    super(container);

    this.descriptionElement = ensureElement<HTMLElement>('.card__text', container);
    this.actionButton = ensureElement<HTMLButtonElement>('.card__button', container);

    this.actionButton.addEventListener('click', onBuy);
  }

  set description(value: string) {
    this.descriptionElement.textContent = value;
  }

  set buttonText(value: string) {
    this.actionButton.textContent = value;
  }

  set buttonDisabled(value: boolean) {
    this.actionButton.disabled = value;
  }
}

