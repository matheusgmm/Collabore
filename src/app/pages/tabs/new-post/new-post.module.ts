import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewPostPageRoutingModule } from './new-post-routing.module';

import { NewPostPage } from './new-post.page';
import { PickLocationComponent } from './pick-location/pick-location.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewPostPageRoutingModule
  ],
  declarations: [NewPostPage, PickLocationComponent]
})
export class NewPostPageModule {}
