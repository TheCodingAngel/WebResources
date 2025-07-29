<?php
require '../common/php/utils.php';
?>
<!DOCTYPE html>

<html lang="en">

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Text</title>
  
  <link type="text/css" rel="stylesheet" href="scripts/_Common/base.css">
  <link type="text/css" rel="stylesheet" href="scripts/Text/text.css">

  <script type="text/javascript" defer src="scripts/_Common/utils_base.js"></script>
  <script type="text/javascript" defer src="scripts/_Common/popups.js"></script>
  
  <script type="text/javascript" defer src="scripts/Text/GraphemeSplitter.js"></script>
  
  <script type="text/javascript" defer src="scripts/Text/text.js"></script>
  <script type="text/javascript" defer src="scripts/Text/init_text.js"></script>
</head>

<body>

<main class="flex-column flex-stretch">

<noscript><h1><b>You need to enable JavaScript to use this page.</b></h1></noscript>

<?php Page::printTop(); ?>

<div id="pageHeader" class="page-header flex-row flex-stretch-ortogonal">
  <ul class="breadcrumb">
    <li><a href="/">Home</a></li>
    <li>»</li>
    <li><a href="">Tools</a></li>
    <li>»</li>
    <li><h1 class="title">Text</h1></li>
  </ul>
  <div class="flex-stretch-center-children">
  </div>
  <div class="toolbar-horizontal">
    <!--
    <a href="#" onclick="memory.saveToFile()">
      <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
        <title>Download Offline Copy</title>
        <path d="M64 0C28.7 0 0 28.7 0 64L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-288-128 0c-17.7 0-32-14.3-32-32L224 0 64 0zM256 0l0 128 128 0L256 0zM216 232l0 102.1 31-31c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-72 72c-9.4 9.4-24.6 9.4-33.9 0l-72-72c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l31 31L168 232c0-13.3 10.7-24 24-24s24 10.7 24 24z"/>
      </svg>
    </a>
    -->
    <a href="https://TheCodingAngel.org/tools/arch/Text.zip">
      <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <title>Download Offline Copy (Open Text.html)</title>
        <path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 242.7-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7 288 32zM64 352c-35.3 0-64 28.7-64 64l0 32c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-32c0-35.3-28.7-64-64-64l-101.5 0-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352 64 352zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/>
      </svg>
    </a>
  </div>
</div>




<div class="flex-row">



<div class="flex-column">



<div id="combiningSection" class="section-codepoint flex-column">
  <div id="combiningHeader" class="flex-row flex-stretch-ortogonal">
    <h3 class="section-header flex-stretch-center-children">Code Point Strings</h3>
    <button class="button flex-space-left" onclick="codePointData.showPlanePopup(this)">?</button>
  </div>

<label class="vertical-margins"><strong>Text:</strong></label>
<select id="languageList" class="data">
</select>

<div class="flex-row">
<label class="label flex-pos-ortogonal-center"><strong>Glyphs:</strong></label>
<select id="glyphs" class="data flex-pos-ortogonal-center">
    <option value="None">None</option>
    <option value="👨">👨 Man</option>
    <option value="👩">👩 Woman</option>
    <option value="❤">❤ Heavy Black Heart</option>
    <option value="👦">👦 Boy</option>
    <option value="👧">👧 Girl</option>
    <option value="🤷">🤷 Person Shrugging</option>
    <option value="👉">👉 Backhand Index Pointing Right</option>
    <option value="👋">👋 Waving Hand</option>
    <option disabled>________________________________</option>
    <!-- <option value="♀️">♀️ Female Sign</option> -->
    <option value="🇧">🇧 Regional indicator symbol</option>
    <option value="🇬">🇬 Regional indicator symbol</option>
    <option value="🇺">🇺 Regional indicator symbol</option>
    <option value="🇳">🇳 Regional indicator symbol</option>
    <option value="🇺🇳">🇺🇳 United Nations</option>
    <option disabled>________________________________</option>
    <option value="é">é Latin small e with acute</option>
    <option value="ñ">ñ Latin small n with tilde</option>
    <option value="ı">ı Latin small dotless i</option>
    <option value="بِ‌ه‌ا">بِ‌ه‌ا Non-joined letters</option>
    <option value="بِها">بِها Joined letters (Ligature)</option>
    <option value="﷽">﷽ Bismillah (1 Code Point)</option>
    <option value="꧂">꧂ Couple with Heart</option>
    <option value="𒄡">𒄡 Bìšeba (gud over gud lugal)</option>
    <option disabled>________________________________</option>
    <option value="👪">👪 Family: Man, Woman, Boy (1 Code Point)</option>
    <option value="👨‍👩‍👦">👨‍👩‍👦 Family: Man, Woman, Boy</option>
    <option value="💑">💑 Couple with Heart (1 Code Point)</option>
    <option value="👩‍❤‍👨">👩‍❤‍👨 Couple with Heart</option>
    <option value="👩🏼‍❤‍👨🏼">👩🏼‍❤‍👨🏼 Couple with Heart</option>
    <!-- <option value="🧎🏽‍♀️">🧎🏽‍♀️ Woman Kneeling: Medium Skin Tone</option> -->
