import { Injectable } from '@angular/core';

declare var google: any;

@Injectable({
  providedIn: 'root'
})
export class GpsService {

  constructor() { }

  /**
   * METODO PARA OBTENER LAS COORDENADAS DEL DISPOSITIVO USANDO CORDOVA:
   */
  public getDeviceGeolocation(callback) {
    if (!('geolocation' in navigator)) {
      return;
    }

    navigator.geolocation.getCurrentPosition((position) => {
      let gps_data = {
        position: position.coords.latitude,
        Longitude: position.coords.longitude,
        Altitude: position.coords.altitude,
        Accuracy: position.coords.accuracy,
        altitude_accuracy: position.coords.altitudeAccuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: position
      };
      console.log('[LUKASK GPS SERVICE] - GPS DATA: ', gps_data);

      callback({ lat: position.coords.latitude, long: position.coords.longitude });
    }, (error) => {
      console.log('code: ' + error.code + '\n' +
        'message: ' + error.message + '\n');
    }, { timeout: 7000 });
  }

  /**
   * METODO PARA OBTENER LA POSICION GEO REFERENCIAL DEL DISPOSITIVO USANDO EL GEOCODER DE GOOGLE:
   * @param latitude 
   * @param longitude 
   * @param callback 
   */
  public getDeviceLocation(latitude: number, longitude: number, callback) {
    var geocoder = new google.maps.Geocoder;
    geocoder.geocode({ 'latLng': { lat: latitude, lng: longitude } }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK) {
        let str = results[0].formatted_address;
        let location = str.split(",");

        callback({ address: location[0], city: location[1] });
      }
    });
  }
}
