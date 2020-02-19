<?php
include "kd-kernel-include.php";

$line = $_POST["line"];
$userName = $_POST["userName"];
$userPath = USER_PATH . "/$userName";
$fileName = "$userPath/kd-terminal-lines.txt";

if (file_exists($userPath)) {
    file_put_contents($fileName, $line . "\r\n", FILE_APPEND);
}
?>
