'use strict';
angular.module('app')
.controller('ScenarioTemplateCtrl', ['$scope', '$modal', '$http', '$state','$stateParams', '$window', 'toaster', 'bootbox',
function($scope, $modal, $http, $state,$stateParams, $window, toaster, bootbox) {
	//List 
    $scope.currentPage = 1;
    $scope.item_page = 20;
    // List 
    $scope.list_data = function(){
        $http({
            url: ApiPath+'scenario-template?page='+$scope.currentPage,
            method: "GET",
            dataType: 'json',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function (result, status, headers, config) {
        if(!result.error){
            $scope.dataResult = result.data;
            //
            $scope.totalItems = result.total;
            $scope.maxSize = 5;
            $scope.item_page = result.item_page;
            $scope.item_stt = $scope.item_page * ($scope.currentPage - 1);
        }        
        else{
            toaster.pop('error', 'Thông báo', 'Không có dữ liệu!');
        }
        });
    };
    $scope.list_data();
}]);