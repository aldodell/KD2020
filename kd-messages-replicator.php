<?php

$fileName = "messages-queue";

//Get message
$m = $_GET["m"] . "\r\n";

//put the message on file:
file_put_contents($fileName, $m, FILE_APPEND);
?>