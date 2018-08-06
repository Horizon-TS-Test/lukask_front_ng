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
import { ReplyListComponent } from './components/reply-list/reply-list.component';
import { CommentFormComponent } from './components/comment-form/comment-form.component';
import { UserService } from './services/user.service';
import { UserEditComponent } from './components/user-edit/user-edit.component';
import { TaskListComponent } from './components/task-list/task-list.component';
import { SingleMapComponent } from './components/single-map/single-map.component';
import { ImgViewerComponent } from './components/img-viewer/img-viewer.component';
import { CommentListComponent } from './components/comment-list/comment-list.component';
import { HorizonNotificationComponent } from './components/horizon-notification/horizon-notification.component';
import { NotificationService } from './services/notification.service';
import { NotificationListComponent } from './components/notification-list/notification-list.component';
import { MediaStreamingComponent } from './components/media-streaming/media-streaming.component';
import { ActivityComponent } from './components/activity/activity.component';
import { RouterService } from './services/router.service';
import { HomePanelComponent } from './components/home-panel/home-panel.component';
import { NewPubComponent } from './components/new-pub/new-pub.component';
import { PubFormComponent } from './components/pub-form/pub-form.component';
import { PagosInicioComponent } from './components/pagos-inicio/pagos-inicio.component';
import { FindAccountsComponent } from './components/find-accounts/find-accounts.component';
import { PlanillaComponent } from './components/planilla/planilla.component';
import { PlanillaDetailComponent } from './components/planilla-detail/planilla-detail.component';
import { PaymentsCardComponent } from './components/payments-card/payments-card.component';
import { PaypalComponent } from './components/paypal/paypal.component';
import { SupportListComponent } from './components/support-list/support-list.component';
import { ProfileLinkComponent } from './components/profile-link/profile-link.component';
import { ProfileOwnerComponent } from './components/profile-owner/profile-owner.component';
import { HorizonPopOverComponent } from './components/horizon-pop-over/horizon-pop-over.component';
import { UserRegisterComponent } from './components/user-register/user-register.component';
import { UserFormComponent } from './components/user-form/user-form.component';
import { HorizonSwitchInputComponent } from './components/horizon-switch-input/horizon-switch-input.component';

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
    ReplyListComponent,
    CommentFormComponent,
    UserEditComponent,
    TaskListComponent,
    SingleMapComponent,
    ImgViewerComponent,
    CommentListComponent,
    HorizonNotificationComponent,
    NotificationListComponent,
    MediaStreamingComponent,
    ActivityComponent,
    HomePanelComponent,
    NewPubComponent,
    PubFormComponent,
    PagosInicioComponent,
    FindAccountsComponent,
    PlanillaComponent,
    PlanillaDetailComponent,
    PaymentsCardComponent,
    PaypalComponent,
    SupportListComponent,
    ProfileLinkComponent,
    ProfileOwnerComponent,
    HorizonPopOverComponent,
    UserRegisterComponent,
    UserFormComponent,
    HorizonSwitchInputComponent
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
  providers: [appRoutingProviders, ContentService, UserService, AuthGuardService, LoginGuardService, NotifierService, CameraService, SocketService, BrowserNotifierService, QuejaService, NotificationService, RouterService],
  bootstrap: [AppComponent],
  entryComponents: [AlertComponent, HorizonModalComponent, SingleMapComponent, HorizonNotificationComponent, HorizonPopOverComponent]
})
export class AppModule { }