import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ContentService } from '../../services/content.service';
import { ViewChild } from '@angular/core';
import { Publication } from '../../models/publications';
import { QuejaService } from '../../services/queja.service';
import pubIcons from '../../data/pub-icons';
import pubIconsOver from '../../data/pub-icons-over';
import styleMap from '../../data/map-style';
import { CONTENT_TYPES } from '../../config/content-type';
import { Subscription } from 'rxjs';
import { DynaContentService } from 'src/app/services/dyna-content.service';

import { cacha } from 'src/app/data/parroquias/cacha';
import { calpi } from 'src/app/data/parroquias/calpi';
import { cubijies } from 'src/app/data/parroquias/cubijies';
import { flores } from 'src/app/data/parroquias/flores';
import { lican } from 'src/app/data/parroquias/lican';
import { pungala } from 'src/app/data/parroquias/pungala';
import { punin } from 'src/app/data/parroquias/punin';
import { quimiag } from 'src/app/data/parroquias/quimiag';
import { sanjuan } from 'src/app/data/parroquias/sanjuan';
import { sanluis } from 'src/app/data/parroquias/sanluis';
import { riobamba } from 'src/app/data/parroquias/riobamba';
import { veloz } from 'src/app/data/parroquias/veloz';
import { licto } from 'src/app/data/parroquias/licto';
import { maldonado } from 'src/app/data/parroquias/maldonado';
import { velasco } from 'src/app/data/parroquias/velasco';
import { lizarzaburu } from 'src/app/data/parroquias/lizarzaburu';
import { yaruquies } from 'src/app/data/parroquias/yaruquies';
import { GpsService } from 'src/app/services/gps.service';

import * as Snackbar from 'node-snackbar';



declare var google: any;
declare var $: any;


@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.css']
})
export class MapViewComponent implements OnInit, OnChanges {
  @Input() focusPubId: string;

  public lat: number;
  public lng: number;
  public zoom: number;
  public subscription: Subscription;
  public fechai: any;
  public fechaf: any;
  public mostrarp1: boolean;
  public mostrarp2: boolean;
  public mostrarp3: boolean;
  

  @ViewChild('gmap') gmapElement: any;
  map: any;
  public pubList: Publication[];
  public _locationCity: string;
  private lstMarkers: Array<any>;
  public ciudades: Array<any>;
  public parishSelect: string;
  public cantonSelect: string;

  public graficoParroquia: any;
  public parroquias: any = [];

  constructor(
    private _contentService: ContentService,
    private _quejaService: QuejaService,
    private _dynaContentService: DynaContentService,
    private _gpsService: GpsService,
  ) {
    this.mostrarp1 = false;
    this.mostrarp2 = false;
    this.mostrarp3 = true;

    this.lat = -1.6709800;
    this.lng = -78.6471200;
    this.zoom = 15;
    this.parishSelect = "1";
    this.cantonSelect = "1";
    this.graficoParroquia = "N/D"; //Variable que almacenara el grafico de la parroquia
    this.lstMarkers = new Array<any>();
    this.ciudades = new Array<any>();
    //Iniciar fechas
    var fechatemp = new Date();
    this.fechai=fechatemp.getFullYear()+"-"+(fechatemp.getMonth()+1) +"-"+fechatemp.getDate();
    this.fechaf=fechatemp.getFullYear()+"-"+(fechatemp.getMonth()+1) +"-"+fechatemp.getDate();

}

  ngOnInit() {
    this._contentService.fadeInComponent($("#mapContainer"));
    this.getGps()
    var mapProp = {
      center: new google.maps.LatLng(this.lat, this.lng),
      zoom: this.zoom,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: styleMap,
      disableDefaultUI: true
    };

    /**
     * PARA SUBSCRIBIRSE AL EVENTO DE ACTUALIZACIÓN DEL SOCKET, QUE TRAE 
     * LOS CAMBIOS DE UNA PUBLICACIÓN PARA LUEGO MOSTRARLA EN EL MAPA
    */
    this.subscription = this._quejaService.map$.subscribe((newPubId: string) => {
      if (newPubId) {
        this.fetchPub();
        this.focusPubId = newPubId;
        this.focusPubById();
      }
    });
    

    //Definición del mapa
    this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);

