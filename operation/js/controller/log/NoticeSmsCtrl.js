'use strict';
angular.module('app')
.controller('NoticeSmsCtrl', ['$scope', '$modal', '$http', '$state', '$window', '$stateParams', 'toaster',
function($scope, $modal, $http, $state, $window, $stateParams, toaster) {
	$scope.createSms = function (data){
        $scope.onProgress = true;
        $http({
            url: ApiPath + 'log/createsms',
            method: "POST",
            data: data,
            dataType: 'json',
        }).success(function (result, status, headers, config) {
            if(result.error == false){
                $scope.onProgress = false;
                toaster.pop('success', 'Thông báo', 'Thực hiện thành công !');
            }else {
                $scope.onProgress = false;
                toaster.pop('error', 'Thông báo', result.message);
            }
        });

    }
}]);