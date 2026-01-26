import { IApi, IProduct, IProductListResponse, IOrderData, ISuccessResponse } from '../../types';

export class WebLarekAPI {
  private _api: IApi;

  constructor(baseApi: IApi) {
    this._api = baseApi;
  }

  // Получение списка товаров с сервера
  async getProductList(): Promise<IProduct[]> {
    try {
      const response = await this._api.get<IProductListResponse>('/product');
      return response.items;
    } catch (error) {
      console.error('Ошибка при получении списка товаров:', error);
      throw error;
    }
  }

  // Отправка заказа на сервер
  async submitOrder(orderData: IOrderData): Promise<ISuccessResponse> {
    try {
      const response = await this._api.post<ISuccessResponse>('/order', orderData);
      return response;
    } catch (error) {
      console.error('Ошибка при отправке заказа:', error);
      throw error;
    }
  }
}