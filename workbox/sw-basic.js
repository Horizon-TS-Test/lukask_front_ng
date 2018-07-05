importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.2.0/workbox-sw.js");

//NEXT ALLOWS US TO USE INDEX DB:
importScripts('/assets/js/idb.js');
importScripts('/assets/js/utility-db.js');
///////////

var SYNC_TYPE = {
    pubSyn: 'sync-new-pub',
    comSyn: 'sync-new-comment',
    relSyn: 'sync-new-relevance',
    userSyn: 'sync-update-user',
};

var REST_URLS_PATTERN = {
    medios: /http:\/\/192.168.1.58:8081\/repositorio_lukask\/.*/,
    firstPubs: /http:\/\/192.168.1.37:3000\/publication\/\?limit=[0-9]+$/,
    morePubs: /http:\/\/192.168.1.37:3000\/publication\/\?limit=[0-9]+&offset=[0-9]+$/,
    qtype: 'http://192.168.1.37:3000/qtype',
    comments: /http:\/\/192.168.1.37:3000\/comment\/\?pub_id=[0-9|a-f|-]+\&(?:limit=[0-9]+|limit=[0-9]+\&offset=[0-9]+)$/,
    replies: /http:\/\/192.168.1.37:3000\/comment\/\?com_id=[0-9|a-f|-]+\&(?:limit=[0-9]+|limit=[0-9]+\&offset=[0-9]+)\&replies=true$/,
};

var REST_URLS = {
    pub: 'http://192.168.1.37:3000/publication',
    comment: 'http://192.168.1.37:3000/comment',
    relevance: 'http://192.168.1.37:3000/relevance',
    user: 'http://192.168.1.37:3000/user',
};

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

/**
 * MÉTODO PARA OBTENER EL ID DEL USUARIO DESDE EL STORAGE PARA ENVIAR UN FETCH REQUEST:
 */
function getUserId() {
    return readAllData('ownuser')
        .then((tableData) => {
            for (let user of tableData) {
                return user.user_key;
            }
        });
}

/**
 * MÉTODO GENÉRICO PARA ENVIAR UN FETCH REQUEST AL SERVIDOR:
 * @param {*} restUrl EL URL DEL HTTP REQUEST
 * @param {*} formData EL REQUEST BODY
 * @param {*} indexedTable LA TABLA EN LA QUE SE VA A ALMACENAR LA RESPUESTA DEL SERVIDOR
 * @param {*} syncTable LA TABLA EN LA QUE SE ALMACENA LOS DATOS DEL PROCESO BACK-SYNC
 */
function sendData(restUrl, formData, indexedTable, syncTable) {
    getUserId()
        .then(function (userKey) {
            fetch(restUrl, {
                method: 'POST',
                body: formData,
                credentials: 'include',
                headers: {
                    "Pass-Key": userKey
                }
            }).then(function (res) {
                console.log('[LUKASK SERVICE WORKER] Fetch response', res);
                if (res.ok) {
                    res.json()
                        .then(function (restData) {
                            switch (indexedTable) {
                                case 'publication':
                                    verifyStoredData(indexedTable, restData.data, false);
                                    break;
                                case '':
                                    break;
                                default:
                                    upgradeTableFieldData(indexedTable, restData.data);
                                    break;
                            }
                            //ALWAYS IT MUST BE "id" FOR GENERIC PURPOSES:
                            deleteItemData(syncTable, formData.get('id'));
                            ////
                        });
                }
            }).catch(function (err) {
                console.log('Error while sending data', err);
            });
        });
}

/**
 * BACKGROUND SYNCRONIZATION:
 */
