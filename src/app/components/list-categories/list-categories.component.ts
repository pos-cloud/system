import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Category } from './../../models/category';
import { CategoryService } from './../../services/category.service';

import { AddCategoryComponent } from './../../components/add-category/add-category.component';
import { UpdateCategoryComponent } from './../../components/update-category/update-category.component';
import { DeleteCategoryComponent } from './../../components/delete-category/delete-category.component';

@Component({
  selector: 'app-list-categories',
  templateUrl: './list-categories.component.html',
  styleUrls: ['./list-categories.component.css']
})

export class ListCategoriesComponent implements OnInit {

  private categories: Category[];
  private areCategoriesEmpty: boolean = true;
  private alertMessage: any;
  private userType: string;
  private orderTerm: string[] = ['description'];
  private filters: boolean = false;
  @Output() eventAddItem: EventEmitter<Category> = new EventEmitter<Category>();

  constructor(
    private _categoryService: CategoryService,
    private _router: Router,
    private _modalService: NgbModal
  ) { }

  ngOnInit(): void {
    
    this._router.events.subscribe((data:any) => { 
      let pathLocation: string;
      pathLocation = data.url.split('/');
      this.userType = pathLocation[1];
    });
    this.getCategories();
  }

  private getBadge(term: string): boolean {

    return true;
  }

  private getCategories(): void {  

    this._categoryService.getCategories().subscribe(
        result => {
          this.categories = result.categories;
          if(!this.categories) {
            this.alertMessage = "Error al traer los rubros. Error en el servidor.";
            this.areCategoriesEmpty = true;
          } else if(this.categories.length !== 0){
             this.areCategoriesEmpty = false;
          } else {
            this.areCategoriesEmpty = true;
          }
        },
        error => {
          this.alertMessage = error;
          if(!this.alertMessage) {
            this.alertMessage = "Error en la petición.";
          }
        }
      );
   }

  private orderBy (term: string): void {

    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = "-"+term;  
    } else {
      this.orderTerm[0] = term; 
    }
  }
  
  private openModal(op: string, category:Category): void {

      let modalRef;
      switch(op) {
        case 'add' :
          modalRef = this._modalService.open(AddCategoryComponent, { size: 'lg' }).result.then((result) => {
            this.getCategories();
          }, (reason) => {
            this.getCategories();
          });
          break;
        case 'update' :
            modalRef = this._modalService.open(UpdateCategoryComponent, { size: 'lg' })
            modalRef.componentInstance.category = category;
            modalRef.result.then((result) => {
              if(result === 'save_close') {
                this.getCategories();
              }
            }, (reason) => {
              
            });
          break;
        case 'delete' :
            modalRef = this._modalService.open(DeleteCategoryComponent, { size: 'lg' })
            modalRef.componentInstance.category = category;
            modalRef.result.then((result) => {
              if(result === 'delete_close') {
                this.getCategories();
              }
            }, (reason) => {
              
            });
          break;
        default : ;
      }
    };

    private addItem(categorySelected) {
      this.eventAddItem.emit(categorySelected);
    }
}
