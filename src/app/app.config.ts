import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { KeycloakAngularModule, KeycloakBearerInterceptor, KeycloakService } from 'keycloak-angular';
import { routes } from './app.routes';
import { HTTP_INTERCEPTORS } from '@angular/common/http';


function initializeKeycloak(keycloak: KeycloakService) {
  return () =>
    keycloak.init({
      config: {
        url: 'http://localhost:8080',
        realm: 'master',
        clientId: 'angularapp'
      },
      initOptions: {
        onLoad: 'check-sso', // 'login-required' , 'check-sso'
        silentCheckSsoRedirectUri:
          window.location.origin + '/silent-check-sso.html',
          checkLoginIframe: false
      },
      loadUserProfileAtStartUp: true,
      enableBearerInterceptor: true
    });


}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService]
    },
    KeycloakService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: KeycloakBearerInterceptor,
      multi: true
    }, provideZoneChangeDetection({ eventCoalescing: true })
  ]
};