<?php
include "kd-messages-ini.php";

//Get desktop instance name
$d = $_GET["d"];

//Get message
$m = $_GET["m"];

//Check ID MESSAGE
if (!file_exists($fileName_index)) {
    file_put_contents($fileName_index, "0");
}

//get last id
$id = intval(file_get_contents($fileName_index)) + 1;

//update id
file_put_contents($fileName_index, $id);

$t = file_get_contents($fileName_messages);
$y = preg_split("/\\r\\n/", $t);
$u = count($y);
$p = "";

if ($u > $MAX_MESSAGES) {
    $o = $MAX_MESSAGES - $u;
  
    for ($i = $o; $i < $MAX_MESSAGES; $i++) {
        $p .= $y[$i-1] . "\r\n";
    }

    file_put_contents($fileName_messages, "");

}

//build javascript
$r = $p;
$r .= "var _m = new KDMessage();";
$r .= "_m.importJSON($m);";
$r .= "_m.index = $id;";
$r .= "$d.sendMessage(_m);\r\n";

//put the message on file:
file_put_contents($fileName_messages, $r, FILE_APPEND);

