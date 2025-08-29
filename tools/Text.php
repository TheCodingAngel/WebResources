<?php
require '../common/php/utils.php';
?>
<!DOCTYPE html>

<html lang="en">

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Text</title>
  <?php Page::printFavIcon("favicon.ico"); ?>


  <link type="text/css" rel="stylesheet" href="scripts/_Common/base.css">
  <?php Page::printFontsCss(); ?>
  
  <link type="text/css" rel="stylesheet" href="scripts/Text/text.css">
  <link type="text/css" rel="stylesheet" href="scripts/_Common/style.css" />
  <link type="text/css" rel="stylesheet" href="scripts/_Common/responsive.css" />

  <script type="text/javascript" defer src="scripts/_Common/utils_base.js"></script>
  <script type="text/javascript" defer src="scripts/_Common/popups.js"></script>
  
  <script type="text/javascript" defer src="scripts/Text/GraphemeSplitter.js"></script>
  
  <script type="text/javascript" defer src="scripts/Text/text.js"></script>
  <script type="text/javascript" defer src="scripts/Text/init_text.js"></script>
</head>

<body class="text_page">

<div class="preloader">
  <div></div>
  <div></div>
  <div></div>
</div>

<main class="flex-column flex-stretch">

<noscript><h1><b>You need to enable JavaScript to use this page.</b></h1></noscript>

<?php Page::printTop(); ?>

<div id="pageHeader" class="page-header flex-row flex-stretch-ortogonal navdirection">
  <div class="containertop">
    <ul class="charecter_breadcrumb breadcrumb link_style">
      <li><a href="/">Home</a></li>
      <li>»</li>
      <li><a href="">Tools</a></li>
      <li>»</li>
      <li><h1 class="title character_main_title">Text</h1></li>
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
</div>



<div class="text_section">

<div id="popupStrings" class="popup section-codepoint flex-column popup_dialog">
  <div id="stringsHeader" class="flex-row flex-stretch-ortogonal">
    <h3 id="stringsTitle" class="section-header flex-stretch-center-children">Unicode Strings</h3>
    <button class="button button_style flex-space-left" title="Close" onclick="textApi.closePopup()">ˣ</button>
  </div>
  <div id="stringsPanel" class="codepoint-panel flex-shrink">
    <p>Note that "glyph" and "character" have one meaning for Unicode and another for writing systems.
    </p>
    <p>Text can have <a href="https://www.omniglot.com/writing/direction.htm">different orientation and directions</a>.
    </p>
    <p>Diacritics and other modifying or combining marks can be piled to form invalid
       <a href="https://en.wikipedia.org/wiki/Zalgo_text">Zalgo</a> text.
    </p>
    <p>In a similar way glyphs can form grapheme clusters.
       There are "joiner" and "non-joiner" modifiers used for forming and for breaking clusters.
    </p>
  </div>
</div>



<div id="popupCodePointTree" class="popup section-codepoint flex-column popup_dialog">
  <div id="codePointTreeHeader" class="flex-row flex-stretch-ortogonal">
    <h3 id="codePointTreeTitle" class="section-header flex-stretch-center-children">Code Points</h3>
    <button class="button button_style flex-space-left" title="Close" onclick="textApi.closePopup()">ˣ</button>
  </div>
  <div id="codePointTreePanel" class="codepoint-panel flex-shrink">
    <p>A text could be just a list of characters and corresponding <a href="CodePoints.php">Code Points</a>.
       However, diacritics and other modifiers could form clusters with their base letters.
    </p>
    <p>Each Code Point is encoded separately, which is why clusters have sub-elements -
       one for each code point in the cluster.
    </p>
    <p>Encoding schemes with Code Units bigger than one byte (such as UTF-16 and UTF-32) have to use
       <a href="https://www.unicode.org/versions/Unicode16.0.0/core-spec/chapter-2/#G27981">Byte Order Mark (BOM)</a>
       to distinguish Little from Big Endian.
       Note how the BOM values are treated as special
       <a href="https://www.unicode.org/versions/Unicode16.0.0/core-spec/chapter-23/#G19635">"non-character"</a>
       Code Points.
    </p>
    <p>UTF-8 also has a BOM but it's use is
       <a href="https://www.unicode.org/L2/L2021/21038-bom-guidance.pdf">subject of debates</a>.
       For HTML it is recommended to
       <a href="https://www.w3.org/International/questions/qa-byte-order-mark">not use BOM for UTF-8</a>.
    </p>
    <p>Note - valid Extended ASCII characters <a href="ExtendedASCII.php">may clash</a> with UTF-8 BOM
       (select the last "Default text" from the first combo box).
    </p>
  </div>
