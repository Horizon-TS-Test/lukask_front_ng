# LukaskFront

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.6.2.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

##TO INSTAL PACKAGES:
Run npm install

##TO RUN NORMAL ANGULAR-CLI VERSION
ng serve

##TO RUN THE PWA VERSION:
###JUST THE FIRS TIME
-npm install -g http-server

###ANY TIME YOU RUN THE APP
####GENERATE THE SERVICE WORKER:
cd /workbox
workbox injectManifest workbox-config.js

####IN ONE TERMINAL
ng build --prod
cd dist/lukask_pwa
####USE THE PORT YOU PREFER
http-server -p 8080 -c-1