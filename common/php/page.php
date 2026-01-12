<?php

class Page
{
    const IMAGE_PATH = 'res/images/';
    const OFFLINE_IMAGE_PATH = 'images/';
    
    protected $rootRelativePath = '';
    
    protected $scriptFolder = '';   // 'C:/apache/mysite/tools'
    protected $baseUri = '';        // 'http://mysite.com'
    protected $uriFolder = '';      // '/tools'
    protected $page = '';           // 'index.php'
    
    protected $top;
    protected $bottom;
    protected $hamburger;
    protected $preloader;
    
    public function __construct($rootRelativePath)
    {
        $this->rootRelativePath = $rootRelativePath.'/';
        
        $this->baseUri = '';
        if (!empty($_SERVER['HTTPS']) && ('on' == $_SERVER['HTTPS'])) {
            $this->baseUri = 'https://';
        } else {
            $this->baseUri = 'http://';
        }
        $this->baseUri .= $_SERVER['HTTP_HOST'] ?? '';
        
        //$uri = $_SERVER['REQUEST_URI'];
        $uri = $_SERVER['SCRIPT_NAME'];
        $tempArray = explode('/',$uri);
        $this->page = $tempArray[count($tempArray) - 1];
        
        $this->uriFolder = dirname($_SERVER['SCRIPT_NAME']);
        $uriLen = strlen($this->uriFolder);
        if ($uriLen > 0 && $this->uriFolder[$uriLen - 1] != '/')
            $this->uriFolder .= '/';
        $this->scriptFolder = dirname($_SERVER['SCRIPT_FILENAME']);
    }
    
    public function traceFields()
    {
        $res  = 'scriptFolder = '.$this->scriptFolder.'<br />'."\n";
      
        $res .= "\n<br />\n";
        $res .= 'baseUri = '.$this->baseUri.'<br />'."\n";
        $res .= 'uriFolder = '.$this->uriFolder.'<br />'."\n";
        $res .= 'page = '.$this->page.'<br />'."\n";
        $res .= 'rootRelativePath = '.$this->rootRelativePath.'<br />'."\n";
        
        print($res);
    }
    
    public function isOffline()
    {
        if (php_sapi_name() != 'cli')
        {
            return false;
        }
        $cmdArgs = $argv ?? $_SERVER['argv'];
        return $cmdArgs[1] == 'offline';
    }
    
    public function printFavIcon($iconFileName)
    {
        if ($this->isOffline()) {
            print("<link rel=\"icon\" type=\"image/x-icon\" href=\"images/{$iconFileName}\">\n");
        }
    }
    
    public function printCommonCss($fileName)
    {
        $pathRelativeToPage = $this->isOffline() ? 'scripts/_Common/' : $this->rootRelativePath.'common/scripts/';
        print($this->getCssLink($pathRelativeToPage . $fileName) . "\n");
    }
    
    public function printFontsCss()
    {
        $pathRelativeToPage = 'scripts/_Common/';
        $fontsFileName = $this->isOffline() ? 'fonts_local.css' : 'fonts.css';
        print($this->getCssLink($pathRelativeToPage . $fontsFileName) . "\n");
    }
    
    public function printInternalLink($text, $ref, $id = null, $class = null)
    {
        $link = is_null($id) ? "<a" : "<a id=\"{$id}\"";
        $extension = $this->isOffline() ? '.html' : '';
        $link .= " href=\"{$ref}{$extension}\"";
        if (!is_null($class))
        {
            $link .= " class=\"{$class}\"";
        }
        print($link . ">{$text}</a>");
    }
    
    public function printImagePath($imageFileName)
    {
        $baseDir = $this->isOffline() ?
            self::OFFLINE_IMAGE_PATH :
            ($this->rootRelativePath . self::IMAGE_PATH);
        print($baseDir . $imageFileName);
    }
    
    public function printTop()
    {
        if (!isset($this->top))
        {
            $temp = file_get_contents($this->addPathRelativeToThis('page-top.htm'));
            $this->top = $this->isOffline() ?
                str_replace(self::IMAGE_PATH, self::OFFLINE_IMAGE_PATH, $temp) :
                str_replace(self::IMAGE_PATH, $this->rootRelativePath . self::IMAGE_PATH, $temp);
        }
        
        print($this->top);
    }
    
    public function printBottom()
    {
        if (!isset($this->bottom))
        {
            $this->bottom = file_get_contents($this->addPathRelativeToThis('page-bottom.htm'));
        }
        
        print($this->bottom);
    }
    
    public function printHamburgerMenuScript()
    {
        if (!isset($this->hamburger))
        {
            $this->hamburger = file_get_contents($this->addPathRelativeToThis('hamburger.js'));
        }
        
        print($this->hamburger);
    }
    
    public function printBreadcrumb($pageName, $parentText = null)
    {
        $offset = '  ';
        $baseOffset = $offset . $offset;
        $isIndex = !isset($pageName) || $pageName == '';
        
        print($baseOffset . '<ul class="charecter_breadcrumb breadcrumb link_style">' . "\n");
        
        if ($isIndex && is_null($parentText)) {
            print($baseOffset . $offset . '<li><h1 class="title">Root</h1></li>' . "\n");
        } else {
            print($baseOffset . $offset . '<li><a href="https://TheCodingAngel.org/">Root</a></li>' . "\n");
        }
        
        if (!is_null($parentText)) {
            print($baseOffset . $offset . '<li>»</li>' . "\n");
            //$parentDir = $this->isOffline() ? '/' . strtolower($parentText) . '/' : $this->getLastDirName($this->uriFolder);
            $parentDir = '/' . strtolower($parentText) . '/';
            $parentLink = '<li><a href="https://TheCodingAngel.org' . $parentDir . '">' . $parentText . '</a></li>';
            print($baseOffset . $offset . $parentLink . "\n");
        }
        
        if (!$isIndex) {
            print($baseOffset . $offset . '<li>»</li>' . "\n");
            print($baseOffset . $offset . '<li><h1 class="title">' . $pageName . '</h1></li>' . "\n");
        }
        
        print($baseOffset . '</ul>' . "\n");
    }
    
    public function printPreloaderScript()
    {
        if (!isset($this->preloader))
        {
            $this->preloader = file_get_contents($this->addPathRelativeToThis('preloader.js'));
        }
        
        print($this->preloader);
    }
    
    public function getAbsoluteEntryPath($pathRelativeToEntryPage = null)
    {
        $base = realpath(dirname($_SERVER['SCRIPT_FILENAME']));
        if (is_null($pathRelativeToEntryPage))
        {
            return $base;
        }
        
        return realpath($base.DIRECTORY_SEPARATOR.$pathRelativeToEntryPage);
    }
    
    private function addPathRelativeToThis($pathRelativeToThisFile)
    {
        return dirname(__FILE__).DIRECTORY_SEPARATOR.$pathRelativeToThisFile;
    }
    
    private function getCssLink($cssFileName)
    {
        return "<link type=\"text/css\" rel=\"stylesheet\" href=\"{$cssFileName}\" />";
    }
    
    private function getLastDirName($path)
    {
        if (strlen($path) <= 1) {
            return $path;
        }
        $pos = strrpos($path, '/', -2);
        return $pos === false ? $path : substr($path, $pos);
    }
}

?>
