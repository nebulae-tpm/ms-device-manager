import { DeviceManagerService } from './device-manager.service';
import { Component, OnDestroy, OnInit, ElementRef, ViewChild } from '@angular/core';
import { fuseAnimations } from '../../../core/animations';
import { Subscription } from 'rxjs/Subscription';
import { FuseTranslationLoaderService } from './../../../core/services/translation-loader.service';
// tslint:disable-next-line:import-blacklist
import * as Rx from 'rxjs/Rx';
import { MatTableDataSource, MatPaginator, MatDialog, MatSort } from '@angular/material';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
import { TagDetailComponent } from './tag-detail/tag-detail.component';
import { Tag } from './device-manager-tag-helpers';
import { mergeMap, toArray, map, tap, debounceTime, distinctUntilChanged, filter, mapTo } from 'rxjs/operators';

export interface TableTags{
  name: string;
  type: string;
  atttubutes: number;
}


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'device-manager',
  templateUrl: './device-manager.component.html',
  styleUrls: ['./device-manager.component.scss'],
  animations: fuseAnimations
})
export class DeviceManagerComponent implements OnInit, OnDestroy {
  allSubscriptions: Subscription[] = [];



  dialogRef: any;

  displayedColumns: string[] = ['attribute', 'value', 'actions'];
  dataSource = new MatTableDataSource<Tag>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('filter') filter: ElementRef;
  @ViewChild(MatSort) sort: MatSort;

  tableSize: number;
  page = 0;
  count = 10;
  filterText = "";
  sortColumn = null;
  sortOrder = null;
  itemPerPage = "";



  constructor(
    public dialog: MatDialog,
    private deviceManagerService: DeviceManagerService,
    private translationLoader: FuseTranslationLoaderService
   ) {
    this.translationLoader.loadTranslations(english, spanish);
  }


  ngOnInit() {

    this.deviceManagerService.fecthTagTypes()
      .subscribe(
        result => {
          console.log('quering by tag types ==>', result );
          this.deviceManagerService.tagTypes = result;
        },
        error => console.log(error),
        () => console.log("Finished !!")
      );

    this.dataSource.paginator = this.paginator;

    this.deviceManagerService.getTagsByPages$(0, 0)
    .pipe(
      mergeMap((tags: Tag[]) => this.loadRowDataInDataTable$(tags))
    )
    .subscribe(
      (response) => {
        console.log(response);
      },
      (error) => console.log(error),
      () => console.log('Completed !!!!!')
    );

    this.allSubscriptions.push(
      Rx.Observable.fromEvent(this.filter.nativeElement, 'keyup')
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        filter(() => this.filter.nativeElement),
        map(() => this.filter.nativeElement.value.trim()  ),
        tap((filterText => this.filterText = filterText)),
        mergeMap(() => this.deviceManagerService.getTagsByPages$(this.page, this.count, this.filterText, this.sortColumn, this.sortOrder) ),
        mergeMap((responseArray) => this.loadRowDataInDataTable$(responseArray))
      )
      .subscribe(
        (filterText) => {
          console.log(this.filterText);
          this.dataSource.data.length = 100;
          this.dataSource.data = this.dataSource.data.slice();
        },
        (error) => console.log(error),
        () => console.log("COMPLETED FILTER SUBSCRIPTION !!! ")
      )
    );

    this.allSubscriptions.push(
      this.paginator.page.subscribe(pageChanged => {
        this.page = pageChanged.pageIndex;
        this.count = pageChanged.pageSize;
        console.log(this.page, this.count);

      })
    );

  }




  loadRowDataInDataTable$(tags: Tag[]){
    if (tags.length > 0){
      return Rx.Observable.from(tags)
      .pipe(
        map((tag) =>  this.dataSource.data.push(tag)),
        toArray(),
        tap(() => this.dataSource.data = this.dataSource.data.slice())
      );
    }else {
      return Rx.Observable.empty();
    }

  }

  editTag(tag: Tag, action: string) {
    console.log('TAG =>', tag);
    tag.attributes = tag.attributes ? tag.attributes.map(item => ({ ...item, currentValue: { key: item.key, value: item.value } })) : [];
    this.dialogRef = this.dialog.open(TagDetailComponent, {
      panelClass: 'event-form-dialog',
      data: {
        action: action ? action : 'edit',
        tag: {
          name: tag.name,
          type: tag.type,
          attributes: tag.attributes
        },
        tagTypes: this.deviceManagerService.tagTypes
      }
    })
    .afterClosed()
    .subscribe( (response: {tag: Tag, originalName: string}) => {
      console.log(response);
      const index = this.dataSource.data.findIndex(e => e.name === response.originalName);
      index  !== -1
      ? this.dataSource.data[index] = response.tag
      : this.dataSource.data.push(response.tag);

      this.dataSource.data = this.dataSource.data.slice();
      // this.dataSource.data.filter()
    });
  }

  deleteElementFromTable(tag: any){
    console.log('Deleting => ', tag.name);
    this.deviceManagerService.RemoveTagElement(tag.name)
    .subscribe(
      ok => {

        this.dataSource.data = this.dataSource.data.filter(e => e.name !== tag.name).slice();
      },
      error => console.log(error),
      () => console.log("Stream Finished")
    );
  }

  onNewTag(){
    this.editTag({ name: '', type: '', attributes: [{key: '', value: '', editing: true, currentValue: { key: '', value: ''}}] }, 'create');
  }


  ngOnDestroy() {
    // this.allSubscriptions.forEach(s => s.unsubscribe());
  }


}
