<?php
require '../common/php/utils.php';
$page = new Page('..');
?>
<!DOCTYPE html>

<html lang="en">

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Extended ASCII</title>
  
  <?php $page->printFavIcon('favicon.ico'); ?>

  <?php $page->printCommonCss('base.css'); ?>
  <?php $page->printFontsCss(); ?>
  
  <link type="text/css" rel="stylesheet" href="scripts/Text/text.css">
  <?php $page->printCommonCss('style.css'); ?>
  <?php $page->printCommonCss('responsive.css'); ?>
  
  <script type="text/javascript" defer src="scripts/_Common/utils_base.js"></script>
  <script type="text/javascript" defer src="scripts/_Common/popups.js"></script>
  <script type="text/javascript" defer src="scripts/_Common/table.js"></script>
  <script type="text/javascript" defer src="scripts/_Common/sounds.js"></script>
  
  <script type="text/javascript" defer src="scripts/Text/utils.js"></script>
  <script type="text/javascript" defer src="scripts/Text/ExtendedAscii.js"></script>
</head>

<body class="extended_page">

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
    <ul class="breadcrumb_inside breadcrumb link_style">
      <li><a href="/">Home</a></li>
      <li>»</li>
      <li><a href="">Tools</a></li>
      <li>»</li>
      <li><h1 class="title breadcrumb_main_title">Extended ASCII</h1></li>
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
      <a href="https://TheCodingAngel.org/tools/arch/ExtendedASCII.zip">
        <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <title>Download Offline Copy (Open ExtendedASCII.html)</title>
          <path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 242.7-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7 288 32zM64 352c-35.3 0-64 28.7-64 64l0 32c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-32c0-35.3-28.7-64-64-64l-101.5 0-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352 64 352zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/>
        </svg>
      </a>
    </div>
  </div>
</div>



<input type="text" id="popupText" class="popup data" pattern="[0-9a-fA-F]+">



<div id="popupEncodeText" class="popup section-codepoint flex-column popup_dialog">
  <div id="encodeTextHeader" class="flex-row flex-stretch-ortogonal">
    <h3 id="encodeTextTitle" class="section-header flex-stretch-center-children">Extended ASCII has Code Pages</h3>
    <button class="button flex-space-left" title="Close" onclick="ascii.closePopup()">ˣ</button>
  </div>
  <div id="encodeTextPanel" class="codepoint-panel flex-shrink">
    <p>Each of the 128 numbers between 80<sub><b>16</b></sub> and FF<sub><b>16</b></sub> is matched
       to <strong>different characters</strong> depending on the <strong>code page</strong> -
       check out the <strong>following sections</strong>.
    </p>
    <p>If a character is not in a code page, it cannot be encoded
       (so its encoded value is <mark>??</mark> and the corresponding decoded character is <mark>☐</mark>).
    </p>
    <p>Each of the 128 numbers between 00<sub><b>16</b></sub> and 7F<sub><b>16</b></sub> is matched
       to <strong>one character</strong> in the original ASCII, so it is always the same after encoding and decoding:
    </p>
    <table id="asciiCharactersTable" class="characters clear-table">
      <thead>
        <tr>
          <th class="table-header" role="columnheader" scope="column">Hex</th>
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
      <tbody id="asciiCharactersData">
      </tbody>
    </table>
  </div>
</div>


<div id="popupCodePage" class="popup section-codepoint flex-column popup_dialog">
  <div id="codePageHeader" class="flex-row flex-stretch-ortogonal">
    <h3 id="codePageTitle" class="section-header flex-pos-ortogonal-center">Characters for page...</h3>
    <select id="comboCodePage" class="data flex-pos-ortogonal-center codepage_select">
    </select>
    <button class="button flex-space-left" title="Close" onclick="ascii.closePopup()">ˣ</button>
  </div>
  <div id="codePagePanel" class="codepoint-panel flex-shrink">
    <p>If a character is not in a code page, it cannot be encoded
       (so its encoded value is <mark>??</mark> and the corresponding decoded character is <mark>☐</mark>).
    </p>
    <table id="codePageCharacters" class="data clear-table">
      <thead>
        <tr>
          <th class="table-header" role="columnheader" scope="column">Hex</th>
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
      <tbody id="codePageCharactersData">
      </tbody>
    </table>
  </div>
