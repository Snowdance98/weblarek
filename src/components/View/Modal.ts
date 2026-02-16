import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';
import type { IEvents } from '../base/Events';

interface IModalView {
  content: HTMLElement | null;
}

export class Modal extends Component<IModalView> {
  private readonly closeButton: HTMLButtonElement;
  private readonly content: HTMLElement;

  constructor(container: HTMLElement, private readonly events: IEvents) {
    super(container);

    this.closeButton = ensureElement<HTMLButtonElement>('.modal__close', container);
    this.content = ensureElement<HTMLElement>('.modal__content', container);

    this.closeButton.addEventListener('click', () => this.close());

    // Закрытие по клику на оверлей (по самому .modal)
    this.container.addEventListener('click', (evt) => {
      if (evt.target === this.container) {
        this.close();
      }
    });

    // Закрытие по Esc
    document.addEventListener('keydown', (evt) => {
      if (evt.key === 'Escape' && this.container.classList.contains('modal_active')) {
        this.close();
      }
    });
  }

  set contentNode(value: HTMLElement | null) {
    this.content.replaceChildren();
    if (value) this.content.append(value);
  }

  open(content: HTMLElement) {
    this.contentNode = content;
    this.container.classList.add('modal_active');
    this.events.emit('modal:open');
  }

  close() {
    if (!this.container.classList.contains('modal_active')) return;
    this.container.classList.remove('modal_active');
    this.content.replaceChildren();
    this.events.emit('modal:close');
  }

  render(data?: Partial<IModalView>): HTMLElement {
    return super.render(data);
  }
}

