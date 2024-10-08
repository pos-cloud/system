import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import {
  NgForm,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { Gallery } from 'app/components/gallery/gallery';
import { GalleryService } from 'app/components/gallery/gallery.service';
import { Resource } from 'app/components/resource/resource';
import { ResourceService } from 'app/components/resource/resource.service';
import { TranslateMePipe } from 'app/main/pipes/translate-me';
import { ToastService } from 'app/shared/toast/toast.service';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css'],
  providers: [TranslateMePipe],
})
export class GalleryComponent implements OnInit {
  public operation: string;
  @Input() readonly: boolean;
  public galleryId: string;

  public gallery: any;
  public galleryForm: UntypedFormGroup;

  public resourcesForm: UntypedFormArray;
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public orientation: string = 'horizontal';
  public resources: Resource[];
  public selectedResource: string | null = null;

  public formErrors = {
    name: '',
    colddown: '',
    resource: '',
  };

  public validationMessages = {
    name: {
      required: 'Este campo es requerido.',
    },
    colddown: { required: 'Este campo es requerido.' },
  };

  constructor(
    public _galleryService: GalleryService,
    public _resourceService: ResourceService,
    public _fb: UntypedFormBuilder,
    public _router: Router,
    private _route: ActivatedRoute,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    private _toastr: ToastService,
    public translatePipe: TranslateMePipe
  ) {
    if (window.screen.width < 1000) this.orientation = 'vertical';
    this.getResources();
  }

