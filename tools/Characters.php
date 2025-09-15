<?php
require '../common/php/page.php';
$page = new Page('..');
?>
<!DOCTYPE html>

<html lang="en">

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <title>Numbers and Characters</title>
  
  <?php $page->printFavIcon('favicon.ico'); ?>

  <?php $page->printCommonCss('base.css'); ?>
  <?php $page->printFontsCss(); ?>
  
  <link type="text/css" rel="stylesheet" href="scripts/Characters/counters.css">
  <?php $page->printCommonCss('style.css'); ?>
  <?php $page->printCommonCss('responsive.css'); ?>
  
  <script type="text/javascript" defer src="scripts/_Common/utils_base.js"></script>
  <script type="text/javascript" defer src="scripts/_Common/popups.js"></script>
  <script type="text/javascript" defer src="scripts/_Common/table.js"></script>
  <script type="text/javascript" defer src="scripts/_Common/wizard_base.js"></script>

  <script type="text/javascript" defer src="scripts/Characters/wizard.js"></script>
  <script type="text/javascript" defer src="scripts/Characters/counter.js"></script>
  <script type="text/javascript" defer src="scripts/Characters/widget-base.js"></script>
  <script type="text/javascript" defer src="scripts/Characters/widgets.js"></script>
  <script type="text/javascript" defer src="scripts/Characters/separators.js"></script>
  <script type="text/javascript" defer src="scripts/Characters/init.js"></script>
</head>

<body class="character_page">

<div class="preloader">
  <div></div>
  <div></div>
  <div></div>
</div>
    
<div id="frameOverlay" class="frame-overlay"></div>

<main class="flex-column flex-stretch">

<noscript><h1><b>You need to enable JavaScript to use these counters.</b></h1></noscript>

<?php $page->printTop(); ?>

<div id="pageHeader" class="page-header flex-row flex-stretch-ortogonal navdirection">
  <div class="containertop">
    <ul class="charecter_breadcrumb breadcrumb link_style">
      <li><a href="/">Home</a></li>
      <li>»</li>
      <li><a href="">Tools</a></li>
      <li>»</li>
      <li>
        <h1 class="title character_main_title">
          Numbers and Characters
        </h1>
      </li>
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
      <a href="https://TheCodingAngel.org/tools/arch/Characters.zip">
        <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <title>Download Offline Copy (Open Characters.html)</title>
          <path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 242.7-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7 288 32zM64 352c-35.3 0-64 28.7-64 64l0 32c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-32c0-35.3-28.7-64-64-64l-101.5 0-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352 64 352zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/>
        </svg>
      </a>
    </div>
  </div>
</div>



<input type="text" id="popupText" class="popup data counter_grid_input" />



<div id="popupCharacters" class="popup section flex-column popup_dialog">
  <div id="charactersHeader" class="flex-row flex-stretch-ortogonal">
    <h3 id="charactersTitle" class="section-header flex-pos-ortogonal-center flex-stretch-center-children">Characters for page...</h3>
    <button class="button button_style flex-space-left" title="Close" onclick="counterOctHex.closePopup()">ˣ</button>
  </div>
  <div id="charactersPanel" class="section-panel flex-shrink">
    <table id="charactersTable" class="characters clear-table">
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
      <tbody id="charactersData">
      </tbody>
    </table>
  </div>
</div>


