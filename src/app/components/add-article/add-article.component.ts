import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { SlicePipe } from '@angular/common'; 

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Article, ArticleType } from './../../models/article';
import { Make } from './../../models/make';
import { Category } from './../../models/category';

import { ArticleService } from './../../services/article.service';
import { MakeService } from './../../services/make.service';
import { CategoryService } from './../../services/category.service';

import { Config } from './../../app.config';

@Component({
  selector: 'app-add-article',
  templateUrl: './add-article.component.html',
  styleUrls: ['./add-article.component.css'],
  providers: [NgbAlertConfig]
})

export class AddArticleComponent  implements OnInit {

  public article: Article;
  public articleForm: FormGroup;
  public makes: Make[] = new Array();
  public categories: Category[] = new Array();
  public types: ArticleType[] = [ArticleType.Bar, ArticleType.Kitchen, ArticleType.Counter];
  public alertMessage: string = "";
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public resultUpload;
  public apiURL = Config.apiURL;

  public formErrors = {
    'code': "1",
    'make': '',
    'description': '',
    'posDescription': '',
    'salePrice': 0.00,
    'category': ''
  };

  public validationMessages = {
    'code': {
      'required':       'Este campo es requerido.',
      'maxlength':      'No puede exceder los 5 carácteres.'
    },
    'make': {
      'required':       'Este campo es requerido.'
    },
    'description': {
      'required':       'Este campo es requerido.'
    },
    'posDescription': {
      'maxlength':      'No puede exceder los 10 carácteres.'
    },
    'salePrice': {
      'required':       'Este campo es requerido.'
    },
    'category': {
      'required':       'Este campo es requerido.'
    }
  };

  constructor(
    public _articleService: ArticleService,
    public _makeService: MakeService,
    public _categoryService: CategoryService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.article = new Article ();
    this.buildForm();
    this.getMakes();
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
          Validators.required
        ]
      ],
      'description': [this.article.description, [
          Validators.required
        ]
      ],
      'posDescription': [this.article.posDescription, [
          Validators.maxLength(10)
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
      'type': [this.article.type, [
        ]
      ]
    });

    this.articleForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

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

  public getLastArticle(): void {  

    this.loading = true;
    
    this._articleService.getLastArticle().subscribe(
        result => {
          let code = "1";
          let category: Category = new Category();
          let make: Make  = new Make();
          if(result.articles){
            if(result.articles[0] !== undefined) {
              if (!isNaN(parseInt(result.articles[0].code))) {
                code = (parseInt(result.articles[0].code) + 1) + "";
              } else {
                code = "1";
              }
            }
          }
          if(this.categories[0] !== undefined) {
            category = this.categories[0];
          }
          if(this.makes[0] !== undefined) {
            make = this.makes[0];
          }
          this.articleForm.setValue({
            '_id': '',
            'code': code,
            'make': make,
            'description': '',
            'posDescription': '',
            'salePrice': 0.00,
            'category': category,
            'observation': '',
            'barcode': '',
            'type': ArticleType.Counter
          });
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
          if(!result.makes) {
            this.showMessage(result.message, "info", true);
            this.loading = false;
          } else {
            this.hideMessage();
            this.loading = false;
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
          if(!result.categories) {
            this.showMessage(result.message, "info", true);
            this.loading = false;
          } else {
            this.hideMessage();
            this.loading = false;
            this.categories = result.categories;
            this.getLastArticle();
          }
        },
        error => {
          this.showMessage(error._body, "danger", false);
          this.loading = false;
        }
      );
   }

  public addArticle(): void {
    
    if(this.articleForm.value.posDescription === "") {
      let slicePipe = new SlicePipe();
      this.articleForm.value.posDescription = slicePipe.transform(this.articleForm.value.description,0,10);
    }
    this.article = this.articleForm.value;
    this.saveArticle();
  }

  public saveArticle(): void {
    
    this.loading = true;
    
    this._articleService.saveArticle(this.article).subscribe(
    result => {
        if (!result.article) {
          this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.article = result.article;
          if (this.filesToUpload) {
            this._articleService.makeFileRequest(this.article._id, this.filesToUpload)
              .then(
              (result) => {
                this.resultUpload = result;
                this.article.picture = this.resultUpload.filename;
                this.showMessage("El artículo se ha añadido con éxito.", "success", false);
                this.article = new Article();
                this.filesToUpload = null;
                this.buildForm();
                this.getLastArticle();
              },
              (error) => {
                this.showMessage(error, "danger", false);
              }
              );
          } else {
            this.showMessage("El artículo se ha añadido con éxito.", "success", false);
            this.article = new Article();
            this.filesToUpload = null;
            this.buildForm();
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

  public filesToUpload: Array <File>;

  public fileChangeEvent(fileInput: any): void {

    this.filesToUpload = <Array<File>>fileInput.target.files;
  }

  public makeFileRequest(files: Array<File>) {
    
    let idArticulo = this.article._id;
    return new Promise(function(resolve, reject){
      var formData:any = new FormData();
      var xhr = new XMLHttpRequest();

      for(var i = 0; i < files.length ; i++){
        formData.append('image',files[i], files[i].name);
      }
      xhr.onreadystatechange = function(){
        if(xhr.readyState == 4){
          if(xhr.status == 200){
            resolve(JSON.parse(xhr.response));
          }else {
            reject(xhr.response);
          }
        }
      }
      
      xhr.open('POST', Config.apiURL + 'upload-image/'+idArticulo,true);
      xhr.send(formData);
    });
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
