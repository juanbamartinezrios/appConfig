import {InjectionToken, NgModule, APP_INITIALIZER, ModuleWithProviders} from '@angular/core';
import {AppConfigService} from 'projects/coremodulelib/src/lib/services/app-config.service';

const AUTH_CONFIG_URL_TOKEN = new InjectionToken<string>('AUTH_CONFIG_URL');

const initConfig = (appConfig: AppConfigService, configUrl: string): (() => Promise<void>) => {
  const promise = appConfig.loadConfig(configUrl).then(() => {});
  return () => promise;
};

@NgModule({
  providers: [],
  imports: [],
})
export class AppConfigurationModule {
  static forRoot(configFilePath: string): ModuleWithProviders<AppConfigurationModule> {
    return {
      ngModule: AppConfigurationModule,
      providers: [
        AppConfigService,
        {provide: AUTH_CONFIG_URL_TOKEN, useValue: configFilePath},
        {
          provide: APP_INITIALIZER,
          useFactory: initConfig,
          deps: [AppConfigService, AUTH_CONFIG_URL_TOKEN],
          multi: true,
        },
      ],
    };
  }
}
