import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { OwlModule } from 'ngx-owl-carousel';
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
import { QuejaService } from './services/queja.service';
import { HorizonModalComponent } from './components/horizon-modal/horizon-modal.component';
import { MaterialButtonComponent } from './components/material-button/material-button.component';
import { MaterialBtnListComponent } from './components/material-btn-list/material-btn-list.component';
import { CommentComponent } from './components/comment/comment.component';
import { CommentReplyComponent } from './components/comment-reply/comment-reply.component';
import { EditUserComponent } from './components/edit-user/edit-user.component';

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
    WebrtcCameraComponent,
    HorizonModalComponent,
    MaterialButtonComponent,
    MaterialBtnListComponent,
    CommentComponent,
    CommentReplyComponent,
    EditUserComponent
  ],
  imports: [
    HttpModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    routing,
    AngularFontAwesomeModule,
    OwlModule,
    ServiceWorkerModule.register('/sw-workbox.js', { enabled: environment.production })
  ],
  providers: [appRoutingProviders, ContentService, LoginService, AuthGuardService, LoginGuardService, NotifierService, CameraService, SocketService, BrowserNotifierService, QuejaService],
  bootstrap: [AppComponent],
  entryComponents: [AlertComponent, HorizonModalComponent]
})
export class AppModule { }
