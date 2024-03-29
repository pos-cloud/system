import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef, HostListener } from "@angular/core";
import { Router } from "@angular/router";
import {
  NgbModal,
  NgbAlertConfig,
  NgbActiveModal,
} from "@ng-bootstrap/ng-bootstrap";
import { Article, Type, attributes } from "../article";
import { Config } from "../../../app.config";
import { ArticleService } from "../article.service";
import { AddArticleComponent } from "../article/add-article.component";
import { ImportComponent } from "../../import/import.component";
import { RoundNumberPipe } from "../../../main/pipes/round-number.pipe";
import { Printer } from "../../printer/printer";
import { PrinterService } from "../../printer/printer.service";
import { UpdateArticlePriceComponent } from "../update-article-price/update-article-price.component";
import { AuthService } from "app/components/login/auth.service";
import { User } from "app/components/user/user";
import { PrintPriceListComponent } from "../../print/print-price-list/print-price-list.component";
import { ConfigService } from "app/components/config/config.service";
import { Claim, ClaimPriority, ClaimType } from "app/layout/claim/claim";
import { ClaimService } from "app/layout/claim/claim.service";
import { ExportExcelComponent } from "../../export/export-excel/export-excel.component";
import { CurrencyPipe } from "@angular/common";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { UserService } from "app/components/user/user.service";
import { PriceList } from "app/components/price-list/price-list";
import { PriceListService } from "app/components/price-list/price-list.service";
import { ListPriceListsComponent } from "../../price-list/list-price-lists/list-price-lists.component";
import { Subscription } from "rxjs";
import { TaxService } from "app/components/tax/tax.service";
import { Tax } from "app/components/tax/tax";
import { first } from "rxjs/operators";
import { MeliService } from "app/main/services/meli.service";
import * as printJS from "print-js";


@Component({
  selector: "app-list-articles",
  templateUrl: "./list-articles.component.html",
  styleUrls: ["./list-articles.component.scss"],
  providers: [NgbAlertConfig, RoundNumberPipe],
  encapsulation: ViewEncapsulation.None,
})
export class ListArticlesComponent implements OnInit {

  @HostListener('window:afterprint')
  onAfterPrint() {
    this.pdfSrc = null;
  }

  public identity: User;
  public title: string;
  public priceLists: PriceList[] = new Array();
  public priceListId: string;
  public alertMessage: string = "";
  public userType: string = "";
  public loading: boolean = false;
  public apiURL = Config.apiURL;
  public pdfSrc: string | any;
  public loadingPdf: boolean = false;
  @ViewChild('pdfFrame') pdfFrame!: ElementRef;
  public timezone = "-03:00";
  public itemsPerPage = 10;
  @ViewChild(ExportExcelComponent)
  exportExcelComponent: ExportExcelComponent;
  public roundNumber = new RoundNumberPipe();
  public articleType: Type;
  public currentPage: number = 0;
  public database: string;
  private subscription: Subscription = new Subscription();
  public filters: any[];
  public config: Config;
  public items: any[] = new Array();
  public article: Article
  public listTitle: string;
  public orderTerm: string[] = ["description"];
  public totalItems: number = 0;
  private roundNumberPipe: RoundNumberPipe = new RoundNumberPipe();
  private currencyPipe: CurrencyPipe = new CurrencyPipe("es-Ar");
  public sort = {
    code: 1,
  };
  public columns = attributes;
  public articleHistoryId: string;
  public showPdf = true;

  constructor(
    private _articleService: ArticleService,
    private _router: Router,
    private _modalService: NgbModal,
    private _printerService: PrinterService,
    private _priceList: PriceListService,
    public _meliService: MeliService,
    private _userService: UserService,
    private _authService: AuthService,
    private _taxService: TaxService,
    private _configService: ConfigService,
    private _claimService: ClaimService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) {
    this.filters = new Array();
    for (let field of this.columns) {
      if (field.defaultFilter) {
        this.filters[field.name] = field.defaultFilter;
      } else {
        this.filters[field.name] = "";
      }
    }
  }

