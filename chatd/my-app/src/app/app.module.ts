import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgZorroAntdModule, NZ_I18N, en_GB } from 'ng-zorro-antd';
import { AppComponent } from './app.component';

// tslint:disable-next-line: jsdoc-format
/** Config angular i18n **/
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { AppRoutingModule } from './app-routing.module';



import { LoginModule } from './view/login/login.module';
import { RegModule } from './view/reg/reg.module';
import { MainModule } from './view/main/main.module';
registerLocaleData(en);

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    // tslint:disable-next-line: jsdoc-format
    /** include ng-zorro-antd module **/
    NgZorroAntdModule,
    LoginModule,
    RegModule,
    MainModule,
  ],
  bootstrap: [AppComponent],
  // tslint:disable-next-line: jsdoc-format
  providers: [
    { provide: NZ_I18N, useValue: en_GB }
  ]
})
export class AppModule { }
