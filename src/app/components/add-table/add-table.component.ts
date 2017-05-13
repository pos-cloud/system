import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Table, TableStatus } from './../../models/table';
import { Room } from './../../models/room';

import { TableService } from './../../services/table.service';
import { RoomService } from './../../services/room.service';

@Component({
  selector: 'app-add-table',
  templateUrl: './add-table.component.html',
  styleUrls: ['./add-table.component.css'],
  providers: [NgbAlertConfig]
})

export class AddTableComponent  implements OnInit {

  private table: Table;
  private rooms: Room[] = new Array();
  private tableForm: FormGroup;
  private alertMessage: any;
  private userType: string;
  private loading: boolean = false;
  private focusEvent = new EventEmitter<boolean>();

  private formErrors = {
    'description': '',
    'room': '',
    'chair': 1,
  };

  private validationMessages = {
    'description': {
      'required':       'Este campo es requerido.'
    },
    'room': {
      'required':       'Este campo es requerido.'
    },
    'chair': {
      'required':       'Este campo es requerido.'
    }
  };

  constructor(
    private _tableService: TableService,
    private _roomService: RoomService,
    private _fb: FormBuilder,
    private _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
  ) { 
    alertConfig.type = 'danger';
    alertConfig.dismissible = true;
  }

  ngOnInit(): void {

    let locationPathURL: string;
    this._router.events.subscribe((data:any) => { 
      locationPathURL = data.url.split('/');
      this.userType = locationPathURL[1];
    });
    this.table = new Table ();
    this.buildForm();
    this.getRooms();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  private buildForm(): void {

    this.tableForm = this._fb.group({
      'description': [this.table.description, [
          Validators.required
        ]
      ],
      'room': [this.table.room, [
          Validators.required
        ]
      ],
      'chair': [this.table.chair, [
          Validators.required
        ]
      ],
      'status': [this.table.status, [
        ]
      ]
    });

    this.tableForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  private onValueChanged(data?: any): void {

    if (!this.tableForm) { return; }
    const form = this.tableForm;

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

  private getRooms(): void {  

    this._roomService.getRooms().subscribe(
        result => {
          let room: Room  = new Room();
          if(!result.rooms) {
            this.alertMessage = result.message;
          } else {
            this.rooms = result.rooms;
            if(this.rooms[0] !== undefined) {
              room = this.rooms[0];
            }
          }
          this.tableForm.setValue({
            'room': room,
            'description': '',
            'chair': 1,
            'status': TableStatus.Enabled,
          });
        },
        error => {
          this.alertMessage = error;
          if(!this.alertMessage) {
            this.alertMessage = "Error en la petición.";
          }
        }
      );
   }

  private addTable(): void {
    this.loading = true;
    this.table = this.tableForm.value;
    this.saveTable();
  }

  private saveTable(): void {
    
    this._tableService.saveTable(this.table).subscribe(
    result => {
        if (!this.table) {
          this.alertMessage = 'Ha ocurrido un error al querer crear la mesa.';
        } else {
          this.table = result.table;
          this.alertConfig.type = 'success';
          this.alertMessage = "La mesa se ha añadido con éxito.";      
          this.table = new Table ();
          this.buildForm();
        }
        this.loading = false;
      },
      error => {
        this.alertMessage = error;
        if(!this.alertMessage) {
            this.alertMessage = 'Ha ocurrido un error al conectarse con el servidor.';
        }
        this.loading = false;
      }
    );
  }
}
