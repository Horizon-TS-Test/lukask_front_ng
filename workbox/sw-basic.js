importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.2.0/workbox-sw.js");

//NEXT ALLOWS US TO USE INDEX DB:
importScripts('/assets/js/idb.js');
importScripts('/assets/js/utility-db.js');
///////////

var SYNC_TYPE = {
    pubSyn: 'sync-new-pub'
};
var REST_URLS = {
    pub: 'http://192.168.1.37:3000/publication',
    qtype: 'http://192.168.1.37:3000/qtype'
}

workbox.precaching.suppressWarnings();

//DYNAMIC CACHING WITH ROUTING:
//REGULAR EXPRESSION FOR FONT AWESOME URL'S:
workbox.routing.registerRoute(new RegExp("[^*]/fontawesome-webfont.*"), workbox.strategies.staleWhileRevalidate({
    cacheName: 'font-awesome'
}));
////

//REGULAR EXPRESSION FOR BACKEND MEDIA:
workbox.routing.registerRoute(new RegExp("http://192.168.1.58:8081/repositorio_lukask/*"), workbox.strategies.staleWhileRevalidate({
    cacheName: 'lukask-media'
}));
////

//FOR SPA APPS:
workbox.routing.registerNavigationRoute('/index.html');
////

//HANDLER FOR INDEXED DB:
workbox.routing.registerRoute(REST_URLS.pub, function (args) {
    return fetch(args.event.request)
        .then(function (res) {
            //STORE THE RESPONSE ON INDEX DB:
            var clonePubRes = res.clone();
            clearAllData('publication')
                .then(function () {
                    return clonePubRes.json();
                })
                .then(function (response) {
                    console.log("[Lukask Service Worker - indexedDB] pub from rest api", response.data);
                    var pubs = response.data;
                    for (var i = 0; i < pubs.length; i++) {
                        writeData('publication', pubs[i]);
                    }
                });
            return res;
        });
});

workbox.routing.registerRoute(REST_URLS.qtype, function (args) {
    return fetch(args.event.request)
        .then(function (res) {
            //STORE THE RESPONSE ON INDEX DB:
            var cloneTypeRes = res.clone();
            clearAllData('qtype')
                .then(function () {
                    return cloneTypeRes.json();
                })
                .then(function (response) {
                    console.log("[Lukask Service Worker - indexedDB] qtype from rest api", response.data);
                    for (var qtype of response.data) {
                        writeData('qtype', qtype);
                    }
                });
            return res;
        });
});
/////////

//FALLBACK PAGE AND DYNAMIC CACHING:
workbox.routing.registerRoute(function (routeData) {
    return (routeData.event.request.headers.get("accept").includes("text/html"));
}, function (args) {
    return caches.match(args.event.request)
        .then(function (response) {
            if (response) {
                return response;
            }
            else {
                //DYNAMIC CACHING:
                return fetch(args.event.request)
                    .then(function (res) {
                        return caches.open("dynamic")
                            .then(function (cache) {
                                cache.put(args.event.request.url, res.clone());
                                return res;
                            })
                    })
                    .catch(function (err) {
                        return caches.match(new RegExp('/offline/'))
                            .then(function (res) {
                                return res;
                            })
                    });
            }
        });
});
///////////

/////////////POST REQUEST TO THE SERVER WITH A BACKGROUND SYNCRONIZATION WAY USING THE SERVICE WORKER://////////////
function sendData(user_id, formData, indexedTable, restUrl) {
    fetch(restUrl, {
        method: 'POST',
        body: formData,
        credentials: true,
        headers: {
            "Pass-Key": user_id
        }
    }).then(function (res) {
        console.log('Data sent', res);
        if (res.ok) {
            res.json()
                .then(function (restData) {
                    writeData('publication', restData.pub);
                    //ALWAYS IT MUST BE "id" FOR GENERIC PURPOSES:
                    deleteItemData(indexedTable, formData.get('id'));
                    ////
                });
        }
    }).catch(function (err) {
        console.log('Error while sending data', err);
    });
}

self.addEventListener('sync', function (event) {
    console.log('[Lukask Service Worker] Background syncing', event);

    switch (event.tag) {
        case SYNC_TYPE.pubSyn:
            console.log('[Lukask Service Worker] Syncing new pubs');
            event.waitUntil(
                readAllData('sync-pub')
                    .then(function (data) {
                        for (var pub of data) {
                            //SENDING PUB TO THE BACKEND SERVER:
                            var formData = new FormData();
                            //ALWAYS IT MUST BE "id" FOR GENERIC PURPOSES:
                            formData.append('id', pub.id);
                            //
                            formData.append('latitude', pub.latitude);
                            formData.append('longitude', pub.longitude);
                            formData.append('detail', pub.detail);
                            formData.append('type_publication', pub.type_publication);
                            formData.append('date_publication', pub.date_publication);
                            for (var media of pub.media_files) {
                                formData.append('media_files[]', media.file, media.fileName);
                            }

                            sendData(pub.user_id, formData, 'sync-pub', REST_URLS.pub);
                        }
                    })
            );
            break;
    }
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

workbox.precaching.precacheAndRoute([], {});

/////////////////////////////////////PUSH NOTIFICATIONS///////////////////////////////////////////////////////

//HANDLE CLICK EVENTS:
self.addEventListener('notificationclick', function (event) {
    //FIND OUT THE NOTIFICATION:
    var notification = event.notification;
    //FIND OUT WHICH ACTION WAS CLICKED:
    var action = event.action;

    console.log(notification);
    if (action == 'confirm') {
        console.log("confirm was chosen");
        //notification.close();
    }
    else {
        console.log(action);
        //TO MAKE THE SERVICE WORKER WAIT UNTIL THE EVENT HAS BEEN COMPLETED:
        event.waitUntil(
            //TO HANDLE THE TABS OF THE WEB BROWSER:
            clients.matchAll()
                .then(function (clientsArray) {
                    var client = clientsArray.find(function (cli) {
                        return cli.visibilityState === 'visible';
                    });

                    //IF THE WEB BROWSER IS OPEN:
                    if (client !== undefined) {
                        client.navigate(notification.data.url);
                        client.focus();
                    }
                    //IF ITS CLOSED:
                    else {
                        clients.openWindow(notification.data.url);
                    }
                })
        );
    }
    notification.close();
});
/////

self.addEventListener('notificationclose', function (event) {
    console.log("Notification was closed");
});

//CONFIGURING PUSH NOTIFICATIONS RECEPTOR:
self.addEventListener('push', function (event) {
    console.log('Push Notification received', event);

    var defaultNotifData = { title: 'New!', content: 'Something new happened!', open_url: '/' };

    if (event.data) {
        defaultNotifData = JSON.parse(event.data.text());
    }

    var options = {
        body: defaultNotifData.content,
        icon: '/assets/images/logo/logo-1.svg',
        badge: '/assets/images/logo/logo-1.svg',
        data: {
            url: defaultNotifData.open_url
        }
    };

    event.waitUntil(
        self.registration.showNotification(defaultNotifData.title, options)
    );
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////