</div>



<div id="content" class="flex-column extended_section">




<div id="textEncodeSection" class="section-codepoint flex-column flex-stretch-ortogonal text_encode_area">
  <div id="textEncodeHeader" class="flex-row flex-stretch-ortogonal extended_header">
    <h3 class="section-header flex-pos-ortogonal-center">Text to Encode:</h3>
    <label class="flex-pos-ortogonal-center flex-space-left mr_5">Default Text for:</label>
    <select id="comboDefaultText" class="data flex-pos-ortogonal-center select_title">
    </select>
    <button class="button button_style" onclick="ascii.showTextEncodePopup(this)">?</button>
  </div>
  <div id="textEncodePanel" class="flex-column flex-stretch-ortogonal disable-dbl-tap-zoom textarea_flex">
    <textarea id="textEncode" class="data-big flex-stretch-ortogonal textarea_inside" rows="3" cols="40"></textarea>
  </div>
</div>



<div class="flex-column flex-stretch-ortogonal">
  <label class="data-big flex-stretch-center-children arrow">⇊</label>
</div>



<div id="asciiCodesSection" class="section-codepoint flex-column bytes_area">
  <div id="asciiCodesHeader" class="flex-row flex-stretch-ortogonal extended_header">
    <h3 class="section-header flex-pos-ortogonal-center">Encoded Bytes (Hexadecimal values):</h3>
    <select id="comboEncodePage" class="data flex-pos-ortogonal-center flex-space-left select_title">
    </select>
    <button class="button button_style" onclick="ascii.showEncodePagePopup(this)">Show Code Page</button>
  </div>
  <div id="asciiCodesPanel" class="codepoint-panel-table flex-shrink disable-dbl-tap-zoom byte_table">
    <table id="asciiCodes" class="data clear-table disable-dbl-tap-zoom">
      <thead>
        <tr>
          <th class="table-header" role="columnheader" scope="column">Addr</th>
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
          <th class="table-header" role="columnheader" scope="column">10</th>
          <th class="table-header" role="columnheader" scope="column">11</th>
          <th class="table-header" role="columnheader" scope="column">12</th>
          <th class="table-header" role="columnheader" scope="column">13</th>
          <th class="table-header" role="columnheader" scope="column">14</th>
          <th class="table-header" role="columnheader" scope="column">15</th>
          <th class="table-header" role="columnheader" scope="column">16</th>
          <th class="table-header" role="columnheader" scope="column">17</th>
          <th class="table-header" role="columnheader" scope="column">18</th>
          <th class="table-header" role="columnheader" scope="column">19</th>
        </tr>
      </thead>
      <tbody id="asciiBytes" class="disable-dbl-tap-zoom">
      </tbody>
    </table>
  </div>
</div>



<div class="flex-column flex-stretch-ortogonal">
  <label class="data-big flex-stretch-center-children arrow">⇊</label>
</div>



<div id="textDecodeSection" class="section-codepoint flex-column flex-stretch-ortogonal decoded_area">
  <div id="textDecodeHeader" class="flex-row flex-stretch-ortogonal extended_header">
    <h3 class="section-header flex-pos-ortogonal-center">Decoded Text:</h3>
    <select id="comboDecodePage" class="data flex-pos-ortogonal-center flex-space-left select_title">
    </select>
    <button class="button button_style" onclick="ascii.showDecodePagePopup(this)">Show Code Page</button>
  </div>
  <div id="textDecodePanel" class="flex-column flex-stretch-ortogonal disable-dbl-tap-zoom textarea_flex">
    <textarea id="textDecode" class="data-big flex-stretch-ortogonal textarea_inside" readonly rows="3" cols="40"></textarea>
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
