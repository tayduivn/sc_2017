<?php namespace warehouse;

use bm_warehousemodel\DRModel;
use bm_warehousemodel\DRItemModel;
use bm_warehousemodel\DRProductModel;

class WareHouseDRCtrl extends BaseCtrl {
    function __construct(){

    }

    private function getModel(){
        $CreateStart    = Input::has('create_start')       ? (int)Input::get('create_start')              : 0;
        $CreatedEnd     = Input::has('create_end')         ? (int)Input::get('create_end')                : 0;

        $TrackingCode   = Input::has('tracking_code')       ? strtoupper(trim(Input::get('tracking_code'))) : '';
        $KeyWord        = Input::has('keyword')             ? trim(Input::get('keyword'))                   : '';
        $DrStatus       = Input::has('dr_status')           ? trim(Input::get('dr_status'))                   : '';
        $ListStatus     = Input::has('list_status')         ? trim(Input::get('list_status'))               : '';

        $Model          = new DRProductModel;
        $ListUser       = [];

        if(!empty($CreateStart)){
            $Time           = $CreateStart - 86400*90;
            $CreateStart    = $this->__convert_time($CreateStart);
            $Time           = $this->__convert_time($Time);
            $Model          = $Model->where('create_date','>=',$CreateStart);
        }else{
            return false;
        }

        if(!empty($CreatedEnd)){
            $CreatedEnd         = $this->__convert_time($CreatedEnd);
            $Model              = $Model->where('create_date','<=',$CreatedEnd);
        }

        if(!empty($DrStatus)){
            $Model          = $Model->where('status',$DrStatus);
        }

        if(!empty($TrackingCode)){
            if(preg_match("/^DR/i", $TrackingCode)){
                $ListDR = DRModel::where('create_date','>=',$CreateStart)->where('dr_code', $TrackingCode)->lists('id');
                if(empty($ListDR)){
                    return false;
                }

                $ListDRItem = DRItemModel::where('create_date','>=', $CreateStart)->whereIn('delivery_receipt', $ListDR)->lists('id');
                if(empty($ListDRItem)){
                    return false;
                }

                $Model  = $Model->whereIn('delivery_receipt_item_id', $ListDRItem);

            }else{
                if(preg_match("/^U/i", $TrackingCode)) {
                    $Model = $Model->where('uid', $TrackingCode);
                }else{
                    $Model = $Model->where('sku', $TrackingCode);
                }
            }
        }

        if(!empty($KeyWord) || !empty($ListStatus)){
            if(!empty($KeyWord)){
                $UserModel      = new \User;
                if (filter_var($KeyWord, FILTER_VALIDATE_EMAIL)){  // search email
                    $UserModel          = $UserModel->where('email',$KeyWord);
                }elseif(filter_var((int)$KeyWord, FILTER_VALIDATE_INT,array('option'=>array('min_range'=>8,'max_range'=>20)))){  // search phone
                    $UserModel          = $UserModel->where('phone',$KeyWord);
                }else{
                    $UserModel          = $UserModel->where('fullname',$KeyWord);
                }

                $ListUser = $UserModel->lists('id');
                if(empty($ListUser)){
                    return false;
                }
            }

            $ListUId    = \bm_ecommercemodel\SellerProductItemModel::where('created','>=', $Time);
            if(!empty($ListUser)){
                $ListUId    = $ListUId->whereIn('user',$ListUser);
            }

            if(!empty($ListStatus)){
                $ListStatus = array_map('intval', explode(',', $ListStatus));
                $ListUId    = $ListUId->whereIn('status',$ListStatus);
            }

            $ListUId    = $ListUId->lists('serial_number');
            if(empty($ListUId)){
                return false;
            }
            $Model  = $Model->whereIn('uid', $ListUId);
        }

        return $Model;
    }

    private function ResponseData($check = true){
        return Response::json([
            'error'             => false,
            'code'              => 'SUCCESS',
            'error_message'     => 'Thành công',
            'total'             => $this->total,
            'data'              => $this->data
        ]);
    }

    public function getIndex(){
        $itemPage           = 20;
        $page               = Input::has('page')                ? (int)Input::get('page')                       : 1;
        $Cmd                = Input::has('cmd')                 ? trim(Input::get('cmd'))                       : '';
        $WareHouse          = Input::has('warehouse')           ? strtoupper(trim(Input::get('warehouse')))     : '';

        $Model          = $this->getModel();
        if(!$Model){
            return $this->ResponseData();
        }

        if(!empty($WareHouse)){
            $Model  = $Model->where('warehouse', $WareHouse);
        }

        if($Cmd == 'export'){
            return $this->ExportExcel($Model);
        }

        $TotalModel     = clone $Model;
        $this->total    = $TotalModel->count();

        if($this->total > 0){
            $offset     = ($page - 1)*$itemPage;
            $Model      = $Model->skip($offset)->take($itemPage);
            $this->data = $Model->with([
                '__get_seller_product' => function($query){
                    $query->with(['__product','__user']);
                },'__get_dr_item' => function($query){
                    $query->with('__get_dr');
                },'__get_seller_shipment'
            ])->orderBy('create_date','DESC')->get()->toArray();
        }

        return $this->ResponseData();
    }

    private function ExportExcel($Model){
        $Data               = [];

        $Model->with([
            '__get_seller_product' => function($query){
                $query->with(['__product','__user']);
            },'__get_dr_item' => function($query){
                $query->with('__get_dr');
            },'__get_seller_shipment'
        ])->orderBy('create_date','DESC')->chunk('1000', function($query) use(&$Data){
            foreach($query as $val){
                $val                = $val->toArray();
                $Data[]             = $val;
            }
        });

        $this->data = $Data;
        return $this->ResponseData();
    }

    public function getCountGroup(){
        $Model          = $this->getModel();

        if(!$Model){
            return $this->ResponseData();
        }

        $GroupStatus    = $Model->groupBy('warehouse')->get(array('warehouse',DB::raw('count(*) as total')))->toArray();
        if(empty($GroupStatus)){
            return $this->ResponseData();
        }

        $this->data['ALL']  = 0;
        foreach($GroupStatus as $val){
            $this->data[$val['warehouse']]  = (int)$val['total'];
            $this->data['ALL']             += (int)$val['total'];
        }

        return $this->ResponseData();
    }
}
