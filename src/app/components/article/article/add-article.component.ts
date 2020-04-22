// Angular
import { Component, OnInit, EventEmitter, Input, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, NgForm } from '@angular/forms';
import { Router } from '@angular/router';

// Terceros
import { NgbAlertConfig, NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

// Models
import { Article, ArticlePrintIn, Type } from '../article';
import { ArticleStock } from '../../article-stock/article-stock';
import { Make } from '../../make/make';
import { Category } from '../../category/category';
import { Variant } from '../../variant/variant';
import { Config } from '../../../app.config';
import { Taxes } from '../../tax/taxes';
import { Deposit } from '../../deposit/deposit';
import { Location } from '../../location/location';
import { UnitOfMeasurement } from 'app/components/unit-of-measurement/unit-of-measurement';
import { Currency } from 'app/components/currency/currency';
import { Company, CompanyType } from '../../company/company'

// Services
import { ArticleService } from '../article.service';
import { ArticleStockService } from '../../article-stock/article-stock.service';
import { MakeService } from '../../make/make.service';
import { CategoryService } from '../../category/category.service';
import { VariantService } from '../../variant/variant.service';
import { DepositService } from '../../deposit/deposit.service';
import { LocationService } from '../../location/location.service';
import { CurrencyService } from 'app/components/currency/currency.service';
import { CompanyService } from 'app/components/company/company.service';
import { UnitOfMeasurementService } from 'app/components/unit-of-measurement/unit-of-measurement.service';

// Pipes
import { DecimalPipe } from '@angular/common';
import { SlicePipe } from '@angular/common';
import { ArticleFields } from '../../article-field/article-fields';
import { ArticleFieldType, ArticleField } from '../../article-field/article-field';
import { RoundNumberPipe } from '../../../main/pipes/round-number.pipe';
import { MovementOfArticleService } from 'app/components/movement-of-article/movement-of-article.service';
import { ArticleFieldService } from 'app/components/article-field/article-field.service';
import { ClassificationService } from 'app/components/classification/classification.service';
import { Classification } from 'app/components/classification/classification';
import { debounceTime, distinctUntilChanged, tap, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ConfigService } from 'app/components/config/config.service';
import { TaxClassification } from 'app/components/tax/tax';

@Component({
    selector: 'app-add-article',
    templateUrl: './add-article.component.html',
    styleUrls: ['./add-article.component.scss'],
    providers: [NgbAlertConfig, DecimalPipe],
    encapsulation: ViewEncapsulation.None
})

export class AddArticleComponent implements OnInit {

    public article: Article;
    @Input() articleId: string;
    @Input() operation: string;
    @Input() readonly: boolean;
    public articleStock: ArticleStock;
    public articles: Article[];
    public config: Config;
    public articleForm: FormGroup;
    public currencies: Currency[] = new Array();
    public makes: Make[] = new Array();
    public classifications: Classification[] = new Array();
    public companies: Company[] = new Array();
    public deposits: Deposit[] = new Array();
    public locations: Location[] = new Array();
    public categories: Category[] = new Array();
    public variants: Variant[] = new Array();
    public unitsOfMeasurement: UnitOfMeasurement[] = new Array();
    public taxes: Taxes[] = new Array();
    public otherFields: ArticleFields[] = new Array();
    public printIns: ArticlePrintIn[] = [ArticlePrintIn.Counter, ArticlePrintIn.Kitchen, ArticlePrintIn.Bar, ArticlePrintIn.Voucher];
    public alertMessage = '';
    public userType: string;
    public loading = false;
    public focusEvent = new EventEmitter<boolean>();
    public focusNoteEvent = new EventEmitter<boolean>();
    public apiURL = Config.apiURL;
    public filesToUpload: Array<File>;
    public hasChanged = false;
    public roundNumber: RoundNumberPipe = new RoundNumberPipe();
    public imageURL: string;
    public articleType: string;
    public filtersTaxClassification: TaxClassification[] = [TaxClassification.Tax];
    public lastPricePurchase: number = 0.00;
    public lastDatePurchase: string;
    public otherFieldsAlfabetico = false;
    public otherFieldsNumber = false;
    public orientation: string = 'horizontal';
    public notes: string[];
    public formErrorsNote: string;

    public value;
    public articleFieldSelected: ArticleField;
    public articleFields: ArticleField[];
    public articleFieldValues = [];
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
        'category': '',
        'deposit': '',
        'location': '',
        'barcode': '',
        'currency': '',
        'providers': '',
        'note': ''
    };

    public validationMessages = {
        'code': {
            'required': 'Este campo es requerido.'
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
        },
        'deposit': {
            'required': 'Este campo es requerido'
        },
        'location': {
        },
        'barcode': {
            'maxlength': 'No puede exceder los 14 dígitos.'
        },
        'currency': {
            'maxlength': 'No puede exceder los 14 dígitos.'
        },
        'note': {
        }
    };

    public searchCategories = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            tap(() => this.loading = true),
            switchMap(async term =>
                await this.getCategories(`where="description": { "$regex": "${term}", "$options": "i" }&sort="description":1&limit=10`).then(
                    categories => {
                        return categories;
                    }
                )
            ),
            tap(() => this.loading = false)
        )

    public formatterCategories = (x: { description: string }) => x.description;


    public searchMakes = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            tap(() => this.loading = true),
            switchMap(term =>
                this.getMakes(`where="description": { "$regex": "${term}", "$options": "i" }&sort="description":1&limit=10`).then(
                    makes => {
                        return makes;
                    }
                )
            ),
            tap(() => this.loading = false)
        )

    public formatterMakes = (x: { description: string }) => x.description;

    constructor(
        public _articleService: ArticleService,
        public _articleStockService: ArticleStockService,
        public _variantService: VariantService,
        public _depositService: DepositService,
        public _locationService: LocationService,
        public _modalService: NgbModal,
        public _makeService: MakeService,
        public _categoryService: CategoryService,
        public _classificationService: ClassificationService,
        public _companyService: CompanyService,
        public _unitOfMeasurementService: UnitOfMeasurementService,
        public _movementsOfArticle: MovementOfArticleService,
        public _articleFields: ArticleFieldService,
        public _fb: FormBuilder,
        public _router: Router,
        public activeModal: NgbActiveModal,
        public alertConfig: NgbAlertConfig,
        public _currencyService: CurrencyService,
        public _configService: ConfigService,
    ) {
        if (window.screen.width < 1000) this.orientation = 'vertical';
        this.article = new Article();
        this.notes = new Array();
        this.getCurrencies();
        this.getArticleTypes();

        const pathLocation: string[] = this._router.url.split('/');
        this.userType = pathLocation[1];
        if (pathLocation[2] === "productos") {
            this.articleType = "Producto";
        } else if (pathLocation[2] === "variantes") {
            this.articleType = "Variante";
        }
        this.getArticleFields();
        this.getDeposits();
        this.getUnitsOfMeasurement();
    }

    async ngOnInit() {

        this.buildForm();

        await this._configService.getConfig.subscribe(
            config => {
                this.config = config;
                // AGREGAMOS VALIDACIÓN DE LONGITUD DE CÓDIGO INTERNO
                this.validationMessages.code['maxlength'] = `No puede exceder los ${this.config.article.code.validators.maxLength} carácteres.`;
                this.articleForm.controls['code'].setValidators([Validators.maxLength(this.config.article.code.validators.maxLength)]);
                this.article.isWeigth = this.config.article.isWeigth.default;
            }
        );

        if (this.articleId) {
            this.getArticle();

        } else {
            this.imageURL = './../../../assets/img/default.jpg';
        }
    }

    public getArticleTypes() {

        let match = `{"operationType": { "$ne": "D" } }`;

        match = JSON.parse(match);

        // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
        let project = {
            "name": 1,
            "operationType": 1
        };

        // AGRUPAMOS EL RESULTADO
        let group = {
            _id: null,
            count: { $sum: 1 },
            classifications: { $push: "$$ROOT" }
        };

        this._classificationService.getClassifications(
            project, // PROJECT
            match, // MATCH
            {}, // SORT
            group, // GROUP
            0, // LIMIT
            0 // SKIP
        ).subscribe(
            result => {
                this.loading = false;
                if (result && result[0] && result[0].classifications) {
                    this.classifications = result[0].classifications;
                } else {
                    this.classifications = new Array();
                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public getArticleFields() {

        this.loading = true;

        this._articleFields.getArticleFields().subscribe(
            result => {
                if (result && result.articleFields) {

                    this.articleFields = result.articleFields;
					/*for (let x = 0; x < result.articleFields.length; x++) {

						if (result.articleFields[x]['datatype'] === ArticleFieldType.String ||
							result.articleFields[x]['datatype'] === ArticleFieldType.Array) {
							this.otherFieldsAlfabetico = true;
						}
						if (result.articleFields[x]['datatype'] !== ArticleFieldType.String &&
							result.articleFields[x]['datatype'] !== ArticleFieldType.Array) {
							this.otherFieldsNumber = true;
						}

					}*/
                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public buildListArticleField(articleField: ArticleField) {
        this.articleFieldValues = [];
        this.value = '';

        if (articleField && articleField.datatype === ArticleFieldType.Array) {
            this.articleFieldValues = articleField.value.split(';')
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
                Validators.required
            ]
            ],
            'codeSAT': [this.article.codeSAT, [
            ]
            ],
            'currency': [this.article.currency, [
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
            'quantityPerMeasure': [this.article.quantityPerMeasure, [
            ]
            ],
            'unitOfMeasurement': [this.article.unitOfMeasurement, [
            ]
            ],
            'deposits': this._fb.array([]),
            'locations': this._fb.array([]),
            'otherFields': this._fb.array([]),
            'children': this._fb.array([]),
            'observation': [this.article.observation, []],
            'barcode': [this.article.barcode, [
                Validators.maxLength(14)
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
            ],
            'allowMeasure': [this.article.allowMeasure, [
            ]
            ],
            'ecommerceEnabled': [this.article.ecommerceEnabled, [
            ]
            ],
            'posKitchen': [this.article.posKitchen, [
            ]
            ],
            'isWeigth': [this.article.isWeigth, [
            ]
            ],
            'favourite': [this.article.favourite, [
            ]
            ],
            'providers': [this.article.providers, []],
            'lastPricePurchase': [0.00, []],
            'lastDatePurchase': [0.00, []],
            'classification': [this.article.classification, []]
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

    public addNote(note: string): void {
        note = note.toUpperCase();
        if (!this.notes) this.notes = new Array();
        if (note && note !== '') {
            if (this.notes.indexOf(note) == -1) {
                this.notes.push(note);
                this.formErrorsNote = null;
            } else {
                this.formErrorsNote = "La nota ingresada ya existe.";
            }
        } else {
            this.formErrorsNote = "Debe ingresar un valór válido.";
        }
        this.focusNoteEvent.emit(true);
    }

    public deleteNote(note: string): void {
        note = note.toUpperCase();
        if (note) this.notes.splice(this.notes.indexOf(note), 1);
        this.formErrorsNote = null;
        this.focusNoteEvent.emit(true);
    }

    public getDeposit(id: string): Promise<Deposit> {

        return new Promise<Deposit>((resolve, reject) => {
            this._depositService.getDeposit(id).subscribe(
                result => {
                    if (result && result.deposit) {
                        resolve(result.deposit)
                    } else {
                        resolve(null)
                    }
                }
            )
        })
    }

    async addDeposit(depositForm: NgForm) {

        let valid = true;
        const deposits = this.articleForm.controls.deposits as FormArray;


        let deposit = await this.getDeposit(depositForm.value.deposit)

        for (const element of this.articleForm.controls.deposits.value) {

            let depositAux = await this.getDeposit(element.deposit);

            if (depositAux.branch._id === deposit.branch._id) {
                valid = false;
                this.showMessage("Solo puede tener un depósito por sucursal.", "info", true);
            }
        }

        this.articleForm.controls.deposits.value.forEach(element => {

            if (depositForm.value.deposit == element.deposit) {
                valid = false;
                this.showMessage("El depósito ya existe", "info", true);
            }

        });

        if (depositForm.value.deposit == '' || depositForm.value.deposit == 0 || depositForm.value.deposit == null) {
            this.showMessage("Debe seleccionar un depósito", "info", true);
            valid = false;
        }

        if (valid) {
            deposits.push(
                this._fb.group({
                    _id: null,
                    deposit: depositForm.value.deposit,
                    capacity: 0
                })
            );
            depositForm.resetForm();
        }

    }

    async addOtherField(otherFieldsForm: NgForm) {

        let valid = true;

        const otherFields = this.articleForm.controls.otherFields as FormArray;


        this.articleForm.controls.otherFields.value.forEach(element => {


            if (otherFieldsForm.value.articleField._id == element.articleField) {
                valid = false;
                this.showMessage("El campo ya existe", "info", true);
            }

        });

        if (otherFieldsForm.value.value == '' || otherFieldsForm.value.value == null) {
            this.showMessage("Debe ingresar un valor", "info", true);
            valid = false;
        }

        if (valid) {
            otherFields.push(
                this._fb.group({
                    _id: null,
                    value: otherFieldsForm.value.value,
                    articleField: otherFieldsForm.value.articleField._id,
                    amount: otherFieldsForm.value.amount
                })
            );
            otherFieldsForm.resetForm();
            this.value = '';
        }

    }

    async addLocation(locationForm: NgForm) {

        let valid = true;
        const locations = this.articleForm.controls.locations as FormArray;

        if (locationForm.value.location == '' || locationForm.value.location == null) {
            this.showMessage("Debe seleccionar una ubicación.", "info", true);
            valid = false;
        }

        this.articleForm.controls.locations.value.forEach(element => {

            if (locationForm.value.location == element.location) {
                valid = false;
                this.showMessage("La ubicación ya existe.", "info", true);
            }
        });

        if (valid) {
            locations.push(
                this._fb.group({
                    _id: null,
                    location: locationForm.value.location,
                })
            );
            locationForm.resetForm();
        }
    }

    public deleteDeposit(index): void {
        let control = <FormArray>this.articleForm.controls.deposits;
        control.removeAt(index)
    }

    public deleteOtherField(index): void {
        let control = <FormArray>this.articleForm.controls.otherFields;
        control.removeAt(index)
    }

    public deleteLocation(index): void {
        let control = <FormArray>this.articleForm.controls.locations;
        control.removeAt(index)
    }

    public getCurrencies(): void {

        this.loading = true;

        this._currencyService.getCurrencies('sort="name":1').subscribe(
            result => {
                if (!result.currencies) {
                } else {
                    this.currencies = result.currencies;
                }
                this.loading = false;
            },
            error => {
                this.showMessage(error._body, "danger", false);
                this.loading = false;
            }
        );
    }

    public getArticle(): void {

        this.loading = true;

        this._articleService.getArticle(this.articleId).subscribe(
            result => {
                if (!result.article) {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                    this.loading = false;
                } else {
                    this.hideMessage();
                    this.article = result.article;
                    this.notes = this.article.notes;
                    this.taxes = this.article.taxes;
                    if (this.article.picture && this.article.picture !== 'default.jpg') {
                        this.imageURL = Config.apiURL + 'get-image-article/' + this.article.picture + "/" + Config.database;
                    } else {
                        this.imageURL = './../../../assets/img/default.jpg';
                    }
                    this.getLastPricePurchase();
                    if (this.article.containsVariants) {
                        this.getVariantsByArticleParent();
                    }
                    if (this.operation === 'copy') {
                        this.article._id = null;
                        this.article.code = '';
                    }
                    this.setValuesForm();
                    this.setValuesArray();

                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public setValuesArray(): void {

        if (this.article.deposits && this.article.deposits.length > 0) {
            let deposits = this.articleForm.controls.deposits as FormArray;
            this.article.deposits.forEach(x => {

                if (x.deposit && x.deposit._id && x.deposit.operationType != 'D') {
                    deposits.push(this._fb.group({
                        '_id': null,
                        'deposit': x.deposit._id,
                        'capacity': x.capacity
                    }))
                }
            })
        }

        if (this.article.locations && this.article.locations.length > 0) {
            let locations = this.articleForm.controls.locations as FormArray;
            this.article.locations.forEach(x => {

                let locationId;
                if (x.location && x.location._id && x.location.operationType != 'D') {
                    locationId = x.location._id;
                    locations.push(this._fb.group({
                        '_id': null,
                        'location': locationId
                    }))
                }

            })
        }

        if (this.article.otherFields && this.article.otherFields.length > 0) {
            let otherFields = this.articleForm.controls.otherFields as FormArray;
            this.article.otherFields.forEach(x => {

                let articleFieldId;
                if (x.articleField && x.articleField._id && x.articleField.operationType != 'D') {
                    articleFieldId = x.articleField._id;
                    otherFields.push(this._fb.group({
                        '_id': null,
                        'articleField': articleFieldId,
                        'value': x.value
                    }))
                }

            })
        }

    }

    public getVariantsByArticleParent(): void {

        this.loading = true;

        let query = 'where="articleParent":"' + this.article._id + '"';

        this._variantService.getVariants(query).subscribe(
            result => {
                if (!result.variants) {
                    this.variants = new Array();
                } else {
                    this.variants = this.getUniqueVariants(result.variants);
                }
                this.loading = false;
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public getUniqueVariants(variants: Variant[]): Variant[] {

        let variantsToReturn: Variant[] = new Array();

        for (let variant of variants) {
            if (variantsToReturn && variantsToReturn.length > 0) {
                let exists: boolean = false;
                for (let variantAux of variantsToReturn) {
                    if (variantAux.value._id === variant.value._id) {
                        exists = true;
                    }
                }
                if (!exists) {
                    variantsToReturn.push(variant);
                }
            } else {
                variantsToReturn.push(variant);
            }
        }

        return variantsToReturn;
    }

    public padString(n, length) {
        var n = n.toString();
        while (n.length < length) {
            n = '0' + n;
        }
        return n;
    }

    public autocompleteCode() {
        if (!isNaN(this.articleForm.value.code)) {
            this.article.code = this.padString(this.articleForm.value.code, this.config.article.code.validators.maxLength);
        } else {
            this.article.code = this.articleForm.value.code;
        }
        this.setValuesForm();
    }

    public getLastArticle(): void {

        this.loading = true;

        let query = `where="type":"${Type.Final}"&sort="_id":-1&limit=1`;

        this._articleService.getArticles(query).subscribe(
            result => {
                let code = this.padString(1, this.config.article.code.validators.maxLength);
                if (result.articles) {
                    if (result.articles[0]) {
                        if (!isNaN(parseInt(result.articles[0].code))) {
                            code = ((parseInt(result.articles[0].code) + 1) + '').slice(0, this.config.article.code.validators.maxLength);
                        } else {
                            code = this.padString(1, this.config.article.code.validators.maxLength);
                        }
                    }
                }
                if (this.operation === 'add') {
                    let category: Category = new Category();
                    if (this.categories[0]) {
                        category = this.categories[0];
                    }
                    this.article.category = category;
                }

                this.article.code = this.padString(code, this.config.article.code.validators.maxLength);

                this.setValuesForm();
                this.loading = false;
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    async openModal(op: string, articleId?: string) {

        let modalRef;
        switch (op) {
            case 'view':
                modalRef = this._modalService.open(AddArticleComponent, { size: 'lg', backdrop: 'static' });
                modalRef.componentInstance.articleId = articleId;
                modalRef.componentInstance.readonly = true;
                modalRef.componentInstance.operation = "view";
                break;
        }
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
                    if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
                    this.loading = false;
                } else {
                    this.articleStock = result.articleStock;
                }
                this.loading = false;
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public getMakes(query) {

        return new Promise((resolve, reject) => {

            this._makeService.getMakes(query).subscribe(
                result => {
                    if (!result.makes) {
                        resolve(null)
                    } else {
                        resolve(result.makes)
                    }
                },
                error => {
                    this.showMessage(error._body, 'danger', false);
                    this.loading = false;
                }
            );
        });

    }

    public getCategories(query) {

        this.loading = true;

        return new Promise((resolve, reject) => {
            this._categoryService.getCategories(query).subscribe(
                result => {
                    if (!result.categories) {
                        resolve(null)
                    } else {
                        this.hideMessage();
                        resolve(result.categories)
                    }
                    this.loading = false;
                },
                error => {
                    this.showMessage(error._body, 'danger', false);
                    this.loading = false;
                }
            );
        });

    }

    public getDeposits(): void {
        this.loading = true;

        this._depositService.getDeposits().subscribe(
            result => {
                if (!result.deposits) {
                    this.getLocations();
                } else {
                    this.hideMessage();
                    this.deposits = result.deposits;
                    this.getLocations();
                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public getLocations(): void {
        this.loading = true;

        this._locationService.getLocations().subscribe(
            result => {
                if (!result.locations) {
                    this.getCompany();
                } else {
                    this.hideMessage();
                    this.locations = result.locations;
                    this.getCompany();
                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }


    public getCompany(): void {

        this.loading = true;

        let query = 'where="type":"' + CompanyType.Provider.toString() + '"';

        this._companyService.getCompanies(query).subscribe(
            result => {
                if (!result.companies) {
                    this.getUnitsOfMeasurement();
                } else {
                    this.hideMessage();
                    this.companies = result.companies;
                    this.getUnitsOfMeasurement();
                }
                this.loading = false;
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public getLastPricePurchase(): void {

        this.loading = true;

        /// ORDENAMOS LA CONSULTA
        let sortAux = { 'transaction.endDate': -1 };

        // FILTRAMOS LA CONSULTA

        let match = `{  "operationType": { "$ne": "D" },
                    "transaction.operationType" : { "$ne": "D" },
                    "transaction.state" : "Cerrado",
                    "transaction.type.transactionMovement" : "Compra",
                    "article._id" : { "$oid" : "${this.article._id}"}
                  }`;


        match = JSON.parse(match);

        let timezone = "-03:00";
        if (Config.timezone && Config.timezone !== '') {
            timezone = Config.timezone.split('UTC')[1];
        }

        let project = {
            "transaction.state": 1,
            "transaction.operationType": 1,
            "article._id": 1,
            "operationType": 1,
            "transaction.endDate": 1,
            'endDate': { $dateToString: { date: "$transaction.endDate", format: "%d/%m/%Y", timezone: timezone } },
            "transaction.type.name": 1,
            "transaction.type.transactionMovement": 1,
            "transaction._id": 1,
            "transaction.quotation": 1,
            "amount": 1,
            "salePrice": 1,
            "costPrice": 1,
            "basePrice": 1
        };

        // AGRUPAMOS EL RESULTADO
        let group = {
            _id: null,
            count: { $sum: 1 },
            movementsOfArticles: { $push: "$$ROOT" }
        };

        let limit = 1;
        let skip = 0;

        this._movementsOfArticle.getMovementsOfArticlesV2(
            project, // PROJECT
            match, // MATCH
            sortAux, // SORT
            group, // GROUP
            limit, // LIMIT
            skip // SKIP
        ).subscribe(
            result => {
                if (result && result[0] && result[0].movementsOfArticles && result[0].movementsOfArticles.length > 0) {
                    let movementOfArticle = result[0].movementsOfArticles[0];
                    this.lastPricePurchase = this.roundNumber.transform(movementOfArticle.basePrice / movementOfArticle.amount);
                    this.lastDatePurchase = movementOfArticle['endDate'];
                    let quotation = 1;
                    if (movementOfArticle.transaction && movementOfArticle.transaction.quotation) {
                        quotation = movementOfArticle.transaction.quotation;
                    }
                    this.lastPricePurchase = this.roundNumber.transform(this.lastPricePurchase / quotation);
                } else {
                    this.lastPricePurchase = 0;
                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public getUnitsOfMeasurement(): void {

        this.loading = true;

        this._unitOfMeasurementService.getUnitsOfMeasurement().subscribe(
            result => {
                if (!result.unitsOfMeasurement) {
                    if (this.operation === 'add' || this.operation === 'copy') {
                        this.getLastArticle();
                    } else {
                        this.setValuesForm();
                    }
                } else {
                    this.hideMessage();
                    this.unitsOfMeasurement = result.unitsOfMeasurement;
                    if (this.operation === 'add' || this.operation === 'copy') {
                        this.getLastArticle();
                    } else {
                        this.setValuesForm();
                    };
                }
                this.loading = false;
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public updatePrices(op): void {

        let taxedAmount = 0;

        switch (op) {
            case 'basePrice':
                this.articleForm.value.costPrice = 0;
                taxedAmount = this.articleForm.value.basePrice;

                if (this.otherFields && this.otherFields.length > 0) {
                    for (const field of this.otherFields) {
                        if (field.articleField.datatype === ArticleFieldType.Percentage) {
                            field.amount = this.roundNumber.transform((this.articleForm.value.basePrice * parseFloat(field.value) / 100));
                        } else if (field.articleField.datatype === ArticleFieldType.Number) {
                            field.amount = parseFloat(field.value);
                        }
                        if (field.articleField.modifyVAT) {
                            taxedAmount += field.amount;
                        } else {
                            if (field.amount) {
                                this.articleForm.value.costPrice += field.amount;
                            }
                        }
                    }
                }

                if (this.taxes && this.taxes.length > 0) {
                    for (const articleTax of this.taxes) {
                        if (articleTax.tax.percentage && articleTax.tax.percentage != 0) {
                            articleTax.taxBase = taxedAmount;
                            articleTax.taxAmount = this.roundNumber.transform((taxedAmount * articleTax.percentage / 100));
                        }
                        this.articleForm.value.costPrice += (articleTax.taxAmount);
                    }
                }
                this.articleForm.value.costPrice += taxedAmount;

                if (!(taxedAmount === 0 && this.articleForm.value.salePrice !== 0)) {
                    this.articleForm.value.markupPrice = this.roundNumber.transform((this.articleForm.value.costPrice * this.articleForm.value.markupPercentage / 100));
                    this.articleForm.value.salePrice = this.articleForm.value.costPrice + this.articleForm.value.markupPrice;
                }
                break;
            case 'otherFields':
                this.articleForm.value.costPrice = 0;
                taxedAmount = this.articleForm.value.basePrice;

                if (this.otherFields && this.otherFields.length > 0) {
                    for (const field of this.otherFields) {
                        if (field.articleField.datatype === ArticleFieldType.Percentage || field.articleField.datatype === ArticleFieldType.Number) {
                            if (field.articleField.datatype === ArticleFieldType.Percentage) {
                                field.amount = this.roundNumber.transform((this.articleForm.value.basePrice * parseFloat(field.value) / 100));
                            } else if (field.articleField.datatype === ArticleFieldType.Number) {
                                field.amount = parseFloat(field.value);
                            }
                            if (field.articleField.modifyVAT) {
                                taxedAmount += field.amount;
                            } else {
                                this.articleForm.value.costPrice += field.amount;
                            }
                        }
                    }
                }

                if (this.taxes && this.taxes.length > 0) {
                    for (const articleTax of this.taxes) {
                        this.articleForm.value.costPrice += (articleTax.taxAmount);
                    }
                }

                this.articleForm.value.costPrice += taxedAmount;

                if (!(taxedAmount === 0 && this.articleForm.value.salePrice !== 0)) {
                    this.articleForm.value.markupPrice = this.roundNumber.transform((this.articleForm.value.costPrice * this.articleForm.value.markupPercentage / 100));
                    this.articleForm.value.salePrice = this.articleForm.value.costPrice + this.articleForm.value.markupPrice;
                }
                break;
            case 'taxes':
                this.articleForm.value.costPrice = 0;
                taxedAmount = this.articleForm.value.basePrice;

                if (this.otherFields && this.otherFields.length > 0) {
                    for (const field of this.otherFields) {
                        if (field.articleField.datatype === ArticleFieldType.Percentage || field.articleField.datatype === ArticleFieldType.Number) {
                            if (field.articleField.datatype === ArticleFieldType.Percentage) {
                                field.amount = this.roundNumber.transform((this.articleForm.value.basePrice * parseFloat(field.value) / 100));
                            } else if (field.articleField.datatype === ArticleFieldType.Number) {
                                field.amount = parseFloat(field.value);
                            }
                            if (field.articleField.modifyVAT) {
                                taxedAmount += field.amount;
                            } else {
                                this.articleForm.value.costPrice += field.amount;
                            }
                        }
                    }
                }

                if (this.taxes && this.taxes.length > 0) {
                    for (const articleTax of this.taxes) {
                        this.articleForm.value.costPrice += (articleTax.taxAmount);
                    }
                }

                this.articleForm.value.costPrice += taxedAmount;
                if (!(taxedAmount === 0 && this.articleForm.value.salePrice !== 0)) {
                    this.articleForm.value.markupPrice = this.roundNumber.transform(this.articleForm.value.costPrice * this.articleForm.value.markupPercentage / 100);
                    this.articleForm.value.salePrice = this.articleForm.value.costPrice + this.articleForm.value.markupPrice;
                }
                break;
            case 'markupPercentage':
                if (!(this.articleForm.value.basePrice === 0 && this.articleForm.value.salePrice !== 0)) {
                    this.articleForm.value.markupPrice = this.roundNumber.transform(this.articleForm.value.costPrice * this.articleForm.value.markupPercentage / 100);
                    this.articleForm.value.salePrice = this.articleForm.value.costPrice + this.articleForm.value.markupPrice;
                }
                break;
            case 'markupPrice':
                if (!(this.articleForm.value.basePrice === 0 && this.articleForm.value.salePrice !== 0)) {
                    this.articleForm.value.markupPercentage = this.roundNumber.transform(this.articleForm.value.markupPrice / this.articleForm.value.costPrice * 100);
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
                    this.articleForm.value.markupPercentage = this.roundNumber.transform(this.articleForm.value.markupPrice / this.articleForm.value.costPrice * 100);
                }
                break;
            default:
                break;
        }

        this.articleForm.value.basePrice = this.roundNumber.transform(this.articleForm.value.basePrice);
        this.articleForm.value.costPrice = this.roundNumber.transform(this.articleForm.value.costPrice);
        this.articleForm.value.markupPercentage = this.roundNumber.transform(this.articleForm.value.markupPercentage);
        this.articleForm.value.markupPrice = this.roundNumber.transform(this.articleForm.value.markupPrice);
        this.articleForm.value.salePrice = this.roundNumber.transform(this.articleForm.value.salePrice);

        this.article = this.articleForm.value;
        this.setValuesForm();

    }

    public loadPosDescription(): void {
        if (this.articleForm.value.posDescription === '') {
            const slicePipe = new SlicePipe();
            this.articleForm.value.posDescription = slicePipe.transform(this.articleForm.value.description, 0, 20);
            this.article = this.articleForm.value;
            this.setValuesForm();
        }
    }

    public setValuesForm(): void {

        if (!this.article._id) { this.article._id = ''; }
        if (!this.article.code) { this.article.code = this.padString(1, this.config.article.code.validators.maxLength); }
        if (!this.article.codeSAT) { this.article.codeSAT = ''; }

        let currency;
        if (!this.article.currency) {
            currency = null;
        } else {
            if (this.article.currency._id) {
                currency = this.article.currency._id;
            } else {
                currency = this.article.currency;
            }
        }

        let make;
        if (!this.article.make) {
            make = null;
        } else {
            make = this.article.make;
        }

        let providers;
        if (!this.article.providers || this.article.providers.length === 0) {
            providers = null;
        } else {
            if (this.article.providers[0]._id) {
                providers = this.article.providers[0]._id;
            } else {
                providers = this.article.providers;
            }
        }

        let classification;
        if (!this.article.classification) {
            classification = null;
        } else {
            if (this.article.classification[0]._id) {
                classification = this.article.classification[0]._id;
            } else {
                classification = this.article.classification;
            }
        }

        if (!this.article.description) { this.article.description = ''; }
        if (!this.article.posDescription) { this.article.posDescription = ''; }
        if (!this.article.basePrice) { this.article.basePrice = 0.00; }
        if (!this.article.costPrice) { this.article.costPrice = 0.00; }
        if (!this.article.markupPercentage) { this.article.markupPercentage = 0.00; }
        if (!this.article.markupPrice) { this.article.markupPrice = 0.00; }
        if (!this.article.salePrice) { this.article.salePrice = 0.00; }

        let unitOfMeasurement;
        if (!this.article.unitOfMeasurement) {
            unitOfMeasurement = null;
        } else {
            if (this.article.unitOfMeasurement._id) {
                unitOfMeasurement = this.article.unitOfMeasurement._id;
            } else {
                unitOfMeasurement = this.article.unitOfMeasurement;
            }
        }

        if (!this.article.quantityPerMeasure) { this.article.quantityPerMeasure = 1; }
        if (!this.article.observation) { this.article.observation = ''; }
        if (!this.article.barcode) { this.article.barcode = ''; }
        if (!this.article.printIn) { this.article.printIn = ArticlePrintIn.Counter; }
        if (!this.article.allowPurchase === undefined) { this.article.allowPurchase = true; }
        if (!this.article.allowSale === undefined) { this.article.allowSale = true; }
        if (!this.article.allowSaleWithoutStock === undefined) { this.article.allowSaleWithoutStock = false; }
        if (!this.article.ecommerceEnabled === undefined) { this.article.ecommerceEnabled = false; }
        if (!this.article.posKitchen === undefined) { this.article.posKitchen = false; }
        if (!this.article.isWeigth === undefined) { this.article.isWeigth = false; }

        this.article.basePrice = this.roundNumber.transform(this.article.basePrice);
        this.article.costPrice = this.roundNumber.transform(this.article.costPrice);
        this.article.markupPercentage = this.roundNumber.transform(this.article.markupPercentage);
        this.article.markupPrice = this.roundNumber.transform(this.article.markupPrice, 3);
        this.article.salePrice = this.roundNumber.transform(this.article.salePrice);


        let lastPricePurchase
        if (this.lastPricePurchase && this.lastPricePurchase != 0) {
            lastPricePurchase = this.lastPricePurchase
        } else {
            lastPricePurchase = 0;
        }

        const values = {
            '_id': this.article._id,
            'code': this.article.code,
            'codeSAT': this.article.codeSAT,
            'currency': currency,
            'make': this.article.make,
            'description': this.article.description,
            'posDescription': this.article.posDescription,
            'basePrice': this.article.basePrice,
            'costPrice': this.article.costPrice,
            'markupPercentage': this.article.markupPercentage,
            'markupPrice': this.article.markupPrice,
            'salePrice': this.article.salePrice,
            'category': this.article.category,
            'quantityPerMeasure': this.article.quantityPerMeasure,
            'unitOfMeasurement': unitOfMeasurement,
            'observation': this.article.observation,
            'barcode': this.article.barcode,
            'printIn': this.article.printIn,
            'allowPurchase': this.article.allowPurchase,
            'allowSale': this.article.allowSale,
            'allowSaleWithoutStock': this.article.allowSaleWithoutStock,
            'isWeigth': this.article.isWeigth,
            'allowMeasure': this.article.allowMeasure,
            'ecommerceEnabled': this.article.ecommerceEnabled,
            'posKitchen': this.article.posKitchen,
            'favourite': this.article.favourite,
            'providers': providers,
            'lastPricePurchase': lastPricePurchase,
            'classification': classification
        };


        this.articleForm.patchValue(values);
    }

    public addArticle(): void {

        if (!this.readonly) {
            this.loading = true;
            this.loadPosDescription();

            this.article = this.articleForm.value;
            if (this.articleForm.value.make === '') {
                this.article.make = null
            }
            this.article.notes = this.notes;
            this.autocompleteCode();
            if (this.variants && this.variants.length > 0) {
                this.article.containsVariants = true;
            } else {
                this.article.containsVariants = false;
            }

            this.article.taxes = this.taxes;

            const pathLocation: string[] = this._router.url.split('/');
            if (pathLocation[2] === "productos") {
                this.article.type = Type.Final;
            } else if (pathLocation[2] === "variantes") {
                this.article.type = Type.Variant;
            } else if (pathLocation[2] === "ingredientes") {
                this.article.type = Type.Ingredient;
            } else {
                this.article.type = Type.Final;
            }

            if (this.operation === 'add' || this.operation === 'copy') {
                this.saveArticle();
            } else if (this.operation === 'update') {
                this.updateArticle();
            }
        }
    }

    public saveArticle(): void {

        this.loading = true;


        if (this.isValid()) {
            this._articleService.saveArticle(this.article, this.variants).subscribe(
                result => {
                    if (!result.article) {
                        this.loading = false;
                        if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
                    } else {
                        this.hasChanged = true;
                        this.article = result.article;
                        if (this.filesToUpload) {
                            this._articleService.makeFileRequest(this.article._id, this.filesToUpload)
                                .then(
                                    (result) => {
                                        let resultUpload;
                                        resultUpload = result;
                                        this.article.picture = resultUpload.article.picture;
                                        if (this.article.picture && this.article.picture !== 'default.jpg') {
                                            this.imageURL = Config.apiURL + 'get-image-article/' + this.article.picture;
                                        } else {
                                            this.imageURL = './../../../assets/img/default.jpg';
                                        }
                                        this.loading = false;
                                        this.showMessage('El producto se ha añadido con éxito.', 'success', false);
                                        if (this.userType === 'pos') {
                                            this.activeModal.close({ article: this.article });
                                        }
                                    },
                                    (error) => {
                                        this.loading = false;
                                        this.showMessage(error, 'danger', false);
                                    }
                                );
                        } else {
                            this.loading = false;
                            this.showMessage('El producto se ha añadido con éxito.', 'success', false);
                            if (this.userType === 'pos') {
                                this.activeModal.close({ article: this.article });
                            }
                        }
                    }
                },
                error => {
                    this.showMessage(error._body, 'danger', false);
                    this.loading = false;
                }
            );
        } else {
            this.loading = false;
        }
    }

    public updateArticle(): void {

        this.loading = true;

        if (this.isValid()) {

            this._articleService.updateArticle(this.article, this.variants).subscribe(
                result => {
                    if (!result.article) {
                        if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
                    } else {
                        this.hasChanged = true;
                        this.article = result.article;
                        if (this.filesToUpload) {
                            this._articleService.makeFileRequest(this.article._id, this.filesToUpload)
                                .then(
                                    (result) => {
                                        let resultUpload;
                                        resultUpload = result;
                                        this.article.picture = resultUpload.article.picture;
                                        if (this.article.picture && this.article.picture !== 'default.jpg') {
                                            this.imageURL = Config.apiURL + 'get-image-article/' + this.article.picture + "/" + Config.database;
                                        } else {
                                            this.imageURL = './../../../assets/img/default.jpg';
                                        }
                                        this.filesToUpload = null;
                                        this.loading = false;
                                        this.showMessage('El producto se ha actualizado con éxito.', 'success', false);
                                    },
                                    (error) => {
                                        this.showMessage(error, 'danger', false);
                                    }
                                );
                        } else {
                            this.filesToUpload = null;
                            this.loading = false;
                            this.showMessage('El producto se ha actualizado con éxito.', 'success', false);
                        }
                    }
                    this.loading = false;
                },
                error => {
                    this.showMessage(error._body, 'danger', false);
                    this.loading = false;
                }
            );
        } else {
            this.loading = false;
        }
    }

    public deleteArticle(): void {

        this.loading = true;

        this._articleService.deleteArticle(this.article._id).subscribe(
            result => {
                if (!result.article) {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                } else {
                    this.activeModal.close('delete_close');
                }
                this.loading = false;
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public isValid(): boolean {

        let valid: boolean = true;

        if (this.article.make && typeof this.article.make !== 'object') {
            this.showMessage("Debe seleccionar una marca valida", "danger", true)
            this.articleForm.value.make = null;
            valid = false
        }

        if (typeof this.article.category !== 'object') {
            this.showMessage("Debe seleccionar una categoría valida", "danger", true)
            valid = false
        }

        return valid;
    }

    public cleanForm() {
        this.article = new Article();
        this.taxes = new Array();
        this.otherFields = new Array();
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

    public addArticleTaxes(articleTaxes: Taxes[]): void {
        this.taxes = articleTaxes;
        this.updatePrices('taxes');
    }

    public addArticleFields(otherFields: ArticleFields[]): void {
        this.updatePrices('otherFields');
    }

    public addStock(articleStock: ArticleStock): void {
        this.articleStock = articleStock;
    }

    public manageVariants(variants: Variant[]): void {
        this.variants = variants;
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