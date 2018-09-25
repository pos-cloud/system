//Angular
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

//Terceros
import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

//Models
import { MovementOfArticle } from '../../models/movement-of-article';
import { Article } from '../../models/article';
import { Variant } from '../../models/variant';
import { VariantValue } from '../../models/variant-value';
import { VariantType } from '../../models/variant-type';
import { ArticleStock } from '../../models/article-stock';
import { Config } from './../../app.config';

//Services
import { MovementOfArticleService } from '../../services/movement-of-article.service';
import { VariantService } from '../../services/variant.service';
import { ArticleStockService } from '../../services/article-stock.service';

//Pipes
import { RoundNumberPipe } from '../../pipes/round-number.pipe';
import { TransactionMovement } from '../../models/transaction-type';
import { Taxes } from '../../models/taxes';
import { ArticleFieldType } from '../../models/article-field';
import { ArticleFields } from '../../models/article-fields';

@Component({
  selector: 'app-add-movement-of-article',
  templateUrl: './add-movement-of-article.component.html',
  styleUrls: ['./add-movement-of-article.component.css'],
  providers: [NgbAlertConfig]
})

export class AddMovementOfArticleComponent implements OnInit {

  @Input() movementOfArticle: MovementOfArticle;
  public containsVariants: Boolean;
  public articleStock: ArticleStock;
  public variants: Variant[];
  public variantTypes: VariantType[];
  public selectedVariants;
  public areVariantsEmpty: boolean = true;
  public movementOfArticleForm: FormGroup;
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public roundNumber: RoundNumberPipe;
  public errVariant: string;
  public config: Config;
  public unitPrice;

  public formErrors = {
    'description': '',
    'amount': '',
    'unitPrice': ''
  };

  public validationMessages = {
    'description': {
      'required': 'Este campo es requerido.'
    },
    'amount': {
      'required': 'Este campo es requerido.'
    },
    'unitPrice': {
      'required': 'Este campo es requerido.'
    }
  };

  constructor(
    public _movementOfArticleService: MovementOfArticleService,
    public _articleStockService: ArticleStockService,
    public _variantService: VariantService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) {
    this.roundNumber = new RoundNumberPipe();
    this.selectedVariants = {};
  }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.containsVariants = this.movementOfArticle.article.containsVariants;
    if(this.movementOfArticle.transaction.type.transactionMovement === TransactionMovement.Sale) {
      this.unitPrice = this.roundNumber.transform(this.movementOfArticle.salePrice / this.movementOfArticle.amount);
    } else {
      this.unitPrice = this.roundNumber.transform(this.movementOfArticle.basePrice / this.movementOfArticle.amount);
    }
    if (this.movementOfArticle.article && this.containsVariants) {
      this.getVariantsByArticleParent();
    }
    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.movementOfArticleForm = this._fb.group({
      '_id': [this.movementOfArticle._id, [
        ]
      ],
      'description': [this.movementOfArticle.description, [
          Validators.required
        ]
      ],
      'amount': [this.movementOfArticle.amount, [
          Validators.required
        ]
      ],
      'notes': [this.movementOfArticle.notes, [
        ]
      ],
      'unitPrice': [this.unitPrice, [
        ]
      ]
    });

