<?php
/**
 * Created by PhpStorm.
 * User: sabir
 * Date: 30.12.14
 * Time: 14:49
 */

require 'autoload.php';

use Parse\ParseObject;
use Parse\ParseQuery;
use Parse\ParseClient;
use Parse\ParseACL;
use Parse\ParsePush;
use Parse\ParseUser;
use Parse\ParseInstallation;
use Parse\ParseException;
use Parse\ParseAnalytics;
use Parse\ParseFile;
use Parse\ParseCloud;



if (isset($_GET['id']) == false){
    header('Location: http://idiophrases.com');
}

$idiomId = $_GET["id"];

ParseClient::initialize( "Y9LJi7Ti007mowLGEI5mqaAy7BJYtma0D9V4qLP9", "eOreFmctwLwmSaH7vbm1QOuWfrc7mXhSwis2DfOe", "EjrTpnujMPGpCa7pMXVRcqlSbFBmfp0Lr7La3YAQ" );
$query = new ParseQuery("Idiom");
$idiom = $query->get($idiomId);
$name = $idiom->get("title");

$query = new ParseQuery("Idiom");
$query->equalTo("title", $name);
$query->equalTo("idiomType", "idiom");
$query->ascending("vimeoId");
$results = $query->find();

$count = count($results);

?>











<?php

for ($i = 0; $i < $count; $i++) {
    echo "<br/>" . $results[$i]->get("title");
}

?>