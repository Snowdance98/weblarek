import './scss/styles.scss';
import { apiProducts } from './utils/data';
import { Products } from './components/Models/Products';
import { Cart } from './components/Models/Cart';
import { Order } from './components/Models/Order';
import { Api } from './components/base/Api';
import { WebLarekAPI } from './components/Services/WebLarekAPI';
import { IOrderData } from './types';

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
    // Получаем URL API из переменных окружения
    const API_URL = import.meta.env.VITE_API_ORIGIN;
    
    console.log('Проверяем переменные окружения...');
    console.log('VITE_API_ORIGIN:', API_URL);
    console.log('Все env переменные:', import.meta.env);
    
    if (!API_URL) {
      console.error('Ошибка: VITE_API_ORIGIN не задан в .env файле');
      console.log('Текущее значение import.meta.env:', import.meta.env);
      console.log('Создайте файл .env в корне проекта с содержимым:');
      console.log('VITE_API_ORIGIN=https://larek-api.nomoreparties.co');
      console.log('Или используйте тестовый URL для проверки...');
      
      // Используем тестовый URL для проверки
      const testAPI_URL = 'https://larek-api.nomoreparties.co';
      console.log('Используем тестовый URL:', testAPI_URL);
      await testConnection(testAPI_URL);
      return;
    }
    
    await testConnection(API_URL);
    
  } catch (error) {
    console.error('Критическая ошибка при работе с API:', error);
  }
}

async function testConnection(apiUrl: string) {
  console.log('\n--- Тестирование подключения к API ---');
  console.log('URL API:', apiUrl);
  
  // Проверяем доступность сервера
  try {
    console.log('Проверяем доступность сервера...');
    const testResponse = await fetch(apiUrl, { method: 'HEAD' });
    console.log('Статус сервера:', testResponse.status, testResponse.statusText);
    
    if (!testResponse.ok) {
      console.error('Сервер недоступен или возвращает ошибку');
      
      // Попробуем другой эндпоинт
      console.log('Пробуем обратиться к корневому эндпоинту...');
      const rootResponse = await fetch(apiUrl);
      console.log('Ответ от корня:', rootResponse.status, rootResponse.statusText);
      
      // Попробуем с /api префиксом
      const apiRootUrl = apiUrl + '/api';
      console.log('Пробуем с /api префиксом:', apiRootUrl);
      const apiResponse = await fetch(apiRootUrl);
      console.log('Ответ от /api:', apiResponse.status, apiResponse.statusText);
    }
  } catch (fetchError) {
    console.error('Ошибка при проверке сервера:', fetchError);
    console.log('Возможные причины:');
    console.log('1. Сервер не запущен');
    console.log('2. Проблемы с интернет-соединением');
    console.log('3. CORS ошибка');
    console.log('4. Неверный URL');
  }
  
  // Создаем базовый API
  console.log('\nСоздаем экземпляр Api...');
  const baseApi = new Api(apiUrl);
  const webLarekAPI = new WebLarekAPI(baseApi);
  
  console.log('Создан экземпляр WebLarekAPI');
  
  // Пробуем разные варианты эндпоинтов
  const endpointsToTry = [
    '/product',
    '/api/product',
    '/api/products',
    '/products',
    '/api/items'
  ];
  
  for (const endpoint of endpointsToTry) {
    console.log(`\nПробуем эндпоинт: ${endpoint}`);
    try {
      // Временно тестируем напрямую fetch
      const response = await fetch(apiUrl + endpoint);
      console.log(`Статус для ${endpoint}:`, response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Успех! Данные с ${endpoint}:`, data);
        break;
      }
    } catch (error) {
      console.log(`Ошибка для ${endpoint}:`, error);
    }
  }
  
  // Пробуем получить товары через наш API класс
  try {
    console.log('\nПробуем получить товары через WebLarekAPI...');
    const productsFromServer = await webLarekAPI.getProductList();
    console.log('Успех! Товары полученные с сервера:', productsFromServer);
    console.log('Количество товаров с сервера:', productsFromServer.length);
  } catch (apiError) {
    console.log('Не удалось получить товары через API. Используем тестовые данные.');
    
    // Используем тестовые данные
    const productsModel = new Products();
    productsModel.setItems(apiProducts.items);
    console.log('Используем тестовые данные из data.ts');
    console.log('Тестовые товары:', productsModel.getItems());
    
    // Тестируем создание заказа с тестовыми данными
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
    
    console.log('Тестовые данные заказа для демонстрации:', testOrderData);
    
    // Пробуем отправить заказ (скорее всего тоже упадет, но проверим)
    try {
      console.log('Пробуем отправить тестовый заказ...');
      const orderResponse = await webLarekAPI.submitOrder(testOrderData);
      console.log('Заказ успешно отправлен:', orderResponse);
    } catch (orderError) {
      console.log('Ошибка при отправке заказа:', orderError);
    }
  }
}

// Запускаем тест API
testServerAPI();

console.log('\n=== Основное тестирование завершено ===');