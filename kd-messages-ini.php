<?php
header('Content-type: text/javascript');
$fileName_messages = "kd-messages-queue.js";
$fileName_index = "kd-messages-index.txt";
$MAX_MESSAGES = 64;

function returnJavascript($text) {
    echo("<script>$text;</script>");
}
?>