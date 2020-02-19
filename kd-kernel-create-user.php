<?php
include "kd-kernel-include.php";

$name = $_POST["name"];
$securityLevel = $_POST["securityLevel"];
$userpath = USER_PATH . "/" . $name;
$user["name"] = $name;
$user["securityLevel"] = $securityLevel;

//if isnt' exits user path directory
if (!file_exists($userpath)) {
    mkdir($userpath, 0777, true);
    $j = json_encode($user);
    file_put_contents($userpath . "/user.json", $j);
}