    this.movementOfArticleForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public onValueChanged(data?: any): void {

    if (!this.movementOfArticleForm) { return; }
    const form = this.movementOfArticleForm;

    for (const field in this.formErrors) {
      this.formErrors[field] = '';
      const control = form.get(field);

      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  public isValidSelectedVariants(): boolean {

    let isValid: boolean = true;

    if (this.containsVariants && this.variantTypes && this.variantTypes.length > 0) {
      for(let type of this.variantTypes) {
        if (this.selectedVariants[type.name] === null) {
          isValid = false;
        }
      }
    } else {
      isValid = false;
    }

    return isValid;
  }

  public getVariantsByArticleParent(): void {

    this.loading = true;

    this._variantService.getVariantsByArticleParent(this.movementOfArticle.article).subscribe(
      result => {
        if (!result.variants) {
          this.areVariantsEmpty = true;
          this.variants = null;
        } else {
          this.variants = result.variants;
          this.variantTypes = this.getUniqueValues('type', this.variants);
          this.initializeSelectedVariants();
          this.areVariantsEmpty = false;

        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public initializeSelectedVariants(): void {

    if (this.variantTypes && this.variantTypes.length > 0) {
      for(let type of this.variantTypes) {
        let key = type.name;
        this.selectedVariants[key] = null;
      }
    }
  }

  public getVariantsByType(variantType: VariantType): Variant[] {

    let variantsToReturn: Variant[] = new Array();

    for(let variant of this.variants) {
      if (variant.type._id === variantType._id) {
        if (variantsToReturn && variantsToReturn.length > 0) {
          for(let variantAux of variantsToReturn) {
            if (variant.value._id !== variantAux.value._id) {
              variantsToReturn.push(variant);
            }
          }
        } else {
          variantsToReturn.push(variant);
        }
      }
    }

    variantsToReturn = this.getUniqueVariants(variantsToReturn);

    return variantsToReturn;
  }

  public getUniqueValues(property: string, array: Array<any>): Array<any> {

    let uniqueArray = new Array();
    let exists = false;

    if(array && array.length > 0) {
      for (let i = 0; i < array.length; i++) {
        let el = array[i][property];
        exists = false;
        for(let j = 0; j < uniqueArray.length; j++) {
          if (array[i][property]._id === uniqueArray[j]._id) {
            exists = true;
          }
        }
        if (!exists) {
          uniqueArray.push(el);
        }
      }
    }

    return uniqueArray;
  }

  public getUniqueVariants(array: Array<any>): Array<any> {

    let uniqueArray = new Array();
    let exists = false;

    if(array && array.length > 0) {
      for (let i = 0; i < array.length; i++) {
        let el = array[i];
        exists = false;
        for (let j = 0; j < uniqueArray.length; j++) {
          if (array[i].value._id === uniqueArray[j].value._id) {
            exists = true;
          }
        }
        if (!exists) {
          uniqueArray.push(el);
        }
      }
    }

    return uniqueArray;
  }

  public selectVariant(type: VariantType, value: VariantValue): void {

    let key = type.name;
    if (value.description === this.selectedVariants[key]) {
      this.selectedVariants[key] = null;
    } else {
      this.selectedVariants[key] = value.description;
    }
  }

  public addAmount(): void {
    this.movementOfArticle.amount += 1;
    this.setValueForm();
  }

  public subtractAmount(): void {
    if (this.movementOfArticleForm.value.amount > 1) {
      this.movementOfArticle.amount -= 1;
    } else {
      this.movementOfArticle.amount = 1;
    }
    this.setValueForm();
  }

  public setValueForm(): void {

    if (!this.movementOfArticle._id) this.movementOfArticle._id = '';
    if (!this.movementOfArticle.description) this.movementOfArticle.description = '';
    if (!this.movementOfArticle.amount) this.movementOfArticle.amount = 1;
    if (!this.movementOfArticle.notes) this.movementOfArticle.notes = '';
    if (!this.movementOfArticle.salePrice) this.movementOfArticle.salePrice = 0;

    this.movementOfArticle.amount = this.roundNumber.transform(this.movementOfArticle.amount);

    let values = {
      '_id': this.movementOfArticle._id,
      'description': this.movementOfArticle.description,
      'amount': this.movementOfArticle.amount,
      'notes': this.movementOfArticle.notes,
      'unitPrice': this.unitPrice
    };

    this.movementOfArticleForm.setValue(values);
  }

  public addMovementOfArticle(): void {

    // Si puede editar el precio a mano se cambia el precio del artículo temporalmente
    if(this.movementOfArticle.transaction.type.transactionMovement === TransactionMovement.Sale) {
      this.movementOfArticle.basePrice = this.movementOfArticle.article.basePrice * this.movementOfArticle.amount;
      this.movementOfArticle.salePrice = this.movementOfArticleForm.value.unitPrice * this.movementOfArticle.amount;
    } else {
      this.movementOfArticle.basePrice = this.movementOfArticleForm.value.unitPrice * this.movementOfArticle.amount;
    }

    if (this.containsVariants) {
      if (!this.isValidSelectedVariants()) {
        if (!this.variants || this.variants.length === 0) {
          if (Config.modules.stock &&
            this.movementOfArticle.transaction.type.modifyStock) {
            this.getArticleStock();
          } else {
            this.movementOfArticleExists();
          }
        } else {
          this.errVariant = "Debe seleccionar una variante";
        }
      } else {
        this.errVariant = undefined;
        this.movementOfArticle.article = this.getArticleBySelectedVariants();
        if (Config.modules.stock &&
            this.movementOfArticle.transaction.type.modifyStock) {
          this.getArticleStock();
        } else {
          this.movementOfArticleExists();
        }

      }
    } else {
      // Si tiene el modulo de stock y la transacción afecta stock verificamos que tenga stock
      if (Config.modules.stock &&
          this.movementOfArticle.transaction.type.modifyStock) {
        this.getArticleStock();
      } else {
        // Corroboramos si ya existe algún movimiento del artículo a agregar
        this.movementOfArticleExists();
      }
    }
  }

  public getArticleStock(): void {

    this.loading = true;

    this._articleStockService.getStockByArticle(this.movementOfArticle.article._id).subscribe(
      result => {
        if (!result.articleStocks || result.articleStocks.length <= 0) {
          this.loading = false;
          this.movementOfArticleExists();
        } else {
          this.loading = false;
          this.articleStock = result.articleStocks[0];
          this.movementOfArticleExists();
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getArticleBySelectedVariants(): Article {

    let articleToReturn: Article;
    let articles: Article[] = new Array();

    if (this.variants && this.variants.length > 0) {
      for(let variant of this.variants) {
        if (variant.value.description === this.selectedVariants[variant.type.name]) {
          articles.push(variant.articleChild);
        }
      }
    }

    if (articles && articles.length > 0) {
      for (let article of articles) {
        let count = 0;
        for (let articleAux of articles) {
          if (article._id === articleAux._id) {
            count++;
          }
        }
        if (count == this.variantTypes.length) {
          articleToReturn = article;
        }
      }
    }

    return articleToReturn;
  }

  public getVariantsByArticleChild(article: Article): Variant[] {

    let variantsToReturn: Variant[] = new Array();

    if (this.variants && this.variants.length > 0) {
      for (let variant of this.variants) {
        if (variant.articleChild._id === article._id) {
          variantsToReturn.push(variant);
        }
      }
    }

    return variantsToReturn;
  }

  public movementOfArticleExists(): void {

    this.loading = true;

    this._movementOfArticleService.movementOfArticleExists(this.movementOfArticle).subscribe(
      result => {
        if (!result.movementsOfArticles) {

          // Si no existe ningún movimiento del artículo guardamos uno nuevo
          if (this.containsVariants) {
            this.loadDescriptionOfVariants();
          } else {
            this.movementOfArticle.notes = this.movementOfArticleForm.value.notes;
          }
          this.movementOfArticle.description = this.movementOfArticleForm.value.description;
          this.movementOfArticle.amount = this.movementOfArticleForm.value.amount;

          if(this.movementOfArticle.transaction.type.transactionMovement === TransactionMovement.Sale) {
            this.movementOfArticle = this.recalculateSalePrice(this.movementOfArticle);
          } else {
            this.movementOfArticle = this.recalculateCostPrice(this.movementOfArticle);
          }

          this.verifyPermissions("save");
        } else {
          let movementFound = result.movementsOfArticles[0];

          this.movementOfArticle.article = movementFound.article;

          if (!this.containsVariants) {
            this.movementOfArticle.notes = this.movementOfArticleForm.value.notes;
          }
          if (this.movementOfArticle._id && this.movementOfArticle._id !== '') {
            this.movementOfArticle.amount = this.movementOfArticleForm.value.amount;
          } else {
            this.movementOfArticle._id = movementFound._id;
            this.movementOfArticle.amount += movementFound.amount;
          }

          if(this.movementOfArticle.transaction.type.transactionMovement === TransactionMovement.Sale) {
            this.movementOfArticle = this.recalculateSalePrice(this.movementOfArticle);
          } else {
            this.movementOfArticle = this.recalculateCostPrice(this.movementOfArticle);
          }

          this.verifyPermissions("update");
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public recalculateCostPrice(movementOfArticle: MovementOfArticle): MovementOfArticle {

    let unitPrice = this.roundNumber.transform(this.movementOfArticleForm.value.unitPrice + this.movementOfArticle.transactionDiscountAmount);

    movementOfArticle.amount = this.movementOfArticleForm.value.amount;
    movementOfArticle.transactionDiscountAmount = this.roundNumber.transform((unitPrice * movementOfArticle.transaction.discountPercent / 100), 3);
    movementOfArticle.basePrice = this.roundNumber.transform((unitPrice - movementOfArticle.transactionDiscountAmount) * movementOfArticle.amount);
    movementOfArticle.markupPrice = 0.00;
    movementOfArticle.markupPercentage = 0.00;

    let taxedAmount = movementOfArticle.basePrice;

    movementOfArticle.costPrice = 0;

    let fields: ArticleFields[] = new Array();
    if(movementOfArticle.otherFields && movementOfArticle.otherFields.length > 0) {
      for (const field of movementOfArticle.otherFields) {
        if(field.datatype === ArticleFieldType.Percentage) {
          field.amount = this.roundNumber.transform((movementOfArticle.basePrice * parseInt(field.value)) / 100);
          taxedAmount += field.amount;
        } else if(field.datatype === ArticleFieldType.Number) {
          field.amount = parseInt(field.value);
          taxedAmount += field.amount;
        }
        fields.push(field);
      }
    }
    movementOfArticle.otherFields = fields;

    if(this.movementOfArticle.transaction.type.requestTaxes) {
      let taxes: Taxes[] = new Array();
      if (movementOfArticle.taxes && movementOfArticle.taxes.length > 0) {
        for (const articleTax of movementOfArticle.taxes) {
          articleTax.taxBase = taxedAmount;
          articleTax.taxAmount = this.roundNumber.transform(taxedAmount * articleTax.percentage / 100);
          taxes.push(articleTax);
          movementOfArticle.costPrice += (articleTax.taxAmount);
        }
      }
      movementOfArticle.taxes = taxes;
    }
    movementOfArticle.costPrice += this.roundNumber.transform(taxedAmount);
    movementOfArticle.salePrice = movementOfArticle.costPrice;

    return movementOfArticle;
  }

  public recalculateSalePrice(movementOfArticle: MovementOfArticle): MovementOfArticle {

    let unitPrice = this.movementOfArticleForm.value.unitPrice + this.movementOfArticle.transactionDiscountAmount;

    this.movementOfArticle.basePrice = this.roundNumber.transform(this.movementOfArticle.article.basePrice * this.movementOfArticle.amount);

    let fields: ArticleFields[] = new Array();
    if(movementOfArticle.otherFields && movementOfArticle.otherFields.length > 0) {
      for (const field of movementOfArticle.otherFields) {
        if(field.datatype === ArticleFieldType.Percentage) {
          field.amount = this.roundNumber.transform((movementOfArticle.basePrice * parseInt(field.value)) / 100);
        } else if(field.datatype === ArticleFieldType.Number) {
          field.amount = parseInt(field.value);
        }
        fields.push(field);
      }
    }
    movementOfArticle.otherFields = fields;

    this.movementOfArticle.costPrice = this.roundNumber.transform(this.movementOfArticle.article.costPrice * this.movementOfArticle.amount);
    this.movementOfArticle.transactionDiscountAmount = this.roundNumber.transform((unitPrice * this.movementOfArticle.transaction.discountPercent / 100), 3);
    this.movementOfArticle.salePrice = this.roundNumber.transform((unitPrice - this.movementOfArticle.transactionDiscountAmount) * this.movementOfArticle.amount);
    this.movementOfArticle.markupPrice = this.roundNumber.transform(this.movementOfArticle.salePrice - this.movementOfArticle.costPrice);
    this.movementOfArticle.markupPercentage = this.roundNumber.transform(this.movementOfArticle.markupPrice / this.movementOfArticle.costPrice * 100);

    if (this.movementOfArticle.transaction.type.requestTaxes) {
      let tax: Taxes = new Taxes();
      let taxes: Taxes[] = new Array();
      if (this.movementOfArticle.taxes) {
        for (let taxAux of this.movementOfArticle.taxes) {
          tax.percentage = this.roundNumber.transform(taxAux.percentage);
          tax.tax = taxAux.tax;
          tax.taxBase = this.roundNumber.transform(this.movementOfArticle.salePrice / ((tax.percentage / 100) + 1));
          tax.taxAmount = this.roundNumber.transform(tax.taxBase * tax.percentage / 100);
          taxes.push(tax);
        }
      }
      this.movementOfArticle.taxes = taxes;
    }

    return movementOfArticle;
  }

  public verifyPermissions(op: string):void {

    let allowed = true;

    if (this.movementOfArticle.transaction.type.transactionMovement === TransactionMovement.Sale &&
        !this.movementOfArticle.article.allowSale) {
      allowed = false;
      this.showMessage("El producto no esta habilitado para la venta", 'info', true);
    }

    if (Config.modules.stock &&
        this.movementOfArticle.transaction.type.transactionMovement === TransactionMovement.Sale &&
        this.movementOfArticle.transaction.type.modifyStock &&
        !this.movementOfArticle.article.allowSaleWithoutStock &&
        (!this.articleStock || (this.articleStock && this.movementOfArticle.amount > this.articleStock.realStock))) {
      allowed = false;
      this.showMessage("No tiene el stock suficiente para vender la cantidad solicitada.", 'info', true);
    }

    if (allowed) {
      if (op === "update") {
        this.updateMovementOfArticle();
      } else {
        this.saveMovementOfArticle();
      }
    }
  }

  public loadDescriptionOfVariants(): void {

    this.movementOfArticle.notes = '';
    let variantsAux: Variant[] = this.getVariantsByArticleChild(this.movementOfArticle.article);

    if(variantsAux && variantsAux.length > 0) {
      for (let i = 0; i < variantsAux.length; i++) {
        this.movementOfArticle.notes += variantsAux[i].value.description;
        if (variantsAux[i + 1]) {
          this.movementOfArticle.notes += " / ";
        } else {
          this.movementOfArticle.notes += "\r\n";
        }
      }
    }
    if (this.movementOfArticleForm.value.notes) {
      this.movementOfArticle.notes += this.movementOfArticleForm.value.notes;
    }
  }

  public saveMovementOfArticle(): void {

    this.loading = true;

    this._movementOfArticleService.saveMovementOfArticle(this.movementOfArticle).subscribe(
      result => {
        if (!result.movementOfArticle) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.activeModal.close('save');
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public deleteMovementOfArticle(): void {

    this.loading = true;

    this._movementOfArticleService.deleteMovementOfArticle(this.movementOfArticleForm.value._id).subscribe(
      result => {
        if (!result.movementOfArticle) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.activeModal.close('delete');
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public updateMovementOfArticle() {

    this.loading = true;

    this._movementOfArticleService.updateMovementOfArticle(this.movementOfArticle).subscribe(
      result => {
        if (!result.movementOfArticle) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.activeModal.close('update');
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
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
