import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './main.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { ChannelsComponent } from './../channels/channels.component';
import { ChatComponent } from './../chat/chat.component';



@NgModule({
  declarations: [
    MainComponent,
    ChannelsComponent,
    ChatComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgZorroAntdModule,
  ]
})
export class MainModule { }
