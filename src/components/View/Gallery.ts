import { Component } from '../base/Component';

interface IGalleryView {
  items: HTMLElement[];
}

export class Gallery extends Component<IGalleryView> {
  constructor(container: HTMLElement) {
    super(container);
  }

  set items(value: HTMLElement[]) {
    this.container.replaceChildren(...value);
  }
}

