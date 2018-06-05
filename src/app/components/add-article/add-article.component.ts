//Angular
import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

//Terceros
import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { padNumber } from '@ng-bootstrap/ng-bootstrap/util/util';

//Models
import { Article, ArticlePrintIn, ArticleType } from './../../models/article';
import { ArticleStock } from './../../models/article-stock';
import { Make } from './../../models/make';
import { Category } from './../../models/category';
import { Variant } from '../../models/variant';
import { Config } from './../../app.config';
import { VariantType } from '../../models/variant-type';
import { Taxes } from '../../models/taxes';

//Services
import { ArticleService } from './../../services/article.service';
import { ArticleStockService } from './../../services/article-stock.service';
import { MakeService } from './../../services/make.service';
import { CategoryService } from './../../services/category.service';
import { VariantService } from './../../services/variant.service';

//Pipes
import { DecimalPipe } from '@angular/common';
import { SlicePipe } from '@angular/common';

@Component({
  selector: 'app-add-article',
  templateUrl: './add-article.component.html',
  styleUrls: ['./add-article.component.css'],
  providers: [NgbAlertConfig, DecimalPipe]
})

export class AddArticleComponent implements OnInit {

  @Input() article: Article;
  @Input() operation: string;
  @Input() readonly: boolean;
  public articleStock: ArticleStock;
  public articleForm: FormGroup;
  public makes: Make[] = new Array();
  public categories: Category[] = new Array();
  public variants: Variant[] = new Array();
  public articlesWithVariants: Article[] = new Array();
  public variantsStored = new Array();
  public raffledVariants: Variant[] = Array();
  public taxes: Taxes[] = new Array();
  public printIns: ArticlePrintIn[] = [ArticlePrintIn.Counter];
  public alertMessage: string = "";
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public resultUpload;
  public apiURL = Config.apiURL;
  public filesToUpload: Array<File>;
  public numberOfVariantsStored: number = 0;
  public numberOfVariantsToStore: number = 0;
  public numberOfGroupOfVariantsStored: number = 0;
  public numberOfGroupOfVariantsToStore: number = 0;
  public numberOfArticleChildStored: number = 0;
  public numberOfArticleChildToStore: number = 0;
  public numberOfArticleTaxStored: number = 0;
  public numberOfArticleTaxToStore: number = 0;
  public uniqueVariantTypes: VariantType[] = new Array();
  public hasChanged: boolean = false;

  public formErrors = {
    'code': '',
    'make': '',
    'description': '',
    'posDescription': '',
    'basePrice': '',
    'costPrice': '',
    'markupPercentage': '',
    'markupPrice': '',
    'salePrice': '',
    'category': ''
  };

  public validationMessages = {
    'code': {
      'required': 'Este campo es requerido.',
      'maxlength': 'No puede exceder los 5 carácteres.'
    },
    'make': {
      'required': 'Este campo es requerido.'
    },
    'description': {
      'required': 'Este campo es requerido.'
    },
    'posDescription': {
      'maxlength': 'No puede exceder los 20 carácteres.'
    },
    'basePrice': {
      'required': 'Este campo es requerido.'
    },
    'costPrice': {
      'required': 'Este campo es requerido.'
    },
    'markupPercentage': {
      'required': 'Este campo es requerido.'
    },
    'markupPrice': {
      'required': 'Este campo es requerido.'
    },
    'salePrice': {
      'required': 'Este campo es requerido.'
    },
    'category': {
      'required': 'Este campo es requerido.'
    }
  };

