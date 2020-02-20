<?php
include "kd-kernel-include.php";
if (!isset($_POST["name"])) {die();}

$obj = $_POST["obj"];
$name = $_POST["name"];
$senderID = $_POST["senderID"];

$userpath = USER_PATH . "/$name/user.json";

$f = file_get_contents($userpath);
$r = "<script>window.parent.$obj.currentUser=$f;</script>";
echo $r;
