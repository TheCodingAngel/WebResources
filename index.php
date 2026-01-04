<?php
require './common/php/page.php';
$page = new Page('.');
?>
<!DOCTYPE html>

<html lang="en">

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Free Tools</title>
  
  <?php $page->printFavIcon("favicon.ico"); ?>

  <?php $page->printCommonCss('base.css'); ?>
  
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
<?php $page->printBreadcrumb(''); ?>
  </div>
</div>

<div id="pageContent" class="page-content">

<div class="introduction">
<h1 class="section-header flex-pos-ortogonal-center">Why are these free
  <a href="https://thecodingangel.org/tools/">Tools</a> and
  <a href="https://www.youtube.com/@thecodingangel/videos">Videos</a> here?</h1>
</div>

<p><br></p>

<div id="intro" class="section flex-column">
  <div id="hardwareHeader" class="section-header flex-row flex-pos-ortogonal-center">
    <h4><p class="introduction">
    To give programmers <a href="https://thecodingangel.org/tools/">hands on experience</a>
    and <a href="https://www.youtube.com/@thecodingangel/videos">deep understanding</a> of what controls our civilization.<br><br>
    Software is everywhere - it is not only in phones, laptops, microwave ovens, cars and vending machines.<br><br>
    Software is invloved in the manufactoring and transmitting of the electricity you use.<br><br>
    Software is used when you pay with a credit or a debit card.<br><br>
    Software is used by voting systems - both in parliaments and during elections.<br><br>
    Software is used by the entire transportation system both for managing airplanes and trains and inside each of them.<br><br>
    Sometimes human lives directly depend on software because it is in the equipment in hospitals and factories.<br><br>
    Software is everywhere, so we, programmers, must understand what we are doing!
    </p></h4>
  </div>
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

