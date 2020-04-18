<?php
/**
 * This script get a message from a desktop and write to file
 * on the server. This file has all messages sended by others users
 * */

include "kd-messages-ini.php";

//Get desktop instance name
$d = $_GET["d"];

//Get message
$index = $_GET["i"];

//Read messages file.
$messagesFile = file_get_contents($fileName_messages);

//Split messages by return characters
$messagesArray = preg_split("/\\r\\n/", $messagesFile);

//Count messages
$messagesQuantity = count($messagesArray);

//data to save:
$data = "";

for ($i = 0; $i < $messagesQuantity; $i++) {
    $mt = $messagesArray[$i];
    $m = json_decode($mt);
    if ($m->index > $index) {
        $data .= "$d.addMessageToLocalQueue($mt);\r\n";
    }
}

echo $data;
