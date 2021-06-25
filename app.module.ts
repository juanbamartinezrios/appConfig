import {HashLocationStrategy, LocationStrategy} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {Injector, NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ServiceWorkerModule} from '@angular/service-worker';
import {CoremodulelibModule} from 'projects/coremodulelib/src/public-api';
import {AppInjector} from '../AppInjector';
import {environment} from '../environments/environment';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {CoreModule} from './core/core.module';
import {NotificationService} from 'projects/coremodulelib/src/lib/services/notification.service';
import {AppConfigurationModule} from './core/config.module';
import {AppConfigService} from 'projects/coremodulelib/src/lib/services/app-config.service';

export function tagManagerFactory(config: AppConfigService) {
  if (config) {
    return config.appConfig.config.tagManagerID;
  }
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    CoremodulelibModule.forRoot(),
    AppConfigurationModule.forRoot('./config/config.json'),
    CoreModule,
    ServiceWorkerModule.register(environment.serviceWorkerScript),
  ],
  providers: [
    {provide: LocationStrategy, useClass: HashLocationStrategy},
    {provide: 'googleTagManagerId', useFactory: tagManagerFactory, deps: [AppConfigService], multi: true},
    NotificationService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(injector: Injector) {
    AppInjector.injector = injector;
  }
}
