<?php
/**
 * This script get a message from a desktop and write to file
 * on the server. This file has all messages sended by others users
 * */

include "kd-messages-ini.php";

//Get desktop instance name
$d = $_GET["d"];

//Get message
$m = $_GET["m"];

//Check ID MESSAGE file. Create it if don't exits.
if (!file_exists($fileName_index)) {
    file_put_contents($fileName_index, "0");
}

//get last id
$id = intval(file_get_contents($fileName_index)) + 1;

//update id
file_put_contents($fileName_index, $id);

//Read messages file.
$t = file_get_contents($fileName_messages);
//Split messages by return characters
$y = preg_split("/\\r\\n/", $t);
//Count messages
$u = count($y);
$p = "";

//Clean old messages
if ($u > $MAX_MESSAGES) {
    for ($i = 0; $i < $MAX_MESSAGES; $i++) {
        $p .= $y[$u - $MAX_MESSAGES + $i - 1] . "\r\n";
    }
    file_put_contents($fileName_messages, "");

}

//build javascript with new message
$r = $p;
$r .= "var _m = new KDMessage();";
$r .= "_m.importJSON($m);";
$r .= "_m.index = $id;";
$r .= "$d.sendMessage(_m);\r\n";

//put the last message at end of file:
file_put_contents($fileName_messages, $r, FILE_APPEND);

?>
