import './scss/styles.scss';
import { apiProducts } from './utils/data';
import { Products } from './components/Models/Products';
import { Cart } from './components/Models/Cart';
import { Order } from './components/Models/Order';
import { Api } from './components/base/Api';
import { WebLarekAPI } from './components/Services/WebLarekAPI';
import { IOrderData } from './types';
import { API_URL } from './utils/constants'; // Импортируем константу из constants.ts

console.log('=== Тестирование моделей данных ===');

// 1. Тестирование Products
console.log('\n1. Тестирование Products:');
const productsModel = new Products();
productsModel.setItems(apiProducts.items);
console.log('Массив товаров из каталога:', productsModel.getItems());
console.log('Количество товаров в каталоге:', productsModel.getItems().length);

const firstProduct = productsModel.getItems()[0];
console.log('Первый товар:', firstProduct);
productsModel.setSelectedItem(firstProduct);
console.log('Выбранный товар:', productsModel.getSelectedItem());

const foundProduct = productsModel.getItem(firstProduct.id);
console.log('Найденный товар по ID:', foundProduct);

// 2. Тестирование Cart
console.log('\n2. Тестирование Cart:');
const cartModel = new Cart();
console.log('Корзина пуста:', cartModel.getItemsCount() === 0);

cartModel.addItem(firstProduct);
console.log('Добавили товар в корзину');
console.log('Товары в корзине:', cartModel.getItems());
console.log('Количество товаров в корзине:', cartModel.getItemsCount());
console.log('Общая стоимость корзины:', cartModel.getTotalPrice());
console.log('Товар в корзине?', cartModel.isInCart(firstProduct.id));

const secondProduct = apiProducts.items[1];
cartModel.addItem(secondProduct);
console.log('Добавили второй товар');
console.log('Общая стоимость после добавления:', cartModel.getTotalPrice());

cartModel.removeItem(firstProduct);
console.log('Удалили первый товар');
console.log('Товары в корзине после удаления:', cartModel.getItems());

cartModel.clear();
console.log('Очистили корзину');
console.log('Корзина пуста после очистки:', cartModel.getItemsCount() === 0);

// 3. Тестирование Order
console.log('\n3. Тестирование Order:');
const orderModel = new Order();
console.log('Данные по умолчанию:', orderModel.getData());

orderModel.setData({
  email: 'test@example.com',
  phone: '+79991234567',
  address: 'Москва, ул. Примерная, д. 1'
});
console.log('Данные после частичного сохранения:', orderModel.getData());

const validation1 = orderModel.validate();
console.log('Валидация без способа оплаты:', validation1);

orderModel.setData({ payment: 'online' });
const validation2 = orderModel.validate();
console.log('Валидация со всеми данными:', validation2);
console.log('Все данные валидны?', Object.keys(validation2).length === 0);

orderModel.setData({ email: 'invalid-email' });
const validation3 = orderModel.validate();
console.log('Валидация с неверным email:', validation3);

orderModel.clear();
console.log('Данные после очистки:', orderModel.getData());

// 4. Тестирование работы с реальным сервером
console.log('\n4. Тестирование работы с сервером:');

async function testServerAPI() {
  try {
    console.log('Проверяем переменные окружения...');
    console.log('VITE_API_ORIGIN:', import.meta.env.VITE_API_ORIGIN);
    
    if (!import.meta.env.VITE_API_ORIGIN) {
      console.error('Ошибка: VITE_API_ORIGIN не задан в .env файле');
      console.log('Создайте файл .env в корне проекта с содержимым:');
      console.log('VITE_API_ORIGIN=https://larek-api.nomoreparties.co');
      return;
    }
    
    console.log('Полный URL API из constants.ts:', API_URL);
    
    // Создаем базовый API с использованием полного URL из constants.ts
    console.log('\nСоздаем экземпляр Api...');
    const baseApi = new Api(API_URL); // Используем полный URL из constants.ts
    const webLarekAPI = new WebLarekAPI(baseApi);
    
    console.log('Создан экземпляр WebLarekAPI');
    
    // Тестируем получение товаров через наше API
    console.log('\nТестируем getProductList()...');
    try {
      const productsFromServer = await webLarekAPI.getProductList();
      console.log('Успех! Товары полученные с сервера:', productsFromServer);
      console.log('Количество товаров с сервера:', productsFromServer.length);
    } catch (apiError) {
      console.error('Ошибка при получении товаров:', apiError);
    }
    
    // Тестируем отправку заказа
    console.log('\nТестируем submitOrder()...');
    const cartModel = new Cart();
    if (apiProducts.items.length > 0) {
      cartModel.addItem(apiProducts.items[0]);
      cartModel.addItem(apiProducts.items[1]);
    }
    
    const testOrderData: IOrderData = {
      payment: 'online',
      email: 'test@example.com',
      phone: '+79991234567',
      address: 'Москва, ул. Примерная, д. 1',
      total: cartModel.getTotalPrice(),
      items: cartModel.getItems().map(item => item.id)
    };
    
    console.log('Тестовые данные заказа:', testOrderData);
    
    try {
      const orderResponse = await webLarekAPI.submitOrder(testOrderData);
      console.log('Заказ успешно отправлен:', orderResponse);
    } catch (orderError) {
      console.error('Ошибка при отправке заказа:', orderError);
    }
    
  } catch (error) {
    console.error('Критическая ошибка при работе с API:', error);
  }
}

// Запускаем тест API
testServerAPI();

console.log('\n=== Основное тестирование завершено ===');