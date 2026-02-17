import { CardWithCategory, type ICardWithCategoryView } from './CardWithCategory';

/**
 * Карточка товара в каталоге (template#card-catalog).
 * Не хранит id товара — событие выбора обрабатывается через переданный обработчик.
 */
export class CardCatalog extends CardWithCategory<Partial<ICardWithCategoryView>> {
  constructor(container: HTMLButtonElement, onSelect: () => void) {
    super(container);
    this.container.addEventListener('click', onSelect);
  }
}

