<?php

class Page
{
    const ONLINE_IMAGE_PATH = "../res/images/";
    const OFFLINE_IMAGE_PATH = "images/";
    
    private static $top;
    private static $bottom;
    
    public static function isOffline()
    {
        if (php_sapi_name() != 'cli')
        {
            return false;
        }
        $cmdArgs = $argv ?? $_SERVER['argv'];
        return $cmdArgs[1] == "offline";
    }
    
    public static function printFavIcon($iconFileName)
    {
        if (self::isOffline()) {
            print("<link rel=\"icon\" type=\"image/x-icon\" href=\"images/{$iconFileName}\">");
        }
    }
    
    public static function printFontsCss()
    {
        $pathRelativeToPage = "scripts/_Common/";
        $fontsFileName = self::isOffline() ? "fonts_local.css" : "fonts.css";
        print(self::getCssLink($pathRelativeToPage . $fontsFileName));
    }
    
    public static function printImagePath($imageFileName)
    {
        $baseDir = self::isOffline() ? self::OFFLINE_IMAGE_PATH : self::ONLINE_IMAGE_PATH;
        print($baseDir . $imageFileName);
    }
    
    public static function printTop()
    {
        if (!isset(self::$top))
        {
            $temp = file_get_contents(self::addPathRelativeToThis("page-top.htm"));
            self::$top = self::isOffline() ? str_replace(self::ONLINE_IMAGE_PATH, self::OFFLINE_IMAGE_PATH, $temp) : $temp;
        }
        
        print(self::$top);
    }
    
    public static function printBottom()
    {
        if (!isset(self::$bottom))
        {
            self::$bottom = file_get_contents(self::addPathRelativeToThis("page-bottom.htm"));
        }
        
        print(self::$bottom);
    }
    
    public static function getAbsoluteEntryPath($pathRelativeToEntryPage = null)
    {
        $base = realpath(dirname($_SERVER['SCRIPT_FILENAME']));
        if (is_null($pathRelativeToEntryPage))
        {
            return $base;
        }
        
        return realpath($base.DIRECTORY_SEPARATOR.$pathRelativeToEntryPage);
    }
    
    private static function addPathRelativeToThis($pathRelativeToThisFile)
    {
        return dirname(__FILE__).DIRECTORY_SEPARATOR.$pathRelativeToThisFile;
    }
    
    private static function getCssLink($cssFileName)
    {
        return "<link type=\"text/css\" rel=\"stylesheet\" href=\"{$cssFileName}\" />";
    }
}

?>
