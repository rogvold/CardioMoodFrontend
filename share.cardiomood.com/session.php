<?php
/**
 * Created by PhpStorm.
 * User: sabir
 * Date: 08.01.15
 * Time: 22:43
 */

require 'php/autoload.php';

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
    header('Location: http://cardiomood.com');
}

$sessionId = $_GET["id"];

//ParseClient::initialize( $app_id, $rest_key, $master_key );

ParseClient::initialize( "SSzU4YxI6Z6SwvfNc2vkZhYQYl86CvBpd3P2wHF1", "pKDap5jqe7lyBG5vTRgvTz7t8AiRWXpMYbuS2oak", "80ah2J605oswPn4WFb8OriGaHywjZ46wpoa9rHzQ" );

$query = new ParseQuery("CardioSession");
$cardioSession = $query->get($sessionId);

$date = $cardioSession->getCreatedAt();

$query = new ParseQuery("CardioDataChunk");
$query->equalTo("sessionId", $sessionId);
$query->ascending("number");
$results = $query->find();



?>

<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">

    <link rel="stylesheet" href="css/bootstrap.min.css" />
    <link rel="stylesheet" href="css/bootstrap-theme.min.css" />
    <script type="text/javascript" src="js/bootstrap.min.js" ></script>


    <link href="img/cLogo.png" rel="shortcut icon" type="image/x-icon">

    <title>CardioMood sharing</title>

    <style>
        header{
            background-color: #1582dc !important;
            color white;
        }

        header a{
            color: rgba(219, 237, 252, 0.9) !important;
        }

        body{
            background: url('img/page-bg.png');
        }

        header .navbar-brand img{
            display: inline-block !important;
            height: 27px !important;
        }

        div.yashare-auto-init{
            margin-top: 10px;
            margin-right: 10px;
            background-color: darkblue;
            padding: 5px;
            background-color: #147bd0;
            margin-right: 5px;
        }

        #mainBlock{
            background-color: white;
            padding: 10px;
            background: white;
            border-radius: 5px;
            box-shadow: 0 1px 5px rgba(0,0,0,.2);
            width: 610px;
            margin: 0 auto;
        }

        #articleHead{
            color: #000000;
            font-weight: bold;
            margin: 5px;
            border-bottom: 1px solid #e3e6f3;
        }

        #articleName{
            width: 600px;
            font-size: 18px;
        }

        #articleDate{
            color: #a8aeb3;
            font-weight: normal;
            font-size: 10px;
            font-style: italic;
        }

        #articleContent{
            padding: 0px 5px;
        }

    </style>

</head>
<body>

<header class="navbar navbar-static-top bs-docs-nav" id="top" role="banner"  >
    <div class="container">
        <div class="navbar-header">
            <button class="navbar-toggle collapsed" type="button" data-toggle="collapse" data-target=".bs-navbar-collapse">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
            <a href="http://cardiomood.com" class="navbar-brand">
                <img src="img/cLogo.png" >
                CardioMood
            </a>
        </div>
        <nav class="collapse navbar-collapse bs-navbar-collapse">
            <ul class="nav navbar-nav">
<!--                <li>-->
<!--                    <a href="../getting-started/">Getting started</a>-->
<!--                </li>-->

            </ul>
            <ul class="nav navbar-nav navbar-right">
                <li class="off-right">

                    <script type="text/javascript" src="//yastatic.net/share/share.js" charset="utf-8"></script>

                    <div class="yashare-auto-init" style="" data-yashareL10n="ru" data-yashareType="small" data-yashareQuickServices="vkontakte,facebook,twitter,odnoklassniki,moimir,gplus" data-yashareTheme="counter"></div>


                </li>
<!--                <li><a href="http://expo.getbootstrap.com" onclick="ga('send', 'event', 'Navbar', 'Community links', 'Expo');">Expo</a></li>-->
<!--                <li><a href="http://blog.getbootstrap.com" onclick="ga('send', 'event', 'Navbar', 'Community links', 'Blog');">Blog</a></li>-->

            </ul>
        </nav>
    </div>
</header>

<div class="container">

    <div class="" id="mainBlock" >

        <div id="articleHead" class="pb10 bb">

            <div id="articleName">
                <?php echo $cardioSession->get("name") ?>
            </div>

            <div id="articleDate">
                <?php echo date_format($date, 'Y-m-d H:i:s'); ?>
            </div>

        </div>

        <div id="articleContent" >
            Plots and calculated params..
        </div>


    </div>

</div>



</body>
</html>