import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AngularFontAwesomeModule } from 'angular-font-awesome';

//ROUTES
import { routing, appRoutingProviders } from './app.routing';
////

import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { AlertComponent } from './components/alert/alert.component';
import { ContentLayerComponent } from './components/content-layer/content-layer.component';
import { EditQuejaComponent } from './components/edit-queja/edit-queja.component';
import { ErrorComponent } from './components/error/error.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { LoginComponent } from './components/login/login.component';
import { MainNavComponent } from './components/main-nav/main-nav.component';
import { MapViewComponent } from './components/map-view/map-view.component';
import { NewMediaComponent } from './components/new-media/new-media.component';
import { PanelOpcionesComponent } from './components/panel-opciones/panel-opciones.component';
import { PortadaComponent } from './components/portada/portada.component';
import { QuejaComponent } from './components/queja/queja.component';
import { QuejaDetailComponent } from './components/queja-detail/queja-detail.component';
import { QuejaListComponent } from './components/queja-list/queja-list.component';
import { Select2BootstrapComponent } from './components/select2-bootstrap/select2-bootstrap.component';
import { WebrtcCameraComponent } from './components/webrtc-camera/webrtc-camera.component';

import { ContentService } from './services/content.service';
import { LoginService } from './services/login.service';
import { AuthGuardService } from './services/auth-guard.service';
import { LoginGuardService } from './services/login-guard.service';
import { NotifierService } from './services/notifier.service';
import { CameraService } from './services/camera.service';
import { SocketService } from './services/socket.service';
import { BrowserNotifierService } from './services/browser-notifier.service';

@NgModule({
  declarations: [
    AppComponent,
    AlertComponent,
    ContentLayerComponent,
    EditQuejaComponent,
    ErrorComponent,
    InicioComponent,
    LoginComponent,
    MainNavComponent,
    MapViewComponent,
    NewMediaComponent,
    PanelOpcionesComponent,
    PortadaComponent,
    QuejaComponent,
    QuejaDetailComponent,
    QuejaListComponent,
    Select2BootstrapComponent,
    WebrtcCameraComponent
  ],
  imports: [
    HttpModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    routing,
    AngularFontAwesomeModule,
    ServiceWorkerModule.register('/sw-workbox.js', { enabled: environment.production })
  ],
  providers: [appRoutingProviders, ContentService, LoginService, AuthGuardService, LoginGuardService, NotifierService, CameraService, SocketService, BrowserNotifierService],
  bootstrap: [AppComponent],
  entryComponents: [AlertComponent, EditQuejaComponent, NewMediaComponent]
})
export class AppModule { }
