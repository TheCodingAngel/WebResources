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
<h1 class="section-header flex-pos-ortogonal-center">Why are these
  <a href="https://thecodingangel.org/tools/">Free Tools</a> here?</h1>
</div>

<p><br></p>

<div id="intro" class="section flex-column">
  <div id="hardwareHeader" class="section-header link_style flex-row flex-pos-ortogonal-center">
    <h4><p class="introduction text-medium">
    To give <strong>programmers</strong> <a class="text-medium" href="https://thecodingangel.org/tools/">hands on experience</a>
    and <a class="text-medium" href="https://www.youtube.com/@thecodingangel/videos">deep understanding</a>
    of what controls our civilization.<br><br>
    Software is everywhere:
    <a class="text-big" title="Computers" href="https://www.geeksforgeeks.org/operating-systems/difference-between-system-software-and-application-software/">&#x1F4BB;</a> <!-- 💻 -->
    <a class="text-big" title="Mobile Devices" href="https://developer.ibm.com/articles/choosing-the-best-programming-language-for-mobile-app-development/">&#x1F4F1;</a> <!-- 📱 -->
    <a class="text-big" title="Cameras" href="https://developer.ridgerun.com/wiki/index.php/Camera_Sensor_Basics">&#x1F4F7;</a> <!-- 📷 -->
    <a class="text-big" title="Television" href="https://en.wikipedia.org/wiki/List_of_smart_TV_platforms">&#x1F4FA;</a> <!-- 📺 -->
    <a class="text-big" title="Communications" href="https://en.wikipedia.org/wiki/Internet_of_things">&#x1F4E1;</a> <!-- 📡 -->
    <a class="text-big" title="Cars" href="https://intechhouse.com/blog/driving-the-future-automotive-embedded-software-development">&#x1F697;</a> <!-- 🚗 -->
    <a class="text-big" title="Credit / Debit Card Payments" href="https://stripe.com/en-bg/resources/more/how-to-create-a-card-program-a-step-by-step-guide">&#x1F4B3;</a> <!-- 💳 -->
    <a class="text-big" title="Transportation" href="https://en.wikipedia.org/wiki/Transportation_management_system">&#x1F69A;</a> <!-- 🚚 -->
    <a class="text-big" title="Music" href="https://en.wikipedia.org/wiki/List_of_music_software">&#x1F3A7;</a> <!-- 🎧 -->
    <a class="text-big" title="Movies" href="https://www.softwarehow.com/video-editing-software-hollywood-movies-use/">&#x1F3AC;</a> <!-- 🎬 -->
    <a class="text-big" title="Teaching" href="https://www.educationcorner.com/35-incredible-classroom-apps/">&#x1F469;&#x1F3FB;&#x200D;&#x1F3EB;</a> <!-- 👩🏻‍🏫 -->
    <a class="text-big" title="Voting" href="https://en.wikipedia.org/wiki/Open-source_voting_system">&#x1F5F3;&#xFE0F;</a> <!-- 🗳️ -->
    <a class="text-big" title="Government" href="https://research.com/software/best-government-software">&#x1F4CA;</a> <!-- 📊 -->
    <a class="text-big" title="Science" href="https://en.wikipedia.org/wiki/List_of_data_science_software">&#x1F52C;</a> <!-- 🔬 -->
    <a class="text-big" title="Robots / AI" href="https://roboticcoding.com/robotics-programming-for-beginners/">&#x1F916;</a> <!-- 🤖 -->
    <a class="text-big" title="Space Technologies" href="https://www.nasa.gov/smallsat-institute/space-mission-design-tools/">&#x1F6F0;&#xFE0F;</a> <!-- 🛰️ -->
    <br><br>
    Sometimes human lives directly depend on it:
    <!-- a class="text-big" title="Electrical Infrastructure" href="https://www.verifiedmarketresearch.com/blog/best-advanced-distribution-management-systems/">&#x1F5F2;</a --> <!-- 🗲 -->
    <a class="text-big" title="High Voltage Infrastructure" href="https://diversedaily.com/high-voltage-engineering-software-tools-a-comprehensive-overview/">&#x1F5F2;</a> <!-- 🗲 -->
    <a class="text-big" title="Industry (Dangerous Production)" href="https://roboticsandautomationnews.com/2025/04/24/top-20-industrial-software-suppliers-theres-an-app-for-that/90043/">&#x2699;&#xFE0F;</a> <!-- ⚙️ -->
    <a class="text-big" title="Trains (Tight Schedules without Crashes)" href="https://www.devopsschool.com/blog/top-10-rail-operations-management-software-features-pros-cons-comparison/">&#x1F685;</a> <!-- 🚅 -->
    <a class="text-big" title="Airplanes" href="https://en.wikipedia.org/wiki/Avionics_software">&#x2708;&#xFE0F;</a> <!-- ✈️ -->
    <a class="text-big" title="Emergency Rooms / Intensive Care Units" href="https://vantagemedtech.com/embedded-medical-device-software/">&#x1F1E8;&#x1F1ED;</a> <!-- 🇨🇭 -->
    <a class="text-big" title="Surgery (Robotic Helpers)" href="https://standardbots.com/blog/surgical-robotics-companies">&#x1F468;&#x200D;&#x2695;&#xFE0F;</a> <!-- 👨‍⚕️ -->
    <a class="text-big" title="Life Saving Machines (e.g. Heart-Lung)" href="https://www.mordorintelligence.com/industry-reports/cardiopulmonary-bypass-equipment-market">&#x1F9EC;</a> <!-- 🧬 -->
    <a class="text-big" title="Diagnosis (X-Ray/MRI/CT-Scan Images)" href="https://topbusinesssoftware.com/categories/medical-imaging/">&#x1F321;&#xFE0F;</a> <!-- 🌡️ -->
    <a class="text-big" title="Pharmaceutical Manufactoring" href="https://www.pharmaceuticalonline.com/solution/pharmaceutical-software">&#x1F48A;</a> <!-- 💊 -->
    <br><br>
    So we, <strong>programmers</strong>, must understand what we are doing!
    </p></h4>
  </div>
</div>

<div id="tools" class="section flex-column">
  <div class="gallery flex-pos-ortogonal-center">
    <a href="tools/Computer"><img src="./res/images/thumbnails/emulator-simple.jpg"></img></a>
    <a href="tools/Computer-Full"><img src="./res/images/thumbnails/emulator-full.jpg"></img></a>
    <div class="link_style">
      <p class="introduction">
        <strong>Documentation:</strong>
        <a href="tools/Instructions">Instructions</a>
        <a href="tools/Suffixes">Suffixes</a>
        <a href="tools/Registers">Registers</a>
      </p>
    </div>
    <div><!-- second (empty) column next to the previous "Documentation" column --></div>
    <a href="tools/Characters"><img src="./res/images/thumbnails/numbers-characters.jpg"></img></a>
    <a href="tools/ExtendedASCII"><img src="./res/images/thumbnails/extended-ASCII.jpg"></img></a>
    <a href="tools/CodePoints"><img src="./res/images/thumbnails/codepoints.jpg"></img></a>
    <a href="tools/Text"><img src="./res/images/thumbnails/graphemes.jpg"></img></a>
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

