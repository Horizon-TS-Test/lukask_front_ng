//////////////////INITIALIZING INDEX DB://////////////////////////
/**
 * OPENS A NEW DATABASE, IF DOESN'T EXISTS IT WILL BE CREATED
 */
var dbPromise = idb.open('lukask-store', 1, function (db) {
    /**
     * NEXT IS LIKE CREATE A NEW TABLE WITH AN ESPECIFIC FIELD AS PRIMARY KEY:
     */
    if (!db.objectStoreNames.contains('publication')) {
        db.createObjectStore('publication', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('qtype')) {
        db.createObjectStore('qtype', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('comment')) {
        db.createObjectStore('comment', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('reply')) {
        db.createObjectStore('reply', { keyPath: 'id' });
    }

    /**
     * TABLES FOR BACKGROUND SYNC:
     */
    if (!db.objectStoreNames.contains('sync-pub')) {
        db.createObjectStore('sync-pub', { keyPath: 'id' });
    }
});
//////////////////////////////////////////////////////////////////

function writeData(tableName, data) {
    return dbPromise
        .then(function (db) {
            var tx = db.transaction(tableName, 'readwrite');
            var store = tx.objectStore(tableName);
            store.put(data);
            //THIS IS FOR PREVENT INTEGRITY FAILS ON THE DATABASE WHEN WE TRY TO UPDATE ANY TABLE:
            return tx.complete;
        });
}

function readAllData(tableName) {
    return dbPromise
        .then(function (db) {
            var tx = db.transaction(tableName, 'readonly');
            var store = tx.objectStore(tableName);
            return store.getAll();
        })
}

//TO CLEAR ALL DATA OF A TABLE ON INDEXED DB BEFORE CALLING REST API TO GET DATA AND SAVE ON THE DB:
function clearAllData(tableName) {
    return dbPromise
        .then(function (db) {
            var tx = db.transaction(tableName, 'readwrite');
            var store = tx.objectStore(tableName);
            store.clear();

            return tx.complete;
        })
}

/**
 * TO DELETE ON INDEX DB ONLY THE DATA WICH IS NOT COMMING FROM THE REST API:
 */
function deleteItemData(tableName, id) {
    return dbPromise
        .then(function (db) {
            var tx = db.transaction(tableName, 'readwrite');
            var store = tx.objectStore(tableName);
            store.delete(id);

            return tx.complete;
        })
        .then(function () {
            console.log("Item deleted");
        })
}

/**
 * TO HANDLE PUBLIC VAPID KEY OF THE SERVER:
 */
function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; i++) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}

/**
 * SAVE THE IMAGE CAPTURE IN A BLOB FILE:
 */
function dataURItoBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    var blob = new Blob([ab], { type: mimeString });

    return blob;
}
///////////////////////////