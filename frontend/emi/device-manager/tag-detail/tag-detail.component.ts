import { TagAttribute, Tag } from './../device-manager-tag-helpers';
import { DeviceManagerService } from '../device-manager.service';
import { Component, OnDestroy, OnInit, ElementRef, Inject, InjectionToken, ViewChild, NgZone } from '@angular/core';
import { fuseAnimations } from '../../../../core/animations';
import { Subscription } from 'rxjs/Subscription';
import { FuseTranslationLoaderService } from '../../../../core/services/translation-loader.service';
// tslint:disable-next-line:import-blacklist
import * as Rx from 'rxjs/Rx';
import {take} from 'rxjs/operators';
import { MatTableDataSource, MatPaginator, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { locale as english } from '../i18n/en';
import { locale as spanish } from '../i18n/es';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { startWith, map } from 'rxjs/operators';

export interface TableTags{
  name: string;
  type: string;
  atttubutes: number;
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'tag-detail',
  templateUrl: './tag-detail.component.html',
  styleUrls: ['./tag-detail.component.scss'],
  animations: fuseAnimations
})



export class TagDetailComponent implements OnInit, OnDestroy {

  tagForm: FormGroup = new FormGroup({
    basicTagInfo: new FormGroup({
      name: new FormControl(null, [Validators.required]),
      type: new FormControl(null, [Validators.required])
    })
  });



  tagTypesOptions: string[] = [];
  filteredOptions: Rx.Observable<string[]>;
  basicInfoTagChecked = false;

  displayedColumns: string[] = ['attribute', 'value', 'actions'];
  dataSource = new MatTableDataSource<TagAttribute>();
  @ViewChild(MatPaginator) paginator: MatPaginator;

  tagElement: Tag;


  constructor(
    public dialogRef: MatDialogRef<TagDetailComponent>,
    private deviceManagerService: DeviceManagerService,
    @Inject(MAT_DIALOG_DATA) private dataInjected: {tag: Tag, tagTypes: string[] },
    private translationLoader: FuseTranslationLoaderService
   ) {
    this.translationLoader.loadTranslations(english, spanish);
    this.tagElement = dataInjected.tag;
    this.tagForm.get('basicTagInfo.name').setValue(this.tagElement.name);
    this.tagForm.get('basicTagInfo.type').setValue(this.tagElement.type);

    this.tagTypesOptions = dataInjected.tagTypes;
    console.log('TAG INJECTED ==> ', dataInjected);
  }


  ngOnInit() {

    this.dataSource.data =  this.dataInjected.tag.attributes;
    if (this.dataSource.data.length === 0){
      const defaultTagAttribute = {
        key: '',
        value: '',
        editing: true,
        currentValue: { key: '' , value: '' }
      };
      this.dataSource.data.push(defaultTagAttribute);
    }

    this.filteredOptions = this.tagForm.get('basicTagInfo.type').valueChanges
      .pipe(
        startWith(''),
        map(value => this.tagTypesOptions.filter(option => option.toLowerCase().includes(value.toLowerCase())))
      );
  }

  ngOnDestroy() {
  }

  deleteElementFromTable(tagAttribute: TagAttribute) {
    console.log(this.tagElement.name, tagAttribute.key);
    this.deviceManagerService.removeTagAttribute(this.tagElement.name, tagAttribute.key)
        .subscribe(
          ok => { },
          error => console.log(error),
          () => console.log("Stream finished")
    );
    if (this.dataSource.data.length === 1) {
      this.dataSource.data = [{
        key: '',
        value: '',
        editing: true,
        currentValue: {
          key: '',
          value: ''
        }
      }];
    } else {
      this.dataSource.data = this.dataSource.data.filter(e => e.key !== tagAttribute.key).slice();
    }
  }

  startToEditing(tagAttribute: TagAttribute){
    tagAttribute.editing = true;
    console.log(tagAttribute);
    this.dataSource.data = this.dataSource.data.slice();
  }

  finishEditing(tagAttribute: TagAttribute){
    console.log(tagAttribute);
    if (tagAttribute.currentValue.key && tagAttribute.currentValue.value){

      tagAttribute.editing = false;
      tagAttribute.key = tagAttribute.currentValue.key;
      tagAttribute.value = tagAttribute.currentValue.value;

      this.deviceManagerService
      .addAttributeToTag(this.tagElement.name, {key: tagAttribute.key, value: tagAttribute.value})
      .subscribe(
        result => console.log(result),
        error => console.log(error),
        () => console.log("Stream finished")
      );

      this.dataSource.data = this.dataSource.data.slice();
    }
  }

  addNewAttribute() {
    if (this.dataSource.data.findIndex(e => e.editing) === -1) {
      console.log('addNewAttribute ...');
      this.dataSource.data.push({
        key: '',
        value: '',
        editing: true,
        currentValue: {
          key: '',
          value: ''
        }
      });
      this.dataSource.data = this.dataSource.data;
    }
  }
  saveBasicTagInfo(){
    const tagFormRawValue = this.tagForm.getRawValue();
    const basicInfoTag = {
      name: tagFormRawValue.basicTagInfo.name,
      type: tagFormRawValue.basicTagInfo.type
    };
    console.log(basicInfoTag);
    this.deviceManagerService.createTagElement$(basicInfoTag).subscribe(
      (result) => {
        console.log(result);
        this.basicInfoTagChecked = true;
      },
      (error) => console.log(error),
      () => console.log()
    );
  }
}
