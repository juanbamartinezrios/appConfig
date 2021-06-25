import {Injectable} from '@angular/core';
import {HttpClient, HttpBackend} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {AppConfig, Settings} from '../models/config/config.model';

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  public appConfig: AppConfig;
  public http: HttpClient;

  constructor(protected readonly httpHandler: HttpBackend) {
    this.appConfig = new AppConfig();
    this.http = new HttpClient(httpHandler);
  }

  public loadConfig(endpoint: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.http
        .get<Settings>(endpoint)
        .pipe(map((res) => res))
        .subscribe(
          (value) => {
            this.appConfig.initFromJson(value);
            resolve(true);
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  public get(): Settings {
    return this.appConfig.config;
  }
}