<div id="characterSection" class="character_section">

  <!-- Binary and Ternary counters -->
  <div id="hardwareSection" class="hardwarea_area section">
    <div id="hardwareHeader" class="hardwarea_title">
      <h3 class="section-header flex-pos-ortogonal-center">Hardware Levels (Voltage, Light, etc.) to Digits:</h3>
    </div>
    
    <div class="details_h">

      <div class="top_details">
        <div class="blockdetailes flex-row flex-pos-ortogonal-center">
          <button class="button button_style" onclick="counterTernary.start()">Start</button>
          <button class="button button_style" onclick="counterTernary.pause()">Pause</button>
          <button class="button button_style" onclick="counterTernary.reset()">Reset</button>
        </div>
        <div class="rangeblock blockdetailes flex-row flex-pos-ortogonal-center">
          <label for="btSpeedSlider">Slow</label>
          <input id="btSpeedSlider" class="range_inner" type="range" value="0.03" min="0.005" max="0.15" step="0.005"
            oninput="counterTernary.setSpeed(this.value)"
            onchange="counterTernary.setSpeed(this.value)">
          <label for="btSpeedSlider">Fast</label>
        </div>
      </div>
      
      <div class="hardware_names flex-row flex-pos-ortogonal-center">
        <div class="radio_names flex-column">
          <div class="all_names flex-row">
            <div class="radios flex-row">
              <input type="radio" id="btOnlyBinary" onchange="counterTernary.showBinary()">
              <label for="btOnlyBinary">Binary</label>
            </div>
            <div class="radios flex-row">
              <input type="radio" id="btOnlyTernary" onchange="counterTernary.showTernary()">
              <label for="btOnlyTernary">Ternary</label>
            </div>
            <div class="radios flex-row">
              <input type="radio" id="btBinaryTernary" onchange="counterTernary.showBoth()">
              <label for="btBinaryTernary">Both</label>
            </div>
          </div>
          <div class="digit_radios flex-row"><p>Digits:</p>
            <div class="radios">
              <input type="radio" id="btDigits_3" onchange="counterTernary.setDigits(3)"><label for="btDigits_3">3</label>
            </div>
            <div class="radios">
              <input type="radio" id="btDigits_4" onchange="counterTernary.setDigits(4)"><label for="btDigits_4">4</label>
            </div>
            <div class="radios">
              <input type="radio" id="btDigits_6" onchange="counterTernary.setDigits(6)"><label for="btDigits_6">6</label>
            </div>
            <div class="radios">
              <input type="radio" id="btDigits_8" onchange="counterTernary.setDigits(8)"><label for="btDigits_8">8</label>
            </div>
          </div>
        </div>
        <div class="checkbox_names flex-column">
          <div class="checkbox_style flex-row">
            <input type="checkbox" id="btUseVoltLevels" class="checkbox" onchange="counterTernary.setVoltLevels(!this.checked)">
            <label for="btUseVoltLevels">Convert levels to symbols</label>
          </div>
          <div class="checkbox_style flex-row">
            <input type="checkbox" id="btUseNegativeNumbers" class="checkbox" onchange="counterTernary.setAllowNegative(this.checked)">
            <label for="btUseNegativeNumbers">Use negative numbers</label>
          </div>
        </div>
      </div>

      <div class="counters_area counters-grid hardware_counter">
        <div id="btLabelBin" class="alignRightCenter">
          <label class="baseLabel">Binary:</label>
        </div>
        <div id="btRowBin" class="counterhead flex-row">
          <div id="btDivBin" class="counter-parent"><div class="counter-gradient"></div></div>
        </div>
        <div id="btDivBinOverflow" class="overflow">
          <svg width="12" height="12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <title>Overflow!</title>
            <path d="M290.4 19.8C295.4 7.8 307.1 0 320 0L480 0c17.7 0 32 14.3 32 32l0 160c0 12.9-7.8 24.6-19.8 29.6s-25.7 2.2-34.9-6.9L400 157.3 246.6 310.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L354.7 112 297.4 54.6c-9.2-9.2-11.9-22.9-6.9-34.9zM0 176c0-44.2 35.8-80 80-80l80 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-80 0c-8.8 0-16 7.2-16 16l0 256c0 8.8 7.2 16 16 16l256 0c8.8 0 16-7.2 16-16l0-80c0-17.7 14.3-32 32-32s32 14.3 32 32l0 80c0 44.2-35.8 80-80 80L80 512c-44.2 0-80-35.8-80-80L0 176z"/>
          </svg>
        </div>
        
        <div id="btLabelTer" class="flex-column alignRightCenter">
          <label id="btLabelTerUnbalanced" class="baseLabel alignRightCenter">Unbalanced Ternary:</label>
          <label id="btLabelTerBalanced" class="baseLabel alignRightCenter">Balanced Ternary:</label>
          <div id="btDivShortBalancedTernary" class="checkbox_style flex-row">
            <input type="checkbox" id="btShortBalancedTernary" class="checkbox" checked onchange="counterTernary.setShortSymbols(this.checked)">
            <label for="btShortBalancedTernary">short symbols</label>
          </div>
        </div>
        <div id="btRowTer" class="counterhead flex-row">
          <div id="btDivTer" class="counter-parent"><div class="counter-gradient"></div></div>
        </div>
        <div id="btDivTerOverflow" class="overflow">
          <svg width="12" height="12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <title>Overflow!</title>
            <path d="M290.4 19.8C295.4 7.8 307.1 0 320 0L480 0c17.7 0 32 14.3 32 32l0 160c0 12.9-7.8 24.6-19.8 29.6s-25.7 2.2-34.9-6.9L400 157.3 246.6 310.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L354.7 112 297.4 54.6c-9.2-9.2-11.9-22.9-6.9-34.9zM0 176c0-44.2 35.8-80 80-80l80 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-80 0c-8.8 0-16 7.2-16 16l0 256c0 8.8 7.2 16 16 16l256 0c8.8 0 16-7.2 16-16l0-80c0-17.7 14.3-32 32-32s32 14.3 32 32l0 80c0 44.2-35.8 80-80 80L80 512c-44.2 0-80-35.8-80-80L0 176z"/>
          </svg>
        </div>
        
        <div class="alignRightTop">
          <label for="btNumberInput">Decimal Value:</label>
        </div>
        <div class="flex-column">
          <div class="counter_input flex-row">
            <input id="btNumberInput" class="numinput" type="number" value="0"
              oninput="counterTernary.setValueNumEdit(this.value)">
          </div>
          <div class="counter_range flex-row">
            <label id="btMinValue" for="btValSlider" onclick="counterTernary.setMinValue()">Min</label>
            <input id="btValSlider" type="range" value="0" min="0" max="1023" step="0.1"
              title="This slider has a range determined by the counters but you can enter any number in the text box above."
              oninput="counterTernary.setValueSlider(this.value)"
              onchange="counterTernary.setValueSlider(this.value)">
            <label id="btMaxValue" for="btValSlider" onclick="counterTernary.setMaxValue()">Max</label>
          </div>
        </div>
        <div></div>
      </div>
    </div>
  </div>


  <!-- Octal / Hexadecimal counters -->
  <div id="wordSection" class="word_area section flex-column">
    <div id="wordHeader" class="charecter_title">
      <h3 class="section-header flex-pos-ortogonal-center">RCA-301's word - 2 characters, 12 binary digits (bits), Big Endian:</h3>
    </div>

    <div class="details_h">

      <div class="flex-column flex-pos-ortogonal-center">
        <div class="flex-row flex-pos-ortogonal-center blockdetailes">
          <button class="button button_style" onclick="counterOctHex.start()">Start</button>
          <button class="button button_style" onclick="counterOctHex.pause()">Pause</button>
          <button class="button button_style" onclick="counterOctHex.reset()">Reset</button>
        </div>
        <div class="flex-row flex-pos-ortogonal-center rangeblock blockdetailes">
          <label for="ohSpeedSlider">Slow</label>
          <input id="ohSpeedSlider" type="range" value="0.03" min="0.005" max="0.15" step="0.005"
            oninput="counterOctHex.setSpeed(this.value)"
            onchange="counterOctHex.setSpeed(this.value)">
          <label for="ohSpeedSlider">Fast</label>
        </div>
      </div>
      
      <div class="characters_radios hardware_names flex-row flex-pos-ortogonal-center">
        <div class="ch_radio flex-column">
          <div class="radios flex-row">
            <input type="radio" id="ohUseOctal" onchange="counterOctHex.showOct()">
            <label for="ohUseOctal">Octal</label>
          </div>
          <div class="radios flex-row">
            <input type="radio" id="ohUseHex" onchange="counterOctHex.showHex()">
            <label for="ohUseHex">Hexadecimal</label>
          </div>
          <div class="radios flex-row">
            <input type="radio" id="ohUseOctHex" onchange="counterOctHex.showOctHex()">
            <label for="ohUseOctHex">Both</label>
          </div>
        </div>
        <div class="ch_radio flex-column">
          <div class="radios flex-row">
            <input type="radio" id="ohUseCharRca" onchange="counterOctHex.showCharRca()">
            <label for="ohUseCharRca">RCA-301 Characters (6-bit)</label>
          </div>
          <div class="radios flex-row">
            <input type="radio" id="ohUseCharAscii" onchange="counterOctHex.showCharAscii()">
            <label for="ohUseCharAscii">ASCII Characters (7-bit)</label>
          </div>
          <div class="radios flex-row">
            <input type="radio" id="ohUseCharBoth" onchange="counterOctHex.showCharBoth()">
            <label for="ohUseCharBoth">Both</label>
          </div>
        </div>
        <div class="checkbox_names">
          <div class="checkbox_style flex-row">
            <input type="checkbox" id="ohUseNegativeNumbers" onchange="counterOctHex.setAllowNegative(this.checked)">
            <label for="ohUseNegativeNumbers">Use negative numbers</label>
          </div>
        </div>
      </div>

      <div class="counters_area counters-grid flex_mobile">
        <div id="ohLabelBin" class="alignRightCenter">
          <label class="baseLabel">Binary:</label>
        </div>
        <div id="ohRowBin" class="flex-row">
          <div id="ohDivBin" class="counter-parent">
            <div class="counter-gradient">
              <div class="separator"><div class="separator-marker"></div></div>
              <div class="separator"><div class="separator-marker"></div></div>
              <div class="separator"><div class="separator-marker"></div></div>
              <div class="separator"><div class="separator-marker"></div></div>
              <div class="separator"><div class="separator-marker"></div></div>
            </div>
          </div>
        </div>
        <div id="ohDivBinOverflow" class="overflow">
          <svg width="12" height="12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <title>Overflow!</title>
            <path d="M290.4 19.8C295.4 7.8 307.1 0 320 0L480 0c17.7 0 32 14.3 32 32l0 160c0 12.9-7.8 24.6-19.8 29.6s-25.7 2.2-34.9-6.9L400 157.3 246.6 310.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L354.7 112 297.4 54.6c-9.2-9.2-11.9-22.9-6.9-34.9zM0 176c0-44.2 35.8-80 80-80l80 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-80 0c-8.8 0-16 7.2-16 16l0 256c0 8.8 7.2 16 16 16l256 0c8.8 0 16-7.2 16-16l0-80c0-17.7 14.3-32 32-32s32 14.3 32 32l0 80c0 44.2-35.8 80-80 80L80 512c-44.2 0-80-35.8-80-80L0 176z"/>
          </svg>
        </div>
        
        <div id="ohLabelOct" class="alignRightCenter">
          <label class="baseLabel">Octal:</label>
        </div>
        <div id="ohRowOct" class="flex-row">
          <div id="ohDivOct" class="counter-parent">
            <div class="counter-gradient">
              <div class="separator"><div class="separator-marker"></div></div>
              <div class="separator"><div class="separator-marker"></div></div>
              <div class="separator"><div class="separator-marker"></div></div>
              <div class="separator"><div class="separator-marker"></div></div>
              <div class="separator"><div class="separator-marker"></div></div>
            </div>
          </div>
        </div>
        <div id="ohDivOctOverflow" class="overflow">
          <svg width="12" height="12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <title>Overflow!</title>
            <path d="M290.4 19.8C295.4 7.8 307.1 0 320 0L480 0c17.7 0 32 14.3 32 32l0 160c0 12.9-7.8 24.6-19.8 29.6s-25.7 2.2-34.9-6.9L400 157.3 246.6 310.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L354.7 112 297.4 54.6c-9.2-9.2-11.9-22.9-6.9-34.9zM0 176c0-44.2 35.8-80 80-80l80 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-80 0c-8.8 0-16 7.2-16 16l0 256c0 8.8 7.2 16 16 16l256 0c8.8 0 16-7.2 16-16l0-80c0-17.7 14.3-32 32-32s32 14.3 32 32l0 80c0 44.2-35.8 80-80 80L80 512c-44.2 0-80-35.8-80-80L0 176z"/>
          </svg>
        </div>

        <div id="ohLabelHex" class="alignRightCenter">
          <label class="baseLabel">Hexadecimal:</label>
        </div>
        <div id="ohRowHex" class="flex-row">
          <div id="ohDivHex" class="counter-parent">
            <div class="counter-gradient">
              <div class="separator"><div class="separator-marker"></div></div>
              <div class="separator"><div class="separator-marker"></div></div>
              <div class="separator"><div class="separator-marker"></div></div>
              <div class="separator"><div class="separator-marker"></div></div>
            </div>
          </div>
        </div>
        <div id="ohDivHexOverflow" class="overflow">
          <svg width="12" height="12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <title>Overflow!</title>
            <path d="M290.4 19.8C295.4 7.8 307.1 0 320 0L480 0c17.7 0 32 14.3 32 32l0 160c0 12.9-7.8 24.6-19.8 29.6s-25.7 2.2-34.9-6.9L400 157.3 246.6 310.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L354.7 112 297.4 54.6c-9.2-9.2-11.9-22.9-6.9-34.9zM0 176c0-44.2 35.8-80 80-80l80 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-80 0c-8.8 0-16 7.2-16 16l0 256c0 8.8 7.2 16 16 16l256 0c8.8 0 16-7.2 16-16l0-80c0-17.7 14.3-32 32-32s32 14.3 32 32l0 80c0 44.2-35.8 80-80 80L80 512c-44.2 0-80-35.8-80-80L0 176z"/>
          </svg>
        </div>
        
        <hr>
        <div></div>
        <div></div>
        
        <div id="ohLabelCharRca" class="alignRightCenter">
          <label class="baseLabel">RCA-301:</label>
        </div>
        <div id="ohRowCharRca" class="flex-row">
          <div id="ohDivCharRca" class="counter-parent">
            <div class="counter-gradient">
              <div class="separator"><div class="separator-marker"></div></div>
              <div class="separator"><div class="separator-marker"></div></div>
              <div class="separator"><div class="separator-marker"></div></div>
            </div>
          </div>
        </div>
        <div id="ohDivCharRcaOverflow" class="overflow">
          <svg width="12" height="12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <title>Overflow!</title>
            <path d="M290.4 19.8C295.4 7.8 307.1 0 320 0L480 0c17.7 0 32 14.3 32 32l0 160c0 12.9-7.8 24.6-19.8 29.6s-25.7 2.2-34.9-6.9L400 157.3 246.6 310.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L354.7 112 297.4 54.6c-9.2-9.2-11.9-22.9-6.9-34.9zM0 176c0-44.2 35.8-80 80-80l80 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-80 0c-8.8 0-16 7.2-16 16l0 256c0 8.8 7.2 16 16 16l256 0c8.8 0 16-7.2 16-16l0-80c0-17.7 14.3-32 32-32s32 14.3 32 32l0 80c0 44.2-35.8 80-80 80L80 512c-44.2 0-80-35.8-80-80L0 176z"/>
          </svg>
        </div>
        
        <div id="ohLabelCharAscii" class="alignRightCenter">
          <label class="baseLabel">ASCII:</label>
        </div>
        <div id="ohRowCharAscii" class="flex-row">
          <div id="ohDivCharAscii" class="counter-parent">
            <div class="counter-gradient">
              <div class="separator"><div class="separator-marker"></div></div>
              <div class="separator"><div class="separator-marker"></div></div>
              <div class="separator"><div class="separator-marker"></div></div>
            </div>
          </div>
        </div>
        <div id="ohDivCharAsciiOverflow" class="overflow">
          <svg width="12" height="12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <title>Overflow!</title>
            <path d="M290.4 19.8C295.4 7.8 307.1 0 320 0L480 0c17.7 0 32 14.3 32 32l0 160c0 12.9-7.8 24.6-19.8 29.6s-25.7 2.2-34.9-6.9L400 157.3 246.6 310.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L354.7 112 297.4 54.6c-9.2-9.2-11.9-22.9-6.9-34.9zM0 176c0-44.2 35.8-80 80-80l80 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-80 0c-8.8 0-16 7.2-16 16l0 256c0 8.8 7.2 16 16 16l256 0c8.8 0 16-7.2 16-16l0-80c0-17.7 14.3-32 32-32s32 14.3 32 32l0 80c0 44.2-35.8 80-80 80L80 512c-44.2 0-80-35.8-80-80L0 176z"/>
          </svg>
        </div>
        
        <div class="alignRightTop">
          <label for="ohNumberInput" class="decimal">Decimal Value:</label>
        </div>
        <div class="flex-column">
          <div class="counter_input flex-row">
            <input id="ohNumberInput" class="numinput" type="number" value="0"
              oninput="counterOctHex.setValueNumEdit(this.value)">
          </div>
          <div class="counter_range flex-row">
            <label id="ohMinValue" for="ohValSlider" onclick="counterOctHex.setMinValue()">Min</label>
            <input id="ohValSlider" type="range" value="0" min="0" max="1023" step="0.1"
              title="This slider has a range determined by the counters but you can enter any number in the text box above."
              oninput="counterOctHex.setValueSlider(this.value)"
              onchange="counterOctHex.setValueSlider(this.value)">
            <label id="ohMaxValue" for="ohValSlider" onclick="counterOctHex.setMaxValue()">Max</label>
          </div>
        </div>
        <div></div>
      </div>
    </div>
  </div>


</div>


<?php $page->printBottom(); ?>


<!-- hardware popup  -->
<div class="character_popup cpu_popup">
  <div class="bg_card" onclick="document.querySelector('.character_popup').classList.remove('activemp')">
  </div>
  <div class="mp_card">
    <div class="clos_btn" onclick="document.querySelector('.character_popup').classList.remove('activemp')">
      <img src="<?php $page->printImagePath('close.png'); ?>" />
    </div>
    <p>Automatic counters work with digits!</p>
    <p>When using levels the values can be changed only manually.</p>
    <p>Check "Convert levels to symbols" in order to use automatic counters...</p>
  </div>
</div>
<!-- end hardware popup  -->

</main>

<script>
<?php $page->printPreloaderScript(); ?>

<?php $page->printHamburgerMenuScript(); ?>
</script>

</body>

</html>