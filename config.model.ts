export class AppConfig {
  public config: Settings;

  public initFromJson(config: Settings): void {
    this.config = config;
  }
}

export interface Settings {
  production: boolean;
  API: string;
  API_REPORTES: string;
  API_PUSHSENDER: string;
  country: string;
  basehref: string;
  tagManagerID: string;
  serviceWorkerScript: string;
  webSocketUrl: string;
  authenticador: string;
  frontUrl: string;
}
