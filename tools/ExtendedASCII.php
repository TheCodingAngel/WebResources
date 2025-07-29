<?php
require '../common/php/utils.php';
?>
<!DOCTYPE html>

<html lang="en">

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Extended ASCII</title>

  <link type="text/css" rel="stylesheet" href="scripts/_Common/base.css">
  <link type="text/css" rel="stylesheet" href="scripts/Text/text.css">
  
  <script type="text/javascript" defer src="scripts/_Common/utils_base.js"></script>
  <script type="text/javascript" defer src="scripts/_Common/popups.js"></script>
  <script type="text/javascript" defer src="scripts/_Common/table.js"></script>
  <script type="text/javascript" defer src="scripts/_Common/sounds.js"></script>
  
  <script type="text/javascript" defer src="scripts/Text/utils.js"></script>
  <script type="text/javascript" defer src="scripts/Text/ExtendedAscii.js"></script>
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
    <li><h1 class="title">Extended ASCII</h1></li>
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



<input type="text" id="popupText" class="popup data" pattern="[0-9a-fA-F]+">



<div id="popupCodePage" class="popup section-codepoint flex-column">
  <div id="codePageHeader" class="flex-row flex-stretch-ortogonal">
    <h3 id="codePageTitle" class="section-header flex-pos-ortogonal-center">Characters for page...</h3>
    <select id="comboCodePage" class="data flex-pos-ortogonal-center">
    </select>
    <button class="button flex-space-left" title="Close" onclick="ascii.closePopup()">ˣ</button>
  </div>
  <div id="codePagePanel" class="codepoint-panel flex-shrink">
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



<div id="content" class="flex-column">




<div id="textEncodeSection" class="section-codepoint flex-column flex-stretch-ortogonal">
  <div id="textEncodeHeader" class="flex-row flex-stretch-ortogonal">
    <h3 class="section-header flex-pos-ortogonal-center">Text to Encode:</h3>
    <label class="flex-pos-ortogonal-center flex-space-left">Default Text for:</label>
    <select id="comboDefaultText" class="data flex-pos-ortogonal-center">
    </select>
    <button class="button" onclick="codePointData.showPlanePopup(this)">?</button>
  </div>
  <div id="textEncodePanel" class="flex-column flex-stretch-ortogonal disable-dbl-tap-zoom">
    <textarea id="textEncode" class="data-big flex-stretch-ortogonal" rows="3" cols="40"></textarea>
  </div>
</div>



<div class="flex-column flex-stretch-ortogonal">
  <label class="data-big flex-stretch-center-children">⇊</label>
</div>



<div id="asciiCodesSection" class="section-codepoint flex-column">
  <div id="asciiCodesHeader" class="flex-row flex-stretch-ortogonal">
    <h3 class="section-header flex-pos-ortogonal-center">Encoded Bytes (Hexadecimal):</h3>
    <select id="comboEncodePage" class="data flex-pos-ortogonal-center flex-space-left">
    </select>
    <button class="button" onclick="ascii.showEncodePagePopup(this)">Show Code Page</button>
  </div>
  <div id="asciiCodesPanel" class="codepoint-panel-table flex-shrink disable-dbl-tap-zoom">
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
  <label class="data-big flex-stretch-center-children">⇊</label>
</div>



<div id="textDecodeSection" class="section-codepoint flex-column flex-stretch-ortogonal">
  <div id="textDecodeHeader" class="flex-row flex-stretch-ortogonal">
    <h3 class="section-header flex-pos-ortogonal-center">Decoded Text:</h3>
    <select id="comboDecodePage" class="data flex-pos-ortogonal-center flex-space-left">
    </select>
    <button class="button" onclick="ascii.showDecodePagePopup(this)">Show Code Page</button>
  </div>
  <div id="textDecodePanel" class="flex-column flex-stretch-ortogonal disable-dbl-tap-zoom">
    <textarea id="textDecode" class="data-big flex-stretch-ortogonal" readonly rows="3" cols="40"></textarea>
  </div>
</div>




</div>





<?php Page::printBottom(); ?>

</main>

</body>
</html>
