<?php
/**
 * Created by PhpStorm.
 * User: sabir
 * Date: 03.01.15
 * Time: 12:49
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

$articleId = $_GET["id"];

//ParseClient::initialize( $app_id, $rest_key, $master_key );

ParseClient::initialize( "h1QhtsSjeoyQSa8RDQBDPvgbnI7Ix6nadHTsepwN", "Frq9bS1aVvjmwFqPvZph6K3rDzGMfkUUiR5yTwoi", "PuOZIYv6eHyqXLS0hc19bHCfO1ZrdPgA9cNbMpBI" );

$query = new ParseQuery("PatientArticle");
$article = $query->get($articleId);
$name = $article->get("name");
$content = $article->get("content");
$patientCreatedAt = $article->getCreatedAt();

$contentNoTags = strip_tags($content);

$pos=strpos($contentNoTags, ' ', 200);
substr($contentNoTags,0,$pos);

$imgSrc = $article->get("imgSrc");

//$userId = $article->get("ownerId");
//$userQuery = new ParseQuery(ParseUser);
//$user = $userQuery->get($userId);

?>

<!DOCTYPE html>
<html class="no-js" lang="">

<head>
    <!-- meta -->
    <meta charset="utf-8">
    <meta name="description" content="<?php echo $contentNoTags; ?>">
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1, maximum-scale=1">
    <link href="home/img/logo_mini.png" rel="shortcut icon" type="image/x-icon" />
    <!-- /meta -->

    <meta property="og:image" content="http://article.englishpatient.org/home/img/logo_mini.png"/>
    <meta property="og:title" content="<?php echo str_replace('"', "'", $name) ?>"/>
    <meta property="og:description" content="<?php echo $contentNoTags; ?>"/>
    <meta property="og:site_name" content="English Patient - boost your productivity in learning English"/>
    <meta property="og:url" content="http://article.englishpatient.org/article.php?id=<?php echo $articleId ?>"/>
    <meta property="og:type" content="website"/>

    <title>
        <?php echo $name ?>
    </title>

    <!-- core scripts -->
    <script src="home/plugins/jquery-1.11.1.min.js"></script>
    <script src="home/bootstrap/js/bootstrap.js"></script>
    <script src="home/plugins/jquery.slimscroll.min.js"></script>
    <script src="home/plugins/jquery.easing.min.js"></script>
    <script src="home/plugins/appear/jquery.appear.js"></script>
    <script src="home/plugins/jquery.placeholder.js"></script>
    <script src="home/plugins/fastclick.js"></script>


    <!-- /core scripts -->

    <!-- page level plugin styles -->
    <!-- /page level plugin styles -->

    <!-- core styles -->
    <link rel="stylesheet" href="home/bootstrap/css/bootstrap.min.css">
    <link rel="stylesheet" href="home/css/font-awesome.css">
    <link rel="stylesheet" href="home/css/themify-icons.css">
    <link rel="stylesheet" href="home/css/animate.min.css">

    <link rel="stylesheet" href="home/plugins/medium/medium-editor.css">
    <link rel="stylesheet" href="home/plugins/medium-plugin/css/medium-editor-insert-plugin.min.css">

    <!-- /core styles -->

    <script src="home/js/parse-1.2.18.min.js" ></script>
    <script src="home/js/moment.js" ></script>



    <!-- template styles -->
    <link rel="stylesheet" href="home/css/skins/palette.css">
    <link rel="stylesheet" href="home/css/fonts/font.css">
    <link rel="stylesheet" href="home/css/main.css">

    <link rel="stylesheet" href="css/custom.css">
    <link rel="stylesheet" href="home/plugins/toastr/toastr.min.css">
    <!-- template styles -->

    <!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!--[if lt IE 9]>
    <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
    <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
    <![endif]-->

    <!-- load modernizer -->
    <script src="plugins/modernizr.js"></script>

    <style>
        img.patientCategory{
            cursor: pointer;
            -webkit-transition: 1s;
            -moz-transition: 1s;
            -o-transition: 1s;
            transition: 1s;
        }
        img.patientCategory:hover{
            opacity: 0.6;
            margin-top: 0px;
        }

        .mediumInsert{
            margin-left: 0px !important;
        }

        #commentsBlock{
            min-height: 200px;
            max-width: 700px;
            display: block;
            margin: 0 auto;
            background-color: white;
            margin-top: 15px;
            padding: 10px;
            border-radius: 5px;
            box-shadow: 0 1px 5px rgba(0,0,0,.2);
        }

        #patientArticle{
            background: white;
            border-radius: 5px;
            box-shadow: 0 1px 5px rgba(0,0,0,.2);
            padding: 15px 20px 10px 20px;
            width: 700px;
            margin: 0 auto;
        }

        #articleName{
            width: 600px;
            font-size: 18px;
        }

        #articleHead{
            color: #000000;
            font-weight: bold;
            margin: 5px;
        }

        #articleDate{
            color: #a8aeb3;
            font-weight: normal;
        }

        .main-content .content-wrap{
            background-image: url('home/img/page-bg.png') !important;
            background-size: 50px 50px !important;
        }

        a.navbar-brand img{
            max-height: 40px !important;
            margin-right: 0px !important;
            margin-top: -10px !important;
        }

        a .heading-font{
            color: white;
            font-size: 22px;
        }

        div.yashare-auto-init{
            margin-top: 10px;
            margin-right: 10px;
            background-color: darkblue;
            padding: 5px;
            background-color: #147bd0;
            margin-right: 5px;
        }

        #previewOverlay{
            opacity: 1;
            filter: alpha(opacity=100);
            background-color: rgba(255, 255, 255, 0.97);
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            display: block;
            z-index: 999;
            height: 100%;
        }

        #previewButton{
            cursor: pointer;
        }

        #mediaList{
            list-style: none;
            margin-left: 0px;
            padding-left: 0px;
            height: 500px;
            overflow-y: auto;
            background-color: #f5f5f5;
            max-width: 200px;
        }

        #mediaList li{
            max-height: 120px;
            margin-bottom: 10px;
        }

        #mediaList li img{
            max-height: 115px;
        }

        #mediaList li{
            text-align: center;
        }

        li.mediaItem{
            cursor: pointer;
        }

        #mediaBlock{
            max-height: 500px;
        }

        #mediaBlock iframe, #mediaBlock img{
            max-height: 500px;
            margin: 0 auto;
        }

        #mediaBlock img{
            display: block;
            min-width: 300px;
        }

        .mediaItem.active{
            border: 3px solid #147bd0;
        }

        #transcriptBlock{
            background-color: white;
            font-size: 28px;
        }

        .container{
            background-color: #ffffff;
        }

        .row{
            background-color: #ffffff;
        }
        /*header.header{*/
            /*position: relative !important;*/
        /*}*/

    </style>