self.addEventListener('sync', function (event) {
    console.log('[LUKASK SERVICE WORKER] Background syncing!!!', event);

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
                            formData.append('location', pub.location);
                            formData.append('address', pub.address);
                            for (var media of pub.media_files) {
                                formData.append('media_files[]', media.file, media.fileName);
                            }

                            sendData(REST_URLS.pub, formData, 'publication', 'sync-pub');
                        }
                    })
            );
            break;
        case SYNC_TYPE.comSyn:
            console.log('[LUKASK SERVICE WORKER] Syncing new comments');
            event.waitUntil(
                readAllData('sync-comment')
                    .then(function (data) {
                        for (var com of data) {
                            console.log("com: ", com);
                            //SENDING COMMENT TO THE BACKEND SERVER:
                            var formData = new FormData();
                            //ALWAYS IT MUST BE "id" FOR GENERIC PURPOSES:
                            formData.append('id', com.id);
                            //
                            formData.append('description', com.description);
                            formData.append('id_publication', com.id_publication);
                            formData.append('action_parent', com.action_parent);
                            formData.append('active', com.active);
                            formData.append('userName', com.userName);
                            formData.append('userImage', com.userImage);

                            sendData(REST_URLS.comment, formData, (com.action_parent == "") ? 'comment' : 'reply', 'sync-comment');
                        }
                    })
            );
            break;
        case SYNC_TYPE.relSyn:
            console.log('[LUKASK SERVICE WORKER] Syncing new relevance');
            event.waitUntil(
                readAllData('sync-relevance')
                    .then(function (data) {
                        for (var rel of data) {
                            console.log("relevance: ", rel);
                            //SENDING RELEVANCE TO THE BACKEND SERVER:
                            var formData = new FormData();
                            //ALWAYS IT MUST BE "id" FOR GENERIC PURPOSES:
                            formData.append('id', rel.id);
                            //
                            formData.append('id_publication', rel.id_publication);
                            formData.append('active', rel.active);

                            sendData(REST_URLS.relevance, formData, 'publication', 'sync-relevance');
                        }
                    })
            );
            break;
        case SYNC_TYPE.userSyn:
            console.log('[LUKASK SERVICE WORKER] Syncing user to update');
            event.waitUntil(
                readAllData('sync-user-profile')
                    .then(function (data) {
                        for (var prof of data) {
                            console.log("userProfile: ", prof);
                            //SENDING USER PROFILE TO THE BACKEND SERVER FOR UPDATE:
                            var formData = new FormData();
                            //ALWAYS IT MUST BE "id" FOR GENERIC PURPOSES:
                            formData.append('id', prof.id);
                            //
                            formData.append('email', prof.username);
                            formData.append('identification_card', prof.person.identification_card);
                            formData.append('name', prof.person.name);
                            formData.append('last_name', prof.person.last_name);
                            formData.append('age', prof.person.age);
                            formData.append('birthdate', prof.person.birthdate);
                            formData.append('cell_phone', prof.person.cell_phone);
                            formData.append('telephone', prof.person.telephone);
                            formData.append('address', prof.person.address);
                            formData.append('user_file', prof.file, prof.fileName);
                            formData.append('is_active', prof.isActive);


                            sendData(REST_URLS.user + "/" + prof.id, formData, '', 'sync-user-profile');
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
    console.log("la acción es: " + action);
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
                    //NEXT IS USED TO OPEN A NEW TAB AND NAVIGATE TO THE REQUESTED URL:
                    //client.navigate(notification.data.url);
                    if (action.indexOf("/") !== -1) {
                        client.navigate(action);
                        client.focus();
                    }
                }
                //IF ITS CLOSED:
                else {
                    //clients.openWindow(notification.data.url);
                    if (action.indexOf("/") == -1) {
                        action = notification.data.url;
                    }
                    clients.openWindow(action);
                }
            })
    );
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

    console.log(defaultNotifData);

    var options = {
        "//": "Visual Options",
        title: defaultNotifData.title,
        body: defaultNotifData.content,
        dir: 'rtl',
        icon: defaultNotifData.icon_image,
        badge: '/assets/icons/badged-icon.png',
        vibrate: [500, 200, 200, 100], //THIS IS FOR SOME DEVICES NOT FOR ALL

        "//": "Behavioural Options",
        tag: 'confirm-notification', //TO ALLOW NOTIFICATIONS WILL STACK AND SHOW ONE GROUP OF NOTIFICATIONS
        //lang: 'es-US', //BCP 47
        data: {
            url: defaultNotifData.open_url
        },
        actions: [ //THESE ARE THE OPTIONS DISPLAYED ON THE NOTIFICATION
            /*{
                action: '/',
                title: "Mural",
                //icon: '/assets/icons/lukask-96x96.png'
            },
            {
                action: '/mapview',
                title: "Mapa",
                //icon: '/assets/icons/lukask-96x96.png'
            }*/
        ]
    };

    if (defaultNotifData.actions) {
        for (var action of defaultNotifData.actions) {
            options.actions[options.actions.length] = action;
        }
    }

    event.waitUntil(
        clients.matchAll()
            .then(function (clientsArray) {
                var client = clientsArray.find(function (cli) {
                    return cli.visibilityState === 'visible';
                });

                //IF THE WEB BROWSER IS OPEN:
                if (client == undefined) {
                    self.registration.showNotification(defaultNotifData.title, options);
                }
                /*if (client !== undefined) {
                    client.navigate(notification.data.url);
                    client.focus();
                }
                //IF ITS CLOSED:
                else {
                    clients.openWindow(notification.data.url);
                }*/
            })
    );
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////