'use strict';

//Verify
angular.module('app').controller('VerifyCtrl', ['$scope', '$http', '$state', '$window', '$stateParams', 'toaster', 'Verify', 'Config_Accounting', 'Order', 'Api_Path', 'Analytics',
 	function($scope, $http, $state, $window, $stateParams, toaster, Verify, Config_Accounting, Order, Api_Path, Analytics) {
    // config
    Analytics.trackPage('/money_remittance');
    $scope.currentPage      = 1;
    $scope.item_page        = 20;
    $scope.maxSize          = 5;
    $scope.list_data        = [];
    $scope.time_start       = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    $scope.time_end         = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    $scope.search           = '';
    $scope.list_bank        = Config_Accounting.vimo;
    $scope.waiting          = true;
    $scope.waiting_detail   = true;
    $scope.status_order     = {};
    var time_create_start   = Date.parse(new Date(date.getFullYear(), date.getMonth() - 2, 1))/1000;
    
    $scope.list_status      =
        {
            'INSERT'      : {
                'name'      : 'Chờ xác nhận',
                'bg'        : 'bg-info'
            },
            'WAITING'      : {
                'name'      : 'Chờ chuyển tiền',
                'bg'        : 'bg-primary'
            },
            'PROCESSING'      : {
                'name'      : 'Đang chuyển tiền',
                'bg'        : 'bg-warning'
            },
            'SUCCESS'      : {
                'name'      : 'Đã chuyển tiền',
                'bg'        : 'bg-success'
            }
        }
    ;

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
    
    // get data
        // List Status
        Order.Status().then(function (result) {
            if(!result.data.error){
                $scope.status_order     = result.data.data;
            }
        });


        // List order
        $scope.exportExcel = function (item){
            var time_start = '';
            var time_end   = '';

            if(!item){ // Export danh sách bản kê
                if($scope.time_start != undefined && $scope.time_start != ''){
                    time_start  = +Date.parse($scope.time_start)/1000;
                }
                if($scope.time_end != undefined && $scope.time_end != ''){
                    time_end  = +Date.parse($scope.time_end)/1000 + 86399;
                }

                return Api_Path.OrderVerify + '/exportexcel?cmd=export&time_start=' + time_start + '&time_end=' + time_end;
            }else {
                time_start  = item.time_create - 86400*90;
                time_end    = item.time_create;

                return Api_Path.Base + 'order/order?cmd=export&time_create_start=' + time_start + '&time_create_end='+ time_end + '&verify_id=' + item.id;
            }
            
        }




        $scope.setPage = function(){
            var time_start = '';
            var time_end   = '';
            var search     = '';

            if($scope.time_start != undefined && $scope.time_start != ''){
                time_start  = +Date.parse($scope.time_start)/1000;
            }
            if($scope.time_end != undefined && $scope.time_end != ''){
                time_end  = +Date.parse($scope.time_end)/1000 + 86399;
            }

            if($scope.search != undefined && $scope.search != ''){
                search = $scope.search;
            }else if($stateParams.id != undefined && $stateParams.id != ''){
                search = $stateParams.id;
            }

            $scope.list_data        = [];
            $scope.waiting          = true;
        	Verify.OrderVerify(time_start,time_end, search,$scope.currentPage,'').then(function (result) {
                if(!result.data.error){
                    $scope.list_data        = result.data.data;
                    $scope.totalItems       = result.data.total;
                    $scope.item_page        = result.data.item_page;
                    $scope.item_stt         = $scope.item_page * ($scope.currentPage - 1);
                }
                $scope.waiting              = false;
            });
            return;
        };
    
    // action
    $scope.setPage();
    
    $scope.show_detail = function(item){
        $scope.waiting_detail   = true;
        if(item.id > 0){
            if((!item.detail || !item.detail.length) && !item.show){
                Verify.VerifyShow(item.id, item.time_create).then(function (result) {
                    if(!result.data.error){
                        item.detail          = result.data.data.order;
                    }
                    $scope.waiting_detail       = false;
                });
            }

            item.show           = !item.show;
            if(item.show){
                item.show_freeze    = false;
            }

            return;
        }
    }

    $scope.show_freeze = function(item){
        $scope.waiting_freeze   = true;
        if(item.id > 0){
            if((!item.freeze || !item.freeze.length) && !item.show_freeze){
                Verify.Freeze(item.id).then(function (result) {
                    if(!result.data.error){
                        item.freeze          = result.data.data;
                    }
                    $scope.waiting_freeze       = false;
                });
            }

            item.show_freeze = !item.show_freeze;
            if(item.show_freeze){
                item.show   = false;
            }

            return;
        }
    }
    
    
    }
]);
