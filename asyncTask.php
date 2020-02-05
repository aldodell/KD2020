<?php
/**
 * Process calls from asyncTasks.js
 * */
$command = $_POST["command"];
$parameters = $_POST["parameters"];
$scriptURL = $_POST["scriptURL"];

switch ($command) {
    case 'send':
        file_put_contents($scriptURL, $parameters, FILE_APPEND);
        break;

    case 'reset':
        file_put_contents($scriptURL, "");

    default:
        # code...
        break;
}

?>
