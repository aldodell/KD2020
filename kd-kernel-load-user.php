<?php
include "kd-kernel-include.php";

$object = $_POST["object"];
$userName = $_POST["userName"];

$userpath = USER_PATH . "/$userName/user.json";

$f = file_get_contents($userpath);
$r = "<script>window.parent.$object.currentUser=$f;alert($object);</script>";
echo $r;

?>
