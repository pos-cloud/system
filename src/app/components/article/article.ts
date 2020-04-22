import { Make } from '../make/make';
import { Category } from '../category/category';
import { Taxes } from '../tax/taxes';
import { Deposit } from '../deposit/deposit';
import { Location } from '../location/location';
import { ArticleFields } from '../article-field/article-fields';
import { User } from '../user/user';
import { UnitOfMeasurement } from '../unit-of-measurement/unit-of-measurement';

import * as moment from 'moment';
import { Currency } from '../currency/currency';
import { Company } from '../company/company';
import { Classification } from '../classification/classification';

export class Article {

  public _id: string;
  public type: Type = Type.Final;
  public containsVariants: boolean = false;
  public containsStructure: boolean = false;
  public code: string = "0000000001";
  public codeSAT: string;
  public description: string = '';
  public posDescription: string = '';
  public quantityPerMeasure: number = 1;
  public unitOfMeasurement: UnitOfMeasurement;
  public observation: string;
  public notes: string[];
  public basePrice: number = 0.00;
  public taxes: Taxes[];
  public otherFields: ArticleFields[];
  public costPrice: number = 0.00;
  public markupPercentage: number = 0.00;
  public markupPrice: number = 0.00;
  public salePrice: number = 0.00;
  public currency: Currency;
  public make: Make;
  public deposits: [{
      _id: string;
      deposit : Deposit,
      capacity : number;	
  }];
  public locations: [{
      _id: string;
      location : Location
  }];
  public children: [{
      _id: string;
      article : Article,
      quantity : number
  }];
  public category: Category;
  public barcode: string;
  public printIn: ArticlePrintIn = ArticlePrintIn.Counter;
  public posKitchen: Boolean = false;
  public allowPurchase: Boolean = true;
  public allowSale: Boolean = true;
  public allowSaleWithoutStock: Boolean = false;
  public allowMeasure: Boolean = false;
  public isWeigth: Boolean = false;
  public ecommerceEnabled: Boolean = false;
  public favourite: Boolean = false;
  public picture: string = 'default.jpg';
  public providers : Company[];
  public classification : Classification;
  public operationType : string;
  public creationUser: User;
  public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
  public updateUser: User;
  public updateDate: string;

  constructor() {}
}

export enum ArticlePrintIn {
  Bar = <any> "Bar",
  Kitchen = <any> "Cocina",
  Counter = <any> "Mostrador",
  Voucher = <any> "Voucher"
}

export enum Type {
  Final = <any>"Final",
  Variant = <any>"Variante",
  Ingredient = <any>"Ingrediente"
}

export let attributes = [
  {
    name: 'code',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required : false,
  },
  {
    name: 'description',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required : false,
  },
  {
    name: 'posDescription',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required : false,
  },
  {
    name: 'make.description',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required : false,
  },
  {
    name: 'category.description',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required : false,
  },
  {
    name: 'salePrice',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'currency',
    project: null,
    align: 'right',
    required : false,
  },
  {
    name: 'taxesPercentage',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: `{"$reduce":{"input":"$taxes.percentage","initialValue":"","in":{"$concat":["$$value",{"$cond":{"if":{"$eq":["$$value",""]},"then":"","else":"; "}},{"$concat":[{"$toString":"$$this"},"%"]}]}}}`,
    align: 'left',
    required : false,
  },
  {
    name: 'currency.name',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required : false,
  },
  {
    name: 'observation',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required : false,
  },
  {
    name: 'barcode',
    visible: true,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required : false,
  },
  {
    name: 'costPrice',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'currency',
    project: null,
    align: 'right',
    required : false,
  },
  {
    name: 'basePrice',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'currency',
    project: null,
    align: 'right',
    required : false,
  },
  {
    name: 'markupPercentage',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'percent',
    project: null,
    align: 'right',
    required : false,
  },
  {
    name: 'markupPrice',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'currency',
    project: null,
    align: 'right',
    required : false,
  },
  {
    name: 'otherFieldsValues',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: `{"$reduce":{"input":"$otherFields.value","initialValue":"","in":{"$concat":["$$value",{"$cond":{"if":{"$eq":["$$value",""]},"then":"","else":"; "}},{"$concat":[{"$toString":"$$this"},""]}]}}}`,
    align: 'left',
    required : false,
  },
  {
    name: 'printIn',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required : false,
  },
  {
    name: 'allowPurchase',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'boolean',
    project: null,
    align: 'left',
    required : false,
  },
  {
    name: 'allowSale',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'boolean',
    project: null,
    align: 'left',
    required : false,
  },
  {
    name: 'allowPurchase',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'boolean',
    project: null,
    align: 'left',
    required : false,
  },
  {
    name: 'allowSaleWithoutStock',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'boolean',
    project: null,
    align: 'left',
    required : false,
  },
  {
    name: 'allowMeasure',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'boolean',
    project: null,
    align: 'left',
    required : false,
  },
  {
    name: 'isWeigth',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'boolean',
    project: null,
    align: 'left',
    required : false,
  },
  {
    name: 'ecommerceEnabled',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'boolean',
    project: null,
    align: 'left',
    required : false,
  },
  {
    name: 'picture',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'string',
    project: null,
    align: 'left',
    required : false,
  },
  {
    name: 'favourite',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'boolean',
    project: null,
    align: 'left',
    required : false,
  },
  {
    name: 'posKitchen',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'boolean',
    project: null,
    align: 'left',
    required : false,
  },
  {
    name: 'creationDate',
    visible: false,
    disabled: false,
    filter: true,
    datatype: 'date',
    project: null,
    align: 'left',
    required : false,
  },
  {
    name: 'type',
    visible: false,
    disabled: true,
    filter: false,
    datatype: 'string',
    project: null,
    align: 'left',
    required : true,
  },
  {
    name: 'operationType',
    visible: false,
    disabled: true,
    filter: false,
    datatype: 'string',
    defaultFilter: `{ "$ne": "D" }`,
    project: null,
    align: 'left',
    required : true,
  },
];