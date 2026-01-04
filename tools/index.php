<?php
require '../common/php/page.php';
$page = new Page('..');
?>
<!DOCTYPE html>

<html lang="en">

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Tools</title>
  
  <?php $page->printFavIcon("favicon.ico"); ?>

  <?php $page->printCommonCss('base.css'); ?>
  <?php $page->printFontsCss(); ?>
  
  <?php $page->printCommonCss('document.css'); ?>
  <?php $page->printCommonCss('style.css'); ?>
  <?php $page->printCommonCss('responsive.css'); ?>
</head>

<body>

<main class="flex-column flex-stretch">

<noscript><h1><b>You need to enable JavaScript to use this page.</b></h1></noscript>

<?php $page->printTop(); ?>

<div id="pageHeader" class="page-header flex-row flex-stretch-ortogonal navdirection">
  <div class="containertop">
  
<?php $page->printBreadcrumb('Tools'); ?>
    
    <div class="flex-stretch-center-children">
    </div>
    <div class="toolbar-horizontal">
      <a href="https://TheCodingAngel.org/tools/arch/Tools.zip">
        <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <title>Download Offline Copy of All Tools (Open any ".html" file)</title>
          <path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 242.7-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7 288 32zM64 352c-35.3 0-64 28.7-64 64l0 32c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-32c0-35.3-28.7-64-64-64l-101.5 0-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352 64 352zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/>
        </svg>
      </a>
    </div>
  </div>
</div>

<div id="pageContent" class="page-content">

<div class="introduction">
<h1 class="section-header flex-pos-ortogonal-center">Tools</h1>
</div>

<div id="tools" class="section flex-column">
  <div class="gallery flex-pos-ortogonal-center">
    <a href="Computer"><img src="/res/images/thumbnails/tools/emulator-simple.jpg"></img></a>
    <a href="Computer-Full"><img src="/res/images/thumbnails/tools/emulator-full.jpg"></img></a>
    <div class="link_style">
      <p class="introduction">
        <strong>Documentation:</strong>
        <a href="Instructions">Instructions</a>
        <a href="Suffixes">Suffixes</a>
        <a href="Registers">Registers</a>
      </p>
    </div>
    <div><!-- second (empty) column next to the previous "Documentation" column --></div>
    <a href="Characters"><img src="/res/images/thumbnails/tools/numbers-characters.jpg"></img></a>
    <a href="ExtendedASCII"><img src="/res/images/thumbnails/tools/extended-ASCII.jpg"></img></a>
    <a href="CodePoints"><img src="/res/images/thumbnails/tools/codepoints.jpg"></img></a>
    <a href="Text"><img src="/res/images/thumbnails/tools/graphemes.jpg"></img></a>
  </div>
</div>

</div>

<?php $page->printBottom(); ?>

</main>

<script>
<?php $page->printHamburgerMenuScript(); ?>
</script>

</body>

</html>