  async ngOnInit() {
    console.log("entro")
    this.getPriceList();
    let pathLocation: string[] = this._router.url.split("/");
    this.userType = pathLocation[1];
    this.articleHistoryId = pathLocation[3];
    this.listTitle = pathLocation[2].charAt(0).toUpperCase() + pathLocation[2].slice(1);
    this._authService.getIdentity.pipe(first()).subscribe((identity) => {
      this.identity = identity;
    });

    await this._configService.getConfig.pipe(first()).subscribe((config) => {
      this.config = config;
    });

    this.database = localStorage.getItem('company');
    if ("Variantes" === this.listTitle) {
      this.articleType = Type.Variant;
      this.title = "Listado de Variantes";
    } else if ("Ingredientes" === this.listTitle) {
      this.articleType = Type.Ingredient;
      this.title = "Listado de Ingredientes";
    } else {
      // ENTRA CUANDO SE HACE UNA TRANSACCIÓN O EN LA TABLA
      this.articleType = Type.Final;
      this.title = "Listado de Productos";
    }

    if (this.articleHistoryId) this.title = "Historial del producto";
    this.initDragHorizontalScroll();
    this.getItems();
  }

  public initDragHorizontalScroll(): void {
    const slider = document.querySelector(".table-responsive");
    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener("mousedown", (e) => {
      isDown = true;
      slider.classList.add("active");
      startX = e["pageX"] - slider["offsetLeft"];
      scrollLeft = slider.scrollLeft;
    });
    slider.addEventListener("mouseleave", () => {
      isDown = false;
      slider.classList.remove("active");
    });
    slider.addEventListener("mouseup", () => {
      isDown = false;
      slider.classList.remove("active");
    });
    slider.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e["pageX"] - slider["offsetLeft"];
      const walk = (x - startX) * 0.7; //scroll-fast
      slider.scrollLeft = scrollLeft - walk;
    });
  }

  public getItems(): void {
    this.loading = true;

    // FILTRAMOS LA CONSULTA
    let match: any = `{`;
    for (let i = 0; i < this.columns.length; i++) {
      if (this.columns[i].visible || this.columns[i].required) {
        let value = this.filters[this.columns[i].name];
        if (value && value != "") {
          if (this.columns[i].defaultFilter) {
            match += `"${this.columns[i].name}": ${this.columns[i].defaultFilter}`;
          } else {
            match += `"${this.columns[i].name}": { "$regex": "${value}", "$options": "i"}`;
          }
          if (i < this.columns.length - 1) {
            match += ",";
          }
        }
      }
    }

    if (match.charAt(match.length - 1) === ",")
      match = match.substring(0, match.length - 1);
    match += `}`;
    match = JSON.parse(match);

    if (this.userType === "admin") {
      match["type"] = this.articleType;
    }

    // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
    let project: any = `{`;
    let j = 0;
    for (let i = 0; i < this.columns.length; i++) {
      if (this.columns[i].visible || this.columns[i].required) {
        if (j > 0) {
          project += `,`;
        }
        j++;
        if (!this.columns[i].project) {
          if (this.columns[i].datatype !== "string") {
            if (this.columns[i].datatype === "date") {
              project += `"${this.columns[i].name}": { "$dateToString": { "date": "$${this.columns[i].name}", "format": "%d/%m/%Y", "timezone": "${this.timezone}" }}`;
            } else {
              project += `"${this.columns[i].name}": { "$toString" : "$${this.columns[i].name}" }`;
            }
          } else {
            project += `"${this.columns[i].name}": 1`;
          }
        } else {
          project += `"${this.columns[i].name}": ${this.columns[i].project}`;
        }
      }
    }
    project += `}`;

    project = JSON.parse(project);

    // AGRUPAMOS EL RESULTADO
    let group = {
      _id: null,
      count: { $sum: 1 },
      items: { $push: "$$ROOT" },
    };

    let page = 0;
    if (this.currentPage != 0) {
      page = this.currentPage - 1;
    }
    let skip = !isNaN(page * this.itemsPerPage) ? page * this.itemsPerPage : 0; // SKIP
    let limit = this.itemsPerPage;

    if (!this.articleHistoryId) {
      this.subscription.add(
        this._articleService
          .getArticlesV2(
            project, // PROJECT
            match, // MATCH
            this.sort, // SORT
            group, // GROUP
            limit, // LIMIT
            skip // SKIP
          )
          .subscribe(
            (result) => {
              this.loading = false;
              if (result && result[0] && result[0].items) {
                if (this.itemsPerPage === 0) {
                  this.exportExcelComponent.items = result[0].items;
                  this.exportExcelComponent.export();
                  this.itemsPerPage = 10;
                  this.getItems();
                } else {
                  this.items = result[0].items;
                  this.totalItems = result[0].count;
                }
              } else {
                this.items = new Array();
                this.totalItems = 0;
              }
            },
            (error) => {
              this.showMessage(error._body, "danger", false);
              this.loading = false;
              this.totalItems = 0;
            }
          )
      );
    } else {
      for (let column of this.columns) {
        if (column.name === "creationDate") column.visible = true;
      }
      this.subscription.add(
        this._articleService
          .getHArticles(
            {
              ...project,
              harticle: 1
            }, // PROJECT
            {
              ...match,
              harticle: { $oid: this.articleHistoryId }
            }, // MATCH
            this.sort, // SORT
            group, // GROUP
            limit, // LIMIT
            skip // SKIP
          )
          .subscribe(
            (result) => {
              this.loading = false;
              if (result && result[0] && result[0].items) {
                if (this.itemsPerPage === 0) {
                  this.exportExcelComponent.items = result[0].items;
                  this.exportExcelComponent.export();
                  this.itemsPerPage = 10;
                  this.getItems();
                } else {
                  this.items = result[0].items;
                  this.totalItems = result[0].count;
                }
              } else {
                this.items = new Array();
                this.totalItems = 0;
              }
            },
            (error) => {
              this.showMessage(error._body, "danger", false);
              this.loading = false;
              this.totalItems = 0;
            }
          )
      );
    }
  }

  public exportItems(): void {
    this.itemsPerPage = 0;
    this.getItems();
  }

  public getValue(item, column): any {
    let val: string = "item";
    let exists: boolean = true;
    let value: any = "";
    for (let a of column.name.split(".")) {
      val += "." + a;
      if (exists && !eval(val)) {
        exists = false;
      }
    }
    if (exists) {
      switch (column.datatype) {
        case "number":
          value = this.roundNumberPipe.transform(eval(val));
          break;
        case "currency":
          value = this.currencyPipe.transform(
            this.roundNumberPipe.transform(eval(val)),
            "USD",
            "symbol-narrow",
            "1.2-2"
          );
          break;
        case "percent":
          value = this.roundNumberPipe.transform(eval(val)) + "%";
          break;
        default:
          value = eval(val);
          break;
      }
    }
    return value;
  }

  public getColumnsVisibles(): number {
    let count: number = 0;
    for (let column of this.columns) {
      if (column.visible) {
        count++;
      }
    }
    return count;
  }

  public orderBy(term: string): void {
    if (this.sort[term]) {
      this.sort[term] *= -1;
    } else {
      this.sort = JSON.parse('{"' + term + '": 1 }');
    }

    this.getItems();
  }

  back() {
    let pathLocation: string[] = this._router.url.split("/");
    this._router.navigateByUrl(pathLocation[1] + '/' + pathLocation[2]);
  }

  public drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
  }

  public refresh(): void {
    this.getItems();
  }

  public pageChange(page): void {
    this.currentPage = page;
    this.getItems();
  }

  public selectArticle(articleSelected: Article): void {
    this.activeModal.close({ article: articleSelected });
  }

  public printArticle(article: Article) {
    this.loading = true;
    this._printerService.printArticle(article._id, 1,).subscribe(
      (res: Blob) => {
        if (res) {     
          const blobUrl = URL.createObjectURL(res);
          printJS(blobUrl);
          this.loading = false;
        } else {
          this.loading = false;
          this.showMessage('Error al cargar el PDF', 'danger', false);
        }
      },
      (error) => {
        this.loading = false;
        this.showMessage(error.message, 'danger', false);
      }
    );
  }

  public printLabels(articlesId: string[]) {
    this.loading = true;
    this._printerService.printLabels(articlesId).subscribe(
      (res: Blob) => {
        if (res) {     
          const blobUrl = URL.createObjectURL(res);
          printJS(blobUrl);
          this.loading = false;
        } else {
          this.loading = false;
          this.showMessage('Error al cargar el PDF', 'danger', false);
        }
      },
      (error) => {
        this.loading = false;
        this.showMessage(error.message, 'danger', false);
      }
    );
  }

  async openModal(op: string, article?: Article, type?: string) {
    let modalRef;
    switch (op) {
      case "view":
        modalRef = this._modalService.open(AddArticleComponent, {
          size: "lg",
          backdrop: "static",
        });
        modalRef.componentInstance.articleId = article._id;
        modalRef.componentInstance.readonly = true;
        modalRef.componentInstance.operation = "view";
        break;
      case "add":
        modalRef = this._modalService.open(AddArticleComponent, {
          size: "lg",
          backdrop: "static",
        });
        modalRef.componentInstance.operation = "add";
        modalRef.result.then(
          (result) => {
            this.getItems();
          },
          (reason) => {
            this.getItems();
          }
        );
        break;
      case "update":
        modalRef = this._modalService.open(AddArticleComponent, {
          size: "lg",
          backdrop: "static",
        });
        modalRef.componentInstance.articleId = article._id;
        modalRef.componentInstance.operation = "update";
        modalRef.result.then(
          (result) => {
            this.getItems();
          },
          (reason) => {
            this.getItems();
          }
        );
        break;
      case "delete":
        modalRef = this._modalService.open(AddArticleComponent, {
          size: "lg",
          backdrop: "static",
        });
        modalRef.componentInstance.articleId = article._id;
        modalRef.componentInstance.readonly = true;
        modalRef.componentInstance.operation = "delete";
        modalRef.result.then(
          (result) => {
            if (result === "delete_close") {
              this.getItems();
            }
          },
          (reason) => { }
        );
        break;
      case "print-label":
        this.printArticle(article);
        break;
      case "print-list":
        modalRef = this._modalService.open(PrintPriceListComponent);
        modalRef.result.then(
          (result) => {
            this.getItems();
          },
          (reason) => {
            this.getItems();
          }
        );
        break;
      case "price-lists":
        modalRef = this._modalService.open(ListPriceListsComponent, {
          size: "lg",
          backdrop: "static",
        });
        modalRef.result.then(
          (result) => {
            if (result && result.priceList) {
              this.priceListId = result.priceList;
              this.openModal("print-label", article);
            } else {
              this.openModal("print-label", article);
            }
          },
          (reason) => {
            this.getItems();
          }
        );
        break;
      case "update-prices":
        modalRef = this._modalService.open(UpdateArticlePriceComponent);
        modalRef.componentInstance.articles = this.items;
        modalRef.result.then(
          (result) => {
            this.getItems();
          },
          (reason) => {
            this.getItems();
          }
        );
        break;
      case "copy":
        modalRef = this._modalService.open(AddArticleComponent, {
          size: "lg",
          backdrop: "static",
        });
        modalRef.componentInstance.operation = "copy";
        modalRef.componentInstance.articleId = article._id;
        modalRef.result.then(
          (result) => {
            this.getItems();
          },
          (reason) => {
            this.getItems();
          }
        );
        break;
      case "history":
        if (article.type === Type.Variant) {
          this._router.navigateByUrl(`/admin/variantes/${article._id}`);
        } else {
          this._router.navigateByUrl(`/admin/productos/${article._id}`);
        }
        break;
      case "print-labels":
        const articlesId: string[] = this.items.map(objeto => objeto._id);
        this.printLabels(articlesId); 
        // let printer2 : Printer;
        // await this.getPrinters().then((printers) => {
        //     if (printers && printers.length > 0) {
        //       for (let printerAux of printers) {
        //         if (printerAux.printIn === PrinterPrintIn.Label) {
        //           printer2 = printerAux;
        //         }
        //       }
        //     }
        //   });
        //   if(printer2){
        //     if(printer2.fields && printer2.fields.length > 0){
        //       modalRef = this._modalService.open(
        //         PrintTransactionTypeComponent
        //       );
        //       modalRef.componentInstance.articles = this.items;
        //       modalRef.componentInstance.printerID = printer2._id;
        //       if (this.priceListId) {
        //         modalRef.componentInstance.priceListId = this.priceListId;
        //       }
        //     }else{
        //       modalRef = this._modalService.open(PrintComponent);
        //       modalRef.componentInstance.articles = this.items;
        //     }
        //   } else {
        //     this.showMessage(
        //         "Debe crear una impresora de tipo etiqueta con diseño",
        //         "danger",
        //         false
        //       );
        //   }
        break;
      case 'uploadFile':
          modalRef = this._modalService.open(ImportComponent, {
            size: 'lg',
            backdrop: 'static',
          });
          modalRef.componentInstance.model = 'articles'
          modalRef.componentInstance.title = 'Importar artículos'
          modalRef.result.then(
            (result) => {
              if (result === 'save_close') {
                this.getItems();
              }
            },
            (reason) => {},
          );
        
          break;
        default:
    }
  }

  public getPrinters(): Promise<Printer[]> {
    return new Promise<Printer[]>(async (resolve, reject) => {
      this.loading = true;

      this._printerService.getPrinters().subscribe(
        (result) => {
          this.loading = false;
          if (!result.printers) {
            if (result.message && result.message !== "")
              this.showMessage(result.message, "info", true);
            resolve(null);
          } else {
            resolve(result.printers);
          }
        },
        (error) => {
          this.loading = false;
          this.showMessage(error._body, "danger", false);
          resolve(null);
        }
      );
    });
  }

  public getTaxes(query?: string): Promise<Tax[]> {
    return new Promise<Tax[]>((resolve, reject) => {
      this._taxService.getTaxes(query).subscribe(
        (result) => {
          if (!result.taxes) {
            if (result.message && result.message !== "")
              this.showMessage(result.message, "info", true);
            resolve(null);
          } else {
            resolve(result.taxes);
          }
        },
        (error) => {
          this.showMessage(error._body, "danger", false);
          resolve(null);
        }
      );
    });
  }

  public getArticle(articleId: string): Promise<Article> {
    return new Promise<Article>((resolve, reject) => {
      this._articleService.getArticle(articleId).subscribe(
        (result) => {
          if (!result.article) {
            if (result.message && result.message !== "")
              this.showMessage(result.message, "info", true);
            resolve(null);
          } else {
            this.article = result.article
            resolve(result.article);
          }
        },
        (error) => {
          this.showMessage(error._body, "danger", false);
          resolve(null);
        }
      );
    });
  }

  public getPriceList(): void {
    this._priceList.getPriceLists().subscribe(
      (result) => {
        if (result && result.priceLists) {
          this.priceLists = result.priceLists;
        } else {
          this.priceLists = new Array();
        }
      },
      (error) => {
        this.showMessage(error._body, "danger", false);
      }
    );
  }

  public padNumber(n, length) {
    n = n.toString();
    while (n.length < length) n = "0" + n;
    return n;
  }

  public saveClaim(titulo: string, message: string): void {
    this.loading = true;

    let claim: Claim = new Claim();
    claim.description = message;
    claim.name = titulo;
    claim.priority = ClaimPriority.High;
    claim.type = ClaimType.Err;
    claim.listName = "ERRORES 500";

    this._claimService.saveClaim(claim).subscribe();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public showMessage(
    message: string,
    type: string,
    dismissible: boolean
  ): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = "";
  }
}