</select>
<label class="label flex-pos-ortogonal-center"><strong>Modifiers</strong></label>
<select id="modifiers" class="data flex-pos-ortogonal-center">
    <option value="None">None</option>
    <option value="🏻">🏻 Light Skin Tone</option>
    <option value="🏼">🏼 Medium-Light Skin Tone</option>
    <option value="🏽">🏽 Medium Skin tone</option>
    <option value="🏾">🏾 Medium-Dark Skin Tone</option>
    <option value="🏿">🏿 Dark Skin Tone</option>
    <option disabled>_________________________</option>
    <option value="&zwj;">&zwj;&nbsp; Zero-Width Joiner</option>
    <option value="&zwnj;">&zwnj;&nbsp; Zero-Width Non-Joiner</option>
    <option value="&nbsp;">&nbsp; Non-breaking space</option>
    <option value="&#65039;">&#65039;&nbsp; Variation Selector - 16</option>
    <option disabled>_________________________</option>
    <option value="́">́ &nbsp; Combining Acute Accent (→)</option>
    <option value="̈">̈ &nbsp; Combining Diaeresis (→)</option>
    <option value="̧">̧ &nbsp; Combining Cedilla (→)</option>
    <option value="̃">̃ &nbsp; Combining Tilde (←)</option>
    <option value="̇">̇ &nbsp; Combining Dot Above (←)</option>
    <option value="̣">̣ &nbsp; Combining Dot Below (←)</option>
</select>
<button class="button flex-pos-ortogonal-center" onclick="textApi.addGlyphs()">Add</button>
</div>

<!--label class="vertical-margins">Edit Selected Text:</label-->
<textarea id="textField" class="data-big flex-stretch" rows="4" cols="38"></textarea>

</div>



</div>




<div id="codePointSection" class="section-codepoint flex-column flex-stretch-ortogonal">
  <div id="codePointHeader" class="flex-row flex-stretch-ortogonal">
    <div class="flex-column flex-stretch-ortogonal">
      <h3 id="planeTitle" class="section-header flex-stretch-center-children">Code Points [Code Units], Hex</h3>
      <div class="flex-row">
        <div class="flex-row">
          <input type="radio" id="encUtf8">
          <label for="encUtf8">UTF-8</label>
        </div>
        <div class="flex-row">
          <input type="radio" id="encUtf16Le">
          <label for="encUtf16Le">UTF-16 LE</label>
        </div>
        <div class="flex-row">
          <input type="radio" id="encUtf16Be">
          <label for="encUtf16Be">UTF-16 BE</label>
        </div>
      </div>
    </div>
    <button class="button flex-space-left" title="Encoding Details" onclick="codePointData.showPlanePopup(this)">?</button>
  </div>
  
  <div id="codePointPanel" class="codepoint-panel-tree flex-column flex-stretch">
    <ul id="codePointTree" class="tree">
    </ul>
  </div>
</div>



</div>




<?php Page::printBottom(); ?>

</main>

</body>
</html>
