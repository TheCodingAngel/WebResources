<?php

class Page
{
    private static $top;
    private static $bottom;
    
    public static function printTop()
    {
        if (!isset(Page::$top))
        {
            Page::$top = file_get_contents(Page::addPathRelativeToThis("page-top.htm"));
        }
        
        print(Page::$top);
    }
    
    public static function printBottom()
    {
        if (!isset(Page::$bottom))
        {
            Page::$bottom = file_get_contents(Page::addPathRelativeToThis("page-bottom.htm"));
        }
        
        print(Page::$bottom);
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
}

?>
