<?php
require '../common/php/utils.php';
$page = new Page('..');
?>
<!DOCTYPE html>

<html lang="en">

<head>
  <meta charset="UTF-8">
  <title>Code Points</title>
  
  <?php $page->printFavIcon('favicon.ico'); ?>

  <!-- Full list of Noto Fonts: https://notofonts.github.io/noto-docs/specimen/
  <link rel='stylesheet' href='https://fonts.googleapis.com/css?family=Noto Color Emoji'>
  <link rel='stylesheet' href='https://fonts.googleapis.com/css?family=Noto Music'>
  <link rel='stylesheet' href='https://fonts.googleapis.com/css?family=Noto Sans'>
  <link rel='stylesheet' href='https://fonts.googleapis.com/css?family=Noto%20Sans%20Lepcha'>
  -->

  <?php $page->printCommonCss('base.css'); ?>
  <?php $page->printFontsCss(); ?>
  
  <link type="text/css" rel="stylesheet" href="scripts/Text/text.css">
  <?php $page->printCommonCss('style.css'); ?>
  <?php $page->printCommonCss('responsive.css'); ?>
  
  <script type="text/javascript" defer src="scripts/_Common/utils_base.js"></script>
  <script type="text/javascript" defer src="scripts/_Common/popups.js"></script>
  
  <script type="text/javascript" defer src="scripts/Text/utils.js"></script>
  <script type="text/javascript" defer src="scripts/Text/blocks.js"></script>
  
  <script type="text/javascript" defer src="scripts/Text/Unicode.js"></script>
  <script type="text/javascript" defer src="scripts/Text/UnicodeBlocks.js"></script>
  <script type="text/javascript" defer src="scripts/Text/UnicodeGeneralCategories.js"></script>
  <script type="text/javascript" defer src="scripts/Text/CodePointParser.js"></script>
  <script type="text/javascript" defer src="scripts/Text/BlocksParser.js"></script>
  
  <script type="text/javascript" defer src="scripts/Text/codepoint.js"></script>
  <script type="text/javascript" defer src="scripts/Text/encoding.js"></script>
  <script type="text/javascript" defer src="scripts/Text/characters.js"></script>
  <script type="text/javascript" defer src="scripts/Text/init_characters.js"></script>
</head>

<body class="codepoint_page">

<div class="preloader">
  <div></div>
  <div></div>
  <div></div>
</div>

<main class="flex-column flex-stretch">

<noscript><h1><b>You need to enable JavaScript to use this page.</b></h1></noscript>

<?php $page->printTop(); ?>

<div id="pageHeader" class="page-header flex-row flex-stretch-ortogonal navdirection">
  <div class="containertop">
    <ul class="breadcrumb link_style">
      <li><a href="/">Home</a></li>
      <li>»</li>
      <li><a href="">Tools</a></li>
      <li>»</li>
      <li><h1 class="title character_main_title">Code Points</h1></li>
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
      <a href="https://TheCodingAngel.org/tools/arch/CodePoints.zip">
        <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <title>Download Offline Copy (Open CodePoints.html)</title>
          <path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 242.7-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7 288 32zM64 352c-35.3 0-64 28.7-64 64l0 32c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-32c0-35.3-28.7-64-64-64l-101.5 0-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352 64 352zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/>
        </svg>
      </a>
    </div>
  </div>
</div>



<select id="popupComboBin" class="popup data">
    <option value="0">0</option>
    <option value="1">1</option>
</select>

<select id="popupComboHex" class="popup data">
    <option value="0">0</option>
    <option value="1">1</option>
    <option value="2">2</option>
    <option value="3">3</option>
    <option value="4">4</option>
    <option value="5">5</option>
    <option value="6">6</option>
    <option value="7">7</option>
    <option value="8">8</option>
    <option value="9">9</option>
    <option value="A">A</option>
    <option value="B">B</option>
    <option value="C">C</option>
    <option value="D">D</option>
    <option value="E">E</option>
    <option value="F">F</option>
</select>

