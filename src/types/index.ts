export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';
export type TPayment = 'online' | 'upon receipt';

export interface IApi {
    get<T extends object>(uri: string): Promise<T>;
    post<T extends object>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
}

export interface IProduct {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number | null;
}

export interface IBuyer {
  payment: TPayment;
  email: string;
  phone: string;
  address: string;
}

export interface IValidationResult {
  payment?: string;
  email?: string;
  phone?: string;
  address?: string;
}

// API типы
export interface IProductListResponse {
  total: number;
  items: IProduct[];
}

export interface IOrderData {
  payment: TPayment;
  email: string;
  phone: string;
  address: string;
  total: number;
  items: string[]; // Массив ID товаров
}

export interface ISuccessResponse {
  id: string;
  total: number;
}