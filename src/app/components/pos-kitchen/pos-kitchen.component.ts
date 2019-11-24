import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { MovementOfArticleService } from 'app/services/movement-of-article.service';
import { MovementOfArticle, MovementOfArticleStatus } from 'app/models/movement-of-article';
import { Config } from 'app/app.config';

@Component({
  selector: 'app-pos-kitchen',
  templateUrl: './pos-kitchen.component.html',
  styleUrls: ['./pos-kitchen.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None
})

export class PosKitchenComponent {

  public alertMessage: string = '';
  public loading: boolean = false;
  public movementsOfArticles: MovementOfArticle[];
  public movementOfArticle: MovementOfArticle;
  public database: string = Config.database;
  public apiURL = Config.apiURL;
  public productionStarted: boolean = false;

  constructor(
    public _router: Router,
    public alertConfig: NgbAlertConfig,
    private _movementOfArticleService: MovementOfArticleService,
  ) { }

  public async ngOnInit() {
    this.getMovementOfArticleReady();
    this.initInterval();
  }

  public initInterval(): void {
    setInterval(() => {
      if(this.productionStarted && !this.movementOfArticle && !this.loading) {
        this.startProduction();
      }
    }, 5000);
  }

  public getMovementOfArticleReady(): void {
    try {
      this.movementsOfArticles = JSON.parse(sessionStorage.getItem('kitchen_movementsOfArticles'));
      this.movementOfArticle = JSON.parse(localStorage.getItem('kitchen_movementOfArticle'));
      if(this.movementOfArticle) this.productionStarted = true;
    } catch(err) {}
  }

  public async startProduction() {

    this.productionStarted = true;

    this.searchOrderToPreparing();
  }

  public async searchOrderToPreparing() {

    await this.updateMovementOfArticleByWhere({
      $or: [ { status: MovementOfArticleStatus.Pending }, { status: MovementOfArticleStatus.Preparing } ],
      operationType: { $ne: 'D' }
    }, {
      status: MovementOfArticleStatus.LastOrder,
      $inc: { printed: 1 }
    },
    {
      creationDate: 1
    }).then(
      async movementOfArticle => {
        if(movementOfArticle) {
          if(movementOfArticle.printed === movementOfArticle.amount) {
            this.movementOfArticle = movementOfArticle;
            await this.getMovementOfArticleToPreparing().then(
              movementOfArticle => {
                if(movementOfArticle) {
                  this.movementOfArticle = movementOfArticle;
                  localStorage.setItem('kitchen_movementOfArticle', JSON.stringify(this.movementOfArticle));
                }
              }
            );
          } else if(movementOfArticle.printed < movementOfArticle.amount) {
            this.movementOfArticle = movementOfArticle;
            this.movementOfArticle.status = MovementOfArticleStatus.Preparing;
            await this.updateMovementOfArticle().then(
              async movementOfArticle => {
                if(movementOfArticle) {
                  this.movementOfArticle = movementOfArticle;
                  await this.getMovementOfArticleToPreparing().then(
                    movementOfArticle => {
                      if(movementOfArticle) {
                        this.movementOfArticle = movementOfArticle;
                        localStorage.setItem('kitchen_movementOfArticle', JSON.stringify(this.movementOfArticle));
                      }
                    }
                  );
                }
              }
            );
          } else {
            this.movementOfArticle.status = MovementOfArticleStatus.Ready;
            await this.updateMovementOfArticle().then(
              movementOfArticle => {
                if(movementOfArticle) {
                  this.startProduction();
                }
              }
            );
          }
        }
      }
    );
  }

  public async stopProduction() {
    if(this.movementOfArticle) {
      await this.changeStatusToPending().then(
        movementOfArticle => {
          if(movementOfArticle) {
            this.movementOfArticle = null;
            localStorage.removeItem('kitchen_movementOfArticle');
          }
        }
      );
    } else {
      this.loading = false;
    }
    this.productionStarted = false;
  }

  public finishOrder(): void {
    
    if(!this.movementsOfArticles) this.movementsOfArticles = new Array();
    // AGREGAMOS AL PRINCIPIO DEL LISTADO DE PRODUCIDOS Y SOLO GUARDAMOS LOS 3 PRIMEROS
    this.movementsOfArticles.unshift(this.movementOfArticle);
    this.movementsOfArticles = this.movementsOfArticles.slice(0, 3);
    sessionStorage.setItem('kitchen_movementsOfArticles', JSON.stringify(this.movementsOfArticles));
    this.movementOfArticle = null;
    localStorage.removeItem('kitchen_movementOfArticle');
    this.startProduction();
  }

  public getMovementOfArticleToPreparing(): Promise<MovementOfArticle> {

    return new Promise<MovementOfArticle>((resolve, reject) => {
      
      this.loading = true;

      let project = {
        description: 1,
        notes: 1,
        status: 1,
        amount: 1,
        printed: 1,
        'article._id': 1,
        'article.picture': 1
      };

      let match = { _id: this.movementOfArticle._id };
                  
      this._movementOfArticleService.getMovementsOfArticlesV2(
          project, // PROJECT
          match, // MATCH
          {}, // SORT
          {}, // GROUP
          1, // LIMIT
          0 // SKIP
      ).subscribe(
        result => {
          this.loading = false;
          if(!result.movementsOfArticles) {
            if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
            resolve(null);
          } else {
            resolve(result.movementsOfArticles[0]);
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

  public updateMovementOfArticleByWhere(where: {}, set: {}, sort: {}): Promise<MovementOfArticle> {

    return new Promise<MovementOfArticle>((resolve, reject) => {
      
      this.loading = true;

      this._movementOfArticleService.updateMovementOfArticleByWhere(where, set, sort).subscribe(
        result => {
          this.loading = false;
          if (!result.movementOfArticle) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.movementOfArticle);
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

  public async viewArticle(movementOfArticle: MovementOfArticle) {
    if(this.movementOfArticle) {
      await this.changeStatusToPending().then(
        movementOfArticle => {
          if(movementOfArticle) {
            this.movementOfArticle = null;
            localStorage.removeItem('kitchen_movementOfArticle');
          }
        }
      );
    }
    this.movementOfArticle = movementOfArticle;
  }

  public async changeStatusToPending() {
    return new Promise(async (resolve, reject) => {
      this.movementOfArticle.status = MovementOfArticleStatus.Pending;
      await this.updateMovementOfArticle().then(
        movementOfArticle => {
          resolve(movementOfArticle);
        }
      );
    });
  }

  public async changeStatusToReady() {
    
    return new Promise(async (resolve, reject) => {

      if(!this.loading) {

        if(this.movementOfArticle.status !== MovementOfArticleStatus.Ready) {
          // PASAMOS A ÚLTIMA ORDEN PARA RESERVAR POSIBLE LA INFORMACIÓN Y OBTENER EL ÚLTIMO ESTADO
          await this.updateMovementOfArticleByWhere({ _id: this.movementOfArticle._id }, { status: MovementOfArticleStatus.LastOrder }, {}).then(
            async movementOfArticle => {
              if(movementOfArticle) {
                this.movementOfArticle = movementOfArticle;
                // SI LA CANTIDAD PRODUCIDA ES IGUAL A LA CANTIDAD DE ARTICULOS PASA A ESTAR LISTO
                if(this.movementOfArticle.printed >= this.movementOfArticle.amount) {
                  this.movementOfArticle.status = MovementOfArticleStatus.Ready;
                } else {
                  this.movementOfArticle.status = MovementOfArticleStatus.Preparing;
                }
                this.updateMovementOfArticle().then(
                  movementOfArticle => {
                    if(movementOfArticle) {
                      this.movementOfArticle = movementOfArticle;
                      this.finishOrder();
                    }
                  }
                );
              }
            }
          );
        } else {
          this.movementOfArticle = null;
          localStorage.removeItem('kitchen_movementOfArticle');
          this.startProduction();
          resolve(this.movementOfArticle);
        }
      } else {
        resolve(null);
      }
    });
  }

  public updateMovementOfArticle(): Promise<MovementOfArticle> {

    return new Promise<MovementOfArticle>((resolve, reject) => {
      
      this.loading = true;

      this._movementOfArticleService.updateMovementOfArticle(this.movementOfArticle).subscribe(
        result => {
          this.loading = false;
          if (!result.movementOfArticle) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.movementOfArticle);
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

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage():void {
    this.alertMessage = '';
  }
}