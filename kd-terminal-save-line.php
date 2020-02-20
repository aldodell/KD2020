<?php
include "kd-kernel-include.php";

$line = $_POST["line"] . "\r\n";
$userName = $_POST["userName"];
$userPath = USER_PATH . "/$userName";
$fileName = "$userPath/kd-terminal-lines.txt";

if (file_exists($userPath)) {
    file_put_contents($fileName, $line, FILE_APPEND);
}
?>
