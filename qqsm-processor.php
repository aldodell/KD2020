<?php

//Get query
if (!isset($_GET["q"])) {$q = "";} else { $q = $_GET["q"];}

//If command is NEXT, so p
if ($q == "next") {
    $r = "desktop.getApplicationInstance('qqsm').nextQuestion();";
    //echo $r;
    file_put_contents("qqsm-remote-control-script.js", $r, FILE_APPEND);
}

//Remove scripts
if ($q == "clear") {
    file_put_contents("qqsm-remote-control-script.js", "");
}