<div id="popupBlock" class="popup section-codepoint flex-column popup_dialog rs_width">
  <div id="blockCharactersHeader" class="flex-row flex-stretch-ortogonal">
    <button class="button flex-pos-ortogonal-end "
      onpointerdown="codePointData.viewPrevBlockStart(event)"
      onpointerup="codePointData.viewPrevBlockStop(event)">Prev Block</button>
    
    <h3 id="blockTitle" class="section-header flex-stretch-center-children">Block</h3>
    
    <button class="button flex-pos-ortogonal-end flex-space-left"
      onpointerdown="codePointData.viewNextBlockStart(event)"
      onpointerup="codePointData.viewNextBlockStop(event)">Next Block</button>
    <button class="button" title="Close" onclick="codePointData.closePopup()">ˣ</button>
  </div>
  <div id="blockCharactersPanel" class="codepoint-panel flex-shrink">
    <table id="blockCharacters" class="data clear-table">
      <thead>
        <tr>
          <th class="table-header" role="columnheader" scope="column">U+</th>
          <th class="table-header" role="columnheader" scope="column">0</th>
          <th class="table-header" role="columnheader" scope="column">1</th>
          <th class="table-header" role="columnheader" scope="column">2</th>
          <th class="table-header" role="columnheader" scope="column">3</th>
          <th class="table-header" role="columnheader" scope="column">4</th>
          <th class="table-header" role="columnheader" scope="column">5</th>
          <th class="table-header" role="columnheader" scope="column">6</th>
          <th class="table-header" role="columnheader" scope="column">7</th>
          <th class="table-header" role="columnheader" scope="column">8</th>
          <th class="table-header" role="columnheader" scope="column">9</th>
          <th class="table-header" role="columnheader" scope="column">A</th>
          <th class="table-header" role="columnheader" scope="column">B</th>
          <th class="table-header" role="columnheader" scope="column">C</th>
          <th class="table-header" role="columnheader" scope="column">D</th>
          <th class="table-header" role="columnheader" scope="column">E</th>
          <th class="table-header" role="columnheader" scope="column">F</th>
        </tr>
      </thead>
      <tbody id="blockCharactersData">
      </tbody>
    </table>
  </div>
</div>

<div id="popupCodePoints" class="popup section-codepoint flex-column popup_dialog">
  <div id="codePointsHeader" class="flex-row flex-stretch-ortogonal">
    <h3 id="codePointsTitle" class="section-header flex-stretch-center-children">Code Points</h3>
    <button class="button flex-space-left" title="Close" onclick="codePointData.closePopup()">ˣ</button>
  </div>
  <div id="codePointsPanel" class="codepoint-panel flex-shrink">
    <p>Unicode uses 21 bits but the maximum allowed value is smaller than
       <b>1F</b>FFFF<sub>16</sub> - it is <b>10</b>FFFF<sub>16</sub>.
       Designation is "U+" followed by hexadecimal value using at least 4 digits (so U+0041 instead of U+41).
    </p>
    <br>
    <p>A little more than 10% of all <b>1&nbsp;114&nbsp;112</b> possible values are assigned to characters
      or are used for internal, private or encoding functionality.
    </p>
    <br>
    <p>The entire range <b>0000<sub>16</sub>&nbsp;-&nbsp;10FFFF<sub>16</sub> (0&nbsp;-&nbsp;1&nbsp;114&nbsp;111)</b>
      <br>is split into 17 <b>planes</b>,
      <br>each containing <b>10000<sub>16</sub> (65&nbsp;536)</b>
      different values (or Code Points).
    </p>
    <br>
    <p>Code points are logically groupped into <b>blocks</b> with different sizes.
      One block is for a separate writing system or for math / musical and other types of symbols.
      With time blocks with extensions and supplements for previous blocks were added.
    </p>
    <br>
    <p>Code Point Blocks are defined in the
      <a href="https://unicode-org.github.io/icu/design/props/ppucd">Unicode Character Database</a> from
      <a href="https://raw.githubusercontent.com/unicode-org/icu/master/icu4c/source/data/unidata/ppucd.txt">here</a>.
      For this page a
      <a href="data/ppucd.txt">local copy</a> is used by converting the blocks inside it
      <a href="scripts/Text/UnicodeBlocks.js">to JavaScript</a>.
      <br>
      <button class="button" onclick="characters.saveBlocks()">Convert to JavaScript a "ucd.txt" file from your computer</button>
    </p>
  </div>
</div>

