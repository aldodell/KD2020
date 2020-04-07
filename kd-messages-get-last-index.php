<?php
include("kd-messages-ini.php");

//Get desktop instance name
$d = $_GET["d"];

//get last id
$id = intval(file_get_contents($fileName_index));

//return back
echo(";$d.lastMessageIndex=$id;");
?>