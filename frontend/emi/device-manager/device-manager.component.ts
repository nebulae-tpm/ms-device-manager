import { DeviceManagerService } from './device-manager.service';
import { Component, OnDestroy, OnInit, ElementRef, ViewChild } from '@angular/core';
import { fuseAnimations } from '../../../core/animations';
import { Subscription } from 'rxjs/Subscription';
import { FuseTranslationLoaderService } from './../../../core/services/translation-loader.service';
// tslint:disable-next-line:import-blacklist
import * as Rx from 'rxjs/Rx';
import { MatTableDataSource, MatPaginator, MatDialog } from '@angular/material';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
import { TagDetailComponent } from './tag-detail/tag-detail.component';

export interface TableTags{
  name: string;
  type: string;
  atttubutes: number;
}

export interface AttributeItem {
  name: string;
  type: string;
  atributesQty?: string;
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'device-manager',
  templateUrl: './device-manager.component.html',
  styleUrls: ['./device-manager.component.scss'],
  animations: fuseAnimations
})
export class DeviceManagerComponent implements OnInit, OnDestroy {

  helloWorld: String = 'Hello World static';
  helloWorldLabelQuery$: Rx.Observable<any>;
  helloWorldLabelSubscription$: Rx.Observable<any>;


  // @ViewChild('filter') filter: ElementRef;

  dialogRef: any;

  displayedColumns: string[] = ['attribute', 'value', 'actions'];
  dataSource = new MatTableDataSource<AttributeItem>([
    // tslint:disable-next-line:max-line-length
    { name: 'Cuenca1_DNS_AVANTEL, Cuenca1_DNS_AVANTEL,Cuenca1_DNS_AVANTEL,Cuenca1_DNS_AVANTEL', type: '285.369.26.55', },
    { name: 'Cuenca2_DNS_TELCEL', type: '285.369.26.55', },
    { name: 'Cuenca3_DNS_BellSouth', type: '285.369.26.55', },
    { name: 'Cuenca4_DNS_CELUMOVIL', type: '285.369.26.55', },
    { name: 'Cuenca5_DNS_T&T', type: '285.369.26.55', },
    { name: 'Cuenca6_DNS_TELMEX', type: '285.369.26.55', },
    { name: 'Cuenca7_DNS_OLA', type: '285.369.26.55', },
    { name: 'Cuenca8_DNS_VIRGIN_MOBILE', type: '285.369.26.55', },
    { name: 'Cuenca9_DNS_METRO', type: '285.369.26.55', },
    { name: 'Cuenca1_DNS_MOVIL_EXITO', type: '285.369.26.55', }
  ]);
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    public dialog: MatDialog,
    private deviceManagerService: DeviceManagerService,
    private translationLoader: FuseTranslationLoaderService
   ) {
    this.translationLoader.loadTranslations(english, spanish);
  }


  ngOnInit() {
    this.helloWorldLabelQuery$ = this.deviceManagerService.getHelloWorld$();
    this.helloWorldLabelSubscription$ = this.deviceManagerService.getEventSourcingMonitorHelloWorldSubscription$();

    this.dataSource.paginator = this.paginator;
  }

  editTag(tag: any){
    console.log('TAG =>', tag);
    this.dialogRef = this.dialog.open(TagDetailComponent, {
      panelClass: 'event-form-dialog',
      data: {
        action: 'new',
        date  : Date.now()
      }
    });
  }

  deleteElementFromTable(tag: any){
    console.log('Deleting => ', tag.name);
  }


  ngOnDestroy() {
  }

}