<div id="popupCharacterInfo" class="popup section-codepoint flex-column popup_dialog encodingpopup">
  <div id="characterInfoHeader" class="flex-row flex-stretch-ortogonal">
    <h3 id="characterInfoTitle" class="section-header flex-stretch-center-children">Encoding a Code Point into Code Units</h3>
    <button class="button flex-space-left" title="Close" onclick="characters.closePopup()">ˣ</button>
  </div>
  <div id="characterInfoPanel" class="codepoint-panel flex-shrink">
    <div class="codepoint_endcode flex-column">
      <div class="codepage_btn">
        <div class="prev_codebtn">
          <button class="button button_style" onclick="codeUnits.prevSpecial(event)">《</button>
          <button class="button button_style"
            onpointerdown="codeUnits.prevCharacterStart(event)"
            onpointerup="codeUnits.prevCharacterStop(event)">❰ Prev</button>
        </div>
        <div class="center_btn">
          <a id="characterInfoPreview" class="info-inactive"></a>
          <a id="characterInfoCode" class="info-inactive"></a>
        </div>
        <div class="right_btn">
          <button class="button button_style"
            onpointerdown="codeUnits.nextCharacterStart(event)"
            onpointerup="codeUnits.nextCharacterStop(event)">Next ❱</button>
          <button class="button button_style" onclick="codeUnits.nextSpecial(event)">》</button>
        </div>
      </div>
    </div>
    <p>Some bits are <a class="info-static">static</a> (hard-coded by the standard)
      and some are <a class="info-ignore">ignored</a> while the <a class="info-active">selected</a> bits
      may be <a class="info-modified">calculated</a> or
      <a class="info-active">directly copied</a> into the Code Units.
    </p>
    <div class="b_area">
      <label>UTF-8 - Encoding in bytes</label>
      <label>(Code Unit size is 8 bits):</label>
      <p class="bit_group">
        <button class="button button_style" onclick="codeUnits.prevBits(event, 'utf8')">❰ Bits</button>
        <span id="characterInfoUtf8Code">
        </span>
        <button class="button button_style" onclick="codeUnits.nextBits(event, 'utf8')">Bits ❱</button>
      </p>
      <p class="center_utf">
        <span id="characterInfoUtf8">
        </span>
        =
        <span id="characterInfoUtf8Bytes">
        </span>
      </p>
    </div>
    <div class="b_area">
      <label>UTF-16 - Encoding in byte pairs</label>
      <label>(Code Unit size is 16 bits or 2 bytes):</label>
      <p class="bit_group">
        <button class="button button_style" onclick="codeUnits.prevBits(event, 'utf16')">❰ Bits</button>
        <span id="characterInfoUtf16Code">
        </span>
        <button class="button button_style" onclick="codeUnits.nextBits(event, 'utf16')">Bits ❱</button>
      </p>
      <div class="suggest_option">
        <a id="characterInfoUtf16Operation" class="info-modified">-1</a>
      </div>
      <p class="center_utf b-zero">
        <span id="characterInfoUtf16">
        </span>
        =
        <span title="Big Endian" id="characterInfoUtf16BE">
        </span>
        /
        <span title="Little Endian" id="characterInfoUtf16LE">
        </span>
      </p>
      <p>The Code Units are always taken from left to right (Endianness affects only the order of the 2 bytes of each separate UTF-16 Code Unit).
      </p>
      <p>Hovering the UTF-16 Code Units shows whether the hexadecimal number is in Big or Little Endian.
      </p>
    </div>
  </div>
</div>

<div id="popupCategories" class="popup section-codepoint flex-column popup_dialog">
  <div id="categoriesHeader" class="flex-row flex-stretch-ortogonal">
    <h3 id="categoriesTitle" class="section-header flex-stretch-center-children">Character categories</h3>
    <button class="button flex-space-left" title="Close" onclick="characters.closePopup()">ˣ</button>
  </div>
  <div id="categoriesPanel" class="codepoint-panel flex-shrink">
    <p><a href="https://www.unicode.org/notes/tn36/">Character categories</a>
      are just one type of metadata for Code Points.
      Here an incomplete database (of about 24 000 characters) is used.
    </p>
    <br>
    <p>
      The original of the database can be downloaded <a href="https://www.unicode.org/notes/tn36/Categories.txt">as a text file</a>.
      <br>
      This page uses a <a href="data/categories.txt">local copy</a> of that text file by converting it
      <a href="scripts/Text/Unicode.js">to JavaScript</a>.
      <br>
      <button class="button" onclick="characters.saveCategories()">Convert to JavaScript a "categories.txt" file from your computer</button>
    </p>
    <br>
    <p>Searching supports both characters (π) and Code Points (U+03C0).<br>
       Code Point ranges are also supported - example: U+009C-03CE.<br>
       Searching for empty string gives all characters in the database.
    </p>
  </div>
