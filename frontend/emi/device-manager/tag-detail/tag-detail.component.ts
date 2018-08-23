import { DeviceManagerService } from '../device-manager.service';
import { Component, OnDestroy, OnInit, ElementRef, ViewChild } from '@angular/core';
import { fuseAnimations } from '../../../../core/animations';
import { Subscription } from 'rxjs/Subscription';
import { FuseTranslationLoaderService } from '../../../../core/services/translation-loader.service';
// tslint:disable-next-line:import-blacklist
import * as Rx from 'rxjs/Rx';
import { MatTableDataSource, MatPaginator } from '@angular/material';
import { locale as english } from '../i18n/en';
import { locale as spanish } from '../i18n/es';

export interface TableTags{
  name: string;
  type: string;
  atttubutes: number;
}

export interface AttributeItem {
  attribute: string;
  currentAttribute?: string;
  value: string;
  currentValue?: string;
  editing?: boolean;
}


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'tag-detail',
  templateUrl: './tag-detail.component.html',
  styleUrls: ['./tag-detail.component.scss'],
  animations: fuseAnimations
})
export class TagDetailComponent implements OnInit, OnDestroy {

  helloWorld: String = 'Hello World static';
  helloWorldLabelQuery$: Rx.Observable<any>;
  helloWorldLabelSubscription$: Rx.Observable<any>;


  // @ViewChild('filter') filter: ElementRef;

  displayedColumns: string[] = ['attribute', 'value', 'actions'];
  dataSource = new MatTableDataSource<AttributeItem>([
    {attribute: 'Hydrogen', value: '1.0079', },
    {attribute: 'Helium', value: '4.0026' },
    {attribute: 'Lithium', value: '6.941' },
    {attribute: 'Beryllium', value: '9.0122' }
  ]);
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
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


  ngOnDestroy() {
  }

}
