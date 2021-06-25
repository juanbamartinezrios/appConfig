import {Component, OnInit} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {SwUpdate, UpdateAvailableEvent, SwPush} from '@angular/service-worker';
import {environment} from '../environments/environment';
import {Router, NavigationEnd} from '@angular/router';
import {filter} from 'rxjs/operators';
import {NotificationService} from 'projects/coremodulelib/src/lib/services/notification.service';
import {AuthenticationService} from 'projects/coremodulelib/src/lib/services/authentication.service';
import {LocalstorageService} from 'projects/coremodulelib/src/lib/services/localstorage.service';
import {AzureAnalitcsService} from './core/services/azure-analytics/azure-analytics.service';
import {GoogleTagManagerService} from 'angular-google-tag-manager';
import {AppConfigService} from 'projects/coremodulelib/src/lib/services/app-config.service';
import {User} from 'coremodulelib/coremodulelib';

declare var gtag;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  readonly VAPID_PUBLIC_KEY = 'BA3w1xirDtleaIx9LiRyZEVSPNHL-5rw50AyfwI6mf-Dvr__mikGUlyP0_tEXfCDz0D-PT-iM99S3ToMjPWZ8aI';

  constructor(
    private swPush: SwPush,
    private swUpdate: SwUpdate,
    private snackBar: MatSnackBar,
    private router: Router,
    private notificationService: NotificationService,
    private gtmService: GoogleTagManagerService,
    private authService: AuthenticationService,
    private localStorage: LocalstorageService,
    private appConfigService: AppConfigService,
    public azureAnalitycs: AzureAnalitcsService
  ) {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/ns.html?id=' + this.appConfigService.appConfig.config.tagManagerID;

    document.head.prepend(script);
    if (this.swUpdate.isEnabled) {
      if (environment.production) {
        this.swUpdate.available.subscribe((update: UpdateAvailableEvent) => {
          if (confirm('Existe una nueva version disponible. ¿Instalar?')) {
            window.location.reload();
          }
        });
      }
    }

    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data === 'sincro-pedidos-ok') {
        this.snackBar.open('Pedidos enviados correctamente', '', {
          duration: 2000,
        });
      }
    });
    this.gtmService.addGtmToDom();
    const navEndEvent$ = this.router.events.pipe(filter((e) => e instanceof NavigationEnd));
    navEndEvent$.subscribe((e: NavigationEnd) => {
      if (this.localStorage.getItem('LOGIN_AS') === 'false') {
        if (e.urlAfterRedirects === '/login' || e.url === '/login' || e.urlAfterRedirects === '/logout') {
          this.disableSmile();
        } else {
          this.initSmile();
          this.enableSmile();
        }
        const user = this.authService.getUser();
        const rol = this.authService.getRol();
        const gtmTag1 = {
          event: 'vistavista',
          page_path: e.urlAfterRedirects,
          page_title: e.urlAfterRedirects,
          page_location: e.urlAfterRedirects,
          subRegionId: `${user.subregionId ? user.subregionId : 0}`,
          rol: `${rol}`,
          nombre: `${user.fullName}`,
          pais: `${user.country}`,
          rolFalso: `${user.rolReleva ? user.rolReleva.descripcion : 'null'}`,
          empleadoId: `${user.employeeId}`,
        };

        this.gtmService.getDataLayer();

        gtag('config', `${this.appConfigService.appConfig.config.tagManagerID}`, {
          page_path: e.urlAfterRedirects,
          page_title: e.urlAfterRedirects,
          page_location: e.urlAfterRedirects,
        });
      }
    });
  }

  ngOnInit() {
    this.subscribeToNotifications();
    this.swPush.messages.subscribe((message) => console.log('Push-notification: ', JSON.stringify(message)));
    this.swPush.notificationClicks.subscribe(({action, notification}) => {
      const url = this.router.createUrlTree([`perfil-cliente/detalle-pdv/${notification.data.pdvId}/modulaciones`]);
      const finalUrl = location.origin + '/ventas/#' + url.toString();
      window.open(finalUrl, '_blank');
    });
  }

  public async subscribeToNotifications() {
    try {
      if (!this.swPush.isEnabled) {
        console.log('Notifications is not enabled');
        return;
      }
      const sub = await this.swPush.requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC_KEY,
      });
      if (sub.endpoint.indexOf('https://fcm.googleapis.com/fcm/send') !== -1) {
        this.authService.webpushSuscription = JSON.parse(JSON.stringify(sub));
        const endpointParts = sub.endpoint.split('/');
        const registrationId = endpointParts[endpointParts.length - 1];
      }
    } catch (err) {
      console.error('Could not subscribe due to:', err);
    }
  }

  private unsubscribeSW(): void {
    this.swPush.unsubscribe();
    // this.subscribeToNotifications();
  }

  private initSmile(): void {
    const user: User = this.authService.getUser();
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('smile/user-context/update', {
          detail: {
            empleadoNombre: user.permisosLdap.length ? user.firstName : user.lastName + '  ' + user.firstName,
            empleadoId: user.employeeId ? user.employeeId : 'NA',
            subregionId: user.subregionId ? user.subregionId : 'NA',
            rolRelevaDesc: user.rolReleva ? user.rolReleva.descripcion : 'NA',
            pais: user.country ? user.country : 'NA',
          },
        })
      );
    }, 2000);
  }

  private disableSmile(): void {
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('smile/feedback/disable'));
    }, 2000);
  }

  private enableSmile(): void {
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('smile/feedback/enable'));
    }, 2000);
  }
}