</div>



<div class="flex-column codepoint_section">


<div id="valueSection" class="section-codepoint flex-column codepoint_area">
  <div id="valueHeader" class="flex-row flex-stretch-ortogonal">
    <h3 class="section-header flex-pos-ortogonal-center">Code Points are represented by 21-bit numbers:</h3>
    <button class="button flex-space-left" onclick="codePointData.showCodePointsPopup(this)">?</button>
  </div>
  
  <div class="flex-row">
    <select id="planes" class="data flex-pos-ortogonal-center select_option">
      <option value="00000">0000–​FFFF Basic Multilingual Plane</option>
      <option value="10000">10000–​1FFFF Supplementary Multilingual Plane</option>
      <option value="20000">20000–​2FFFF Supplementary Ideographic Plane</option>
      <option value="30000">30000–​3FFFF Tertiary Ideographic Plane</option>
      <option value="40000">40000–​4FFFF unassigned</option>
      <option value="50000">50000–​5FFFF unassigned</option>
      <option value="60000">60000–​6FFFF unassigned</option>
      <option value="70000">70000–​7FFFF unassigned</option>
      <option value="80000">80000–​8FFFF unassigned</option>
      <option value="90000">90000–​9FFFF unassigned</option>
      <option value="A0000">A0000–​AFFFF unassigned</option>
      <option value="B0000">B0000–​BFFFF unassigned</option>
      <option value="C0000">C0000–​CFFFF unassigned</option>
      <option value="D0000">D0000–​DFFFF unassigned</option>
      <option value="E0000">E0000–​EFFFF Supplementary Special-purpose Plane</option>
      <option value="F0000">F0000–​FFFFF Supplementary Private Use Area plane A</option>
      <option value="100000">100000–​10FFFF Supplementary Private Use Area plane B</option>
    </select>
    <div class="flex-row">
      <label for="showBlock" class="label flex-pos-ortogonal-center">Block:</label>
      <button id="showBlock" class="button button_style" onclick="codePointData.showBlockPopup(this)">Block</button>
    </div>
  </div>
  
  <div id="codePointPanel" class="codepoint-panel-table flex-shrink numbers_table">
    <table id="codePoint" class="data clear-table">
      <thead>
        <tr>
          <th class="table-header" role="columnheader" scope="column">bits</th>
          <th class="table-header" role="columnheader" scope="column">20</th>
          <th class="table-header" role="columnheader" scope="column">19</th>
          <th class="table-header" role="columnheader" scope="column">18</th>
          <th class="table-header" role="columnheader" scope="column">17</th>
          <th class="table-header" role="columnheader" scope="column">16</th>
          <th class="table-header" role="columnheader" scope="column">15</th>
          <th class="table-header" role="columnheader" scope="column">14</th>
          <th class="table-header" role="columnheader" scope="column">13</th>
          <th class="table-header" role="columnheader" scope="column">12</th>
          <th class="table-header" role="columnheader" scope="column">11</th>
          <th class="table-header" role="columnheader" scope="column">10</th>
          <th class="table-header" role="columnheader" scope="column">9</th>
          <th class="table-header" role="columnheader" scope="column">8</th>
          <th class="table-header" role="columnheader" scope="column">7</th>
          <th class="table-header" role="columnheader" scope="column">6</th>
          <th class="table-header" role="columnheader" scope="column">5</th>
          <th class="table-header" role="columnheader" scope="column">4</th>
          <th class="table-header" role="columnheader" scope="column">3</th>
          <th class="table-header" role="columnheader" scope="column">2</th>
          <th class="table-header" role="columnheader" scope="column">1</th>
          <th class="table-header" role="columnheader" scope="column">0</th>
        </tr>
      </thead>
      <tbody id="codePointData">
        <tr id="row0">
          <td id="rhBin" class="digit-indexes"></td>
          <td id="cub20" class="digit-cell">0</td>
          <td id="cub19" class="digit-cell">0</td>
          <td id="cub18" class="digit-cell">0</td>
          <td id="cub17" class="digit-cell">0</td>
          <td id="cub16" class="digit-cell">0</td>
          <td id="cub15" class="digit-cell">0</td>
          <td id="cub14" class="digit-cell">0</td>
          <td id="cub13" class="digit-cell">0</td>
          <td id="cub12" class="digit-cell">0</td>
          <td id="cub11" class="digit-cell">0</td>
          <td id="cub10" class="digit-cell">0</td>
          <td id="cub9" class="digit-cell">0</td>
          <td id="cub8" class="digit-cell">0</td>
          <td id="cub7" class="digit-cell">0</td>
          <td id="cub6" class="digit-cell">0</td>
          <td id="cub5" class="digit-cell">0</td>
          <td id="cub4" class="digit-cell">0</td>
          <td id="cub3" class="digit-cell">0</td>
          <td id="cub2" class="digit-cell">0</td>
          <td id="cub1" class="digit-cell">0</td>
          <td id="cub0" class="digit-cell">0</td>
        </tr>
        <tr id="row1">
          <td id="rhHex" class="digit-indexes">U+</td>
          <td id="cuh5" class="digit-cell">0</td>
          <td class="digit-cell"></td>
          <td class="digit-cell"></td>
          <td class="digit-cell"></td>
          <td id="cuh4" class="digit-cell">0</td>
          <td class="digit-cell"></td>
          <td class="digit-cell"></td>
          <td class="digit-cell"></td>
          <td id="cuh3" class="digit-cell">0</td>
          <td class="digit-cell"></td>
          <td class="digit-cell"></td>
          <td class="digit-cell"></td>
          <td id="cuh2" class="digit-cell">0</td>
          <td class="digit-cell"></td>
          <td class="digit-cell"></td>
          <td class="digit-cell"></td>
          <td id="cuh1" class="digit-cell">0</td>
          <td class="digit-cell"></td>
          <td class="digit-cell"></td>
          <td class="digit-cell"></td>
          <td id="cuh0" class="digit-cell">0</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="flex-row flex-stretch-ortogonal numbers_allbtn">
    <div class="left_btns">
      <button class="button button_style flex-pos-ortogonal-end"
        onpointerdown="codePointData.prevPlaneStart(event)"
        onpointerup="codePointData.prevPlaneStop(event)">《 Plane</button>
      <button class="button button_style flex-pos-ortogonal-end"
        onpointerdown="codePointData.prevSpecialStart(event)"
        onpointerup="codePointData.prevSpecialStop(event)">❰ Special</button>
      <button class="button button_style flex-pos-ortogonal-end"
        onpointerdown="codePointData.prevBlockStart(event)"
        onpointerup="codePointData.prevBlockStop(event)">❮ Block</button>
      <button class="button button_style flex-pos-ortogonal-end"
        onpointerdown="codePointData.decrementStart(event)"
        onpointerup="codePointData.decrementStop(event)">-</button>
    </div>
    <div class="flex-column flex-stretch-parallel middle_range_sarea">
      <div class="flex-row flex-stretch-ortogonal input_number">
        <input id="textCodePoint" type="text" class="flex-stretch-parallel" readonly>
        <input id="numeditCodePoint" type="number" class="flex-stretch-parallel" value="0"
          oninput="codePointData.setValue(parseInt(this.value))"
          onchange="codePointData.setValue(parseInt(this.value), true)">
      </div>
      <input id="sliderCodePoint" type="range" class="flex-stretch-ortogonal" value="0"
        oninput="codePointData.setValue(parseInt(this.value))"
        onchange="codePointData.setValue(parseInt(this.value))">
    </div>
    <div class="right_btns">
      <button class="button button_style flex-pos-ortogonal-end"
        onpointerdown="codePointData.incrementStart(event)"
        onpointerup="codePointData.incrementStop(event)">+</button>
      <button class="button button_style flex-pos-ortogonal-end"
        onpointerdown="codePointData.nextBlockStart(event)"
        onpointerup="codePointData.nextBlockStop(event)">Block ❯</button>
      <button class="button button_style flex-pos-ortogonal-end"
        onpointerdown="codePointData.nextSpecialStart(event)"
        onpointerup="codePointData.nextSpecialStop(event)">Special ❱</button>
      <button class="button button_style flex-pos-ortogonal-end"
        onpointerdown="codePointData.nextPlaneStart(event)"
        onpointerup="codePointData.nextPlaneStop(event)">Plane 》</button>
    </div>
  </div>

