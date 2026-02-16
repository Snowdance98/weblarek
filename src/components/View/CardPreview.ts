import type { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';
import { CardBase, type ICardView } from './CardBase';

interface ICardPreviewView extends Partial<ICardView> {
  description: string;
  buttonText: string;
  buttonDisabled: boolean;
}

/**
 * Карточка-превью товара (template#card-preview).
 */
export class CardPreview extends CardBase<ICardPreviewView> {
  private readonly descriptionElement: HTMLElement;
  private readonly actionButton: HTMLButtonElement;

  constructor(container: HTMLElement, private readonly events: IEvents) {
    super(container);

    this.descriptionElement = ensureElement<HTMLElement>('.card__text', container);
    this.actionButton = ensureElement<HTMLButtonElement>('.card__button', container);

    this.actionButton.addEventListener('click', () => {
      this.events.emit('card:add-to-basket', { id: this.getIdFromDom() });
    });
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

