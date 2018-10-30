<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of SystemUtils
 *
 * @author snick
 */
class SystemUtils {

    public static function trimToNumeric($string) {
        if (!isset($string)) {
            return '';
        }
        return preg_replace('/[^0-9]/', '', $string);
    }

    public static function trimToDate($string) {
        try {
            if (!isset($string)) {
                return '';
            }
            if (strpos($string, ':') === FALSE) {
                $string = preg_replace('/[^0-9]/', '-', $string);
                $string.=' 00:00:00';
                $date = DateTime::createFromFormat('m-d-Y H:i:s', $string);
            } else {
                $string = preg_replace("/[^0-9]/", '-', $string);
                $date = DateTime::createFromFormat('m-d-Y H:i:s', $string);
            }
            if (is_bool($date)) {
                return $string;
            }
            return date_format($date, 'Y-m-d H:i:s');
        } catch (Exception $e) {
            SystemUtils::logActivity('system', 'app', 'unable to convert date ' . $e->getMessage() . ' trace .. ' . $e->getTraceAsString());
            return '';
        }
    }

    public static function formatPhoneNumber($phoneNumber) {
        $phoneNumber = preg_replace('/[^0-9]/', '', $phoneNumber);
        if (strlen($phoneNumber) > 10) {
            $countryCode = substr($phoneNumber, 0, strlen($phoneNumber) - 10);
            $areaCode = substr($phoneNumber, -10, 3);
            $nextThree = substr($phoneNumber, -7, 3);
            $lastFour = substr($phoneNumber, -4, 4);

            $phoneNumber = '+' . $countryCode . ' (' . $areaCode . ') ' . $nextThree . '-' . $lastFour;
        } else if (strlen($phoneNumber) == 10) {
            $areaCode = substr($phoneNumber, 0, 3);
            $nextThree = substr($phoneNumber, 3, 3);
            $lastFour = substr($phoneNumber, 6, 4);

            $phoneNumber = '(' . $areaCode . ') ' . $nextThree . '-' . $lastFour;
        } else if (strlen($phoneNumber) == 7) {
            $nextThree = substr($phoneNumber, 0, 3);
            $lastFour = substr($phoneNumber, 3, 4);

            $phoneNumber = $nextThree . '-' . $lastFour;
        }

        return $phoneNumber;
    }

    public static function cleanSQLQuoteArray($array) {
        if (sizeof($array) < 1) {
            return "0,0";
        }
        $quoted = array();
        foreach ($array AS $v) {
            $quoted[] = "'{$v}'";
        }
        return implode(',', $quoted);
    }

    public static function generateKey($len, $readable = false, $hash = false) {
        $key = '';

        if ($hash) {
            $key = substr(sha1(uniqid(rand(), true)), 0, $len);
        } else if ($readable) {
            $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            for ($i = 0; $i < $len; ++$i) {
                $key .= substr($chars, (mt_rand() % strlen($chars)), 1);
            }
        } else {
            for ($i = 0; $i < $len; ++$i) {
                $key .= chr(mt_rand(33, 126));
            }
        }

        return $key . SystemUtils::generateRandomString(150);
    }

    public static function generateRandomString($length = 10) {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $charactersLength = strlen($characters);
        $randomString = '';
        for ($i = 0; $i < $length; $i++) {
            $randomString .= $characters[rand(0, $charactersLength - 1)];
        }
        return $randomString;
    }

    public static function generateUsername($email) {
        try {
            $Email = explode('@', $email);
            $email = $Email[0] . substr(uniqid(rand(), true), 0, 2);
            unset($Email);
            return $email;
        } catch (Exception $e) {
            logActivity('user', 'app', 'An exception occurred while generating username' . $e->getMessage());
            return $email;
        }
    }

    public static function format_percentage($value, $max) {
        if ($max == 0 || $value == 0) {
            return 0;
        }
        return round(($value / $max) * 100, 0);
    }

    public static function commandExist($cmd) {
        try {
            $val = shell_exec("which $cmd");
            echo $val;
            return (empty($val) ? FALSE : TRUE);
        } catch (Exception $e) {
            return FALSE;
        }
    }

    //this is a simple function to log txt msg in file
    public static function logActivity($type, $usertype, $logMsg) {
        try {
            $file = date('Y-m-d') . '_deb.log';
            $dir = './logs/' . $usertype . '/default';
            if ($type == 'system') {
                $logMsg = 'System: ' . $logMsg . PHP_EOL;
                $dir = './logs/' . $usertype . '/system/';
                $dir.=date('Y');
                if (!file_exists($dir)) {
                    if (!mkdir($dir, 0777, true)) {
                        return false;
                    }
                }

                $log = PHP_EOL . date('Y-m-d H:i:s') . ': ' . $logMsg . PHP_EOL;
                return file_put_contents($dir . '/' . $file, $log, FILE_APPEND);
            } else if ($type == 'user') {
                $logMsg = 'User: ' . $logMsg . PHP_EOL;
                $dir = './logs/' . $usertype . '/user/';
                $dir.=date('Y');
                if (!file_exists($dir)) {
                    if (!mkdir($dir, 0777, true)) {
                        return false;
                    }
                }

                $log = PHP_EOL . date('Y-m-d H:i:s') . ': ' . $logMsg . PHP_EOL;
                return file_put_contents($dir . '/' . $file, $log, FILE_APPEND);
            } else {
                $logMsg = 'dump: ' . $logMsg . PHP_EOL;
                $dir.=date('Y');
                if (!file_exists($dir)) {
                    if (!mkdir($dir, 0777, true)) {
                        return false;
                    }
                }
                $log = PHP_EOL . date('Y-m-d H:i:s') . ': ' . $logMsg . PHP_EOL;
                return file_put_contents($dir . '/' . $file, $log, FILE_APPEND);
            }
        } catch (Exception $e) {
            return false;
        }
    }

    public static function nicetime($date) {
        if (empty($date)) {
            return "a while ago";
        }

        $periods = array("second", "minute", "hour", "day", "week", "month", "year", "decade");
        $lengths = array("60", "60", "24", "7", "4.35", "12", "10");

        $now = time();
        $unix_date = strtotime($date);

// check validity of date
        if (empty($unix_date)) {
            return "";
        }

// is it future date or past date
        if ($now > $unix_date) {
            $difference = $now - $unix_date;
            $tense = "ago";
        } else {
            $difference = $unix_date - $now;
            $tense = "from now";
        }

        for ($j = 0; $difference >= $lengths[$j] && $j < count($lengths) - 1; $j++) {
            $difference /= $lengths[$j];
        }

        $difference = round($difference);

        if ($difference != 1) {
            $periods[$j].= "s";
        }

        return "$difference $periods[$j] {$tense}";
    }

    public static function formatTextUTF8($text) {
        return mb_detect_encoding($text . " ", "UTF-8,CP1252") == "UTF-8" ? iconv("UTF-8", "CP1252", $text) : $text;
    }

}
