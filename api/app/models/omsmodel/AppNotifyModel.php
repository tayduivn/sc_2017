<?php namespace omsmodel;

use Eloquent;
class AppNotifyModel extends Eloquent {

	/**
	 * The database table used by the model.
	 *
	 * @var string
	 */
    
	protected $table            = 'oms_notify_app' ;
    protected $connection       = 'omsdb';
    protected $guarded          = array();
    public    $timestamps       = false;
    
}
