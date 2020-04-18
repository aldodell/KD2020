<?php
/**
 * This script get a message from a desktop and write to file
 * on the server. This file has all messages sended by others users
 * */

include "kd-messages-ini.php";

//Get desktop instance name
$d = $_POST["d"];

//Get message
$m = $_POST["m"];

//Read messages file.
$messagesFile = file_get_contents($fileName_messages);

//Split messages by return characters
$messagesArray = preg_split("/\\r\\n/", $messagesFile);

//Count messages
$messagesQuantity = count($messagesArray);

//data to save:
$data = "";

//get last id
$id = intval(file_get_contents($fileName_index)) + 1;

//update id
file_put_contents($fileName_index, $id);

//Prepare a KDMessage represented as JSON and save it on database file
$kdMessage = json_decode($m);
$kdMessage->index = $id;

//Take last messages from files
$j = $messagesQuantity - $MAX_MESSAGES;
if ($j < 0) {$j = $messagesQuantity;}
for ($i = 0; $i < $j; $i++) {$r .= $messagesArray[$i] . "\r\n";}

$m1 = json_encode($kdMessage);
$r .= $m1;

//put the last message at end of file:
file_put_contents($fileName_messages, $r);

//put last message on file
$messagesArray[] = $m1;

//Send all messages on javascript way
for ($i = 0; $i < $messagesQuantity; $i++) {
    $mt = $messagesArray[$i];
    echo "$d.addMessageToLocalQueue($mt);\r\n";
}
