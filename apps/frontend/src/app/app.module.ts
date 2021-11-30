import { LOCALE_ID, NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'

import { AppComponent } from './app.component'
import { HttpClientModule } from '@angular/common/http'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'
import { DashboardModule } from './dashboard/dashboard.module'
import { registerLocaleData } from '@angular/common'
import localeDe from '@angular/common/locales/de'
import localeDeExtra from '@angular/common/locales/extra/de'

registerLocaleData(localeDe, 'de-DE', localeDeExtra)

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HttpClientModule, NgbModule, DashboardModule],
  providers: [{ provide: LOCALE_ID, useValue: 'de-DE' }],
  bootstrap: [AppComponent],
})
export class AppModule {}
