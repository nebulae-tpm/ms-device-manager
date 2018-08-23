import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../../core/modules/shared.module';
import { DatePipe } from '@angular/common';
import { FuseWidgetModule } from '../../../core/components/widget/widget.module';

import { DeviceManagerService } from './device-manager.service';
import { DeviceManagerComponent } from './device-manager.component';

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
    DeviceManagerComponent    
  ],
  providers: [ DeviceManagerService, DatePipe]
})

export class DeviceManagerModule {}