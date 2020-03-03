<?php
include "kd-kernel-include.php";

$userName = $_POST["userName"];
$terminal = $_POST["terminal"];

$userPath = USER_PATH . "/$userName";
$fileName = "$userPath/kd-terminal-lines.txt";


if (file_exists($userPath)) {
    $lines = preg_split("/\r\n/", file_get_contents($fileName));
    $json = json_encode($lines);
    $r = "<script>alert('hola0');window.parent['$terminal'].appendLines($json);<script>";
    die($r);
}
