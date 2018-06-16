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
    pubs: /http:\/\/192.168.1.37:3000\/publication\/\?.*/,
    qtype: 'http://192.168.1.37:3000/qtype',
    comments: /http:\/\/192.168.1.37:3000\/comment\/\?pub_id=.*/,
    replies: /http:\/\/192.168.1.37:3000\/comment\/\?com_id=.*/,
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
 * FUNCTION TO AVOID DATA DUPLICATION INSIDE INDEXED-DB:
 * @param {*} table THE TABLE NAME
 * @param {*} idDataToSave JSON DATA TO SAVE INTO INDEXED-DB
 */
function verifyStoredData(table, dataToSave) {
    readAllData(table)
        .then(function (tableData) {
            for (var d = 0; d < dataToSave.length; d++) {
                switch (table) {
                    case 'publication':
                        dataToSave[d].id = dataToSave[d].id_publication;
                        break;
                    case 'qtype':
                        dataToSave[d].id = dataToSave[d].id_type_publication;
                        break;
                }
                for (var t = 0; t < tableData.length; t++) {
                    if (tableData[t].id == dataToSave[d].id) {
                        deleteItemData(table, tableData[t].id);
                        tableData.splice(t);
                        t = tableData.length;
                    }
                }
                writeData(table, dataToSave[d]);
            }
        });
}

/**
 * FUNCTION TO AVOID DATA DUPLICATION ON AN SPECIFC FIELD OF AN INDEXED TABLE:
 * @param {*} table THE TABLE NAME
 * @param {*} dataToSave JSON DATA TO SAVE INTO INDEXED-DB
 */
function upgradeTableFieldData(table, dataToSave) {
    readAllData(table)
        .then(function (tableData) {
            for (var i = 0; i < dataToSave.length; i++) {
                let upgradedData = null;
                for (var t = 0; t < tableData.length; t++) {
                    let flag = 0;
                    switch (table) {
                        case "comment":
                            if (tableData[t].id == dataToSave[i].publication) {
                                for (var c = 0; c < tableData[t].comments.length; c++) {
                                    if (tableData[t].comments[c].id_action == dataToSave[i].id_action) {
                                        tableData[t].comments[c] = dataToSave[i];
                                        c = tableData[t].comments.length;
                                        flag = 1;
                                    }
                                }
                                if (flag == 0) {
                                    let index = tableData[t].comments.length;
                                    tableData[t].comments[index] = dataToSave[i];
                                }
                            }
                            break;
                        case "reply":
                            if (tableData[t].id == dataToSave[i].action_parent) {
                                for (var r = 0; r < tableData[t].replies.length; r++) {
                                    if (tableData[t].replies[r].id_action == dataToSave[i].id_action) {
                                        tableData[t].replies[r] = dataToSave[i];
                                        r = tableData[t].replies.length;
                                        flag = 1;
                                    }
                                }
                                if (flag == 0) {
                                    let index = tableData[t].replies.length;
                                    tableData[t].replies[index] = dataToSave[i];
                                }
                            }
                            break;
                    }

                    upgradedData = tableData[t];
                    t = tableData.length;
                }
                if (upgradedData == null) {
                    switch (table) {
                        case "comment":
                            upgradedData = {
                                id: dataToSave[i].publication,
                                comments: [
                                    dataToSave[i]
                                ]
                            }
                            break;
                        case "reply":
                            upgradedData = {
                                id: dataToSave[i].action_parent,
                                replies: [
                                    dataToSave[i]
                                ]
                            }
                            break;
                    }
                    tableData[tableData.length] = upgradedData;
                }
                else {
                    deleteItemData(table, upgradedData.id);
                }
                writeData(table, upgradedData);
            }
        });
}

/**
 * HANDLER TO STORING PUBS DATA INTO INDEXED DB:
 */
workbox.routing.registerRoute(REST_URLS_PATTERN.pubs, function (args) {
    return fetch(args.event.request)
        .then(function (res) {
            //STORE THE RESPONSE ON INDEX DB:
            var clonedRes = res.clone();
            clonedRes.json()
                .then(function (response) {
                    console.log("[LUKASK SERVICE WORKER - INDEXED-DB] Pubs from rest api", response.data);
                    var pubs = response.data.results;

                    verifyStoredData('publication', pubs);
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
            //STORE THE RESPONSE ON INDEX DB:
            var clonedRes = res.clone();
            clonedRes.json()
                .then(function (response) {
                    console.log("[LUKASK SERVICE WORKER - INDEXED-DB] Qtype from rest api", response.data);
                    let types = response.data.results;

                    verifyStoredData('qtype', types);
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
            //STORE THE RESPONSE ON INDEX DB:
            var clonedRes = res.clone();
            clonedRes.json()
                .then(function (response) {
                    console.log("[LUKASK SERVICE WORKER - INDEXED-DB] Comments from rest api", response.comments);
                    let comments = response.comments.results;

                    upgradeTableFieldData('comment', comments);
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
            //STORE THE RESPONSE ON INDEX DB:
            var clonedRes = res.clone();
            clonedRes.json()
                .then(function (response) {
                    console.log("[LUKASK SERVICE WORKER - INDEXED-DB] Replies from rest api", response.comments);
                    let replies = response.comments.results;

                    upgradeTableFieldData('reply', replies);
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