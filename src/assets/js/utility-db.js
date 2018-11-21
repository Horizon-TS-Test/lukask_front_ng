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
    if (!db.objectStoreNames.contains('ownuser')) {
        db.createObjectStore('ownuser', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('province')) {
        db.createObjectStore('province', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('canton')) {
        db.createObjectStore('canton', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('parroquia')) {
        db.createObjectStore('parroquia', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('user-pub')) {
        db.createObjectStore('user-pub', { keyPath: 'id' });
    }

    /**
     * TABLES FOR BACKGROUND SYNC:
     */
    if (!db.objectStoreNames.contains('sync-pub')) {
        db.createObjectStore('sync-pub', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('sync-comment')) {
        db.createObjectStore('sync-comment', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('sync-relevance')) {
        db.createObjectStore('sync-relevance', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('sync-user-profile')) {
        db.createObjectStore('sync-user-profile', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('sync-user-eersa-claim')) {
        db.createObjectStore('sync-user-eersa-claim', { keyPath: 'id' });
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
            console.log("[UTILITY-DB]: ITEM DELETED");
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

/**
 * FUNCTION TO AVOID DATA DUPLICATION INSIDE INDEXED-DB, USED IN JSON ARRAY:
 * @param {*} table THE TABLE NAME
 * @param {*} dataToSave JSON DATA TO SAVE INTO INDEXED-DB
 */
function verifyStoredDataArray(table, dataToSave) {
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
                    case 'province':
                        dataToSave[d].id = dataToSave[d].id_province;
                        break;
                    case 'canton':
                        dataToSave[d].id = dataToSave[d].id_canton;
                        break;
                    case 'parroquia':
                        dataToSave[d].id = dataToSave[d].id_parish;
                        break;
                    case 'user-pub':
                        dataToSave[d].id = dataToSave[d].id_publication;
                        break;
                }
                for (var t = 0; t < tableData.length; t++) {
                    if (tableData[t].id == dataToSave[d].id) {
                        deleteItemData(table, tableData[t].id);
                        tableData.splice(t, 1);
                        t = tableData.length;
                    }
                }
                writeData(table, dataToSave[d]);
            }
        });
}

/**
 * FUNCTION TO AVOID DATA DUPLICATION INSIDE INDEXED-DB, USED IN SINGLE JSON:
 * @param {*} table THE TABLE NAME
 * @param {*} dataToSave JSON DATA TO SAVE INTO INDEXED-DB
 */
function verifyStoredData(table, dataToSave, isDeleted) {
    readAllData(table)
        .then(function (tableData) {
            switch (table) {
                case 'publication':
                    dataToSave.id = dataToSave.id_publication;
                    break;
                case 'user-pub':
                    dataToSave.id = dataToSave.id_publication;
                    break;
                case 'qtype':
                    dataToSave.id = dataToSave.id_type_publication;
                    break;
            }
            for (var t = 0; t < tableData.length; t++) {
                if (tableData[t].id == dataToSave.id) {
                    deleteItemData(table, tableData[t].id);
                    tableData.splice(t, 1);
                    t = tableData.length;
                }
            }
            if (isDeleted == false) {
                writeData(table, dataToSave);
            }
        });
}

/**
 * FUNCTION TO AVOID DATA DUPLICATION ON AN SPECIFC FIELD OF AN INDEXED TABLE, USED IN JSON ARRAY:
 * @param {*} table THE TABLE NAME
 * @param {*} dataToSave JSON DATA TO SAVE INTO INDEXED-DB
 */
function upgradeTableFieldDataArray(table, dataToSave) {
    readAllData(table)
        .then(function (tableData) {
            for (var i = 0; i < dataToSave.length; i++) {
                var upgradedData = null;
                for (var t = 0; t < tableData.length; t++) {
                    var flag = 0;
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
                                    var index = tableData[t].comments.length;
                                    tableData[t].comments[index] = dataToSave[i];
                                    flag = 1;
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
                                    var index = tableData[t].replies.length;
                                    tableData[t].replies[index] = dataToSave[i];
                                    flag = 1;
                                }
                            }
                            break;
                    }

                    if (flag == 1) {
                        upgradedData = tableData[t];
                        t = tableData.length;
                    }
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
 * FUNCTION TO AVOID DATA DUPLICATION ON AN SPECIFC FIELD OF AN INDEXED TABLE, USED IN SINGLE JSON OBJECT:
 * @param {*} table THE TABLE NAME
 * @param {*} dataToSave JSON DATA TO SAVE INTO INDEXED-DB
 */
function upgradeTableFieldData(table, dataToSave) {
    readAllData(table)
        .then(function (tableData) {
            var upgradedData = null;
            for (var t = 0; t < tableData.length; t++) {
                var flag = 0;
                switch (table) {
                    case "comment":
                        if (tableData[t].id == dataToSave.publication) {
                            for (var c = 0; c < tableData[t].comments.length; c++) {
                                if (tableData[t].comments[c].id_action == dataToSave.id_action) {
                                    tableData[t].comments[c] = dataToSave;
                                    c = tableData[t].comments.length;
                                    flag = 1;
                                }
                            }
                            if (flag == 0) {
                                var index = tableData[t].comments.length;
                                tableData[t].comments[index] = dataToSave;
                                flag = 1;
                            }
                        }
                        break;
                    case "reply":
                        if (tableData[t].id == dataToSave.action_parent) {
                            for (var r = 0; r < tableData[t].replies.length; r++) {
                                if (tableData[t].replies[r].id_action == dataToSave.id_action) {
                                    tableData[t].replies[r] = dataToSave;
                                    r = tableData[t].replies.length;
                                    flag = 1;
                                }
                            }
                            if (flag == 0) {
                                var index = tableData[t].replies.length;
                                tableData[t].replies[index] = dataToSave;
                                flag = 1;
                            }
                        }
                        break;
                }

                if (flag == 1) {
                    upgradedData = tableData[t];
                    t = tableData.length;
                }
            }
            if (upgradedData == null) {
                switch (table) {
                    case "comment":
                        upgradedData = {
                            id: dataToSave.publication,
                            comments: [
                                dataToSave
                            ]
                        }
                        break;
                    case "reply":
                        upgradedData = {
                            id: dataToSave.action_parent,
                            replies: [
                                dataToSave
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
        });
}

/**
 * FUNCION PARA ELIMINAR DE INDEXDB LOS REGISTROS DE UNA TABLA ESPECÍFICA SEGÚN SU ID PADRE:
 * @param {*} table NOMBRE DE LA TABLA EN CUESTIÓN
 * @param {*} parentId EL ID DEL PADRE A ELIMINAR
 */
function clearAllDataByParentId(table, parentId) {
    return readAllData(table)
        .then(function (tableData) {
            for (var i = 0; i < tableData.length; i++) {
                if (tableData[i].id == parentId) {
                    return deleteItemData(table, parentId);
                }
            }
        });
}