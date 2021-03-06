'use strict';

//Verify Fee
angular.module('app').controller('ServiceCtrl', ['$scope', 'CourierVerify',
 	function($scope, CourierVerify) {
        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1
        };

        $scope.open = function($event,type) {
            $event.preventDefault();
            $event.stopPropagation();
            if(type == "time_start"){
                $scope.time_start_open = true;
            }else if(type == "time_end"){
                $scope.time_end_open = true;
            }
        };

        $scope.keys = function(obj){
            return obj? Object.keys(obj) : [];
        }

        $scope.currentPage          = 1;
        $scope.item_page            = 20;
        $scope.maxSize              = 5;

        $scope.frm                  = {type : 'service'};
        $scope.time_start           = new Date(date.getFullYear(), date.getMonth(), 1);
        $scope.time_end             = '';
        $scope.waiting              = true;

        /*
            action
         */

        $scope.refresh = function(){
            $scope.list_data        = [];
            $scope.list_user        = [];
        }

        $scope.setPage = function(){
            $scope.waiting   = true;
            $scope.frm.time_start   = '';
            $scope.frm.time_end     = '';

            if($scope.time_start != undefined && $scope.time_start != ''){
                $scope.frm.time_start       = +Date.parse($scope.time_start)/1000;
            }
            if($scope.time_end != undefined && $scope.time_end != ''){
                $scope.frm.time_end         = +Date.parse($scope.time_end)/1000 + 86399;
            }

            $scope.refresh();
            CourierVerify.load($scope.currentPage, $scope.frm).then(function (result) {
                if(!result.data.error){
                    $scope.list_data        = result.data.data;
                    $scope.list_user        = result.data.user;
                    $scope.totalItems       = result.data.total;
                    $scope.item_stt         = $scope.item_page * ($scope.currentPage - 1);
                }
                $scope.waiting   = false;
                return;
            });
        }
        $scope.setPage();

        /*
         End Action
         */

    }
]);
