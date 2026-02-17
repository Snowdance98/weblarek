import './scss/styles.scss';

import { Api } from './components/base/Api';
import { EventEmitter } from './components/base/Events';
import { Cart } from './components/Models/Cart';
import { Order } from './components/Models/Order';
import { Products } from './components/Models/Products';
import { WebLarekAPI } from './components/Services/WebLarekAPI';
import { BasketView, CardBasket, CardCatalog, CardPreview, ContactsForm, Gallery, Header, Modal, OrderForm, SuccessView } from './components/View';
import type { IOrderData, IProduct, IValidationResult } from './types';
import { API_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';

/**
 * Презентер приложения Web-Larek (единственная страница).
 * Важно: презентер не генерирует события, только обрабатывает их.
 */

const events = new EventEmitter();

// --- Models (эмитят события об изменениях данных) ---
const products = new Products(events);
const cart = new Cart(events);
const order = new Order(events);

// --- Services ---
const api = new WebLarekAPI(new Api(API_URL));

// --- Views (эмитят события пользовательских действий) ---
const header = new Header(ensureElement<HTMLElement>('.header'), events);
const gallery = new Gallery(ensureElement<HTMLElement>('.gallery'));
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// Статические представления — создаём один раз, перерисовываем через render()
const basketView = new BasketView(cloneTemplate<HTMLElement>('#basket'), events);
const orderForm = new OrderForm(cloneTemplate<HTMLFormElement>('#order'), events);
const contactsForm = new ContactsForm(cloneTemplate<HTMLFormElement>('#contacts'), events);
const successView = new SuccessView(cloneTemplate<HTMLElement>('#success'), events);

type TModalScreen = 'none' | 'preview' | 'basket' | 'order' | 'contacts' | 'success';
let currentModalScreen: TModalScreen = 'none';

function renderCatalog(items: IProduct[]) {
  const cards = items.map((p) => {
    const el = cloneTemplate<HTMLButtonElement>('#card-catalog');
    const card = new CardCatalog(el, () => {
      events.emit('card:select', { id: p.id });
    });
    return card.render(p);
  });
  gallery.render({ items: cards });
}

function renderPreview(item: IProduct) {
  const el = cloneTemplate<HTMLElement>('#card-preview');
  let onClick: () => void;

  const inCart = cart.isInCart(item.id);
  const canBuy = item.price !== null;

  if (!canBuy) {
    // Товар бесценен — кнопку показываем как недоступную
    onClick = () => {};
  } else if (inCart) {
    // Товар уже в корзине — кнопка превращается в удаление
    onClick = () => {
      events.emit('card:remove-from-basket', { id: item.id });
    };
  } else {
    // Обычное добавление в корзину
    onClick = () => {
      events.emit('card:add-to-basket', { id: item.id });
    };
  }

  const view = new CardPreview(el, onClick);

  return view.render({
    title: item.title,
    price: item.price,
    image: item.image,
    category: item.category,
    description: item.description,
    buttonText: !canBuy ? 'Недоступно' : inCart ? 'Удалить из корзины' : 'В корзину',
    buttonDisabled: !canBuy,
  });
}

function openBasketModal() {
  currentModalScreen = 'basket';
  modal.open(renderBasket());
}

function renderBasket(): HTMLElement {
  const items = cart.getItems().map((p, idx) => {
    const li = cloneTemplate<HTMLElement>('#card-basket');
    const item = new CardBasket(li, () => {
      events.emit('basket:remove', { id: p.id });
    });
    return item.render({
      title: p.title,
      price: p.price,
      index: idx + 1,
    });
  });

  return basketView.render({
    items,
    total: cart.getTotalPrice(),
    canSubmit: cart.getItemsCount() > 0,
  });
}

function openOrderModal() {
  currentModalScreen = 'order';

  const buyer = order.getData();
  const errors = order.validate();
  modal.open(
    orderForm.render({
      payment: buyer.payment === 'online' ? 'card' : 'cash',
      address: buyer.address,
      valid: isOrderStepValid(errors),
      errors: orderErrorsToText(errors, ['payment', 'address']),
    })
  );
}

function openContactsModal() {
  currentModalScreen = 'contacts';

  const buyer = order.getData();
  const errors = order.validate();

  modal.open(
    contactsForm.render({
      email: buyer.email,
      phone: buyer.phone,
      valid: isContactsStepValid(errors),
      errors: orderErrorsToText(errors, ['email', 'phone']),
    })
  );
}

function openSuccessModal(total: number) {
  cart.clear();
  order.clear();
  currentModalScreen = 'success';
  modal.open(successView.render({ total }));
}

function orderErrorsToText(errors: IValidationResult, fields: Array<keyof IValidationResult>): string {
  return fields
    .map((f) => errors[f])
    .filter(Boolean)
    .join('. ');
}

function isOrderStepValid(errors: IValidationResult): boolean {
  return !errors.payment && !errors.address;
}

function isContactsStepValid(errors: IValidationResult): boolean {
  return !errors.email && !errors.phone;
}

async function loadCatalog() {
  const items = await api.getProductList();
  products.setItems(items);
}

// --- Model events (перерисовка только отсюда) ---
events.on<{ items: IProduct[] }>('products:items-changed', () => {
  renderCatalog(products.getItems());
});

events.on<{ item: IProduct | null }>('products:selected-changed', ({ item }) => {
  if (!item) return;
  currentModalScreen = 'preview';
  modal.open(renderPreview(item));
});

events.on('cart:changed', () => {
  header.render({ counter: cart.getItemsCount() });

  if (currentModalScreen === 'basket') {
    // обновление корзины по событию модели
    modal.open(renderBasket());
  }

  if (currentModalScreen === 'preview') {
    const item = products.getSelectedItem();
    if (item) modal.open(renderPreview(item));
  }
});

events.on('order:changed', () => {
  const buyer = order.getData();
  const errors = order.validate();

  if (currentModalScreen === 'order') {
    orderForm.render({
      payment: buyer.payment === 'online' ? 'card' : 'cash',
      address: buyer.address,
      valid: isOrderStepValid(errors),
      errors: orderErrorsToText(errors, ['payment', 'address']),
    });
  }

  if (currentModalScreen === 'contacts') {
    contactsForm.render({
      email: buyer.email,
      phone: buyer.phone,
      valid: isContactsStepValid(errors),
      errors: orderErrorsToText(errors, ['email', 'phone']),
    });
  }
});

events.on('order:cleared', () => {
  const buyer = order.getData();
  const errors = order.validate();

  if (currentModalScreen === 'order') {
    orderForm.render({
      payment: buyer.payment === 'online' ? 'card' : 'cash',
      address: buyer.address,
      valid: isOrderStepValid(errors),
      errors: orderErrorsToText(errors, ['payment', 'address']),
    });
  }

  if (currentModalScreen === 'contacts') {
    contactsForm.render({
      email: buyer.email,
      phone: buyer.phone,
      valid: isContactsStepValid(errors),
      errors: orderErrorsToText(errors, ['email', 'phone']),
    });
  }
});

// --- View events (обработка действий пользователя) ---
events.on('basket:open', () => openBasketModal());

events.on<{ id: string }>('card:select', ({ id }) => {
  const item = products.getItem(id) ?? null;
  products.setSelectedItem(item);
});

events.on<{ id: string }>('card:add-to-basket', ({ id }) => {
  const item = products.getItem(id);
  if (!item) return;
  if (item.price === null) return;
  if (cart.isInCart(id)) return;
  cart.addItem(item);
});

events.on<{ id: string }>('card:remove-from-basket', ({ id }) => {
  const item = cart.getItems().find((p) => p.id === id);
  if (!item) return;
  cart.removeItem(item);
});

events.on<{ id: string }>('basket:remove', ({ id }) => {
  const item = cart.getItems().find((p) => p.id === id);
  if (!item) return;
  cart.removeItem(item);
});

events.on('basket:submit', () => openOrderModal());

events.on<{ payment: 'card' | 'cash' }>('order:payment-select', ({ payment }) => {
  order.setData({ payment: payment === 'card' ? 'online' : 'upon receipt' });
});

events.on<{ address: string }>('order:address-change', ({ address }) => {
  order.setData({ address });
});

events.on('order:submit', () => openContactsModal());

events.on<{ email: string }>('contacts:email-change', ({ email }) => {
  order.setData({ email });
});

events.on<{ phone: string }>('contacts:phone-change', ({ phone }) => {
  order.setData({ phone });
});

events.on('contacts:submit', async () => {
  const errors = order.validate();
  if (!isContactsStepValid(errors)) return;

  const buyer = order.getData();
  const orderData: IOrderData = {
    ...buyer,
    total: cart.getTotalPrice(),
    items: cart.getItems().map((p) => p.id),
  };

  const result = await api.submitOrder(orderData);
  openSuccessModal(result.total);
});

events.on('success:close', () => {
  modal.close();
  products.setSelectedItem(null);
});

events.on('modal:close', () => {
  currentModalScreen = 'none';
  products.setSelectedItem(null);
});

// Базовые события форм (дополнительные, но тоже обрабатываются)
events.on<{ form: string; field: string; value: string }>('form:change', ({ form, field, value }) => {
  if (form === 'order' && field === 'address') order.setData({ address: value });
  if (form === 'contacts' && field === 'email') order.setData({ email: value });
  if (form === 'contacts' && field === 'phone') order.setData({ phone: value });
});

events.on<{ form: string }>('form:submit', ({ form }) => {
  if (form === 'order') openContactsModal();
  if (form === 'contacts') {
    // Ничего не делаем: логика оплаты/submit реализована через `contacts:submit`
  }
});

// --- init ---
header.render({ counter: 0 });
loadCatalog().catch((e) => console.error(e));