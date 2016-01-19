angular.module('auctions.controllers', ['ionic', 'auctions.factories'])

.controller('AuctionsCtrl', function($scope, AuctionsFac) {
  // Pass AuctionsFac.list to the template.
  $scope.auctions = AuctionsFac.list;
})