</div>




<div class="flex-row codepoint_middleblock">

<div id="codePointSection" class="section-codepoint flex-column codepoint_inside">
  <div id="codePointHeader" class="flex-row flex-stretch-ortogonal">
    <h3 id="charDescription" class="section-header flex-pos-ortogonal-center">Code Point</h3>
    <button class="button flex-space-left" onclick="characters.showCharacterInfoPopup(this)">?</button>
  </div>
  <div class="flex-row middle_inside">
  <div class="flex-column flex-stretch-ortogonal middle_table">
    <label id="charName" class="character-name character_title">Name</label>
    <table id="encoding" class="data clear-table encoding-table flex-space-top">
      <thead>
        <tr>
          <th class="table-header" role="columnheader" scope="column">Code Units, Hex</th>
          <th class="table-header" role="columnheader" scope="column">0</th>
          <th class="table-header" role="columnheader" scope="column">1</th>
          <th class="table-header" role="columnheader" scope="column">2</th>
          <th class="table-header" role="columnheader" scope="column">3</th>
        </tr>
      </thead>
      <tbody id="encodedData">
        <tr id="utf8">
          <td id="rhBin" class="byte-indexes" title="8-bit Code Units">UTF-8</td>
          <td id="u8b0" class="byte-cell">00</td>
          <td id="u8b1" class="byte-cell">-</td>
          <td id="u8b2" class="byte-cell">-</td>
          <td id="u8b3" class="byte-cell">-</td>
        </tr>
        <tr id="utf16le">
          <td id="rhBin" class="byte-indexes" title="16-bit Code Units, Little Endian">UTF-16LE</td>
          <td id="u16lb0" class="byte-cell">0000</td>
          <td id="u16lb1" class="byte-cell">-</td>
          <td id="u16lb2" class="byte-cell">-</td>
          <td id="u16lb3" class="byte-cell">-</td>
        </tr>
        <tr id="utf16be">
          <td id="rhBin" class="byte-indexes" title="16-bit Code Units, Big Endian">UTF-16BE</td>
          <td id="u16bb0" class="byte-cell">0000</td>
          <td id="u16bb1" class="byte-cell">-</td>
          <td id="u16bb2" class="byte-cell">-</td>
          <td id="u16bb3" class="byte-cell">-</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="flex-column middle_textarea">
    <textarea id="characterPreview" readonly class="data-big" rows="2" cols="8"></textarea>
    <a id="linkDetails" href=""></a>
  </div>
  <div class="flex-column flex-stretch-ortogonal middle_items">
    <ul id="categories" class="bullet-root items_m">
      <li id="cat_0" class="bullet-no"></li>
        <ul class="bullet-offset">
          <li id="cat_1" class="bullet-no"></li>
          <ul class="bullet-offset">
            <li id="cat_2" class="bullet-no"></li>
            <ul class="bullet-offset">
                <li id="cat_3" class="bullet-no"></li>
            </ul>
          </ul>
        </ul>
    </ul>
    <button id="applyCategories" class="button button_style flex-space-top" onclick="characters.applyCategories()">Apply Categories</button>
  </div>
  </div>
