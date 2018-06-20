importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.2.0/workbox-sw.js");

//NEXT ALLOWS US TO USE INDEX DB:
importScripts('/assets/js/idb.js');
importScripts('/assets/js/utility-db.js');
///////////

var SYNC_TYPE = {
    pubSyn: 'sync-new-pub'
};
var REST_URLS_PATTERN = {
    medios: /http:\/\/192.168.1.58:8081\/repositorio_lukask\/.*/,
    firstPubs: /http:\/\/192.168.1.37:3000\/publication\/\?limit=[0-9]+$/,
    morePubs: /http:\/\/192.168.1.37:3000\/publication\/\?limit=[0-9]+&offset=[0-9]+$/,
    qtype: 'http://192.168.1.37:3000/qtype',
    comments: /http:\/\/192.168.1.37:3000\/comment\/\?pub_id=[0-9|a-f|-]+\&(?:limit=[0-9]+|limit=[0-9]+\&offset=[0-9]+)$/,
    replies: /http:\/\/192.168.1.37:3000\/comment\/\?com_id=[0-9|a-f|-]+\&(?:limit=[0-9]+|limit=[0-9]+\&offset=[0-9]+)\&replies=true$/,
}

workbox.precaching.suppressWarnings();

/////////////////////////////////////////////DYNAMIC CACHING WITH ROUTING:////////////////////////////////////////////////////
/**
 *REGULAR EXPRESSION FOR FONT AWESOME URL'S: 
 */
workbox.routing.registerRoute(new RegExp("[^*]/fontawesome-webfont.*"), workbox.strategies.staleWhileRevalidate({
    cacheName: 'font-awesome'
}));

/**
 * REGULAR EXPRESSION FOR BACKEND MEDIA:
 */
workbox.routing.registerRoute(REST_URLS_PATTERN.medios, workbox.strategies.staleWhileRevalidate({
    cacheName: 'lukask-media'
}));
////

/**
 * REGULAR EXPRESSION FOR GOOGLE MAPS API:
 */
workbox.routing.registerRoute(new RegExp("http://maps.googleapis.com/maps/api/.*"), workbox.strategies.staleWhileRevalidate({
    cacheName: 'google-maps'
}));
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * FOR SPA APPS:
 */
workbox.routing.registerNavigationRoute('/index.html');
////

/////////////////////////////////////////////////////////////INDEXED DB DATA STORING//////////////////////////////////////////

/**
 * HANDLER TO STORING FIRST PUBS DATA INTO INDEXED DB:
 */
workbox.routing.registerRoute(REST_URLS_PATTERN.firstPubs, function (args) {
    return fetch(args.event.request)
        .then(function (res) {
            var clonedRes = res.clone();
            clearAllData('publication')
                .then(function () {
                    return clonedRes.json();
                })
                .then(function (response) {
                    //STORE THE RESPONSE ON INDEX DB:
                    console.log("[LUKASK SERVICE WORKER - INDEXED-DB] First Pubs from rest api", response.data);
                    var pubs = response.data.results;

                    clearAllData('comment')
                        .then(function () {
                            clearAllData('reply')
                                .then(function () {
                                    verifyStoredDataArray('publication', pubs);
                                })
                        })
                });

            return res;
        });
});

/**
 * HANDLER TO STORING MORE PUBS DATA INTO INDEXED DB:
 */
workbox.routing.registerRoute(REST_URLS_PATTERN.morePubs, function (args) {
    return fetch(args.event.request)
        .then(function (res) {
            var clonedRes = res.clone();
            clonedRes.json()
                .then(function (response) {
                    //STORE THE RESPONSE ON INDEX DB:
                    console.log("[LUKASK SERVICE WORKER - INDEXED-DB] More Pubs from rest api", response.data);
                    var pubs = response.data.results;

                    verifyStoredDataArray('publication', pubs);
                });

            return res;
        });
});

/**
 * HANDLER TO STORING QUEJA TYPES INTO INDEXED DB:
 */
workbox.routing.registerRoute(REST_URLS_PATTERN.qtype, function (args) {
    return fetch(args.event.request)
        .then(function (res) {
            var clonedRes = res.clone();
            clonedRes.json()
                .then(function (response) {
                    //STORE THE RESPONSE ON INDEX DB:
                    console.log("[LUKASK SERVICE WORKER - INDEXED-DB] Qtype from rest api", response.data);
                    let types = response.data.results;

                    verifyStoredDataArray('qtype', types);
                });

            return res;
        });
});

/**
 * HANDLER TO STORING PUB COMMENTS INTO INDEXED DB:
 */
workbox.routing.registerRoute(REST_URLS_PATTERN.comments, function (args) {
    return fetch(args.event.request)
        .then(function (res) {
            var clonedRes = res.clone();
            clonedRes.json()
                .then(function (response) {
                    //STORE THE RESPONSE ON INDEX DB:
                    console.log("[LUKASK SERVICE WORKER - INDEXED-DB] Comments from rest api", response.comments);
                    let comments = response.comments.results;

                    upgradeTableFieldDataArray('comment', comments);
                });
            return res;
        });
});

/**
 * HANDLER TO STORING COMMENT REPLIES INTO INDEXED DB:
 */
workbox.routing.registerRoute(REST_URLS_PATTERN.replies, function (args) {
    return fetch(args.event.request)
        .then(function (res) {
            var clonedRes = res.clone();
            clonedRes.json()
                .then(function (response) {
                    //STORE THE RESPONSE ON INDEX DB:
                    console.log("[LUKASK SERVICE WORKER - INDEXED-DB] Replies from rest api", response.comments);
                    let replies = response.comments.results;

                    upgradeTableFieldDataArray('reply', replies);
                });
            return res;
        });
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * FALLBACK PAGE AND DYNAMIC CACHING:
 */
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
                            });
                    })
                    .catch(function (err) {
                        return caches.match(new RegExp('/offline/'))
                            .then(function (res) {
                                return res;
                            });
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

/**
 * BACKGROUND SYNCRONIZATION:
 */
self.addEventListener('sync', function (event) {
    console.log('[LUKASK SERVICE WORKER] Background syncing', event);

    switch (event.tag) {
        case SYNC_TYPE.pubSyn:
            console.log('[LUKASK SERVICE WORKER] Syncing new pubs');
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

/**
 * HANDLE CLICK EVENTS:
 */
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

/**
 * CONFIGURING PUSH NOTIFICATIONS RECEPTOR:
 */
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