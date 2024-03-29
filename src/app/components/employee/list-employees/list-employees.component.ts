import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { EmployeeService } from '../employee.service';

import { AddEmployeeComponent } from '../employee/add-employee.component';
import { Employee } from '../employee';

@Component({
    selector: 'app-list-employees',
    templateUrl: './list-employees.component.html',
    styleUrls: ['./list-employees.component.scss'],
    providers: [NgbAlertConfig],
    encapsulation: ViewEncapsulation.None
})

export class ListEmployeesComponent implements OnInit {

    public employees: Employee[] = new Array();
    public areEmployeesEmpty: boolean = true;
    public alertMessage: string = '';
    public userType: string;
    public orderTerm: string[] = ['name'];
    public propertyTerm: string;
    public areFiltersVisible: boolean = false;
    public loading: boolean = false;
    public itemsPerPage = 10;
    public totalItems = 0;

    constructor(
        public _employeeService: EmployeeService,
        public _router: Router,
        public _modalService: NgbModal,
        public alertConfig: NgbAlertConfig
    ) { }

    ngOnInit(): void {

        let pathLocation: string[] = this._router.url.split('/');
        this.userType = pathLocation[1];
        this.getEmployees();
    }

    public getEmployees(): void {

        this.loading = true;

        this._employeeService.getEmployees().subscribe(
            result => {
                if (!result.employees) {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                    this.loading = false;
                    this.employees = new Array();
                    this.areEmployeesEmpty = true;
                } else {
                    this.hideMessage();
                    this.loading = false;
                    this.employees = result.employees;
                    this.totalItems = this.employees.length;
                    this.areEmployeesEmpty = false;
                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public orderBy(term: string, property?: string): void {

        if (this.orderTerm[0] === term) {
            this.orderTerm[0] = "-" + term;
        } else {
            this.orderTerm[0] = term;
        }
        this.propertyTerm = property;
    }

    public refresh(): void {
        this.getEmployees();
    }

    public openModal(op: string, employee: Employee): void {

        let modalRef;
        switch (op) {
            case 'view':
                modalRef = this._modalService.open(AddEmployeeComponent, { size: 'lg', backdrop: 'static' });
                modalRef.componentInstance.employeeId = employee._id;
                modalRef.componentInstance.readonly = true;
                modalRef.componentInstance.operation = op;
                break;
            case 'add':
                modalRef = this._modalService.open(AddEmployeeComponent, { size: 'lg', backdrop: 'static' })
                modalRef.componentInstance.operation = op;
                modalRef.componentInstance.readonly = false;
                modalRef.result.then((result) => {
                    this.getEmployees();
                }, (reason) => {
                    this.getEmployees();
                });
                break;
            case 'update':
                modalRef = this._modalService.open(AddEmployeeComponent, { size: 'lg', backdrop: 'static' });
                modalRef.componentInstance.operation = op;
                modalRef.componentInstance.employeeId = employee._id;
                modalRef.componentInstance.readonly = false;
                modalRef.result.then((result) => {
                    if (result === 'save_close') {
                        this.getEmployees();
                    }
                }, (reason) => {

                });
                break;
            case 'delete':
                modalRef = this._modalService.open(AddEmployeeComponent, { size: 'lg', backdrop: 'static' })
                modalRef.componentInstance.operation = op;
                modalRef.componentInstance.employeeId = employee._id;
                modalRef.componentInstance.readonly = true;
                modalRef.result.then((result) => {
                    if (result === 'delete_close') {
                        this.getEmployees();
                    }
                }, (reason) => {

                });
                break;
            default: ;
        }
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
