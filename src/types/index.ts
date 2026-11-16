import type { ApiListResponse } from '../components/base/api';

/** Внешний контракт товара. image — путь, который прислал сервер. */
export interface IProductDTO {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  price: number | null;
}

export type IProductListResponse = ApiListResponse<IProductDTO>;

/** Внутренняя модель: imageUrl нормализован относительно CDN_URL. */
export interface IProduct extends Omit<IProductDTO, 'image'> {
  imageUrl: string;
}

/** Только такой товар может находиться в корзине; нулевая цена допустима. */
export interface IPurchasableProduct extends IProduct {
  price: number;
}

export type PaymentMethod = 'card' | 'cash';

export interface IOrderDraft {
  payment: PaymentMethod | null;
  address: string;
  email: string;
  phone: string;
}

export type IOrderFormData = Pick<IOrderDraft, 'payment' | 'address'>;
export type IContactsFormData = Pick<IOrderDraft, 'email' | 'phone'>;

export interface IOrderRequest extends Omit<IOrderDraft, 'payment'> {
  payment: PaymentMethod;
  total: number;
  items: string[];
}

/** Проектный контракт; статус подтверждения API указан в README. */
export interface IOrderResponse {
  id: string;
  total: number;
}

export interface IApiErrorResponse {
  error: string;
}

export type ValidationErrors<T> = Partial<Record<keyof T, string>>;

export interface IValidationResult<T> {
  valid: boolean;
  errors: ValidationErrors<T>;
}

export interface IBasketSnapshot {
  items: ReadonlyArray<Readonly<IPurchasableProduct>>;
  total: number;
  count: number;
}

export type BasketAddResult = 'added' | 'duplicate' | 'unavailable' | 'not-found';

/** Контракты будущих моделей; реализации в этом спринте не создаются. */
export interface ICatalogModel {
  readonly items: ReadonlyArray<Readonly<IProduct>>;
  setItems(items: readonly IProductDTO[]): void;
  getProduct(id: string): Readonly<IProduct> | undefined;
}

export interface IBasketModel {
  readonly ids: readonly string[];
  has(id: string): boolean;
  add(id: string): BasketAddResult;
  remove(id: string): void;
  clear(): void;
  getSnapshot(): IBasketSnapshot;
}

export interface IOrderModel {
  readonly draft: Readonly<IOrderDraft>;
  update(data: Partial<IOrderDraft>): void;
  reset(): void;
  validateOrder(): IValidationResult<IOrderFormData>;
  validateContacts(): IValidationResult<IContactsFormData>;
  toRequest(basket: IBasketSnapshot): IOrderRequest;
}

/** Адаптер использует штатный Api через композицию. */
export interface ILarekApi {
  getProducts(): Promise<IProductListResponse>;
  createOrder(order: IOrderRequest): Promise<IOrderResponse>;
}

export type CategoryModifier = 'soft' | 'hard' | 'other' | 'additional' | 'button';

/** Данные карточки каталога: цена подготовлена для показа, не для расчётов. */
export interface IProductView {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  categoryModifier: CategoryModifier;
  priceLabel: string;
}

export interface IProductPreviewView extends IProductView {
  description: string;
  inBasket: boolean;
  action: 'add' | 'remove' | 'unavailable';
  actionLabel: string;
  actionDisabled: boolean;
}

export interface IBasketItemView {
  id: string;
  index: number;
  title: string;
  priceLabel: string;
}

/** Готовые DOM-узлы карточек; корзина не создаёт модели и не считает сумму. */
export interface IBasketView {
  items: HTMLElement[];
  totalLabel: string;
  checkoutDisabled: boolean;
}

export interface IPageView {
  cards: HTMLElement[];
  basketCount: number;
  locked: boolean;
}

export interface IFormState<T> {
  values: T;
  validation: IValidationResult<T>;
  pending: boolean;
  serverError: string | null;
}

export type IOrderFormView = IFormState<IOrderFormData>;
export type IContactsFormView = IFormState<IContactsFormData>;

export interface ISuccessView {
  totalLabel: string;
}

export interface IModalView {
  content: HTMLElement;
}

export interface IView<T> {
  render(data: T): HTMLElement;
}

export type OrderFieldChange =
  | { field: 'payment'; value: PaymentMethod }
  | { field: 'address'; value: string };

export type ContactsFieldChange = {
  field: keyof IContactsFormData;
  value: string;
};

/** Карта полезной нагрузки; штатный EventEmitter не проверяет имя по этой карте. */
export interface AppEventMap {
  'catalog:changed': Record<string, never>;
  'basket:changed': Record<string, never>;
  'order:changed': Record<string, never>;
  'product:select': { id: string };
  'product:add': { id: string };
  'product:remove': { id: string };
  'basket:open': Record<string, never>;
  'order:open': Record<string, never>;
  'order:change': OrderFieldChange;
  'order:submit': Record<string, never>;
  'contacts:change': ContactsFieldChange;
  'contacts:submit': Record<string, never>;
  'success:close': Record<string, never>;
  'modal:open': Record<string, never>;
  'modal:close': Record<string, never>;
}
