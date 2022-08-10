


/*
  INFO: Different browsers can have different names for the indexedDB object, so we 
  standardize that here.
*/
const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;

let db;



const database = "budget"
const objectStore = "transactions"


const request = indexedDB.open(database, 1);


request.onupgradeneeded = ({ target }) => {
  let db = target.result;
  db.createObjectStore(objectStore, { autoIncrement: true });
};


request.onsuccess = ({ target }) => {
  db = target.result;
  // check if app is online before reading from db
  if (navigator.onLine) {
    // method goes here
  }
};

/* INFO: Simple error handler. */
request.onerror = function(event) {
  console.log("Woops! " + event.target.errorCode);
};


function saveRecord(record) {
  const transaction = db.transaction([objectStore], "readwrite");
  const store = transaction.objectStore(objectStore);
  store.add(record);
}


function checkDatabase() {
  const transaction = db.transaction([objectStore], "readwrite");
  const store = transaction.objectStore(objectStore);
  const getAll = store.getAll();

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      
      /*
        INFO: This is a route we would create in Express (it's already done)
        to handle this kind of bulk update.
      */

      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => {        
        return response.json();
      })
      .then(() => {
        // delete indexedDB records if the update is successful
        const transaction = db.transaction([objectStore], "readwrite");
        const store = transaction.objectStore(objectStore);
        store.clear();
      });
    }
  };
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);