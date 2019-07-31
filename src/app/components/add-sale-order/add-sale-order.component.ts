//Paquetes Angular
import { Component, ElementRef, ViewChild, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

//Paquetes de terceros
import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';

//Modelos
import { Transaction, TransactionState } from './../../models/transaction';
import { TransactionMovement, StockMovement } from './../../models/transaction-type';
import { Taxes } from './../../models/taxes';
import { ArticlePrintIn } from './../../models/article';
import { ArticleStock } from './../../models/article-stock';
import { MovementOfArticle } from './../../models/movement-of-article';
import { Table, TableState } from './../../models/table';
import { Category } from './../../models/category';
import { Print } from './../../models/print';
import { Printer, PrinterType, PrinterPrintIn } from './../../models/printer';
import { Config } from './../../app.config';
import { CompanyType } from '../../models/company';
import { MovementOfCancellation } from "../../models/movement-of-cancellation"

//Servicios
import { MovementOfArticleService } from './../../services/movement-of-article.service';
import { TransactionService } from './../../services/transaction.service';
import { TransactionTypeService } from './../../services/transaction-type.service';
import { TableService } from './../../services/table.service';
import { TurnService } from './../../services/turn.service';
import { PrinterService } from './../../services/printer.service';
import { UserService } from './../../services/user.service';
import { PrintService } from './../../services/print.service';
import { ArticleStockService } from '../../services/article-stock.service';
import { TaxService } from '../../services/tax.service';

//Componentes
import { ListCompaniesComponent } from './../list-companies/list-companies.component';
import { AddMovementOfArticleComponent } from './../add-movement-of-article/add-movement-of-article.component';
import { SelectEmployeeComponent } from './../select-employee/select-employee.component';
import { PrintComponent } from '../print/print/print.component';
import { DeleteTransactionComponent } from '../delete-transaction/delete-transaction.component';
import { AddMovementOfCashComponent } from '../add-movement-of-cash/add-movement-of-cash.component';
import { ApplyDiscountComponent } from '../apply-discount/apply-discount.component';

//Pipes
import { DateFormatPipe } from './../../pipes/date-format.pipe';
import { RoundNumberPipe } from './../../pipes/round-number.pipe';
import { ArticleFields } from '../../models/article-fields';
import { ArticleFieldType } from '../../models/article-field';
import { PaymentMethod } from 'app/models/payment-method';
import { UseOfCFDIService } from 'app/services/use-of-CFDI.service';
import { UseOfCFDI } from 'app/models/use-of-CFDI';
import { RelationTypeService } from 'app/services/relation-type.service';
import { RelationType } from 'app/models/relation-type';
import { MovementOfCancellationComponent } from '../movement-of-cancellation/movement-of-cancellation.component';
import { MovementOfCancellationService } from 'app/services/movement-of-cancellation.service';
import { CancellationTypeService } from 'app/services/cancellation-type.service';
import { CurrencyService } from 'app/services/currency.service';
import { Currency } from 'app/models/currency';
import { CancellationType } from 'app/models/cancellation-type';
import { ListArticlesComponent } from '../list-articles/list-articles.component';
import { ListCategoriesComponent } from '../list-categories/list-categories.component';
import { ImportComponent } from '../import/import.component';
import { MovementOfCash } from 'app/models/movement-of-cash';
import { TaxClassification } from 'app/models/tax';
import { ClaimService } from 'app/services/claim.service';
import { Claim, ClaimPriority, ClaimType } from 'app/models/claim';
import { TransportService } from 'app/services/transport.service';
import { Transport } from 'app/models/transport';
import { SelectTransportComponent } from '../select-transport/select-transport.component';
import { ConfigService } from 'app/services/config.service';

@Component({
  selector: 'app-add-sale-order',
  templateUrl: './add-sale-order.component.html',
  styleUrls: ['./add-sale-order.component.scss'],
  providers: [NgbAlertConfig, DateFormatPipe, RoundNumberPipe],
  encapsulation: ViewEncapsulation.None
})

export class AddSaleOrderComponent {

  public transaction: Transaction;
  public transactionId: string;
  public transactionMovement: string;
  public alertMessage: string = '';
  public movementsOfArticles: MovementOfArticle[];
  public movementsOfCashes: MovementOfCash[];
  public usesOfCFDI: UseOfCFDI[];
  public relationTypes: RelationType[];
  public printers: Printer[];
  public currencies: Currency[];
  public cancellationTypes: CancellationType[];
  public showButtonCancelation: boolean;
  public printerSelected: Printer;
  public printersAux: Printer[];  //Variable utilizada para guardar las impresoras de una operación determinada (Cocina, mostrador, Bar)
  public userType: string;
  public posType: string;
  public loading: boolean;
  @ViewChild('contentPrinters', {static: true}) contentPrinters: ElementRef;
  @ViewChild('contentMessage', {static: true}) contentMessage: ElementRef;
  @ViewChild('contentChangeDate', {static: true}) contentChangeDate: ElementRef;
  @ViewChild('contentChangeQuotation', {static: true}) contentChangeQuotation: ElementRef;
  @ViewChild('containerMovementsOfArticles', {static: true}) containerMovementsOfArticles: ElementRef;
  @ViewChild('containerTaxes', {static: true}) containerTaxes: ElementRef;
  public paymentAmount: number = 0.00;
  public typeOfOperationToPrint: string;
  public kitchenArticlesToPrint: MovementOfArticle[];
  public kitchenArticlesPrinted: number = 0;
  public barArticlesToPrint: MovementOfArticle[];
  public printSelected: Print;
  public filterArticle: string = '';
  public focusEvent = new EventEmitter<boolean>();
  public roundNumber = new RoundNumberPipe();
  public areMovementsOfArticlesEmpty: boolean = true;
  public apiURL = Config.apiURL;
  public userCountry: string = 'AR';
  public lastQuotation: number = 1;
  @ViewChild(ListArticlesComponent, {static: true}) listArticlesComponent: ListArticlesComponent;
  @ViewChild(ListCategoriesComponent, {static: true}) listCategoriesComponent: ListCategoriesComponent;
  public categorySelected: Category;
  public totalTaxesAmount: number = 0;
  public filtersTaxClassification: TaxClassification[];
  public fastPayment: PaymentMethod
  public transports: Transport[];
  public config: Config;

  constructor(
    public _transactionService: TransactionService,
    public _transactionTypeService: TransactionTypeService,
    public _movementOfArticleService: MovementOfArticleService,
    public _articleStockService: ArticleStockService,
    public _tableService: TableService,
    public _turnService: TurnService,
    public _printService: PrintService,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal,
    public _printerService: PrinterService,
    public _userService: UserService,
    private _taxService: TaxService,
    public _useOfCFDIService: UseOfCFDIService,
    public _relationTypeService: RelationTypeService,
    public _movementOfCancellationService : MovementOfCancellationService,
    public _cancellationTypeService: CancellationTypeService,
    public _currencyService: CurrencyService,
    private _claimService: ClaimService,
    public _transportService: TransportService,
    public _configService: ConfigService
  ) {
    this.transaction = new Transaction();
    this.movementsOfArticles = new Array();
    this.printers = new Array();
    this.printersAux = new Array();
    this.barArticlesToPrint = new Array();
    this.kitchenArticlesToPrint = new Array();
    this.usesOfCFDI = new Array();
    this.relationTypes = new Array();
    this.currencies = new Array();
    this.cancellationTypes = new Array();
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.posType = pathLocation[2];
    if (this.posType !== 'resto') {
      this.transactionId = pathLocation[4];
    } else {
      this.transactionId = pathLocation[8];
    }
  }

  async ngOnInit() {
    
    await this._configService.getConfig.subscribe(
      config => {
        this.config = config;
        this.userCountry = this.config['country'];
        if(this.userCountry === 'MX') {
          this.getUsesOfCFDI().then(
            usesOfCFDI => {
              if(usesOfCFDI) {
                this.usesOfCFDI = usesOfCFDI;
              }
            }
          );
          this.getRelationTypes().then(
            relationTypes => {
              if(relationTypes) {
                this.relationTypes = relationTypes;
              }
            }
          );
        }
      }
    );

    if(this.transactionId) {
      await this.getTransaction().then(
        async transaction => {
          if(transaction) {
            this.transaction = transaction;
            if(this.transaction.state === TransactionState.Closed ||
              this.transaction.state === TransactionState.Canceled) {
              this.backFinal();
            } else {
              this.transactionMovement = '' + this.transaction.type.transactionMovement;
              this.filtersTaxClassification = [ TaxClassification.Withholding, TaxClassification.Perception ];
              this.lastQuotation = this.transaction.quotation;

              if(this.userCountry === 'MX' &&
                this.transaction.type.defectUseOfCFDI &&
                !this.transaction.useOfCFDI) {
                this.transaction.useOfCFDI = this.transaction.type.defectUseOfCFDI;
              }

              this.getCancellationTypes().then(
                cancellationTypes => {
                  if(cancellationTypes) {
                    this.cancellationTypes = cancellationTypes;
                    this.showButtonCancelation = true;
                  } else {
                    this.showButtonCancelation = false;
                  }
                }
              );
              this.getTransports();
              this.getMovementsOfTransaction();
            }
          }
        }
      );
    }
  }

  ngAfterViewInit() {
    setTimeout(() => this.focusEvent.emit(true), 1000);
  }

  public getCurrencies(): Promise<Currency[]> {

    return new Promise<Currency[]>((resolve, reject) => {

      this._currencyService.getCurrencies('sort="name":1').subscribe(
        result => {
          if (!result.currencies) {
            resolve(null);
          } else {
            resolve(result.currencies);
          }
        },
        error => {
          this.showMessage(error._body, "danger", false);
          resolve(null);
        }
      );
    });
  }

  public getCancellationTypes(): Promise<CancellationType[]> {

    return new Promise<CancellationType[]>((resolve, reject) => {

      this._cancellationTypeService.getCancellationTypes(
        { "destination._id": 1, "operationType" : 1 }, // PROJECT
        { "destination._id": { $oid: this.transaction.type._id} , "operationType": { "$ne": "D" } }, // MATCH
        { order: 1 }, // SORT
        {}, // GROUP
        0, // LIMIT
        0 // SKIP
      ).subscribe(result => {
        if (result && result.cancellationTypes && result.cancellationTypes.length > 0) {
          resolve(result.cancellationTypes);
        } else {
          resolve(null);
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        resolve(null);
      });
    });
  }

  public getUsesOfCFDI(): Promise<UseOfCFDI[]> {

    return new Promise<UseOfCFDI[]>((resolve, reject) => {

      this._useOfCFDIService.getUsesOfCFDI().subscribe(
        result => {
          if (!result.usesOfCFDI) {
            resolve(null);
          } else {
            resolve(result.usesOfCFDI);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  async changeUseOfCFDI(useOfCFDI) {
    this.transaction.useOfCFDI = useOfCFDI;
    await this.updateTransaction();
  }

  async changeTransport(transport) {
    if(transport){
      this.transaction.transport = transport;
    } else {
      this.transaction.transport = null;
    }
    await this.updateTransaction();
  }

  public getRelationTypes(): Promise<RelationType[]> {

    return new Promise<RelationType[]>((resolve, reject) => {

      let query = 'sort="description":1';

      this._relationTypeService.getRelationTypes(query).subscribe(
        result => {
          if (!result.relationTypes) {
            resolve(null);
          } else {
            resolve(result.relationTypes);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  public getTransaction(): Promise<Transaction> {

    return new Promise<Transaction>((resolve, reject) => {

      this._transactionService.getTransaction(this.transactionId).subscribe(
        async result => {
          if (!result.transaction) {
            this.showMessage(result.message, 'danger', false);
            resolve(null);
          } else {
            resolve(result.transaction);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  public updateTransaction(): Promise<Transaction> {

    return new Promise<Transaction>((resolve, reject) => {

      this.transaction.exempt = this.roundNumber.transform(this.transaction.exempt);
      this.transaction.discountAmount = this.roundNumber.transform(this.transaction.discountAmount);
      this.transaction.totalPrice = this.roundNumber.transform(this.transaction.totalPrice);

      this._transactionService.updateTransaction(this.transaction).subscribe(
        result => {
          if (!result.transaction) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.transaction);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  public saveMovementsOfCancellations(movementsOfCancellations: MovementOfCancellation[]): Promise<MovementOfCancellation[]> {
    
    for (let mov of movementsOfCancellations) {
      let transOrigin = new Transaction();
      transOrigin._id = mov.transactionOrigin._id;
      let transDestino = new Transaction();
      transDestino._id = mov.transactionDestination._id;
      mov.transactionOrigin = transOrigin;
      mov.transactionDestination = transDestino;
    }
    
    return new Promise<MovementOfCancellation[]>((resolve, reject) => {

      this._movementOfCancellationService.saveMovementsOfCancellations(movementsOfCancellations).subscribe(
        async result => {
          if (!result.movementsOfCancellations) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.movementsOfCancellations);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  public daleteMovementsOfCancellations(query: string): Promise<boolean> {

    return new Promise((resolve, reject) => {

      this._movementOfCancellationService.deleteMovementsOfCancellations(query).subscribe(
        async result => {
          if (!result.movementsOfCancellations) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.movementsOfCancellations);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  public changeCurrency(currency: Currency): void {
    this.transaction.currency = currency;
    if(this.config['currency'] && this.transaction.currency._id !== this.config['currency']._id) {
      for(let currency of this.currencies) {
        if(currency._id !== this.config['currency']._id) {
          this.transaction.quotation = currency.quotation;
        }
      }
    } else {
      if(!this.transaction.quotation) {
        this.transaction.quotation = currency.quotation;
      }
    }
    this.updateTransaction().then(
      transaction => {
        if(transaction) {
          this.transaction = transaction;
        }
      }
    );
  }

  public updateTable(): Promise<Table> {

    return new Promise<Table>((resolve, reject) => {

      this._tableService.updateTable(this.transaction.table).subscribe(
        result => {
          if (!result.table) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.table);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          reject(null);
        }
      );
    });
  }

  public getMovementsOfTransaction(): void {

    this.loading = true;

    let query = 'where="transaction":"' + this.transaction._id + '"';

    this._movementOfArticleService.getMovementsOfArticles(query).subscribe(
      result => {
        if (!result.movementsOfArticles) {
          this.areMovementsOfArticlesEmpty = true;
          this.movementsOfArticles = new Array();
          this.updatePrices();
        } else {
          this.areMovementsOfArticlesEmpty = false;
          this.movementsOfArticles = result.movementsOfArticles;
          this.containerMovementsOfArticles.nativeElement.scrollTop = this.containerMovementsOfArticles.nativeElement.scrollHeight;
          this.updatePrices();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  async addItem(itemData: MovementOfArticle) {

    if(itemData) {

      this.showCategories();

      if (!itemData.article.containsVariants && !itemData.article.allowMeasure) {

        let movementOfArticle: MovementOfArticle;

        if(!itemData.article.isWeigth) {
          movementOfArticle = this.getMovementOfArticleByArticle(itemData.article._id);
        }

        if (!movementOfArticle) {
          movementOfArticle = itemData;
          movementOfArticle._id = '';
          movementOfArticle.transaction = this.transaction;
          movementOfArticle.modifyStock = this.transaction.type.modifyStock;
          if(this.transaction.type.stockMovement) {
            movementOfArticle.stockMovement = this.transaction.type.stockMovement.toString();
          }
          movementOfArticle.printed = 0;
          if(await this.isValidMovementOfArticle(movementOfArticle)) {
            await this.saveMovementOfArticle(movementOfArticle).then(
              movementOfArticle => {
                if(movementOfArticle) {
                  this.getMovementsOfTransaction();
                }
              }
            );
          }
        } else {
          movementOfArticle.amount += 1;
          if(await this.isValidMovementOfArticle(movementOfArticle)) {
            if (movementOfArticle.transaction.type.transactionMovement === TransactionMovement.Sale) {
              await this.updateMovementOfArticle(this.recalculateSalePrice(movementOfArticle)).then(
                movementOfArticle => {
                  if(movementOfArticle) {
                    this.getMovementsOfTransaction();
                  }
                }
              );
            } else {
              await this.updateMovementOfArticle(this.recalculateCostPrice(movementOfArticle)).then(
                movementOfArticle => {
                  if(movementOfArticle) {
                    this.getMovementsOfTransaction();
                  }
                }
              );
            }
          } else {
            movementOfArticle.amount -= 1;
          }
        }
      } else {
        let movementOfArticle: MovementOfArticle;
        movementOfArticle = itemData;
        movementOfArticle._id = '';
        movementOfArticle.transaction = this.transaction;
        movementOfArticle.modifyStock = this.transaction.type.modifyStock;
        if(this.transaction.type.stockMovement) {
          movementOfArticle.stockMovement = this.transaction.type.stockMovement.toString();
        }
        movementOfArticle.printed = 0;
        movementOfArticle.amount = 1;
        this.openModal("movement_of_article", movementOfArticle);
      }
    } else {
      this.showArticles();
    }
  }

  public saveMovementOfArticle(movementOfArticle: MovementOfArticle): Promise<MovementOfArticle> {

    return new Promise<MovementOfArticle>((resolve, reject) => {

      movementOfArticle.basePrice = this.roundNumber.transform(movementOfArticle.basePrice);
      movementOfArticle.costPrice = this.roundNumber.transform(movementOfArticle.costPrice);
      movementOfArticle.salePrice = this.roundNumber.transform(movementOfArticle.salePrice);

      this._movementOfArticleService.saveMovementOfArticle(movementOfArticle).subscribe(
        result => {
          if (!result.movementOfArticle) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            this.hideMessage();
            movementOfArticle = result.movementOfArticle;
            resolve(movementOfArticle);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  async isValidMovementOfArticle(movementOfArticle: MovementOfArticle): Promise<boolean> {

    let isValid = true;

    if (this.transaction.type &&
        this.transaction.type.transactionMovement === TransactionMovement.Sale &&
        movementOfArticle.article &&
        !movementOfArticle.article.allowSale) {
        isValid = false;
        this.showMessage("El producto " + movementOfArticle.article.description + " (" + movementOfArticle.article.code + ") no esta habilitado para la venta", 'info', true);
    }

    if (this.transaction.type &&
        this.transaction.type.transactionMovement === TransactionMovement.Purchase &&
        movementOfArticle.article &&
        !movementOfArticle.article.allowPurchase) {
        isValid = false;
        this.showMessage("El producto " + movementOfArticle.article.description + " (" + movementOfArticle.article.code + ") no esta habilitado para la compra", 'info', true);
    }

    if  (movementOfArticle.article &&
        this.config['modules'].stock &&
        this.transaction.type &&
        this.transaction.type.modifyStock &&
        this.transaction.type.stockMovement === StockMovement.Outflows &&
        !movementOfArticle.article.allowSaleWithoutStock) {
        await this.getArticleStock(movementOfArticle).then(
          articleStock => {
            if (!articleStock || movementOfArticle.amount > articleStock.realStock) {
              isValid = false;
              let realStock = 0;
              if(articleStock) {
                realStock = articleStock.realStock;
              }
              this.showMessage("No tiene el stock suficiente del producto " + movementOfArticle.article.description + " (" + movementOfArticle.article.code + "). Stock Actual: " + realStock, 'info', true);
            }
          }
        );
    }
    return isValid;
  }

  public getArticleStock(movementOfArticle: MovementOfArticle): Promise<ArticleStock> {

    return new Promise<ArticleStock>((resolve, reject) => {

      let query = `where= "article": "${movementOfArticle.article._id}",
                          "branch": "${this.transaction.branchDestination._id}",
                          "deposit": "${this.transaction.depositDestination._id}"`;
                          
      this._articleStockService.getArticleStocks(query).subscribe(
        result => {
          if (!result.articleStocks || result.articleStocks.length <= 0) {
            resolve(null);
          } else {
            resolve(result.articleStocks[0]);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  public recalculateCostPrice(movementOfArticle: MovementOfArticle): MovementOfArticle {

    let quotation = 1;

    if(this.transaction.quotation) {
      quotation = this.transaction.quotation;
    }

    movementOfArticle.unitPrice = this.roundNumber.transform(movementOfArticle.unitPrice + movementOfArticle.transactionDiscountAmount);

    if( movementOfArticle.article &&
        movementOfArticle.article.currency &&
        this.config['currency'] &&
        this.config['currency']._id !== movementOfArticle.article.currency._id) {
        movementOfArticle.unitPrice = this.roundNumber.transform((movementOfArticle.unitPrice / this.lastQuotation) * quotation);
    }

    movementOfArticle.transactionDiscountAmount = this.roundNumber.transform((movementOfArticle.unitPrice * movementOfArticle.transaction.discountPercent / 100), 3);
    movementOfArticle.unitPrice -= movementOfArticle.transactionDiscountAmount;
    movementOfArticle.basePrice = this.roundNumber.transform(movementOfArticle.unitPrice * movementOfArticle.amount);
    movementOfArticle.markupPrice = 0.00;
    movementOfArticle.markupPercentage = 0.00;

    let taxedAmount = movementOfArticle.basePrice;
    movementOfArticle.costPrice = 0;

    let fields: ArticleFields[] = new Array();
    if (movementOfArticle.otherFields && movementOfArticle.otherFields.length > 0) {
      for (const field of movementOfArticle.otherFields) {
        if (field.datatype === ArticleFieldType.Percentage) {
          field.amount = this.roundNumber.transform((movementOfArticle.basePrice * parseFloat(field.value) / 100));
        } else if (field.datatype === ArticleFieldType.Number) {
          field.amount = parseFloat(field.value);
        }
        if (field.articleField.modifyVAT) {
          taxedAmount += field.amount;
        } else {
          movementOfArticle.costPrice += field.amount;
        }
        fields.push(field);
      }
    }
    movementOfArticle.otherFields = fields;
    if (movementOfArticle.transaction.type.requestTaxes) {
      if (movementOfArticle.taxes && movementOfArticle.taxes.length > 0) {
        let taxes: Taxes[] = new Array();
        for (let articleTax of movementOfArticle.taxes) {
          articleTax.taxBase = taxedAmount;
          if(articleTax.percentage && articleTax.percentage !== 0) {
            articleTax.taxAmount = this.roundNumber.transform((articleTax.taxBase * articleTax.percentage / 100));
          } else {
            articleTax.taxAmount = articleTax.tax.amount * movementOfArticle.amount;
          }
          taxes.push(articleTax);
          movementOfArticle.costPrice += articleTax.taxAmount;
        }
        movementOfArticle.taxes = taxes;
      }
    }
    movementOfArticle.costPrice += this.roundNumber.transform(taxedAmount);
    movementOfArticle.salePrice = movementOfArticle.costPrice + movementOfArticle.roundingAmount;

    return movementOfArticle;
  }

  public recalculateSalePrice(movementOfArticle: MovementOfArticle): MovementOfArticle {

    let quotation = 1;

    if(this.transaction.quotation) {
      quotation = this.transaction.quotation;
    }

    if (movementOfArticle.article) {

      movementOfArticle.basePrice = this.roundNumber.transform(movementOfArticle.article.basePrice * movementOfArticle.amount);

      if(movementOfArticle.article.currency &&
        this.config['currency'] &&
        this.config['currency']._id !== movementOfArticle.article.currency._id) {
          movementOfArticle.basePrice = this.roundNumber.transform(movementOfArticle.basePrice * quotation);
      }
    }

    let fields: ArticleFields[] = new Array();
    if (movementOfArticle.otherFields && movementOfArticle.otherFields.length > 0) {
      for (const field of movementOfArticle.otherFields) {
        if (field.datatype === ArticleFieldType.Percentage) {
          field.amount = this.roundNumber.transform((movementOfArticle.basePrice * parseFloat(field.value) / 100));
        } else if (field.datatype === ArticleFieldType.Number) {
          field.amount = parseFloat(field.value);
        }
        fields.push(field);
      }
    }
    movementOfArticle.otherFields = fields;

    if (movementOfArticle.article) {
      movementOfArticle.costPrice = this.roundNumber.transform(movementOfArticle.article.costPrice * movementOfArticle.amount);
      if(movementOfArticle.article.currency &&
        this.config['currency'] &&
        this.config['currency']._id !== movementOfArticle.article.currency._id) {
          movementOfArticle.costPrice = this.roundNumber.transform(movementOfArticle.costPrice * quotation);
      }
    }

    movementOfArticle.unitPrice = this.roundNumber.transform(movementOfArticle.unitPrice + movementOfArticle.transactionDiscountAmount);
    if( movementOfArticle.article &&
        movementOfArticle.article.currency &&
        this.config['currency'] &&
        this.config['currency']._id !== movementOfArticle.article.currency._id) {
        movementOfArticle.unitPrice = this.roundNumber.transform((movementOfArticle.unitPrice / this.lastQuotation) * quotation);
    }
    movementOfArticle.transactionDiscountAmount = this.roundNumber.transform((movementOfArticle.unitPrice * movementOfArticle.transaction.discountPercent / 100), 3);
    movementOfArticle.unitPrice -= movementOfArticle.transactionDiscountAmount;
    movementOfArticle.salePrice = this.roundNumber.transform(movementOfArticle.unitPrice * movementOfArticle.amount);
    movementOfArticle.markupPrice = this.roundNumber.transform(movementOfArticle.salePrice - movementOfArticle.costPrice);
    movementOfArticle.markupPercentage = this.roundNumber.transform((movementOfArticle.markupPrice / movementOfArticle.costPrice * 100), 3);
    if (movementOfArticle.transaction.type.requestTaxes) {
      let taxes: Taxes[] = new Array();
      if (movementOfArticle.taxes) {
        for (let taxAux of movementOfArticle.taxes) {
          let tax: Taxes = new Taxes();
          tax.tax = taxAux.tax;
          tax.percentage = this.roundNumber.transform(taxAux.percentage);
          if(taxAux.percentage && taxAux.percentage !== 0) {
            tax.taxBase = (movementOfArticle.salePrice / ((tax.percentage / 100) + 1));
            tax.taxAmount = (tax.taxBase * tax.percentage / 100);
          } else {
            tax.taxAmount = taxAux.tax.amount * movementOfArticle.amount;
          }
          tax.taxBase = this.roundNumber.transform(tax.taxBase);
          tax.taxAmount = this.roundNumber.transform(tax.taxAmount);
          taxes.push(tax);
        }
      }
      movementOfArticle.taxes = taxes;
    }

    return movementOfArticle;
  }

  public getMovementOfArticleByArticle(articleId: string): MovementOfArticle {

    let movementOfArticle: MovementOfArticle;

    if (this.movementsOfArticles && this.movementsOfArticles.length > 0) {
      for (let movementOfArticleAux of this.movementsOfArticles) {
        if (movementOfArticleAux.article && movementOfArticleAux.article._id === articleId) {
          movementOfArticle = movementOfArticleAux;
        }
      }
    }

    return movementOfArticle;
  }

  public updateMovementOfArticle(movementOfArticle: MovementOfArticle) {

    return new Promise<boolean>( async (resolve, reject) => {

      movementOfArticle.basePrice = this.roundNumber.transform(movementOfArticle.basePrice);
      movementOfArticle.costPrice = this.roundNumber.transform(movementOfArticle.costPrice);
      movementOfArticle.salePrice = this.roundNumber.transform(movementOfArticle.salePrice);

      this._movementOfArticleService.updateMovementOfArticle(movementOfArticle).subscribe(
        result => {
          if (!result.movementOfArticle) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            this.containerMovementsOfArticles.nativeElement.scrollTop = this.containerMovementsOfArticles.nativeElement.scrollHeight;
            resolve(result.movementOfArticle);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  async addTransactionTaxes(taxes: Taxes[]) {
    this.transaction.taxes = taxes;
    this.updatePrices();
  }

  async updatePrices(discountPercent?: number) {

    let totalPriceAux = 0;
    let discountAmountAux = 0;

    if (discountPercent !== undefined) {
      this.transaction.discountPercent = this.roundNumber.transform(discountPercent, 3);
    } else if (!this.transaction.discountPercent) {
      this.transaction.discountPercent = 0;
      discountAmountAux = 0;
    }

    let isUpdateValid: boolean = true;

    if (this.movementsOfArticles && this.movementsOfArticles.length > 0) {
      for (let movementOfArticle of this.movementsOfArticles) {
        movementOfArticle.transaction.discountPercent = this.transaction.discountPercent;
        if (this.transaction.type.transactionMovement === TransactionMovement.Sale) {
          movementOfArticle = this.recalculateSalePrice(movementOfArticle);
        } else {
          movementOfArticle = this.recalculateCostPrice(movementOfArticle);
        }
        totalPriceAux += this.roundNumber.transform(movementOfArticle.salePrice);
        discountAmountAux += this.roundNumber.transform(movementOfArticle.transactionDiscountAmount * movementOfArticle.amount);
        let result = await this.updateMovementOfArticle(movementOfArticle);
        if(!result) {
          isUpdateValid = false;
          break;
        }
      }
    } else {
      isUpdateValid = true;
      totalPriceAux = 0;
      this.transaction.discountPercent = 0;
      discountAmountAux = 0;
    }

    if(isUpdateValid) {
      this.transaction.totalPrice = totalPriceAux;
      this.transaction.discountAmount = discountAmountAux;
      if (this.transaction.type.requestTaxes) {
        await this.updateTaxes();
      } else {
        this.transaction.exempt = this.transaction.totalPrice;
        await this.updateTransaction().then(
          transaction => {
            if(transaction) {
              this.transaction = transaction;
              this.lastQuotation = this.transaction.quotation;
            }
          }
        );
      }
    }
  }

  async updateTaxes() {

    let oldTaxes: Taxes[] = this.transaction.taxes;
    let totalPriceAux = 0;
    
    let transactionTaxes: Taxes[] = new Array();
    let transactionTaxesAUX: Taxes[] = new Array();

    this.transaction.exempt = 0;
    this.totalTaxesAmount = 0;
    this.transaction.basePrice = 0;
    if (this.movementsOfArticles) {
      for (let movementOfArticle of this.movementsOfArticles) {
        if (movementOfArticle.taxes && movementOfArticle.taxes.length !== 0) {
          for (let taxesAux of movementOfArticle.taxes) {
            let transactionTax: Taxes = new Taxes();
            if (this.transaction.type.transactionMovement === TransactionMovement.Sale) {
              transactionTax.percentage = taxesAux.percentage;
              transactionTax.tax = taxesAux.tax;
              transactionTax.taxBase = taxesAux.taxBase;
              transactionTax.taxAmount = taxesAux.taxAmount;
            } else {
              transactionTax = taxesAux;
            }
            transactionTaxesAUX.push(transactionTax);
            this.transaction.basePrice += transactionTax.taxBase;
          }
        } else {
          this.transaction.exempt += movementOfArticle.salePrice;
        }
        totalPriceAux += movementOfArticle.salePrice;
      }
    }
    
    if (transactionTaxesAUX) {
      for (let transactionTaxAux of transactionTaxesAUX) {
        let exists: boolean = false;
        for (let transactionTax of transactionTaxes) {
          if (transactionTaxAux.tax._id.toString() === transactionTax.tax._id.toString()) {
            transactionTax.taxAmount += transactionTaxAux.taxAmount;
            transactionTax.taxBase += transactionTaxAux.taxBase;
            exists = true;
          }
        }
        this.totalTaxesAmount += transactionTaxAux.taxAmount;
        if (!exists) {
          transactionTaxes.push(transactionTaxAux);
        }
      }
    }

    this.transaction.taxes = transactionTaxes;
    
    if(oldTaxes && oldTaxes.length > 0) {
      for(let oldTax of oldTaxes) {
        if(oldTax.tax.classification !== TaxClassification.Tax) {
          this.transaction.taxes.push(oldTax);
          this.totalTaxesAmount += oldTax.taxAmount;
          // SUMAMOS AL TOTAL DE LA TRANSACCION LOS IMPUESTOS CARGADOS MANUALMENTE COMO PERCEPCIONES Y RETENCIONES
          totalPriceAux += oldTax.taxAmount;
        }
      }
    }

    this.transaction.totalPrice = this.roundNumber.transform(totalPriceAux);
    
    await this.updateTransaction().then(
      transaction => {
        if(transaction) {
          this.transaction = transaction;
          this.lastQuotation = this.transaction.quotation;
        }
      }
    );
  }

  public validateElectronicTransactionAR(): void {

    this.showMessage("Validando comprobante con AFIP...", 'info', false);

    this._transactionService.validateElectronicTransactionAR(this.transaction).subscribe(
      result => {
        let msn = '';
        if(result) {
          if (result.status === 'err') {
            if (result.code && result.code !== '') {
              msn += result.code + " - ";
            }
            if (result.message && result.message !== '') {
              msn += result.message + ". ";
            }
            if (result.observationMessage && result.observationMessage !== '') {
              msn += result.observationMessage + ". ";
            }
            if (result.observationMessage2 && result.observationMessage2 !== '') {
              msn += result.observationMessage2 + ". ";
            }
            if (msn === '') {
              msn = "Ha ocurrido un error al intentar validar la factura. Comuníquese con Soporte Técnico.";
            }
            this.showMessage(msn, 'info', true);
            let body = 'transaction=' + JSON.stringify(this.transaction) + '&' + 'config=' + '{"companyIdentificationValue":"' + this.config['companyIdentificationValue'] + '","vatCondition":' + this.config['companyVatCondition'].code + ',"database":"' + this.config['database'] + '"}';
            this.saveClaim('ERROR FE :' + msn, body);
          } else {
            this.transaction.number = result.number;
            this.transaction.CAE = result.CAE;
            this.transaction.CAEExpirationDate = moment(result.CAEExpirationDate, 'DD/MM/YYYY HH:mm:ss').format("YYYY-MM-DDTHH:mm:ssZ");
            this.transaction.state = TransactionState.Closed;
            this.finish();
          }
        } else {
          if (msn === '') {
            msn = "Ha ocurrido un error al intentar validar la factura. Comuníquese con Soporte Técnico.";
          }
          this.showMessage(msn, 'info', true);
        }
        this.loading = false;
      },
      error => {
        this.showMessage("Ha ocurrido un error en el servidor. Comuníquese con Soporte.", 'danger', false);
        this.loading = false;
      }
    )
  }
  
  public saveClaim(titulo: string, message: string): void {
    
    this.loading = true;

    let claim: Claim = new Claim();
    claim.description = message;
    claim.name = titulo;
    claim.priority = ClaimPriority.High;
    claim.type = ClaimType.Err;
    claim.listName = 'ERRORES 500';

    this._claimService.saveClaim(claim).subscribe();
  }

  public validateElectronicTransactionMX(): void {

    this.showMessage("Validando comprobante con SAT...", 'info', false);

    this._transactionService.validateElectronicTransactionMX(this.transaction, this.movementsOfArticles, this.movementsOfCashes).subscribe(
      result => {
        if (result.status === 'err') {
          let msn = '';
          if (result.code && result.code !== '') {
            msn += "ERROR " + result.code + ": ";
          }
          if (result.message && result.message !== '') {
            msn += result.message + ". ";
          }
          if (msn === '') {
            msn = "Ha ocurrido un error al intentar validar la factura. Comuníquese con Soporte Técnico.";
          }
          this.showMessage(msn, 'info', true);

          let body ='transaction=' + JSON.stringify(this.transaction) + '&' +
                    'movementsOfArticles=' + JSON.stringify(this.movementsOfArticles) + '&' +
                    'movementsOfCashes=' + JSON.stringify(this.movementsOfCashes) + '&' +
                    'config=' + '{"companyIdentificationValue":"' + this.config['companyIdentificationValue'] + '","vatCondition":' + this.config['companyVatCondition'].code + ',"companyName":"' + this.config['companyName'] + '","companyPostalCode":"' + this.config['companyPostalCode'] + '","database":"' + this.config['database'] + '"}';
      
          this.saveClaim('ERROR FE :' + msn, body);
        } else {
          this.transaction.state = TransactionState.Closed;
          this.transaction.stringSAT = result.stringSAT;
          this.transaction.CFDStamp = result.CFDStamp;
          this.transaction.SATStamp = result.SATStamp;
          this.transaction.endDate = result.endDate;
          this.transaction.UUID = result.UUID;
          this.finish();
        }
        this.loading = false;
      },
      error => {
        this.showMessage("Ha ocurrido un error en el servidor. Comuníquese con Soporte.", 'danger', false);
        this.loading = false;
      }
    )
  }

  async openModal(op: string, movementOfArticle?: MovementOfArticle, fastPayment?: PaymentMethod) {

    this.fastPayment = fastPayment;

    let modalRef;

    switch (op) {
      case 'list-cancellations':
        modalRef = this._modalService.open(MovementOfCancellationComponent, { size: 'lg' });
        modalRef.componentInstance.transactionDestinationId = this.transaction._id;
        modalRef.result.then(async (result) => {
          if(result.movementsOfCancellations && result.movementsOfCancellations.length > 0) {
            this.showButtonCancelation = false;

            await this.daleteMovementsOfCancellations('{"transactionDestination":"'+this.transaction._id+'"}').then(
              async movementsOfCancellations => {
                if(movementsOfCancellations) {
                  await this.saveMovementsOfCancellations(result.movementsOfCancellations).then(
                    movementsOfCancellations => {
                      if(movementsOfCancellations) {
                        this.getMovementsOfTransaction();
                      }
                    }
                  );
                }
              }
            );
          }
        }, (reason) => {
        });
        break;
      case 'movement_of_article':
        movementOfArticle.transaction = this.transaction;
        movementOfArticle.modifyStock = this.transaction.type.modifyStock;
        if(this.transaction.type.stockMovement) {
          movementOfArticle.stockMovement = this.transaction.type.stockMovement.toString();
        }
        modalRef = this._modalService.open(AddMovementOfArticleComponent, { size: 'lg' });
        modalRef.componentInstance.movementOfArticle = movementOfArticle;
        modalRef.result.then((result) => {
          this.getMovementsOfTransaction();
        }, (reason) => {
          this.getMovementsOfTransaction();
        });
        break;
      case 'apply_discount':
        if (this.movementsOfArticles && this.movementsOfArticles.length > 0) {
          modalRef = this._modalService.open(ApplyDiscountComponent, { size: 'lg' });
          modalRef.componentInstance.amount = this.transaction.totalPrice;
          modalRef.componentInstance.amountToApply = this.transaction.discountAmount;
          modalRef.componentInstance.percentageToApply = this.transaction.discountPercent;
          modalRef.result.then((result) => {
            if (result.discount) {
              this.updatePrices(
                result.discount.percentageToApply
              );
            }
          }, (reason) => {
          });
        } else {
          this.showMessage("No se ingresaron productos a la transacción.", 'info', true);
        }
        break;
      case 'cancel':
        modalRef = this._modalService.open(DeleteTransactionComponent, { size: 'lg' });
        modalRef.componentInstance.transactionId = this.transaction._id;
        modalRef.result.then(async (result) => {
          if (result === 'delete_close') {
            if (this.posType === "resto") {
              this.transaction.table.employee = null;
              this.transaction.table.state = TableState.Available;
              await this.updateTable().then(table => {
                if(table) {
                  this.transaction.table = table;
                  this.backFinal();
                }
              });
            } else {
              this.backFinal();
            }
          }
        }, (reason) => {

        });
        break;
      case 'add_client':

        modalRef = this._modalService.open(ListCompaniesComponent, { size: 'lg' });
        if (this.transaction.type.transactionMovement === TransactionMovement.Purchase) {
          modalRef.componentInstance.type = CompanyType.Provider;
        } else if (this.transaction.type.transactionMovement === TransactionMovement.Sale) {
          modalRef.componentInstance.type = CompanyType.Client;
        }
        modalRef.result.then(async (result) => {
          if (result.company) {
            this.transaction.company = result.company;
            if(this.transaction.company.transport){
              this.transaction.transport = this.transaction.company.transport;
            } else {
              this.transaction.transport = null;
            }
            await this.updateTransaction().then(
              transaction => {
                if(transaction) {
                  this.transaction = transaction;
                }
              }
            );
          }
        }, (reason) => {

        });
        break;
      case 'charge':

        this.typeOfOperationToPrint = "charge";

        if (await this.isValidCharge() &&
            await this.areValidMovementOfArticle()) {

          if (this.transaction.type.requestPaymentMethods ||
             fastPayment) {

            modalRef = this._modalService.open(AddMovementOfCashComponent, { size: 'lg' });
            modalRef.componentInstance.transaction = this.transaction;
            if (fastPayment) {
              modalRef.componentInstance.fastPayment = fastPayment;
            }
            modalRef.result.then((result) => {
              this.movementsOfCashes = result.movementsOfCashes;

              if (this.movementsOfCashes) {
                if (result.movementOfArticle) {
                  this.movementsOfArticles.push(result.movementOfArticle);
                }

                if (this.transaction.type.transactionMovement === TransactionMovement.Sale) {
                  if (this.transaction.type.fixedOrigin && this.transaction.type.fixedOrigin !== 0) {
                    this.transaction.origin = this.transaction.type.fixedOrigin;
                  }

                  this.assignLetter();
                  if (this.transaction.type.electronics) {
                    if(this.config['country'] === 'MX') {
                      if(!this.transaction.CFDStamp &&
                        !this.transaction.SATStamp &&
                        !this.transaction.stringSAT) {
                        this.validateElectronicTransactionMX();
                      } else {
                        this.finish(); //SE FINALIZA POR ERROR EN LA FE
                      }
                    } else if (this.config['country'] === 'AR') {
                      if(!this.transaction.CAE) {
                        this.validateElectronicTransactionAR();
                      } else {
                        this.finish(); //SE FINALIZA POR ERROR EN LA FE
                      }
                    } else {
                      this.showMessage("Facturación electrónica no esta habilitada para tu país.", "info", true);
                    }
                  } else if (this.transaction.type.electronics && this.transaction.CAE) {
                    this.finish(); //SE FINALIZA POR ERROR EN LA FE
                  } else {
                    if (this.transaction.type.fixedLetter !== this.transaction.letter) {
                      this.assignTransactionNumber();
                    } else {
                      this.finish();
                    }
                  }
                } else {
                  this.finish();
                }
              }
            }, (reason) => {
            });
          } else {
            if (this.transaction.type.transactionMovement === TransactionMovement.Sale) {
              this.assignLetter();
              if (this.transaction.type.electronics && !this.transaction.CAE) {
                this.validateElectronicTransactionAR();
              } else if (this.transaction.type.electronics && this.transaction.CAE) {
                this.finish(); //SE FINALIZA POR ERROR EN LA FE
              } else {
                if (this.transaction.type.fixedLetter !== this.transaction.letter) {
                      this.assignTransactionNumber();
                    } else {
                      this.finish();
                    }
              }
            } else {
              this.finish();
            }
          }
        }
        break;
      case 'printers':

        await this.getPrinters().then(
          printers => {
            if(printers) {
              this.printers = printers;
            }
          }
        );

        if (this.countPrinters() > 1) {
          modalRef = this._modalService.open(this.contentPrinters, { size: 'lg' }).result.then((result) => {
            if (result !== "cancel" && result !== '') {
              this.distributeImpressions(result);
            }
          }, (reason) => {

          });
        } else if (this.countPrinters() === 1) {
          this.distributeImpressions(this.printersAux[0]);
        } else {
          this.backFinal();
        }
        break;
      case 'errorMessage':
        modalRef = this._modalService.open(this.contentMessage, { size: 'lg' }).result.then((result) => {
          if (result !== "cancel" && result !== '') {
            this.backFinal();
          }
        }, (reason) => {
        });
        break;
      case 'change-date':
        modalRef = this._modalService.open(this.contentChangeDate).result.then(async (result) => {
          if (result !== "cancel" && result !== '') {
            if(this.transaction.endDate && moment(this.transaction.endDate, 'YYYY-MM-DD').isValid()) {
              this.transaction.endDate = moment(this.transaction.endDate, 'YYYY-MM-DD').format('YYYY-MM-DDTHH:mm:ssZ');
              this.transaction.VATPeriod = moment(this.transaction.endDate, 'YYYY-MM-DDTHH:mm:ssZ').format('YYYYMM');
              this.transaction.expirationDate = this.transaction.endDate;
              await this.updateTransaction().then(
                transaction => {
                  if(transaction) {
                    this.transaction = transaction;
                  }
                }
              );
            }
          }
        }, (reason) => {
        });
        break;
      case 'change-quotation':
        modalRef = this._modalService.open(this.contentChangeQuotation).result.then(async (result) => {
          if (result !== "cancel" && result !== '') {
            this.updatePrices();
          } else {
            this.transaction.quotation = this.lastQuotation;
          }
        }, (reason) => {
          this.transaction.quotation = this.lastQuotation;
        });
        break;
      case 'change-taxes':
        modalRef = this._modalService.open(this.containerTaxes, { size: 'lg' }).result.then(async (result) => {
        }, (reason) => {
        });
        break;
      case 'change-employee':
        modalRef = this._modalService.open(SelectEmployeeComponent);
        modalRef.componentInstance.requireLogin = false;
        modalRef.componentInstance.typeEmployee = this.transaction.type.requestEmployee;
        modalRef.componentInstance.op = "change-employee";
        modalRef.result.then(async (result) => {
          if (result) {
            if(result.turn) {
              this.transaction.turnClosing = result.turn;
            }
            if(result.employee) {
              this.transaction.employeeClosing = result.employee;
            }
            await this.updateTransaction().then(
              async transaction => {
                if(transaction) {
                  this.transaction = transaction;
                  if(this.transaction.table) {
                    this.transaction.table.employee = result.employee;
                    await this.updateTable().then(
                      table => {
                        if(table) {
                          this.transaction.table = table;
                        }
                      }
                    );
                  }
                }
              }
            );
          }
        }, (reason) => {

        });
        break;
      case 'print':
        modalRef = this._modalService.open(PrintComponent);
        modalRef.componentInstance.transactionId = this.transaction._id;
        modalRef.componentInstance.company = this.transaction.company;
        modalRef.componentInstance.printer = this.printerSelected;
        modalRef.componentInstance.typePrint = 'invoice';
        modalRef.result.then((result) => {
        }, (reason) => {
          this.backFinal();
        });
        break;
      case 'printKitchen':
        modalRef = this._modalService.open(PrintComponent);
        modalRef.componentInstance.transactionId = this.transaction._id;
        modalRef.componentInstance.movementsOfArticles = this.kitchenArticlesToPrint;
        modalRef.componentInstance.printer = this.printerSelected;
        modalRef.componentInstance.typePrint = 'kitchen';

        modalRef.result.then((result) => {
        }, (reason) => {
          this.updateMovementOfArticlePrinted();
        });
        break;
      case 'import':
        modalRef = this._modalService.open(ImportComponent, { size: 'lg' });
        modalRef.componentInstance.transaction = this.transaction._id;
        let model: any = new MovementOfArticle();
        model.model = "movement-of-article";
        model.relations = new Array();
        model.relations.push("article_relation_code");

        modalRef.componentInstance.model = model;
        modalRef.result.then((result) => {
          this.getMovementsOfTransaction();
        }, (reason) => {
          this.getMovementsOfTransaction();
        });
        break;
      case 'change-transport':
        modalRef = this._modalService.open(SelectTransportComponent);
        modalRef.result.then((result) => {
          if(result && result.transport){
            this.transaction.transport = result.transport
            this.updateTransaction();
          }
        }, (reason) => {
          this.updateTransaction()
        });
        break;
      default: ;
    };
  }

  async isValidCharge(): Promise<boolean> {

    let isValid = true;

    if (this.movementsOfArticles && this.movementsOfArticles.length <= 0) {
      isValid = false;
      this.showMessage("No existen productos en la transacción.", 'info', true);
    } else {
      if(await !this.areValidMovementOfArticle()) {
        isValid = false;
      }
    }

    if(this.transaction.type.requestPaymentMethods && 
      this.fastPayment &&
      this.fastPayment.isCurrentAccount && 
      !this.transaction.company){
      isValid = false;
      this.showMessage("Debe seleccionar una empresa para poder efectuarse un pago con el método " + this.fastPayment.name + ".", "info", true);
    }

    if( this.transaction.type.requestPaymentMethods && 
        this.fastPayment &&
        this.fastPayment.isCurrentAccount && 
        this.transaction.company && 
        !this.transaction.company.allowCurrentAccount){
      isValid = false;
      this.showMessage("La empresa seleccionada no esta habilitada para cobrar con el método " + this.fastPayment.name + ".", "info", true);
    }

    if (isValid &&
      this.transaction.type.transactionMovement === TransactionMovement.Purchase &&
      !this.transaction.company) {
      isValid = false;
      this.showMessage("Debe seleccionar un proveedor para la transacción.", 'info', true);
    }

    if (isValid &&
      this.transaction.type.electronics &&
      this.transaction.totalPrice > 5000 &&
      !this.transaction.company &&
      this.config['country'] === 'AR') {
      isValid = false;
      this.showMessage("Debe indentificar al cliente para transacciones electrónicos con monto mayor a $5.000,00.", 'info', true);
    }

    if (isValid &&
        this.transaction.type.electronics &&
        this.transaction.company && (
        !this.transaction.company.identificationType ||
        !this.transaction.company.identificationValue ||
        this.transaction.company.identificationValue === '')
      ) {
      isValid = false;
      this.showMessage("El cliente ingresado no tiene nro de identificación", 'info', true);
      this.loading = false;
    }

    if (isValid &&
      this.transaction.type.fixedOrigin &&
      this.transaction.type.fixedOrigin === 0 &&
      this.transaction.type.electronics &&
      this.config['country'] === 'MX') {
      isValid = false;
      this.showMessage("Debe configurar un punto de venta para transacciones electrónicos. Lo puede hacer en /Configuración/Tipos de Transacción.", 'info', true);
      this.loading = false;
    }

    return isValid;
  }

  public getPrinters(): Promise<Printer[]> {

    return new Promise<Printer[]>( async (resolve, reject) => {

      this._printerService.getPrinters().subscribe(
        result => {
          if (!result.printers) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.printers);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  async areValidMovementOfArticle(): Promise<boolean> {

    return new Promise<boolean>( async (resolve, reject) => {

      let areValid: boolean = true;

      for(let movementOfArticle of this.movementsOfArticles) {
        if(await this.isValidMovementOfArticle(movementOfArticle)) {
        } else {
          areValid = false;
        }
      }

      resolve(areValid);
    });
  }

  async finish() {

    let isValid: boolean = true;

    if (isValid &&
        this.config['modules'].stock &&
        this.transaction.type.modifyStock) {

          if(await this.areValidMovementOfArticle()) {
            isValid = await this.processStock();
          } else {
            isValid = false;
          }
    }

    if(isValid) {
      await this.updateBalance().then(async balance => {
        if(balance !== null) {
          this.transaction.balance = balance;
          if (!this.transaction.endDate) {
            this.transaction.endDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
          }
          if (this.transaction.type.transactionMovement !== TransactionMovement.Purchase || !this.transaction.VATPeriod) {
            this.transaction.VATPeriod = moment(this.transaction.endDate, 'YYYY-MM-DDTHH:mm:ssZ').format('YYYYMM');
          }
          this.transaction.expirationDate = this.transaction.endDate;
          this.transaction.state = TransactionState.Closed;

          await this.updateTransaction().then(
            async transaction => {
              if(transaction) {
                this.transaction = transaction;

                if (this.transaction && this.transaction.type.printable) {

                  if (this.transaction.table) {
                    this.transaction.table.employee = null;
                    this.transaction.table.state = TableState.Available;
                    await this.updateTable().then(
                      table => {
                        if(table) {
                          this.transaction.table = table;
                        }
                      }
                    );
                  }

                  await this.getPrinters().then(
                    printers => {
                      if(printers) {
                        this.printers = printers;
                      }
                    }
                  );

                  if (this.transaction.type.defectPrinter) {
                    this.printerSelected = this.transaction.type.defectPrinter;
                    this.distributeImpressions(this.transaction.type.defectPrinter);
                  } else {
                    this.openModal('printers');
                  }
                } else {
                  if (this.posType === "resto") {
                    this.transaction.table.employee = null;
                    this.transaction.table.state = TableState.Available;
                    await this.updateTable().then(table => {
                      if(table) {
                        this.transaction.table = table;
                        this.backFinal();
                      }
                    });
                  } else {
                    this.backFinal();
                  }
                }
              }
          });
        }
      });
    }
  }

  public updateBalance(): Promise<number> {

    return new Promise<number>((resolve, reject) => {
      this._transactionService.updateBalance(this.transaction).subscribe(
        async result => {
          if (!result.transaction) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.transaction.balance);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          reject(null);
        }
      )
    });
  }

  async processStock(): Promise<boolean> {

    let endProcess: boolean = true;

    if (this.movementsOfArticles && this.movementsOfArticles.length > 0) {

      for(let movementOfArticle of this.movementsOfArticles) {
        if(movementOfArticle.article) {
          await this.updateRealStock(movementOfArticle).then(
            articleStock => {
              if(!articleStock) {
                endProcess = false;
              }
            }
          );
        }
      }
    } else {
      this.showMessage("No se encuentran productos en la transacción", 'info', true);
    }

    return endProcess;
  }

  public updateRealStock(movementOfArticle: MovementOfArticle): Promise<boolean> {

    return new Promise<boolean>((resolve, reject) => {

      let amountToModify;

      if (this.transaction.type.stockMovement === StockMovement.Inflows || this.transaction.type.stockMovement === StockMovement.Inventory) {
        amountToModify = movementOfArticle.amount;
      } else {
        amountToModify = this.roundNumber.transform(movementOfArticle.amount * -1);
      }

      this._articleStockService.updateRealStock(
        movementOfArticle.article,
        this.transaction.branchDestination,
        this.transaction.depositDestination,
        amountToModify, 
        this.transaction.type.stockMovement.toString()
      ).subscribe(
        result => {
          this.loading = false;
          if (!result.articleStock) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.articleStock);
          }
        },
        error => {
          this.loading = false;
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  async close() {

    this.typeOfOperationToPrint = 'item';

    if (this.movementsOfArticles && this.movementsOfArticles.length > 0) {
      for (let movementOfArticle of this.movementsOfArticles) {
        if (movementOfArticle.article && movementOfArticle.article.printIn === ArticlePrintIn.Bar && movementOfArticle.printed < movementOfArticle.amount) {
          this.barArticlesToPrint.push(movementOfArticle);
        }
        if (movementOfArticle.article && movementOfArticle.article.printIn === ArticlePrintIn.Kitchen && movementOfArticle.printed < movementOfArticle.amount) {
          this.kitchenArticlesToPrint.push(movementOfArticle);
        }
      }
    }

    if (this.barArticlesToPrint && this.barArticlesToPrint.length !== 0) {
      this.typeOfOperationToPrint = "bar";
      this.openModal('printers');
    } else if (this.kitchenArticlesToPrint && this.kitchenArticlesToPrint.length !== 0) {
      this.typeOfOperationToPrint = "kitchen";
      this.openModal('printers');
    } else if (this.posType === "resto") {
      this.transaction.table.state = TableState.Busy;
      await this.updateTable().then(table => {
        if(table) {
          this.transaction.table = table;
          this.backFinal();
        }
      });
    } else {
      this.backFinal();
    }
  }

  public backFinal(): void {

    if (this.posType === "resto") {
      if(this.transaction.table.room && this.transaction.table.room._id) {
        this._router.navigate(['/pos/resto/salones/' + this.transaction.table.room._id + '/mesas']);
      } else {
        this._router.navigate(['/pos/resto/salones/' + this.transaction.table.room + '/mesas']);
      }
    } else if (this.posType === "mostrador") {
      if (this.transaction.type && this.transaction.type.transactionMovement === TransactionMovement.Purchase) {
        this._router.navigate(['/pos/' + this.posType + '/compra']);
      } else if (this.transaction.type && this.transaction.type.transactionMovement === TransactionMovement.Sale) {
        this._router.navigate(['/pos/' + this.posType + '/venta']);
      } else if (this.transaction.type && this.transaction.type.transactionMovement === TransactionMovement.Stock) {
        this._router.navigate(['/pos/' + this.posType + '/stock']);
      } else {
        this._router.navigate(['/pos/' + this.posType]);
      }
    } else {
      this._router.navigate(['/pos/' + this.posType]);
    }
  }

  async getTaxVAT(movementOfArticle: MovementOfArticle) {

    this.loading = true;

    let taxes: Taxes[] = new Array();
    let tax: Taxes = new Taxes();
    tax.percentage = 21.00;
    tax.taxBase = this.roundNumber.transform((movementOfArticle.salePrice / ((tax.percentage / 100) + 1)));
    tax.taxAmount = this.roundNumber.transform((tax.taxBase * tax.percentage / 100));

    this._taxService.getTaxes('where="name":"IVA"').subscribe(
      async result => {
        if (!result.taxes) {
          this.loading = false;
          this.showMessage("Debe configurar el impuesto IVA para el realizar el recargo de la tarjeta", 'info', true);
        } else {
          this.hideMessage();
          tax.tax = result.taxes[0];
          taxes.push(tax);
          movementOfArticle.taxes = taxes;
          await this.saveMovementOfArticle(movementOfArticle).then(
            movementOfArticle => {
              if(movementOfArticle) {
                this.getMovementsOfTransaction();
              }
            }
          );
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public updateMovementOfArticlePrinted(): void {

    this.loading = true;

    this.kitchenArticlesToPrint[this.kitchenArticlesPrinted].printed = this.kitchenArticlesToPrint[this.kitchenArticlesPrinted].amount;

    this._movementOfArticleService.updateMovementOfArticle(this.kitchenArticlesToPrint[this.kitchenArticlesPrinted]).subscribe(
      async result => {
        if (!result.movementOfArticle) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.kitchenArticlesPrinted++;
          if (this.kitchenArticlesPrinted < this.kitchenArticlesToPrint.length) {
            this.updateMovementOfArticlePrinted();
          } else {
            if (this.posType === "resto") {
              this.transaction.table.state = TableState.Busy;
              await this.updateTable().then(table => {
                if(table) {
                  this.transaction.table = table;
                  this.backFinal();
                }
              });
            } else {
              this.backFinal();
            }
          }
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public countPrinters(): number {

    let numberOfPrinters: number = 0;
    this.printersAux = new Array();

    if (this.printers != undefined) {
      for (let printer of this.printers) {
        if (this.typeOfOperationToPrint === 'charge' && printer.printIn === PrinterPrintIn.Counter) {
          this.printersAux.push(printer);
          numberOfPrinters++;
        } else if (this.typeOfOperationToPrint === 'bill' && printer.printIn === PrinterPrintIn.Counter) {
          this.printersAux.push(printer);
          numberOfPrinters++;
        } else if (this.typeOfOperationToPrint === 'bar' && printer.printIn === PrinterPrintIn.Bar) {
          this.printersAux.push(printer);
          numberOfPrinters++;
        } else if (this.typeOfOperationToPrint === 'kitchen' && printer.printIn === PrinterPrintIn.Kitchen) {
          this.printersAux.push(printer);
          numberOfPrinters++;
        }
      }
    } else {
      numberOfPrinters = 0;
    }

    return numberOfPrinters;
  }

  public distributeImpressions(printer: Printer) {

    this.printerSelected = printer;

    switch (this.typeOfOperationToPrint) {
      case 'charge':
        if (printer.type === PrinterType.PDF) {
          this.openModal("print");
        }
        break;
      case 'kitchen':
        if (printer.type === PrinterType.PDF) {
          this.openModal("printKitchen");
        }
        break;
      case 'bar':
        if (printer.type === PrinterType.PDF) {
          this.openModal("print");
        }
        break;
      default:
        this.showMessage("No se reconoce la operación de impresión.", 'danger', false);
        break;
    }
  }

  public assignLetter() {

    if (this.transaction.type.fixedLetter && this.transaction.type.fixedLetter !== '') {
      this.transaction.letter = this.transaction.type.fixedLetter.toUpperCase();
    } else {
      if(this.config['country'] === 'AR') {
        if (this.config['companyVatCondition'] && this.config['companyVatCondition'].description === "Responsable Inscripto") {
          if (this.transaction.company &&
            this.transaction.company.vatCondition) {
            this.transaction.letter = this.transaction.company.vatCondition.transactionLetter;
          } else {
            this.transaction.letter = "B";
          }
        } else if (this.config['companyVatCondition'] && this.config['companyVatCondition'].description === "Monotributista") {
          this.transaction.letter = "C";
        } else {
          this.transaction.letter = "X";
        }
      }
    }

    this.loading = true;
  }

  public getTransports(): void {
    this.loading = true;

    // ORDENAMOS LA CONSULTA
    let sortAux = { name: 1 };
    
    // FILTRAMOS LA CONSULTA
    let match = { operationType: { $ne: "D" } };
    
    // CAMPOS A TRAER
    let project = {
      name: 1,
      operationType: 1
    };

    // AGRUPAMOS EL RESULTADO
    let group = {};

    let limit = 0;

    let skip = 0;

    this._transportService.getTransports(
      project, // PROJECT
      match, // MATCH
      sortAux, // SORT
      group, // GROUP
      limit, // LIMIT
      skip // SKIP
    ).subscribe(result => {
      if (result && result.transports && result.transports.length > 0) {
        this.transports = result.transports;
      }
      this.loading = false;
    },
    error => {
      this.showMessage(error._body, 'danger', false);
      this.loading = false;
    });
  }

  public assignTransactionNumber() {

    let query = 'where="type":"' + this.transaction.type._id + '","origin":"' + this.transaction.origin + '","letter":"' + this.transaction.letter + '"&sort="number":-1&limit=1';

    this._transactionService.getTransactions(query).subscribe(
      result => {
        if (!result.transactions) {
          this.transaction.number = 1;
        } else {
          this.transaction.number = result.transactions[0].number + 1;
        }
        this.finish();
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public setPrintBill(): void {
    if (this.movementsOfArticles && this.movementsOfArticles.length !== 0) {
      this.typeOfOperationToPrint = 'bill';
      this.openModal('printers');
    } else {
      this.showMessage("No existen productos en el pedido.", 'info', true);
      this.loading = false;
    }
  }

  public filterArticles(): void {

    this.listArticlesComponent.filterArticle = this.filterArticle;
    this.listArticlesComponent.filterItem(this.categorySelected);
    if(!this.filterArticle || this.filterArticle === '') {
      this.showCategories();
    }
  }

  public showCategories(): void {

    this.categorySelected = null;
    this.filterArticle = '';
    this.listCategoriesComponent.areCategoriesVisible = true;
    this.listArticlesComponent.areArticlesVisible = false;
    this.listArticlesComponent.filterArticle = this.filterArticle;
    this.focusEvent.emit(true);
  }

  public showArticles(category?: Category): void {

    if(category) {
      this.categorySelected = category;
      this.listArticlesComponent.filterItem(this.categorySelected);
      this.listArticlesComponent.hideMessage();
    }
    this.listCategoriesComponent.areCategoriesVisible = false;
    this.listArticlesComponent.areArticlesVisible = true;
    this.focusEvent.emit(true);
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }
}