</div>

</div>




<div id="metadataSection" class="section-codepoint flex-column codepoint_area flex_height">
  <div id="metadataHeader" class="flex-row flex-stretch-ortogonal">
    <h3 class="section-header flex-pos-ortogonal-center">Character Categories (Code Point Metadata):</h3>
    <button class="button flex-space-left" onclick="characters.showCategoriesPopup(this)">?</button>
  </div>
  
  <div class="flex-row metadata_serch">
    <input type="text" id="textSearch">
    <button id="searchCodePoints" class="button button_style flex-pos-ortogonal-center" onclick="characters.searchCharacter()">Search</button>
  </div>


  <div class="flex-row catagory_select">
    <label class="label flex-pos-ortogonal-center">Category:</label>
    <select id="category_0" class="category-filter data flex-pos-ortogonal-center">
    </select>
    <select id="category_1" class="category-filter data flex-pos-ortogonal-center">
    </select>
    <select id="category_2" class="category-filter data flex-pos-ortogonal-center">
    </select>
    <select id="category_3" class="category-filter data flex-pos-ortogonal-center">
    </select>
    <button class="button button_style flex-pos-ortogonal-center" onclick="characters.getCharactersByCategory()">Get</button>
  </div>

  <div class="flex-row category_list">
    <select id="characterList" size="12" class="data resizeable scroll-horizontal">
    </select>
  </div>

</div>

</div>






<?php $page->printBottom(); ?>

</main>

<script>
<?php $page->printPreloaderScript(); ?>

<?php $page->printHamburgerMenuScript(); ?>
</script>

</body>

</html>
