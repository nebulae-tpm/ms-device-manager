import { Observable } from 'rxjs/Observable';
import { TagAttribute, Tag } from './../device-manager-tag-helpers';
import { DeviceManagerService } from '../device-manager.service';
import { Component, OnDestroy, OnInit, Inject, ViewChild } from '@angular/core';
import { fuseAnimations } from '../../../../core/animations';
import { FuseTranslationLoaderService } from '../../../../core/services/translation-loader.service';
// tslint:disable-next-line:import-blacklist
import * as Rx from 'rxjs/Rx';
import { take, filter, mergeMap } from 'rxjs/operators';
import { MatTableDataSource, MatPaginator, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { locale as english } from '../i18n/en';
import { locale as spanish } from '../i18n/es';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { startWith, map } from 'rxjs/operators';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'tag-detail',
  templateUrl: './tag-detail.component.html',
  styleUrls: ['./tag-detail.component.scss'],
  animations: fuseAnimations
})



export class TagDetailComponent implements OnInit, OnDestroy {

  forbiddenTagNamesArray: string[] = ['RAM'];

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
  originalName: string;


  constructor(
    public dialogRef: MatDialogRef<TagDetailComponent>,
    private deviceManagerService: DeviceManagerService,
    @Inject(MAT_DIALOG_DATA) private dataInjected: {action: string, tag: Tag, tagTypes: string[] },
    private translationLoader: FuseTranslationLoaderService
   ) {
    this.translationLoader.loadTranslations(english, spanish);
    this.tagElement = dataInjected.tag;

    this.tagForm.get('basicTagInfo.name').setValue(this.tagElement.name);
    this.tagForm.get('basicTagInfo.type').setValue(this.tagElement.type);

    this.tagTypesOptions = dataInjected.tagTypes ? dataInjected.tagTypes : [];
    this.originalName = dataInjected.tag.name;
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

  closeDialog() {
    this.tagElement.attributes = this.dataSource.data;
    this.dialogRef.close({
      tag: this.tagElement,
      originalName: this.originalName
    });
  }

  deleteElementFromTable(tagAttribute: TagAttribute) {
    this.deviceManagerService.removeTagAttribute(this.tagElement.name, tagAttribute.key)
        .subscribe(
          ok => { },
          error => console.log(error),
          () => {}
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
    this.dataSource.data = this.dataSource.data.slice();
  }

  finishEditing(tagAttribute: TagAttribute){
    let updateCreateTagAttributeObservable: Observable<any>;


    if (tagAttribute.currentValue.key && tagAttribute.currentValue.value){
      tagAttribute.editing = false;
      tagAttribute.key === '' && tagAttribute.value === ''
        ? updateCreateTagAttributeObservable = this.deviceManagerService
          .addAttributeToTag(this.tagElement.name, { key: tagAttribute.currentValue.key, value: tagAttribute.currentValue.value })
        : updateCreateTagAttributeObservable = this.deviceManagerService
          .editTagAttribute(this.tagElement.name, tagAttribute.key, { key: tagAttribute.currentValue.key, value: tagAttribute.currentValue.value });

      tagAttribute.key = tagAttribute.currentValue.key;
      tagAttribute.value = tagAttribute.currentValue.value;
      updateCreateTagAttributeObservable
        .subscribe(
          result => {},
          error => console.log(error),
          () => {}
        );
      this.dataSource.data = this.dataSource.data.slice();
    }
  }

  addNewAttribute() {
    if (this.dataSource.data.findIndex(e => e.editing) === -1) {
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
    let saveTagObservable: Observable<any>;
    const tagFormRawValue = this.tagForm.getRawValue();
    const basicInfoTag = {
      name: tagFormRawValue.basicTagInfo.name,
      type: tagFormRawValue.basicTagInfo.type
    };

    this.dataInjected.action === 'create'
      ? saveTagObservable = this.deviceManagerService.createTagElement$(basicInfoTag)
      : saveTagObservable = Rx.Observable.of({})
        .pipe(
          filter(() => this.originalName !== basicInfoTag.name || this.dataInjected.tag.type !== basicInfoTag.type),
          mergeMap(() => this.deviceManagerService.editBasicTagInfo(this.originalName, basicInfoTag))
        );

    this.basicInfoTagChecked = true;
    saveTagObservable.subscribe(
      (result) => {
         this.tagElement.name = basicInfoTag.name;
         this.tagElement.type = basicInfoTag.type;
      },
      (error) => console.log(error),
      () => {}
    );
  }

  forbiddenTagNames(control: FormControl): {[s: string]: boolean} {
    if (this.forbiddenTagNamesArray.indexOf(control.value) !== -1) {
      return {'nameIsForbidden': true};
    }
    return null;
  }
}

