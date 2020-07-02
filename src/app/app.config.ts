import { VATCondition } from './components/vat-condition/vat-condition';
import * as moment from 'moment';
import { IdentificationType } from './components/identification-type/identification-type';
import { Currency } from './components/currency/currency';

export class Config {

  public _id: string;
  static database: string;
  static apiHost: string = 'localhost';
  static apiURL: string;
  static apiV8URL: string;
  static apiURL_FE_AR: string = 'libs/fe/ar/index.php';
  static apiURL_FE_MX: string = 'libs/fe/mx/01_CFDI_fe.php';
  static apiPort = 300;
  static apiV8Port = 308;
  static modules;
  static emailAccount: string;
  static emailPassword: string;
  static companyPicture: string;
  static companyName: string;
  static companyAddress: string;
  static companyFantasyName: string;
  static companyPhone: string;
  static companyVatCondition: VATCondition;
  static companyIdentificationType: IdentificationType;
  static companyIdentificationValue: string;
  static companyStartOfActivity: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
  static companyGrossIncome: string;
  static companyPostalCode: string;
  static footerInvoice: string;
  static licensePaymentDueDate: string;
  static country: string;
  static latitude: string;
  static longitude: string;
  static timezone: string;
  static currency: Currency;
  static licenseCost: number;
  static showLicenseNotification: boolean = true;
  public article: {
    code: {
      validators: {
        maxLength: number
      }
    },
    isWeigth: {
      default: boolean
    }
  };
  public company: {
    allowCurrentAccount: {
      default: boolean
    },
    vatCondition: {
      default: VATCondition
    }
  };
  public cashBox: {
    perUser: boolean
  };
  public reports: {
    summaryOfAccounts: {
      detailsPaymentMethod: boolean,
      invertedViewClient: boolean,
      invertedViewProvider: boolean
    }
  };
  public tradeBalance: {
    codePrefix: number,
    numberOfQuantity: number,
    numberOfIntegers: number,
    numberOfDecimals: number
  };
  public voucher: {
    readingLimit: number,
    minutesOfExpiration: number
  };
  public twilio: {
    senderNumber: string,
    accountSid: string,
    authToken: string
  };

  constructor() {
    Config.updateApiURL();
    Config.updateApiV8URL();
  }

  public static setApiHost(apiHost: string): void {
    this.apiHost = apiHost;
    Config.updateApiURL();
    Config.updateApiV8URL();
  }

  public static setApiPort(apiPort: number): void {
    this.apiPort = apiPort;
    Config.updateApiURL();
  }

  public static setApiV8Port(apiPort: number): void {
    this.apiPort = apiPort;
    Config.updateApiV8URL();
  }

  public static setModules(modules): void {
    Config.modules = modules;
  }

  public static setDatabase(database: string): void {
    Config.database = database;
  }

  public static setlicensePaymentDueDate(licensePaymentDueDate: string): void {
    Config.licensePaymentDueDate = licensePaymentDueDate;
  }

  public static setConfigEmail(emailAccount, emailPassword): void {
    Config.emailAccount = emailAccount;
    Config.emailPassword = emailPassword;
  }

  public static setConfigCompany(
    companyPicture,
    companyName,
    companyAddress,
    companyPhone,
    companyVatCondition,
    companyStartOfActivity,
    companyGrossIncome,
    footerInvoice,
    companyFantasyName,
    country,
    timezone,
    currency,
    companyIdentificationType,
    companyIdentificationValue,
    licenseCost,
    companyPostalCode
  ): void {
    Config.companyPicture = companyPicture;
    Config.companyName = companyName;
    Config.companyAddress = companyAddress;
    Config.companyFantasyName = companyFantasyName;
    Config.companyPhone = companyPhone;
    Config.companyVatCondition = companyVatCondition;
    Config.companyStartOfActivity = companyStartOfActivity;
    Config.companyGrossIncome = companyGrossIncome;
    Config.footerInvoice = footerInvoice;
    Config.country = country;
    Config.timezone = timezone;
    Config.companyIdentificationType = companyIdentificationType;
    Config.companyIdentificationValue = companyIdentificationValue;
    Config.licenseCost = licenseCost;
    Config.currency = currency;
    Config.companyPostalCode = companyPostalCode;
  }

  public static setConfigs(showLicenseNotification: boolean): void {
    Config.showLicenseNotification = showLicenseNotification;
  }

  public static updateApiURL() {
    if (Config.apiPort !== 0) {
      Config.apiURL = 'http://' + Config.apiHost + ':' + Config.apiPort + '/api/';
    } else {
      Config.apiURL = 'http://' + Config.apiHost + '/api/';
    }
  }

  public static updateApiV8URL() {
    if (Config.apiPort !== 0) {
      Config.apiV8URL = 'http://' + Config.apiHost + ':' + Config.apiV8Port + '/';
    } else {
      Config.apiV8URL = 'http://' + Config.apiV8Port + '/';
    }
  }
}