</head>

<!-- body -->

<body>

<div class="overlay bg-color"></div>

<div class="app horizontal-layout">
    <!-- top header -->
    <header class="header header-fixed navbar">

        <div class="brand">
            <!-- toggle offscreen menu -->
            <a href="javascript:;" class="ti-menu off-left visible-xs" data-toggle="offscreen" data-move="ltr"></a>
            <!-- /toggle offscreen menu -->

            <!-- logo -->
            <a href="index.php" class="navbar-brand">
                <img src="home/img/logo_mini.png" alt="">
                    <span class="heading-font">
                        English Patient
                    </span>
            </a>
            <!-- /logo -->
        </div>

        <ul class="nav navbar-nav">

            <!--<li class="hidden-xs">-->
            <!--<a href="exercises.html" >-->
            <!--<i class="ti-server"></i>-->
            <!--Materials-->
            <!--</a>-->
            <!--</li>-->

            <li class="hidden-xs">
                <!-- toggle small menu -->
                <!--<a href="javascript:;" class="toggle-sidebar">-->
                <!--<i class="ti-menu"></i>-->
                <!--</a>-->
                <!-- /toggle small menu -->
            </li>
        </ul>

        <ul class="nav navbar-nav navbar-right">

            <li class="off-right">
<!--                <a href="javascript:;">-->

<!--                    <div style="text-align: center; margin-top: 10px;">-->
                        <script type="text/javascript" src="//yastatic.net/share/share.js" charset="utf-8"></script>

                <div class="yashare-auto-init" style="" data-yashareL10n="ru" data-yashareType="small" data-yashareQuickServices="vkontakte,facebook,twitter,odnoklassniki,moimir,gplus" data-yashareTheme="counter"></div>
