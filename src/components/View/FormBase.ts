import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';
import type { IEvents } from '../base/Events';

interface IFormView {
  valid: boolean;
  errors: string;
}

/**
 * Базовый класс формы. Отвечает за:
 * - управление submit-кнопкой (валидность приходит извне),
 * - отображение ошибок,
 * - генерацию событий изменения полей и отправки формы.
 */
export abstract class FormBase extends Component<IFormView> {
  protected readonly form: HTMLFormElement;
  protected readonly submitButton: HTMLButtonElement;
  protected readonly errorsElement: HTMLElement;

  protected constructor(container: HTMLFormElement, protected readonly events: IEvents) {
    super(container);
    this.form = container;

    this.submitButton = ensureElement<HTMLButtonElement>('button[type="submit"]', container);
    this.errorsElement = ensureElement<HTMLElement>('.form__errors', container);

    // Изменение полей
    this.form.addEventListener('input', (evt) => {
      const target = evt.target as HTMLInputElement;
      if (!target?.name) return;
      this.events.emit('form:change', {
        form: this.form.name,
        field: target.name,
        value: target.value,
      });
    });

    // Отправка формы
    this.form.addEventListener('submit', (evt) => {
      evt.preventDefault();
      this.events.emit('form:submit', { form: this.form.name });
    });
  }

  set valid(value: boolean) {
    this.submitButton.disabled = !value;
  }

  set errors(value: string) {
    this.errorsElement.textContent = value;
  }
}