  constructor(
    public _articleService: ArticleService,
    public _articleStockService: ArticleStockService,
    public _variantService: VariantService,
    public _makeService: MakeService,
    public _categoryService: CategoryService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) {
    if(!this.article) {
      this.article = new Article();
    }
  }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.buildForm();
    this.getMakes();
    if(this.operation === "update") {
      this.taxes = this.article.taxes;
      this.setValuesForm();
    } else if (this.operation === "view") {
      this.taxes = this.article.taxes;
      this.readonly = true;
      this.setValuesForm();
    }
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.articleForm = this._fb.group({
      '_id': [this.article._id, [
      ]
      ],
      'code': [this.article.code, [
        Validators.required,
        Validators.maxLength(5)
      ]
      ],
      'make': [this.article.make, [
      ]
      ],
      'description': [this.article.description, [
        Validators.required
      ]
      ],
      'posDescription': [this.article.posDescription, [
        Validators.maxLength(20)
      ]
      ],
      'basePrice': [this.article.basePrice, [
        Validators.required
      ]
      ],
      'costPrice': [this.article.costPrice, [
        Validators.required
      ]
      ],
      'markupPercentage': [this.article.markupPercentage, [
        Validators.required
      ]
      ],
      'markupPrice': [this.article.markupPrice, [
        Validators.required
      ]
      ],
      'salePrice': [this.article.salePrice, [
        Validators.required
      ]
      ],
      'category': [this.article.category, [
        Validators.required
      ]
      ],
      'observation': [this.article.observation, [
      ]
      ],
      'barcode': [this.article.barcode, [
      ]
      ],
      'printIn': [this.article.printIn, [
      ]
      ],
      'allowPurchase': [this.article.allowPurchase, [
      ]
      ],
      'allowSale': [this.article.allowSale, [
      ]
      ],
      'allowSaleWithoutStock': [this.article.allowSaleWithoutStock, [
      ]
      ]
    });