    //this.getPubs();
    this.getCanton();
    /**
     * METODO QUE EJECUTA LA ACCIÓN DEL MARKER
     */
    $("#idviewPub").on(("click"), (event) => { });
  }

  /**
   * METODO QUE OBTIENE LA POSICIÓN DESDE DONDE SE EMITE LA QUEJA
   */
  private getGps() {
    if (!('geolocation' in navigator)) {
      return;
    }

    //ACCESS TO THE GPS:
    navigator.geolocation.getCurrentPosition((position) => {
      this.lat = position.coords.latitude;
      this.lng = position.coords.longitude;
      this.getLocation();

    }, function (err) {
      console.log(err);
      //EXCEDED THE TIMEOUT
      return;
    }, { timeout: 7000 });
  }

  /**
   * METODO QUE RECORRE LA LISTA DE QUEJAS Y CREA EL MARKER DE CADA UNA
   */
  private fetchPub() {
    for (let pub of this.pubList) {
      this.crearMarker(pub.latitude, pub.longitude, this.defineTypeIcon(pub.type), pub.id_publication, pub.type, pub.type.description);
    }
  }

  /**
   * METODO PARA CREAR EL MARKER EN EL MAPA
   * @param lat = latitud
   * @param lng = longitud
   * @param icon = icono
   * @param pubId = identificador de la publicacion
   * @param pubtype = tipo de queja
   * @param description = nombre de la entidad
   */
  private crearMarker(lat, lng, icon, pubId: string, pubtype, description) {
    let marker = new google.maps.Marker({
      position: new google.maps.LatLng(lat, lng),
      map: this.map,
      title: description,
      icon: './assets/icons/icoEERSA5.ico',
      draggable: false,
    });

    var infowindow = new google.maps.InfoWindow({
      content: description
    });

    /*
    marker.addListener('click', (event) => {
      this._dynaContentService.loadDynaContent({ contentType: CONTENT_TYPES.view_queja, contentData: pubId });
      $("#idviewPub").click(); //No tocar si no deja de funcionar ojo!!     
    });
*/
    marker.addListener('mouseover', () => {
      let icon = this.defineTypeIconOver(pubtype);
      //marker.setIcon(icon);
      marker.setAnimation(google.maps.Animation.BOUNCE);
      infowindow.open(this.map, marker);
    });

    marker.addListener('mouseout', () => {
      let icon = this.defineTypeIcon(pubtype);
      //marker.setIcon(icon);
      marker.setAnimation();
      infowindow.close(this.map, marker);
    });

    this.lstMarkers.push(marker);
    this.map.setCenter(new google.maps.LatLng(lat, lng));
    this.map.setZoom(16);
  }


  /**
   * Funcion para traer las publicaciones 
   */
  private getPubs() {
    this.pubList = this._quejaService.getPubListObj();
    if (!this.pubList) {
      this._quejaService.getPubList().then((pubs: Publication[]) => {
        this.pubList = pubs;
        this.fetchPub();
        if (!this.focusPubId) {
          this.focusPubId = this.pubList[0].id_publication;
        }
        //HACIENDO FOCUS UNA PUBLICACIÓN EN EL MAPA      
        this.focusPubById();
      });
    } else {
      this.fetchPub();
      if (!this.focusPubId) {
        this.focusPubId = this.pubList[0].id_publication;
      }
      //HACIENDO FOCUS UNA PUBLICACIÓN EN EL MAPA      
      this.focusPubById();
    }
  }

  /**
   * METODO QUE VALIDA SI HAY UN ID DE QUEJA PARA UBICARLO EN EL MAPA
   */
  private focusPubById() {
    if (this.focusPubId) {
      let focusZoom = 15;
      for (let i = 0; i < this.pubList.length; i++) {
        if (this.focusPubId == this.pubList[i].id_publication) {
          this.map.setCenter({ lat: this.pubList[i].latitude, lng: this.pubList[i].longitude });
          this.map.setZoom(focusZoom);
          i = this.pubList.length;
        }
      }
    }
  }

  /**
   * METODO QUE SEGUN EL TIPO DE ENTIDAD ENVIA EL ICONO
   * @param typeId = TIPO DE ENTIDAD
   */
  private defineTypeIcon(typeId) {
    for (let typeIcon of pubIcons) {
      if (typeIcon.type_id == typeId.description) {
        return typeIcon.icon;
      }
    }
  }

  /**
   * METODO PARA CAMBIAR DE ICONO CUANDO EL MOUSE SE ENCUENTRE ENCIMA
   * @param typeId = Identificador del marker en el que el mouse se encuentra encima 
   * */
  private defineTypeIconOver(typeId) {
    for (let typeIconOver of pubIconsOver) {
      if (typeIconOver.type_id == typeId.description) {
        return typeIconOver.icon;
      }
    }
  }

  
  ngOnChanges(changes: SimpleChanges) {
    for (let property in changes) {
      /*console.log('Previous:', changes[property].previousValue);
      console.log('Current:', changes[property].currentValue);
      console.log('firstChange:', changes[property].firstChange);*/
      if (property === 'focusPubId') {
        if (changes[property].currentValue) {
          this.focusPubId = changes[property].currentValue;
          if (this.pubList) {
            this.focusPubById();
          }
        }
      }
    }
  }

  /**
   * Funciones de seleccion de ciudades
   */


  /**
   * Método que graficara las parroquias
   * @param fuccion 
   */
  seleccionar(fuccion) {
    this.borrarMarkers();
    
    if (fuccion == "funcion3") {
      this.getQuejaType();
    }

    switch (this.parishSelect) {
      case "CACHA":
        this.decidir(cacha.coordenadas, cacha.color);
        break;
      case "ae5cc6ac-ff54-473c-b97d-38f7945d05e5"://"CALPI":
        this.decidir(calpi.coordenadas, calpi.color);
        break;
      case "CUBIJIES":
        this.decidir(cubijies.coordenadas, cubijies.color);
        break;
      case "FLORES":
        this.decidir(flores.coordenadas, flores.color);
        break;
      case "LICAN":
        this.decidir(lican.coordenadas, lican.color);
        break;
      case "a2729ce8-2077-44fb-8f2e-eb0a6df7fdd7"://"PUNGALA":
        this.decidir(pungala.coordenadas, pungala.color);
        break;
      case "8f83baf3-3af4-4510-a29f-7d83d492b55c"://"PUNIN":
        this.decidir(punin.coordenadas, punin.color);
        break;
      case "072bd690-2207-45af-be0b-50722096fef1"://"QUIMIAG":
        this.decidir(veloz.coordenadas, veloz.color);
        break;
      case "SAN JUAN":
        this.decidir(sanjuan.coordenadas, sanjuan.color);
        break;
      case "SAN LUIS":
        this.decidir(sanluis.coordenadas, sanluis.color);
        break;
      case "20da2d98-cc33-47ed-823d-62f6a719bbfc"://"VELOZ":
        this.decidir(veloz.coordenadas, veloz.color);
        break;
      case "666bc427-b3c1-4cdf-a9dc-746699efa6ad"://"LICTO":
        this.decidir(licto.coordenadas, licto.color);
        break;
      case "feb040ec-c24d-4dfc-bf21-003bb384a095"://"MALDONADO":
        this.decidir(maldonado.coordenadas, maldonado.color);
        break;
      case "d1ef216d-a2cf-4c93-8e1c-c89746d0c1ad"://"LIZARZABURU":
        this.decidir(lizarzaburu.coordenadas, lizarzaburu.color);
        break;
      case "b0d40bde-5970-4af0-b2d6-5647321e9b87"://"YARUQUIES":
        this.decidir(yaruquies.coordenadas, yaruquies.color);
        break;
      case "726295f4-e278-411f-b7c2-b72c7af2b69d"://"VELASCO":
        this.decidir(velasco.coordenadas, velasco.color);
        break;

      default:
        this.borrarMarkers();
        this.lstMarkers = new Array<any>();
        this.graficoParroquia.setMap(null);
    }
  }

  /**
   * Método que elimina el gráfico anterior y restablece el mapa
   * @param coordenadas //Coordenadas de la parroquia a ser graficada
   */
  decidir(coordenadas, color) {
    if (this.graficoParroquia.map) {
      this.graficoParroquia.setMap(null);
      this.graficar(coordenadas, color);
    } else {
      this.graficar(coordenadas, color);
    }
  }


  /**
   * Método que elimina el gráfico sin mandar por parametros coordenadas
   * @param coordenadas //Coordenadas de la parroquia a ser graficada
   */
  borrarGraficoAnterior() {
    if (this.graficoParroquia.map) {
      this.graficoParroquia.setMap(null);
    }
  }

  /**
   * Método que borra los markers de la parroquia enterior dibujados en el mapa 
   */
  borrarMarkers() {
    if (this.lstMarkers.length) {
      for (let dato in this.lstMarkers) {
        this.lstMarkers[dato].setMap(null);
      }
      this.lstMarkers = new Array<any>();
    }
  }

  /**
   * Método que grafica los graficos de las parroquias
   * @param coordenadas //Coordenadas de la parroquia
   * @param color //Color de la parroquia
   */
  graficar(coordenadas, color) {
    this.graficoParroquia = new google.maps.Polygon({
      paths: coordenadas,
      strokeColor: color,//'#048170',//'#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 3,
      fillColor: color,//'#048170',//'#FF0000',
      fillOpacity: 0.35
    });
    this.graficoParroquia.setMap(this.map);
    //Pongo la vista del mapa en el primer punto del gráfico
    this.map.setCenter({lat:coordenadas[0].lat,lng:coordenadas[0].lng});
  }


  /**
   * MÉTODO QUE TOMA LA CIUDAD Y DIRECCIÓN DE DONDE SE EMITE LA QUEJA
   */
  public getLocation() {
    this._gpsService.getDeviceLocation(this.lat, this.lng, (deviceLocation) => {
      //this._locationAddress = deviceLocation.address;
      this._locationCity = deviceLocation.city;
      //$("#hidden-btn").click();
    });
  }


  /**
  * MÉTODO PARA CARGAR LOS TIPOS DE QUEJA PARA UN NUEVO REGISTRO:
  */
  private getQuejaType() {
    this._quejaService.getPubParish(this.parishSelect).then((qTypes) => {
      this.pubParish(qTypes);
    });
  }

  /**
   * Funcion que recibe las quejas que estan dentro de la parroquia y los grafica 
   * @param datos //Publicaciones traidas de la consulta
   */
  private pubParish(datos) {
    var listaPubs = datos.results;
    for (let pub of listaPubs) {
      /**
      * Funcion que determina si esta dentro de la ciudad
      * @param posicion : google.maps.LatLng //Parametro posicion de los marquers
      */
      var posicion = new google.maps.LatLng(pub.latitude, pub.length);
      // Manto a llamar al método que crea el marker dada un posición
      this.crearMarker(pub.latitude, pub.length, this.defineTypeIcon(pub.type_publication_detail), pub.id_publication, pub.type_publication_detail, pub.type_publication_detail);
    }
  }

  /**
   * Funcion que recibe las quejas y los grafica si dentro de un rango de fechas
   * @param publications //Publicaciones traidas de la consulta
   */
  
  private pubParishDate(publications) {
    var listaPubs = publications.results;
    for (let pub of listaPubs) {
      /**
       * Funcion que determina si esta dentro de la ciudad
       * @param posicion : google.maps.LatLng //Parametro posicion de los marquers
       */
      this.crearMarker(pub.latitude, pub.length, this.defineTypeIcon(pub.type_publication_detail), pub.id_publication, pub.type_publication_detail, pub.type_publication_detail);
    }
  }


  /**
   * Obtener el listado de la cantones para ser llenados en la lista de la interfaz
   */
  private getCanton() {
    this._quejaService.getCiudades('4f6eb70f-12c3-4204-9a94-96117032f07e').then((result) => {
      this.ciudades = result;
      return result;
    })
  }

  /**
   * Funcion que al cambiar de canton, llena utomaticamente la lista de parroquias de ese canton en la interfaz
   * @param $event 
   */
  onChange($event) {
    this._quejaService.getParroquias(this.cantonSelect).then((result) => {
      this.parroquias = result;
    })
  }

  /**
   * Funcion que validara que el rango de fechas ingresada no excede de 30 dias
   * @param fuccion //nombre de la funcion mandada desde la interfaz para validar a que función mandar
   */
  validarFecha(fuccion) {

    if(this.parishSelect == '1'){
      Snackbar.show({ text: "Seleccione un parroquia!", pos: 'bottom-center', actionText: 'Entendido', actionTextColor: '#f0bd50', customClass: "p-snackbar-layout" });      
      return 0;
    }

    var textoIngresado = this.fechaf.split("-");

    //Llevar a tipo Date
    //  mes -1 porque empieza en 0
    //  y llevar a hora 00:00:00
    var fechaIngresada = new Date(textoIngresado[0], textoIngresado[1] - 1, textoIngresado[2], 0, 0, 0, 0);

    //Obtener fecha límite
    var cantDias = 30;
    //var fechaLimite = new Date(); //fecha actual
    var textoIngresado2 = this.fechai.split("-");
    var fechaLimite = new Date(textoIngresado2[0], textoIngresado2[1] - 1, textoIngresado2[2], 0, 0, 0, 0); //fecha actual
    //fechaLimite.setHours(0, 0, 0, 0); //llevar a hora 00:00:00
    fechaLimite.setDate(fechaLimite.getDate() + cantDias); //sumarle 10 días
    //Validar
    if (fechaIngresada >= fechaLimite) {
        Snackbar.show({ text: "Ingrese una fecha dentro del os 30 dias!", pos: 'bottom-center', actionText: 'Entendido', actionTextColor: '#f0bd50', customClass: "p-snackbar-layout" });
    } else {
      if (fuccion == 'function1') {
        this.getQuejasFecha();
      } else {
        this.getQuejasFechaParish();
      }
    }
  }


  /**
  * Obtener las publicaciones por fecha
  */
  private getQuejasFecha() {
    this._quejaService.getPubFecha(this.fechai, this.fechaf).then((qTypes) => {
      this.borrarMarkers();
      this.borrarGraficoAnterior();

      this.pubParishDate(qTypes);//Crea los marquers de las publicaciones que traen con resultado de la consulta
      if (qTypes.count <= 0) {
        Snackbar.show({ text: "Lo sentimos no hay registros para mostrar.", pos: 'bottom-center', actionText: 'Entendido', actionTextColor: '#f0bd50', customClass: "p-snackbar-layout" });        
      }
      //this.pubList = qTypes;
      //this.fetchPub();
    });
  }

  /**
  * Obtener las publicaciones por fecha
  */
  private getQuejasFechaParish() {
    this._quejaService.getPubFechaParish(this.fechai, this.fechaf, this.parishSelect).then((qTypes) => {
      this.borrarMarkers();
      this.borrarGraficoAnterior();
      
      this.seleccionar("sinparametro"); //Dibuja la parroquia
      this.pubParishDate(qTypes); //Dibuja los markers de las quejas resultantes
      if (qTypes.count <= 0) {
        Snackbar.show({ text: "Lo sentimos no hay registros para mostrar.", pos: 'bottom-center', actionText: 'Entendido', actionTextColor: '#f0bd50', customClass: "p-snackbar-layout" });        
      }
      //this.pubList = qTypes;
      //this.fetchPub();
    });
  }

  /**
   * Funcion que muestra paneles segun sea el caso
   */
  toogle() {
    if (this.mostrarp1 == false) {
      this.mostrarp2 = false;
      this.mostrarp3 = false;
      this.mostrarp1 = true;
    } else {
      if (this.mostrarp2 == false) {
        this.mostrarp2 = true;
        this.mostrarp3 = false;
        this.mostrarp1 = null;
      } else {
        this.mostrarp2 = false;
        this.mostrarp3 = true;
        this.mostrarp1 = false;
      }
    }
  }
}