</div>



<div class="flex-row text_flex">



<div class="flex-column strings">



<div id="combiningSection" class="section-codepoint flex-column left_text">
  <div id="combiningHeader" class="flex-row flex-stretch-ortogonal">
    <h3 class="section-header flex-stretch-center-children">Text (Strings of Code Points)</h3>
    <button class="button button_style flex-space-left" onclick="textApi.showStringsPopup(this)">?</button>
  </div>

<select id="languageList" class="data text_data">
</select>

<div class="flex-row select_inside">
  <div class="select_item">
    <label class="label flex-pos-ortogonal-center"><strong>Glyphs:</strong></label>
    <select id="glyphs" class="data flex-pos-ortogonal-center select_text">
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
      <option value="꧂">꧂ Javanese Right Rerenggan</option>
      <option value="𒄡">𒄡 Bìšeba (gud over gud lugal)</option>
      <option disabled>________________________________</option>
      <option value="👪">👪 Family: Man, Woman, Boy (1 Code Point)</option>
      <option value="👨‍👩‍👦">👨‍👩‍👦 Family: Man, Woman, Boy</option>
      <option value="💑">💑 Couple with Heart (1 Code Point)</option>
      <option value="👩‍❤‍👨">👩‍❤‍👨 Couple with Heart</option>
      <option value="👩🏼‍❤‍👨🏼">👩🏼‍❤‍👨🏼 Couple with Heart (skin modifiers)</option>
      <!-- <option value="🧎🏽‍♀️">🧎🏽‍♀️ Woman Kneeling: Medium Skin Tone</option> -->
    </select>
  </div>
  <div class="select_item">
    <label class="label flex-pos-ortogonal-center"><strong>Modifiers</strong></label>
    <select id="modifiers" class="data flex-pos-ortogonal-center select_text">
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
  </div>
  <button class="button button_style flex-pos-ortogonal-center" onclick="textApi.addGlyphs()">Add</button>
</div>

<!--label class="vertical-margins">Edit Selected Text:</label-->
<textarea id="textField" class="data-big flex-stretch textarea_text" rows="4" cols="38"></textarea>

</div>



</div>




<div id="codePointSection" class="section-codepoint flex-column flex-stretch-ortogonal codepointhex">
  <div id="codePointHeader" class="flex-row flex-stretch-ortogonal">
    <div class="flex-column flex-stretch-ortogonal hex_pl">
      <h3 id="planeTitle" class="section-header flex-stretch-center-children">Code Points [Code Units, Hex]</h3>
      <div class="flex-row gap_hex">
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
    <button class="button button_style flex-space-left" title="Encoding Details" onclick="textApi.showCodePointsPopup(this)">?</button>
  </div>
  
  <div id="codePointPanel" class="codepoint-panel-tree flex-column flex-stretch">
    <ul id="codePointTree" class="tree">
    </ul>
  </div>
</div>



</div>



</div>




<?php Page::printBottom(); ?>

</main>

<script>
  window.addEventListener("load", function () {
    document.querySelector(".preloader").style.display = "none";
  });

  // submenu
  document.addEventListener("click", function (e) {
    const dropdown = document.querySelector(".dropdown_menu");
    // if click is outside dropdown
    if (dropdown && !e.target.closest(".dropdown_menu")) {
      dropdown.classList.remove("submenu");
    }
  });
  const hamburger = document.querySelector(".hamburger");
  const menu = document.querySelector(".menu-list");
  if (hamburger && menu) {
    hamburger.addEventListener("click", () => {
      menu.classList.toggle("show");
      hamburger.classList.toggle("showbar");
    });
  }
</script>

</body>
</html>
