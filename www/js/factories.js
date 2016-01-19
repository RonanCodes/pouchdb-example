angular.module('auctions.factories', [])


.factory('AuctionsFac' , function($q, $rootScope, $timeout) {
  
  // Local database (stored client side).
  var db = new PouchDB('auctions');
  // Remote database (remote CouchDB).
  var remote = new PouchDB('http://127.0.0.1:5984/auctions');
  
  // Set the local database to pull down updates from CouchDB.
  // This won't push updates back up (since we have none in this case).
  // To do two-way sync, use db.sync().
  db.replicate.from(remote, {
    // Without live being true, it just syncs one time and then finishes.
    live: true
    // Without retry, it will stop syncing on an error (such as when we lose WiFi).
    , retry: true
  }).on('change', function (change) {
    // This is just for debugging.
    console.log("Received sync from remote.");
  }).on('error', function (err) {
    // This is just for debugging.
    console.log("Error receiving sync from remote.");
  });
  
  // List of auctions, stored in the factory.
  var auctionsList = [];
  // Run the function below when the factory is created.
  refreshList();
  
  // Function to completely refresh auctionsList.
  function refreshList() {
    // $q.when wraps db.query in a proper primise.
    // db.query uses promises anyway, but they don't play nicely with angular.
    $q.when(
      // Run the design doc auctions with the bydate view.
      // The design doc is synced down from CouchDB, just like a regular document.
      // Hence we actually have a design doc in the local database that is the same as the CouchDB one.
      // We can make this better by ordering the view by date, with newer dates first, and then limiting
      // the view to return only, say, 30 results.
      db.query("auctions/bydate")
    )
    .then(function(result) {
      // When db.query finishes, the following happens.
      // This is the quickest way of emprtying the list while keeping it in the same memory location.
      // That's needed for the two-way data binding in the template it ends up in.
      // It's not pretty or efficient, but it works.
      auctionsList.length = 0;
      // Once the list is emptied, we re-populate it.
      for (var i = 0; i < result.rows.length; i++)
        auctionsList[i] = result.rows[i].value;
      // This just makes sure that the template is refreshed once the list is updated.
      // Sometimes PouchDB changes fall through the cracks otherwise.
      $timeout(function(){$rootScope.$apply();});
    })
    .catch(function() {
      // Just for debugging.
      console.log("Error refreshing auctions list.");
    });
  }
  
  // We call refreshList() whenever the local database changes.
  // The local database would change if a sync from the remote one (CouchDB) added a new document to it.
  db.changes({
    // Start looking for changes from now.
    since: 'now',
    // Keep looking for changes, don't just look once and finish.
    live: true
  }).on('change', function (change) {
    // When a change happens, call the refreshList function.
    refreshList();
  }).on('error', function (err) {
    // Just for debugging.
    console.log("Error in changes.")
  });
  
  return {
    // This will be seen by the controller.
    list: auctionsList
  }
  
})
;