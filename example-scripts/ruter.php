<?php
date_default_timezone_set('Europe/Oslo');
header('Content-Type: application/json');

$obj_json = new StdClass;
$stops = array();

$i = 0;
$radius = 650;
$x_center = 700;
$y_center = 700;

$GLOBALS["obj_json"]->options->text->node_position = "center";
$GLOBALS["obj_json"]->options->node_radius = 20;
$GLOBALS["obj_json"]->options->link->width = 3;
$GLOBALS["obj_json"]->options->link->spacing = 10;

$url = "https://api.entur.io/realtime/v1/rest/vm?datasetId=RUT";
$xml = simplexml_load_file($url);
$time = time();

foreach($xml->ServiceDelivery->VehicleMonitoringDelivery->VehicleActivity as $bus){

    if(!in_array($bus->MonitoredVehicleJourney->OriginName,$stops)){
        array_push($stops,(string) $bus->MonitoredVehicleJourney->OriginName);
    }
    if(!in_array($bus->MonitoredVehicleJourney->DestinationName,$stops)){
        array_push($stops,(string) $bus->MonitoredVehicleJourney->DestinationName);
    }

    $link= new StdClass;

    $link->to =  (string) $bus->MonitoredVehicleJourney->DestinationName;
    $link->from = (string) $bus->MonitoredVehicleJourney->OriginName;

    $link->type =  "1way";
    $link->rate =   (string) $bus->MonitoredVehicleJourney->MonitoredCall->StopPointName;
    $link->load =   (float) $bus->ProgressBetweenStops->Percentage;
    //$link->load_out =   100 -(string) $bus->ProgressBetweenStops->Percentage;

    $GLOBALS["obj_json"]->links[] = $link;
}

shuffle($stops);

foreach($stops as $stop){
    $i++;
    $GLOBALS["obj_json"]->nodes->{$stop}->x  = $x_center + $radius * cos(2* M_PI * $i / sizeof($stops));
    $GLOBALS["obj_json"]->nodes->{$stop}->y  = $y_center + $radius * sin(2* M_PI * $i / sizeof($stops));

}

echo json_encode($obj_json);
?>