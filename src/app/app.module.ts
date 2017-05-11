import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { NgbModule, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

//rutas
import { RoutingModule } from './app.routes';

//servicios
import { ArticleService } from './services/article.service';
import { WaiterService } from './services/waiter.service';
import { TableService } from './services/table.service';
import { CashBoxService } from './services/cash-box.service';
import { SaleOrderService } from './services/sale-order.service';
import { MovementOfArticleService } from "./services/movement-of-article.service";
import { UserService } from './services/user.service';
import { RoomService } from './services/room.service';
import { MakeService } from './services/make.service';

//componentes
import { HeaderComponent } from './components/header/header.component';
import { HomeComponent } from './components/home/home.component';
import { AppComponent } from './app.component';
import { ListArticlesComponent } from './components/list-articles/list-articles.component';
import { AddArticleComponent } from './components/add-article/add-article.component';
import { UpdateArticleComponent } from './components/update-article/update-article.component';
import { DeleteArticleComponent } from './components/delete-article/delete-article.component';
import { ListWaitersComponent } from './components/list-waiters/list-waiters.component';
import { AddWaiterComponent } from './components/add-waiter/add-waiter.component';
import { UpdateWaiterComponent } from './components/update-waiter/update-waiter.component';
import { DeleteWaiterComponent } from './components/delete-waiter/delete-waiter.component';
import { ListTablesComponent } from './components/list-tables/list-tables.component';
import { AddTableComponent } from './components/add-table/add-table.component';
import { UpdateTableComponent } from './components/update-table/update-table.component';
import { DeleteTableComponent } from './components/delete-table/delete-table.component';
import { ListCashBoxesComponent } from './components/list-cash-boxes/list-cash-boxes.component';
import { DeleteCashBoxComponent } from './components/delete-cash-box/delete-cash-box.component';
import { UpdateCashBoxComponent } from './components/update-cash-box/update-cash-box.component';
import { AddCashBoxComponent } from './components/add-cash-box/add-cash-box.component';
import { PointOfSaleComponent } from './components/point-of-sale/point-of-sale.component';
import { LoginComponent } from './components/login/login.component';

//pipe
import { FilterPipe } from './pipes/filter.pipe';
import { OrderByPipe } from './pipes/order-by.pipe';
import { AddSaleOrderComponent } from './components/add-sale-order/add-sale-order.component';
import { ListSaleOrdersComponent } from './components/list-sale-orders/list-sale-orders.component';
import { UpdateSaleOrderComponent } from './components/update-sale-order/update-sale-order.component';
import { DeleteSaleOrderComponent } from './components/delete-sale-order/delete-sale-order.component';
import { FocusDirective } from './directives/focus.directive';
import { ListRoomsComponent } from './components/list-rooms/list-rooms.component';
import { DeleteRoomComponent } from './components/delete-room/delete-room.component';
import { UpdateRoomComponent } from './components/update-room/update-room.component';
import { AddRoomComponent } from './components/add-room/add-room.component';
import { ListMakesComponent } from './components/list-makes/list-makes.component';
import { AddMakeComponent } from './components/add-make/add-make.component';
import { DeleteMakeComponent } from './components/delete-make/delete-make.component';
import { UpdateMakeComponent } from './components/update-make/update-make.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HeaderComponent,
    ListArticlesComponent,
    AddArticleComponent,
    UpdateArticleComponent,
    DeleteArticleComponent,
    ListWaitersComponent,
    AddWaiterComponent,
    UpdateWaiterComponent,
    DeleteWaiterComponent,
    ListTablesComponent,
    AddTableComponent,
    UpdateTableComponent,
    DeleteTableComponent,
    ListCashBoxesComponent,
    DeleteCashBoxComponent,
    UpdateCashBoxComponent,
    AddCashBoxComponent,
    PointOfSaleComponent,
    LoginComponent,
    FilterPipe,
    OrderByPipe,
    AddSaleOrderComponent,
    ListSaleOrdersComponent,
    UpdateSaleOrderComponent,
    DeleteSaleOrderComponent,
    FocusDirective,
    ListRoomsComponent,
    AddRoomComponent,
    DeleteRoomComponent,
    UpdateRoomComponent,
    ListMakesComponent,
    AddMakeComponent,
    DeleteMakeComponent,
    UpdateMakeComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    RoutingModule,
    NgbModule.forRoot()
  ],
  providers: [
    NgbActiveModal,
    ArticleService,
    WaiterService,
    TableService,
    CashBoxService,
    SaleOrderService,
    MovementOfArticleService,
    UserService,
    RoomService,
    MakeService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
