'use strict';

//Verify Upload Money Collect
angular.module('app').controller('UploadProcessCtrl', ['$scope', '$http', '$rootScope', '$state', '$window', '$stateParams', 'FileUploader', 'toaster', 'Api_Path', 'Upload', 'Config_Status', 'Pipe_Process', 'Base',
 	function($scope, $http, $rootScope, $state, $window, $stateParams,FileUploader, toaster, Api_Path, Upload, Config_Status, Pipe_Process, Base) {
    /*
        Config
    */
        $scope.currentPage          = 1;
        $scope.item_page            = 20;
        $scope.maxSize              = 5;
        $scope.dynamic              = 0;
        $scope.totalItems           = 0;
        $scope.NewTotal             = 0;
        $scope.tab                  = 'ALL';
        $scope.frm                  = {tab : 'ALL'};
        $scope.waiting              = true;
        $scope.status_verify        = Config_Status.StatusVerify;
        $scope.list_color           = Config_Status.order_color;
        $scope.pipe_status          = {};
        $scope.waiting_upload       = false;
        $scope.list_type            = Pipe_Process.pipe_type;
        $scope.type_process         = 1;
        $scope.list_process         = {};

        // upload  excel
        var uploader = $scope.uploader = new FileUploader({
            url                 : Api_Path.Upload+'upload?type=process&type_process='+$scope.type_process,
            headers             : {Authorization : $rootScope.userInfo.token,Location : $rootScope.userInfo.country_id},
            removeAfterUpload   : true
        });

        // FILTERS
        uploader.filters.push({
            name: 'excelFilter',
            fn: function(item /*{File|FileLikeObject}*/, options) {
                $scope.waiting_upload  = false;
                var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                return '|vnd.ms-excel|vnd.openxmlformats-officedocument.spreadsheetml.sheet|'.indexOf(type) !== -1;
            }
        });

        uploader.onProgressAll  = function(progress){
            $scope.waiting_upload  = true;
        }

        uploader.onBeforeUploadItem = function(item) {
            item.url = Api_Path.Upload+'upload?type=process&type_process='+$scope.type_process;
        };

        uploader.onSuccessItem = function(item, result, status, headers){
            $scope.waiting_upload  = false;
            if(!result.error){
                toaster.pop('success', 'Thông báo', 'Upload Thành công!');
                $state.go('delivery.upload.upload_process',{id:result.id});
            }
            else{
                toaster.pop('warning', 'Thông báo', 'Upload Thất bại!');
            }
        };

        uploader.onErrorItem  = function(item, result, status, headers){
            $scope.waiting_upload  = false;
            toaster.pop('error', 'Thông báo!', "Kết nối dữ liệu thất bại.");
        };
    /*
        End Config
     */

    /*
        Action
     */
        Base.getGroupProcess('', '').then(function (result) {
            if(!result.data.error){
                angular.forEach(result.data.data, function(value) {
                    if($scope.list_process[value['type']] == undefined){
                        $scope.list_process[value['type']]  = {};
                    }

                    $scope.list_process[value['type']][value['code']]= value;
                });
            }
        });

        Base.PipeStatus('', '').then(function (result) {
            if(!result.data.error){
                angular.forEach(result.data.data, function(value) {
                    if($scope.pipe_status[value['type']] == undefined){
                        $scope.pipe_status[value['type']]  = {};
                    }

                    if($scope.pipe_status[value['type']][value['group_status']] == undefined){
                        $scope.pipe_status[value['type']][value['group_status']]    = {};
                    }

                    $scope.pipe_status[value['type']][value['group_status']][value['status']]= value;
                });
            }
        });

        $scope.$watch($stateParams,function(){
            if($stateParams.id != '' && $stateParams.id != undefined){
                $scope.refresh_data();
                $scope.load(1);
            }

        });

        $scope.load = function(page){
            $scope.currentPage  = page;
            $scope.waiting      = true;
            Upload.ListUpload($stateParams.id, $scope.currentPage,$scope.frm, '').then(function (result) {
                if(!result.data.error){
                    $scope.list_data        = result.data.data;
                    $scope.totalItems       = result.data.total;
                    $scope.NewTotal         = result.data.new_total;
                    $scope.item_stt         = $scope.item_page * ($scope.currentPage - 1);
                }
                $scope.waiting      = false;
                return;
            });
        }

        $scope.refresh_data    = function(){
            $scope.list_data    = [];
            $scope.item_stt     = 0;
            $scope.totalItems   = 0;
            $scope.waiting      = true;
        }

        // Verify
        $scope.Verify = function(){
            Upload.Process($stateParams.id).then(function (result) {
                if(result.data.total > 0) {
                    if (!result.data.error) {
                        toaster.pop('success', 'Thông báo', 'Thành công !');
                    } else {
                        toaster.pop('warning', 'Thông báo', $scope.status_verify[result.data.message].text);
                    }
                }

                    if(result.data.total > 0){

                        $scope.dynamic = (($scope.totalItems - result.data.total)*100/$scope.totalItems).toFixed(2);
                        $scope.Verify();
                    }else{
                        toaster.pop('success', 'Thông báo', 'Kết thúc !');
                        $scope.dynamic = 100;
                        $scope.refresh_data();
                        $scope.load(1);
                    }
            });
        }

        $scope.ChangeTab = function(cou){
            $scope.refresh_data();
            $scope.frm.tab  = cou;
            $scope.load(1);
        }

        $scope.exportExcel = function(){
            return Upload.ListUpload($stateParams.id, $scope.currentPage, $scope.frm, 'PROCESS');
        }

    /*
        End Action
     */

    }
]);