<!--                    </div>-->

<!--                </a>-->

            </li>

        </ul>
    </header>
    <!-- /top header -->

    <section class="layout">


        <!-- main content -->
        <section class="main-content">

            <!-- content wrapper -->
            <div class="content-wrap">

                <!-- inner content wrapper -->
                <div class="wrapper ">

                    <div id="patientArticle">
                        <div id="articleHead" class="pb10 bb">
                             <span class="pull-right">
                                    <i class="ti-gallery pull-right" id="previewButton" ></i>
                            </span>

                            <div id="articleName">
                                <?php echo $name ?>

                            </div>

                            <div id="articleDate">

                            </div>

                        </div>

                        <div id="articleContent" class="patientArticle production pt10" >
                            <?php echo $content ?>
                        </div>
                    </div>

                    <div id="commentsBlock" >
                        <div id="mc-container"></div>
                        <script type="text/javascript">
                            cackle_widget = window.cackle_widget || [];
                            cackle_widget.push({widget: 'Comment', id: 32575});
                            (function() {
                                var mc = document.createElement('script');
                                mc.type = 'text/javascript';
                                mc.async = true;
                                mc.src = ('https:' == document.location.protocol ? 'https' : 'http') + '://cackle.me/widget.js';
                                var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(mc, s.nextSibling);
                            })();
                        </script>
                    </div>

                    <div id="linksPlaceholder">

                    </div>



                </div>
                <!-- /inner content wrapper -->
            </div>
            <!-- /content wrapper -->
            <a class="exit-offscreen"></a>
        </section>
        <!-- /main content -->
    </section>

</div>


<div class="gallery-loader hide">
    <div class="loader"></div>
</div>

<div id="previewOverlay" class="hide" >
    <div class="row mt10">
        <div class="container bb" style="padding-top: 55px;" >
            <div class="col-xs-12" style="display: block; text-align: right; margin-bottom: 10px;">
                <a class="pull-right" href="javascript: void(0);"
                   onclick="hidePreviewOverlay(); $('#mediaBlock').html('');" >
                    <i class="ti-close" ></i>
                    ЗАКРЫТЬ
                </a>
            </div>

            <div class="col-xs-3">
                <div id="mediaListPlaceholder">
                    <ul id="mediaList">

                    </ul>
                    <div id="controlsBlock" class="mt10 mb10" style="text-align: left; padding-left: 25px;">
                        <button class="btn btn-primary" id="prevButton" ><i class="ti-arrow-left" ></i>PREV</button>
                        <button class="btn btn-primary" id="nextButton" >NEXT<i class="ti-arrow-right" ></i></button>
                    </div>
                </div>
            </div>

            <div class="col-xs-9">


                <div id="mediaBlock">

                </div>
                <div id="transcriptBlock">

                </div>




            </div>

        </div>
    </div>
</div>

<div style="display: block; position: absolute; bottom: 0px; cursor:pointer; right: 0px; width: 50px; height: 50px; " onclick="window.location.href=window.location.href + '&voos=1'" >

</div>


<!-- page level scripts -->
<!-- /page level scripts -->

<!-- template scripts -->
<script src="home/js/offscreen.js"></script>
<script src="home/plugins/toastr/toastr.min.js"></script>
<script src="home/js/main.js"></script>
<script src="home/js/custom/howler.js"></script>
<script src="home/js/parse-1.2.18.min.js"></script>
<script src="home/js/custom/common.js"></script>
<script src="js/MediaViewManager.js"></script>
<!-- /template scripts -->

<!-- page script -->
<!-- /page script -->

<script>




    $(function(){
        article = {
            name: "<?php echo $name; ?>",
            createdAt: <?php echo $patientCreatedAt->getTimestamp(); ?>
        }



        moment.lang('ru');
        $('#articleDate').html(moment(article.createdAt * 1000).format('LLL'));

        MVM = new MediaViewManager();
        MVM.init();

//        SAM = new SimpleArticleManager();
//        SAM.init();
//        THPM = new TeacherHomePageManager();
//        THPM.init();
    });
</script>



</body>
<!-- /body -->

</html>