  ngOnInit() {
    const URL = this._router.url.split('/');
    this.operation = URL[3].split('?')[0];
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    if (this.operation !== 'add') {
      this.galleryId = URL[4].split('?')[0];
    }
    this.gallery = new Gallery();
    this.buildForm();

    if (this.galleryId) {
      this.getGallery();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.focusEvent.emit(true);
    });
  }

  public buildForm(): void {
    this.galleryForm = this._fb.group({
      _id: [this.gallery._id, []],
      name: [this.gallery.name, [Validators.required]],
      colddown: [this.gallery.colddown, []],
      barcode: [this.gallery.barcode, []],
      resources: this._fb.array([]),
    });

    this.galleryForm.valueChanges.subscribe((data) =>
      this.onValueChanged(data)
    );

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public addNewResource(e: any): void {
    if (this.galleryForm.value.resources.lenght <= 0 && e) {
      const resources = this.galleryForm.controls.resources as UntypedFormArray;
      resources.push(
        this._fb.group({
          _id: null,
          resource: null,
          order: 0,
        })
      );
    }
  }

  public addResource(resourceForm: NgForm): void {
    let valid = true;
    const resources = this.galleryForm.controls.resources as UntypedFormArray;
    if (valid) {
      resources.push(
        this._fb.group({
          _id: null,
          resource: resourceForm.value.resource || null,
          order: resourceForm.value.order || 1,
        })
      );
      resourceForm.resetForm();
    }
  }

  public returnTo(): void {
    this._route.queryParams.subscribe((params) => {
      const returnUrl = params['returnURL']
        ? decodeURIComponent(params['returnURL'])
        : null;

      if (returnUrl) {
        // Si hay una returnURL, navegar a esa URL
        this._router.navigateByUrl(returnUrl);
      } else {
        // Navegar a una ruta por defecto si no hay returnURL
        this._router.navigate(['/admin/gallery']);
      }
    });
  }

  deleteResource(index) {
    let control = <UntypedFormArray>this.galleryForm.controls.resources;
    control.removeAt(index);
  }

  public onValueChanged(data?: any): void {
    if (!this.galleryForm) {
      return;
    }
    const form = this.galleryForm;

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

  public getGallery() {
    this.loading = true;

    this._galleryService.getById(this.galleryId).subscribe(
      (result) => {
        if (!result.result) {
          this._toastr.showToast(result);
        } else {
          this.gallery = result.result;
          // let aa = this.gallery.resources.find(resource => resource.resource._id ===)
          this.gallery.resources = this.gallery.resources.map(
            (galleryResource) => {
              // Buscar el recurso completo en resource.resources usando el ID
              const completeResource = this.resources.find(
                (res) => res._id === galleryResource.resource
              );
              if (completeResource) {
                // Reemplazar el ID por el objeto completo
                return {
                  ...galleryResource,
                  resource: completeResource, // Aquí reemplazamos el ID con el objeto completo
                };
              }
              return galleryResource; // Si no se encuentra, se deja el recurso como está
            }
          );
          this.setValueForm();
        }
        this.loading = false;
      },
      (error) => {
        this._toastr.showToast(error);
        this.loading = false;
      }
    );
  }

  public setValueForm(): void {
    const values = {
      _id: this.gallery?._id ?? '',
      name: this.gallery?.name ?? '',
      colddown: this.gallery?.colddown ?? 6,
      barcode: this.gallery.barcode ? this.gallery.barcode : false,
    };

    if (this.gallery.resources && this.gallery.resources.length > 0) {
      let resources = <UntypedFormArray>this.galleryForm.controls.resources;
      this.gallery.resources.forEach((x) => {
        let resourceId;
        if (x.resource && x.resource._id) {
          resourceId = x.resource._id;
        }

        resources.push(
          this._fb.group({
            _id: null,
            resource: resourceId,
            order: x.order,
          })
        );
      });
    }

    this.galleryForm.patchValue(values);
  }

  public addGallery() {
    switch (this.operation) {
      case 'add':
        this.saveGallery();
        break;
      case 'update':
        this.updateGallery();
        break;
      case 'delete':
        this.deleteGallery();
      default:
        break;
    }
  }

  async updateGallery() {
    this.loading = true;

    this.gallery = this.galleryForm.value;

    if (await this.isValid()) {
      this._galleryService.update(this.gallery).subscribe(
        (result) => {
          if (!result.result) {
            this.loading = false;
            this._toastr.showToast(result);
          } else {
            this.loading = false;
            this._toastr.showToast(result);
            this.returnTo();
          }
        },
        (error) => {
          this._toastr.showToast(error);
          this.loading = false;
        }
      );
    } else {
      this.loading = false;
    }
  }

  async saveGallery() {
    this.loading = true;

    this.gallery = this.galleryForm.value;

    if (await this.isValid()) {
      this._galleryService.save(this.gallery).subscribe(
        (result) => {
          if (!result.result) {
            this.loading = false;
            this._toastr.showToast(result);
          } else {
            this.loading = false;
            this._toastr.showToast(result);
            this.gallery = new Gallery();
            this.buildForm();
            this.returnTo();
          }
        },
        (error) => {
          this._toastr.showToast(error);
          this.loading = false;
        }
      );
    } else {
      this.loading = false;
    }
  }

  public deleteGallery() {
    this.loading = true;

    this._galleryService.delete(this.gallery._id).subscribe(
      (result) => {
        this.loading = false;
        if (!result.result) {
          this._toastr.showToast(result);
        } else {
          this._toastr.showToast(result);
          this.returnTo();
        }
      },
      (error) => {
        this._toastr.showToast(error);
        this.loading = false;
      }
    );
  }

  public getResources(): void {
    let match = `{ "operationType": { "$ne": "D" } }`;

    match = JSON.parse(match);

    // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
    let project = {
      name: 1,
      type: 1,
      file: 1,
      operationType: 1,
    };
    this._resourceService.getAll({ project, match }).subscribe((result) => {
      if (result.result) {
        this.loading = false;
        this.resources = result.result;
      } else {
        this.resources = new Array();
        this.loading = false;
      }
    });
  }

  public isValid(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (
        this.galleryForm.value.colddown === 0 ||
        this.gallery.colddown === 0 ||
        this.gallery.colddown === null ||
        this.gallery.colddown < 0 ||
        this.galleryForm.value.colddown < 0
      ) {
        this._toastr.showToast(
          null,
          'info',
          undefined,
          'El intervalo no puede ser 0 o negativo'
        );
        resolve(false);
      }

      resolve(true);
    });
  }
}