    this.articleForm.valueChanges.subscribe(data => this.onValueChanged(data));
    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public onValueChanged(data?: any): void {

    if (!this.articleForm) { return; }
    const form = this.articleForm;

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

  public padString(n, length) {
    var n = n.toString();
    while (n.length < length)
      n = "0" + n;
    return n;
  }

  public autocompleteCode() {
    this.article.code = this.padString(this.articleForm.value.code, 5);
    this.setValuesForm();
  }

  public getLastArticle(): void {

    this.loading = true;

    this._articleService.getLastArticle().subscribe(
      result => {
        let code = "00001";
        let category: Category = new Category();
        if (result.articles) {
          if (result.articles[0] !== undefined) {
            if (!isNaN(parseInt(result.articles[0].code))) {
              code = (parseInt(result.articles[0].code) + 1) + "";
            } else {
              code = "00001";
            }
          }
        }
        if (this.categories[0] !== undefined) {
          category = this.categories[0];
        }

        this.article.code = code;
        this.article.make = this.makes[0];
        this.article.category = category;
        this.setValuesForm();
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public getArticleStock(): void {

    this.loading = true;

    this._articleStockService.getStockByArticle(this.article._id).subscribe(
      result => {
        if (!result.articleStocks) {
          this.saveArticleStock();
        } else {
          this.articleStock = result.articleStocks[0];
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public saveArticleStock(): void {

    if (!this.articleStock) {
      this.articleStock = new ArticleStock();
    }

    if (this.articleStock && !this.articleStock.article) {
      this.articleStock.article = this.article;
    }

    this._articleStockService.saveArticleStock(this.articleStock).subscribe(
      result => {
        if (!result.articleStock) {
          if (result.message && result.message !== "") this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.articleStock = result.articleStock;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public getMakes(): void {

    this.loading = true;

    this._makeService.getMakes().subscribe(
      result => {
        if (!result.makes) {
          this.getCategories();
        } else {
          this.hideMessage();
          this.makes = result.makes;
          this.getCategories();
        }
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public getCategories(): void {

    this.loading = true;

    this._categoryService.getCategories().subscribe(
      result => {
        if (!result.categories) {
          if (result.message && result.message !== "") this.showMessage(result.message, "info", true);
        } else {
          this.hideMessage();
          this.categories = result.categories;
          if(this.operation === "add") {
            this.getLastArticle();
          }
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public updatePrices(op): void {

    switch (op) {
      case 'basePrice':
        if (this.taxes.length > 0) {
          this.articleForm.value.costPrice = 0;
          for (let articleTax of this.taxes) {
            articleTax.taxBase = this.articleForm.value.basePrice;
            articleTax.taxAmount = this.articleForm.value.basePrice * articleTax.percentage / 100;
            this.articleForm.value.costPrice += (articleTax.taxAmount);
          }
          this.articleForm.value.costPrice += this.articleForm.value.basePrice;
        } else {
          this.articleForm.value.costPrice = this.articleForm.value.basePrice;
        }
        if (!(this.articleForm.value.basePrice === 0 && this.articleForm.value.salePrice !== 0)) {
          this.articleForm.value.markupPrice = this.articleForm.value.costPrice * this.articleForm.value.markupPercentage / 100;
          this.articleForm.value.salePrice = this.articleForm.value.costPrice + this.articleForm.value.markupPrice;
        }
        break;
      case 'taxes':
        if (this.taxes.length > 0) {
          this.articleForm.value.costPrice = 0;
          for (let articleTax of this.taxes) {
            articleTax.taxBase = this.articleForm.value.basePrice;
            articleTax.taxAmount = this.articleForm.value.basePrice * articleTax.percentage / 100;
            this.articleForm.value.costPrice += (articleTax.taxAmount);
          }
          this.articleForm.value.costPrice += this.articleForm.value.basePrice;
        } else {
          this.articleForm.value.costPrice = this.articleForm.value.basePrice;
        }
        if (!(this.articleForm.value.basePrice === 0 && this.articleForm.value.salePrice !== 0)) {
          this.articleForm.value.markupPrice = this.articleForm.value.costPrice * this.articleForm.value.markupPercentage / 100;
          this.articleForm.value.salePrice = this.articleForm.value.costPrice + this.articleForm.value.markupPrice;
        }
        break;
      case 'markupPercentage':
        if (!(this.articleForm.value.basePrice === 0 && this.articleForm.value.salePrice !== 0)) {
          this.articleForm.value.markupPrice = this.articleForm.value.costPrice * this.articleForm.value.markupPercentage / 100;
          this.articleForm.value.salePrice = this.articleForm.value.costPrice + this.articleForm.value.markupPrice;
        }
        break;
      case 'markupPrice':
        if (!(this.articleForm.value.basePrice === 0 && this.articleForm.value.salePrice !== 0)) {
          this.articleForm.value.markupPercentage = this.articleForm.value.markupPrice / this.articleForm.value.costPrice * 100;
          this.articleForm.value.salePrice = this.articleForm.value.costPrice + this.articleForm.value.markupPrice;
        }
        break;
      case 'salePrice':
        if (this.articleForm.value.basePrice === 0) {
          this.articleForm.value.costPrice === 0;
          this.articleForm.value.markupPercentage = 100;
          this.articleForm.value.markupPrice = this.articleForm.value.salePrice;
        } else {
          this.articleForm.value.markupPrice = this.articleForm.value.salePrice - this.articleForm.value.costPrice;
          this.articleForm.value.markupPercentage = this.articleForm.value.markupPrice / this.articleForm.value.costPrice * 100;
        }
        break;
      default:
        break;
    }

    this.articleForm.value.basePrice = parseFloat(this.articleForm.value.basePrice.toFixed(2));
    this.articleForm.value.costPrice = parseFloat(this.articleForm.value.costPrice.toFixed(2));
    this.articleForm.value.markupPercentage = parseFloat(this.articleForm.value.markupPercentage.toFixed(2));
    this.articleForm.value.markupPrice = parseFloat(this.articleForm.value.markupPrice.toFixed(3));
    this.articleForm.value.salePrice = parseFloat(this.articleForm.value.salePrice.toFixed(2));

    this.article = this.articleForm.value;
    this.setValuesForm();

  }

  public loadPosDescription(): void {
    if (this.articleForm.value.posDescription === "") {
      let slicePipe = new SlicePipe();
      this.articleForm.value.posDescription = slicePipe.transform(this.articleForm.value.description, 0, 20);
      this.article = this.articleForm.value;
      this.setValuesForm();
    }
  }

  public setValuesForm(): void {

    if (!this.article._id) this.article._id = "";
    if (!this.article.code) this.article.code = "000001";
    
    let make;
    if (!this.article.make) {
      make = null;
    } else {
      if (this.article.make._id) {
        make = this.article.make._id;
      } else {
        make = this.article.make;
      }
    }

    if (!this.article.description) this.article.description = "";
    if (!this.article.posDescription) this.article.posDescription = "";
    if (!this.article.basePrice) this.article.basePrice = 0.00;
    if (!this.article.costPrice) this.article.costPrice = 0.00;
    if (!this.article.markupPercentage) this.article.markupPercentage = 0.00;
    if (!this.article.markupPrice) this.article.markupPrice = 0.00;
    if (!this.article.salePrice) this.article.salePrice = 0.00;
    
    let category;
    if (!this.article.category) {
      category = null;
    } else {
      if (this.article.category._id) {
        category = this.article.category._id;
      } else {
        category = this.article.category;
      }
    }

    if (!this.article.observation) this.article.observation = "";
    if (!this.article.barcode) this.article.barcode = "";
    if (!this.article.printIn) this.article.printIn = ArticlePrintIn.Counter;
    if (!this.article.allowPurchase === undefined) this.article.allowPurchase = true;
    if (!this.article.allowSale === undefined) this.article.allowSale = true;
    if (!this.article.allowSaleWithoutStock === undefined) this.article.allowSaleWithoutStock = false;

    this.articleForm.setValue({
      '_id': this.article._id,
      'code': this.article.code,
      'make': make,
      'description': this.article.description,
      'posDescription': this.article.posDescription,
      'basePrice': this.article.basePrice,
      'costPrice': this.article.costPrice,
      'markupPercentage': this.article.markupPercentage,
      'markupPrice': this.article.markupPrice,
      'salePrice': this.article.salePrice,
      'category': category,
      'observation': this.article.observation,
      'barcode': this.article.barcode,
      'printIn': this.article.printIn,
      'allowPurchase': this.article.allowPurchase,
      'allowSale': this.article.allowSale,
      'allowSaleWithoutStock': this.article.allowSaleWithoutStock
    });
  }

  public addArticle(): void {
    
    if (!this.readonly) {
      this.loading = true;
      this.loadPosDescription();
      this.article = this.articleForm.value;
      this.autocompleteCode();
      this.article.type = ArticleType.Final;
      if (this.variants && this.variants.length > 0) {
        this.article.containsVariants = true;
      } else {
        this.article.containsVariants = false;
      }
      this.article.taxes = this.taxes;
      if (this.operation === "add") {
        this.saveArticle();
      } else if (this.operation === "update") {
        this.updateArticle();
      }
    }
  }

  public saveArticle(): void {
    
    this.loading = true;

    this._articleService.saveArticle(this.article).subscribe(
      result => {
        if (!result.article) {
          this.loading = false;
          if (result.message && result.message !== "") this.showMessage(result.message, "info", true);
        } else {
          this.hasChanged = true;
          this.article = result.article;
          if (this.filesToUpload) {
            this._articleService.makeFileRequest(this.article._id, this.filesToUpload)
              .then(
                (result) => {
                  this.resultUpload = result;
                  this.article.picture = this.resultUpload.filename;
                  if (this.article.containsVariants) {
                    this.addVariants(this.article);
                  } else {
                    this.loading = false;
                    this.showMessage("El artículo se ha añadido con éxito.", "success", false);
                  }
                },
                (error) => {
                  this.loading = false;
                  this.showMessage(error, "danger", false);
                }
              );
          } else {
            if (this.article.containsVariants) {
              this.addVariants(this.article);
            } else {
              this.loading = false;
              this.showMessage("El artículo se ha añadido con éxito.", "success", false);
            }
          }
        }
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public updateArticle(): void {

    this.loading = true;

    this._articleService.updateArticle(this.article).subscribe(
      result => {
        if (!result.article) {
          if (result.message && result.message !== "") this.showMessage(result.message, "info", true);
        } else {
          this.hasChanged = true;
          this.article = result.article;
          if (this.filesToUpload) {
            this._articleService.makeFileRequest(this.article._id, this.filesToUpload)
              .then(
                (result) => {
                  this.resultUpload = result;
                  this.article.picture = this.resultUpload.filename;
                  if (this.article.containsVariants) {
                    this.addVariants(this.article);
                  } else {
                    this.loading = false;
                    this.showMessage("El artículo se ha actualizado con éxito.", "success", false);
                  }
                },
                (error) => {
                  this.showMessage(error, "danger", false);
                }
              );
          } else {
            if (this.article.containsVariants) {
              this.addVariants(this.article);
            } else {
              this.loading = false;
              this.showMessage("El artículo se ha actualizado con éxito.", "success", false);
            }
          }
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public cleanForm() {
    this.article = new Article();
    this.taxes = new Array();
    this.filesToUpload = null;
    this.buildForm();
    this.variants = new Array();
    this.getLastArticle();
  }

  public closeModal() {
    this.activeModal.close(this.hasChanged);
  }

  public fileChangeEvent(fileInput: any): void {

    this.filesToUpload = <Array<File>>fileInput.target.files;
  }

  public makeFileRequest(files: Array<File>) {

    let articleId = this.article._id;
    return new Promise(function (resolve, reject) {
      let formData: any = new FormData();
      let xhr: XMLHttpRequest = new XMLHttpRequest();

      for (let i: number = 0; i < files.length; i++) {
        formData.append('image', files[i], files[i].name);
      }
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            resolve(JSON.parse(xhr.response));
          } else {
            reject(xhr.response);
          }
        }
      }

      xhr.open('POST', Config.apiURL + 'upload-image/' + articleId, true);
      xhr.send(formData);
    });
  }

  public addArticleTaxes(articleTaxes: Taxes[]): void {
    this.taxes = articleTaxes;
    this.updatePrices("taxes");
  }

  public addStock(articleStock: ArticleStock): void {
    this.articleStock = articleStock;
  }

  // public saveArticleStock(article: Article): void {

  //   this.loading = true;

  //   if(!this.articleStock) {
  //     this.articleStock = new ArticleStock();
  //   }

  //   this.articleStock.article = article;

  //   this._articleStockService.saveArticleStock(this.articleStock).subscribe(
  //     result => {
  //       if (!result.articleStock) {
  //         if(result.message && result.message !== "") this.showMessage(result.message, "info", true);
  //       } else {
  //         this.articleStock = result.articleStock;
  //       }
  //       this.loading = false;
  //     },
  //     error => {
  //       this.showMessage(error._body, "danger", false);
  //       this.loading = false;
  //     }
  //   );
  // }

  public addVariants(articleParent: Article): void {

    this.loading = true;

    this.numberOfArticleChildToStore = 1;

    let variantTypes: VariantType[] = new Array();

    if (this.variants && this.variants.length > 0) {
      for (let variant of this.variants) {
        variantTypes.push(variant.type);
      }
    }

    this.uniqueVariantTypes = this.getUniqueValues(variantTypes);
    this.numberOfVariantsToStore = this.uniqueVariantTypes.length;

    for (let i = 0; i < this.uniqueVariantTypes.length; i++) {
      this.numberOfArticleChildToStore *= this.getDuplicateValues(this.uniqueVariantTypes[i], variantTypes);
    }

    this.numberOfGroupOfVariantsToStore = this.numberOfArticleChildToStore;

    this.addArticleChildren(articleParent);
  }

  public getUniqueValues(array: Array<any>): Array<any> {

    let uniqueArray = new Array();

    for (let index = 0; index < array.length; index++) {
      let el = array[index];
      if (uniqueArray.indexOf(el) === -1) uniqueArray.push(el);
    }

    return uniqueArray;
  }

  public getDuplicateValues(value: any, array: Array<any>): number {

    let duplicateArray = new Array();
    let cant = 0;

    for (let index = 0; index < array.length; index++) {
      if (value._id === array[index]._id) {
        cant++;
      }
    }

    return cant;
  }

  public addArticleChildren(articleParent: Article): void {

    if (this.numberOfArticleChildStored < this.numberOfArticleChildToStore) {

      let articleChild = articleParent;
      articleChild.type = ArticleType.Variant;
      articleChild.containsVariants = false;
      this.saveArticleChild(articleParent, articleChild);
    } else {
      this.loading = false;
      this.showMessage("El artículo se ha añadido con éxito.", "success", false);
    }
  }

  public saveArticleChild(articleParent: Article, articleChild: Article): void {

    this.loading = true;

    this._articleService.saveArticle(articleChild).subscribe(
      result => {
        if (!result.article) {
          if (result.message && result.message !== "") this.showMessage(result.message, "info", true);
        } else {
          articleChild = result.article;
          this.numberOfArticleChildStored++;
          this.numberOfGroupOfVariantsStored = 0;
          this.numberOfArticleTaxStored = 0;
          this.saveVariants(articleParent, articleChild);
        }
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public saveVariants(articleParent: Article, articleChild: Article): void {

    this.loading = true;

    if (this.numberOfGroupOfVariantsStored === 0) {
      if (!this.raffledVariants || (this.raffledVariants && this.raffledVariants.length === 0)) {
        let exists = false;
        do {
          for (let uniqueVariantType of this.uniqueVariantTypes) {
            let variant = this.getVariantByType(uniqueVariantType);
            variant.articleParent = articleParent;
            variant.articleChild = articleChild;
            this.raffledVariants.push(variant);
          }

          if (this.variantsExists()) {
            exists = true;
            this.raffledVariants = new Array();
          } else {
            exists = false;
          }
        } while (exists);
      }
      this.variantsStored.push(this.raffledVariants);
      this.numberOfVariantsStored = 0;

      this.saveGroupOfVariants(articleParent, articleChild);
    } else {
      this.addArticleChildren(articleParent);
    }
  }

  public variantsExists(): boolean {

    let exists: boolean = false;
    let equals: number = 0;

    for (let i = 0; i < this.variantsStored.length; i++) {
      if (!exists) {
        for (let j = 0; j < this.raffledVariants.length; j++) {
          for (let k = 0; k < this.variantsStored[i].length; k++) {
            if (this.raffledVariants[j].type._id == this.variantsStored[i][k].type._id) {
              if (this.raffledVariants[j].value._id == this.variantsStored[i][k].value._id) {
                equals++;
              }
            }
          }
        }
      }
      if (equals === this.uniqueVariantTypes.length) {
        exists = true;
      }
      equals = 0;
    }
    return exists;
  }

  public getVariantByType(variantType: VariantType): Variant {

    let variant;

    do {
      let random: number = Math.round(Math.random() * ((this.variants.length - 1) - 0) + 0);
      variant = this.variants[random];
    } while (variant.type._id !== variantType._id);

    return variant;
  }

  public saveGroupOfVariants(articleParent: Article, articleChild: Article): void {

    this.loading = true;

    if (this.numberOfVariantsStored < this.numberOfVariantsToStore) {
      this.saveVariant(this.raffledVariants[this.numberOfVariantsStored]);
    } else {
      this.numberOfGroupOfVariantsStored++;
      this.raffledVariants = new Array();
      this.saveVariants(articleParent, articleChild);
    }
  }

  public saveVariant(variant: Variant): void {

    this.loading = true;

    this._variantService.saveVariant(variant).subscribe(
      result => {
        if (!result.variant) {
          if (result.message && result.message !== "") this.showMessage(result.message, "info", true);
        } else {
          variant = result.variant;
          this.numberOfVariantsStored++;
          this.saveGroupOfVariants(variant.articleParent, variant.articleChild);
        }
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public manageVariants(articlesWithVariants: Article[]): void {
    this.articlesWithVariants = articlesWithVariants;
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = "";
  }
}
