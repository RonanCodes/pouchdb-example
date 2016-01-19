angular.module('auctions', ['ionic', 'auctions.controllers'])

.config(function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/auctions');

  // Just a single view displaying auctions list.
  $stateProvider.state('auctions', {
    url: '/auctions'
    , templateUrl: 'templates/auctions.html'
    , controller: 'AuctionsCtrl'
  });

});