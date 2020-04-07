<?php
header('Content-type: text/javascript');
$fileName_messages = "kd-messages-queue.js";
$fileName_index = "kd-messages-index.txt";
$MAX_MESSAGES = 64;

//Check ID MESSAGE file. Create it if don't exits.
if (!file_exists($fileName_index)) {
    file_put_contents($fileName_index, "0");
}

//Check fileName_messages  file. Create it if don't exits.
if (!file_exists($fileName_messages)) {
    file_put_contents($fileName_messages, "");
}

function returnJavascript($text) {
    echo("<script>$text;</script>");
}
?>