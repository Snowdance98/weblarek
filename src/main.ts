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

type TModalScreen = 'none' | 'preview' | 'basket' | 'order' | 'contacts' | 'success';
let currentModalScreen: TModalScreen = 'none';
let currentOrderForm: OrderForm | null = null;
let currentContactsForm: ContactsForm | null = null;
let currentBasketView: BasketView | null = null;

function renderCatalog(items: IProduct[]) {
  const cards = items.map((p) => {
    const el = cloneTemplate<HTMLButtonElement>('#card-catalog');
    const card = new CardCatalog(el, events);
    return card.render({
      id: p.id,
      title: p.title,
      price: p.price,
      image: p.image,
      category: p.category,
    });
  });
  gallery.render({ items: cards });
}

function renderPreview(item: IProduct) {
  const el = cloneTemplate<HTMLElement>('#card-preview');
  const view = new CardPreview(el, events);

  const inCart = cart.isInCart(item.id);
  const canBuy = item.price !== null;

  return view.render({
    id: item.id,
    title: item.title,
    price: item.price,
    image: item.image,
    category: item.category,
    description: item.description,
    buttonText: inCart ? 'Уже в корзине' : 'В корзину',
    buttonDisabled: inCart || !canBuy,
  });
}

function openBasketModal() {
  const el = cloneTemplate<HTMLElement>('#basket');
  currentBasketView = new BasketView(el, events);
  currentModalScreen = 'basket';
  modal.open(renderBasket());
}

function renderBasket(): HTMLElement {
  const items = cart.getItems().map((p, idx) => {
    const li = cloneTemplate<HTMLElement>('#card-basket');
    const item = new CardBasket(li, events);
    return item.render({
      id: p.id,
      title: p.title,
      price: p.price,
      index: idx + 1,
    });
  });

  if (!currentBasketView) {
    // На случай, если рендер вызывается после открытия без сохранённой ссылки
    const el = cloneTemplate<HTMLElement>('#basket');
    currentBasketView = new BasketView(el, events);
  }

  return currentBasketView.render({
    items,
    total: cart.getTotalPrice(),
    canSubmit: cart.getItemsCount() > 0,
  });
}

function openOrderModal() {
  const el = cloneTemplate<HTMLFormElement>('#order');
  currentOrderForm = new OrderForm(el, events);
  currentContactsForm = null;
  currentBasketView = null;
  currentModalScreen = 'order';

  const buyer = order.getData();
  const errors = order.validate();
  modal.open(
    currentOrderForm.render({
      payment: buyer.payment,
      address: buyer.address,
      valid: isOrderStepValid(errors),
      errors: orderErrorsToText(errors, ['payment', 'address']),
    })
  );
}

function openContactsModal() {
  const el = cloneTemplate<HTMLFormElement>('#contacts');
  currentContactsForm = new ContactsForm(el, events);
  currentOrderForm = null;
  currentBasketView = null;
  currentModalScreen = 'contacts';

  const buyer = order.getData();
  const errors = order.validate();

  modal.open(
    currentContactsForm.render({
      email: buyer.email,
      phone: buyer.phone,
      valid: isContactsStepValid(errors),
      errors: orderErrorsToText(errors, ['email', 'phone']),
    })
  );
}

function openSuccessModal(total: number) {
  const el = cloneTemplate<HTMLElement>('#success');
  const view = new SuccessView(el, events);
  currentOrderForm = null;
  currentContactsForm = null;
  currentBasketView = null;
  currentModalScreen = 'success';
  modal.open(view.render({ total }));
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
  currentOrderForm = null;
  currentContactsForm = null;
  currentBasketView = null;
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

  if (currentModalScreen === 'order' && currentOrderForm) {
    currentOrderForm.render({
      payment: buyer.payment,
      address: buyer.address,
      valid: isOrderStepValid(errors),
      errors: orderErrorsToText(errors, ['payment', 'address']),
    });
  }

  if (currentModalScreen === 'contacts' && currentContactsForm) {
    currentContactsForm.render({
      email: buyer.email,
      phone: buyer.phone,
      valid: isContactsStepValid(errors),
      errors: orderErrorsToText(errors, ['email', 'phone']),
    });
  }
});

events.on('order:cleared', () => {
  // Если формы открыты — просто отрисуем их из текущего состояния модели
  const buyer = order.getData();
  const errors = order.validate();

  if (currentModalScreen === 'order' && currentOrderForm) {
    currentOrderForm.render({
      payment: buyer.payment,
      address: buyer.address,
      valid: isOrderStepValid(errors),
      errors: orderErrorsToText(errors, ['payment', 'address']),
    });
  }

  if (currentModalScreen === 'contacts' && currentContactsForm) {
    currentContactsForm.render({
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

events.on<{ id: string }>('basket:remove', ({ id }) => {
  const item = cart.getItems().find((p) => p.id === id);
  if (!item) return;
  cart.removeItem(item);
});

events.on('basket:submit', () => openOrderModal());

events.on<{ payment: 'online' | 'upon receipt' }>('order:payment-select', ({ payment }) => {
  order.setData({ payment });
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
  cart.clear();
  order.clear();
  products.setSelectedItem(null);
});

events.on('modal:close', () => {
  currentModalScreen = 'none';
  currentOrderForm = null;
  currentContactsForm = null;
  currentBasketView = null;
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