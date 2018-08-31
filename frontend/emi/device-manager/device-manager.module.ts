
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../../core/modules/shared.module';
import { DatePipe } from '@angular/common';
import { FuseWidgetModule } from '../../../core/components/widget/widget.module';

import { DeviceManagerService } from './device-manager.service';
import { DeviceManagerComponent } from './device-manager.component';
import { TagDetailComponent } from './tag-detail/tag-detail.component';
import { UppercaseDirective } from './directives/device-manager.directive';
import { ForbiddenNamesValidator } from './device-manager-directive';

const routes: Routes = [
  {
    path: '',
    component: DeviceManagerComponent,
  }
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(routes),
    FuseWidgetModule
  ],
  declarations: [
    DeviceManagerComponent,
    TagDetailComponent,
    UppercaseDirective,
    ForbiddenNamesValidator
  ],
  providers: [
    DeviceManagerService, DatePipe
  ],
  entryComponents: [TagDetailComponent]
})

export class DeviceManagerModule {}
