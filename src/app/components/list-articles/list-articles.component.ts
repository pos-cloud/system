import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { Article } from './../../models/article';
import { Category } from './../../models/category';

import { ArticleService } from './../../services/article.service';

import { AddArticleComponent } from './../../components/add-article/add-article.component';
import { UpdateArticleComponent } from './../../components/update-article/update-article.component';
import { DeleteArticleComponent } from './../../components/delete-article/delete-article.component';
import { ImportComponent } from './../../components/import/import.component';

import { Config } from './../../app.config';

@Component({
  selector: 'app-list-articles',
  templateUrl: './list-articles.component.html',
  styleUrls: ['./list-articles.component.css'],
  providers: [NgbAlertConfig]
})

export class ListArticlesComponent implements OnInit {

  public articles: Article[] = new Array();
  public areArticlesEmpty: boolean = true;
  public alertMessage: any;
  public userType: string;
  public orderTerm: string[] = ['code'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  @Output() eventAddItem: EventEmitter<Article> = new EventEmitter<Article>();
  @Input() areArticlesVisible: boolean = true;
  @Input() filterCategory: string;
  public apiURL = Config.apiURL;

  constructor(
    public _articleService: ArticleService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) { 
    alertConfig.type = 'danger';
    alertConfig.dismissible = true;
    if(this.filterCategory === undefined) {
      this.filterCategory = "";
    }
  }

  ngOnInit(): void {
    
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getArticles();
  }

  public getArticles(): void {  

    this._articleService.getArticles().subscribe(
        result => {
					if(!result.articles) {
						this.alertMessage = result.message;
            this.alertConfig.type = 'danger';
            this.articles = null;
            this.areArticlesEmpty = true;
					} else {
            this.alertMessage = null;
            this.articles = result.articles;
            this.areArticlesEmpty = false;
          }
				},
				error => {
					this.alertMessage = error._body;
					if(!this.alertMessage) {
						this.alertMessage = "Ha ocurrido un error en el servidor";
					}
				}
      );
   }

  public orderBy (term: string, property?: string): void {

    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = "-"+term;  
    } else {
      this.orderTerm[0] = term; 
    }
    this.propertyTerm = property;
  }

  public refresh(): void {
    this.getArticles();
  }
  
  public openModal(op: string, article:Article): void {

      let modalRef;
      switch(op) {
        case 'add' :
          modalRef = this._modalService.open(AddArticleComponent, { size: 'lg' }).result.then((result) => {
            this.getArticles();
          }, (reason) => {
            this.getArticles();
          });
          break;
        case 'update' :
            modalRef = this._modalService.open(UpdateArticleComponent, { size: 'lg' });
            modalRef.componentInstance.article = article;
            modalRef.result.then((result) => {
              if(result === 'save_close') {
                this.getArticles();
              }
            }, (reason) => {
              
            });
          break;
        case 'delete' :
            modalRef = this._modalService.open(DeleteArticleComponent, { size: 'lg' });
            modalRef.componentInstance.article = article;
            modalRef.result.then((result) => {
              if(result === 'delete_close') {
                this.getArticles();
              }
            }, (reason) => {
              
            });
          break;
        case 'import' :
            modalRef = this._modalService.open(ImportComponent, { size: 'lg' });
            modalRef.result.then((result) => {
              if(result === 'import_close') {
                this.getArticles();
              }
            }, (reason) => {
              
            });
          break;
        default : ;
      }
    };

    public addItem(articleSelected) {
      this.eventAddItem.emit(articleSelected);
    }
}
