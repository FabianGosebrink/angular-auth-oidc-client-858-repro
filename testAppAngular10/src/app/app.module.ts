import { HttpClient } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AuthModule, OidcConfigService } from 'angular-auth-oidc-client';
import { map, switchMap } from 'rxjs/operators';
import { AppComponent } from './app.component';

export function configureAuth(
  oidcConfigService: OidcConfigService,
  httpClient: HttpClient
) {
  const setupAction$ = httpClient
    .get<any>(`${window.location.origin}/api/ClientAppSettings`)
    .pipe(
      map((customConfig) => {
        return {
          stsServer: customConfig.stsServer,
          authWellknownEndpoint:
            'https://login.microsoftonline.com/common/v2.0',
          redirectUrl: customConfig.redirect_url,
          clientId: customConfig.client_id,
          scope: customConfig.scope,
          responseType: customConfig.response_type,
          silentRenew: true,
          maxIdTokenIatOffsetAllowedInSeconds: 600,
          issValidationOff: true,
          autoUserinfo: false,
          silentRenewUrl: window.location.origin + '/silent-renew.html',
        };
      }),
      switchMap((config) => oidcConfigService.withConfig(config))
    );

  return () => setupAction$.toPromise();
}

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AuthModule.forRoot()],
  providers: [
    OidcConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: configureAuth,
      deps: [OidcConfigService, HttpClient],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
