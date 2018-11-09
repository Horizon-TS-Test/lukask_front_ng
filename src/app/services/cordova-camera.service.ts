import { Injectable } from '@angular/core';

declare var Camera: any;
declare var navigator: {
  camera: any
};
declare var cordova: any;
declare var window: {
  resolveLocalFileSystemURL: any,
  requestFileSystem: any,
  TEMPORARY: any
};
declare var writeFile: any;

@Injectable({
  providedIn: 'root'
})
export class CordovaCameraService {

  constructor() { }

  private setOptions(srcType) {
    var options = {
      // Some common settings are 20, 50, and 100
      quality: 50,
      destinationType: Camera.DestinationType.FILE_URI,
      // In this app, dynamically set the picture source, Camera or photo gallery
      sourceType: srcType,
      encodingType: Camera.EncodingType.JPEG,
      mediaType: Camera.MediaType.PICTURE,
      allowEdit: true,
      correctOrientation: true  //Corrects Android orientation quirks
    }
    return options;
  }

  public openCamera(callback) {
    var srcType = Camera.PictureSourceType.CAMERA;
    var options = this.setOptions(srcType);
    //var func = createNewFileEntry;

    navigator.camera.getPicture(function cameraSuccess(imageUri) {

      callback(imageUri);
      // You may choose to copy the picture, save it somewhere, or upload.
      //func(imageUri);

    }, function cameraError(error) {
      console.debug("Unable to obtain picture: " + error, "app");
      callback(null);
    }, options);
  }

  public openFilePicker() {
    var srcType = Camera.PictureSourceType.SAVEDPHOTOALBUM;
    var options = this.setOptions(srcType);
    //var func = createNewFileEntry;

    navigator.camera.getPicture(function cameraSuccess(imageUri) {

      alert("GETTING IMG: " + imageUri);

    }, function cameraError(error) {
      console.debug("Unable to obtain picture: " + error, "app");
      return null;
    }, options);
  }

  public isCameraEnabled() {
    return navigator.camera != undefined;
  }

  public createNewFileEntry(imgUri, imgName, callback) {
    /*window.requestFileSystem(window.TEMPORARY, 5 * 1024 * 1024, function (fs) {

      console.log('file system open: ' + fs.name);
      var fileName = "uploadSource.jpeg";
      var dirEntry = fs.root;
      dirEntry.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {

        // Write something to the file before uploading it.
        writeFile(fileEntry);
        callback(fileEntry);

      }, function (error) {
        alert("error" + error);
      });

    }, function (resolveUrlError) {
      alert("resolveUrlError" + resolveUrlError);
    });*/
    /*window.resolveLocalFileSystemURL(cordova.file.cacheDirectory, function success(dirEntry) {

      // JPEG file
      dirEntry.getFile(imgName + ".jpeg", { create: true, exclusive: false }, function (fileEntry) {

        // Do something with it, like write to it, upload it, etc.
        writeFile(fileEntry, imgUri);
        alert("PATH file: " + fileEntry.fullPath);
        alert("NAME file: " + fileEntry.name);
        callback(fileEntry);

        // displayFileData(fileEntry.fullPath, "File copied to");

      }, function (error) {
        alert("error" + error);
      });

    }, function (resolveUrlError) {
      alert("resolveUrlError" + resolveUrlError);
    });*/
  }

  /*public getFileEntry(imgUri, callback) {
    window.resolveLocalFileSystemURL(imgUri, function success(fileEntry) {

      // Do something with the FileEntry object, like write to it, upload it, etc.
      writeFile(fileEntry, imgUri);
      alert("PATH file: " + fileEntry.fullPath);
      alert("NAME file: " + fileEntry.name);
      callback(fileEntry);

    }, function () {
      // If don't get the FileEntry (which may happen when testing
      // on some emulators), copy to a new FileEntry.
      /*this.createNewFileEntry(imgUri, (defaultFileEntry) => {
        callback(defaultFileEntry);
      });
});
  }*/

}
