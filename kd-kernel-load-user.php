<?php
include "kd-kernel-include.php";
$object = $_POST["object"];
$userName = $_POST["userName"];

$userpath = USER_PATH . "/" . $userName;

$f = file_get_contents($userpath);
$r = "$object.currentUser=$f";
echo $r;

?>
