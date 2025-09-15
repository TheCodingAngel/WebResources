<?php
require '../common/php/utils.php';
$page = new Page('..');
?>
<!DOCTYPE html>

<html lang="en">

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Character-Oriented Decimal Computer</title>
  
  <?php $page->printFavIcon('favicon.ico'); ?>

  <?php $page->printCommonCss('base.css'); ?>
  <?php $page->printFontsCss(); ?>

  <link type="text/css" rel="stylesheet" href="scripts/Computer/computer.css">
  <?php $page->printCommonCss('style.css'); ?>
  <?php $page->printCommonCss('responsive.css'); ?>

  <script type="text/javascript" defer src="scripts/_Common/utils_base.js"></script>
  <script type="text/javascript" defer src="scripts/_Common/popups.js"></script>
  <script type="text/javascript" defer src="scripts/_Common/wizard_base.js"></script>
  <script type="text/javascript" defer src="scripts/Computer/wizard.js"></script>
  
  <script type="text/javascript" defer src="scripts/Computer/utils.js"></script>
  <script type="text/javascript" defer src="scripts/Computer/memory.js"></script>
  <script type="text/javascript" defer src="scripts/Computer/io.js"></script>
  <script type="text/javascript" defer src="scripts/Computer/cpu.js"></script>
  <script type="text/javascript" defer src="scripts/Computer/emulator.js"></script>
  <script type="text/javascript" defer src="scripts/Computer/instructions.js"></script>
  <script type="text/javascript" defer src="scripts/Computer/init.js"></script>
</head>

<body>

<div class="preloader">
  <div></div>
  <div></div>
  <div></div>
</div>
<div class="bg_gr"></div>
<div class="bg_gr_right"></div>

<div id="frameOverlay" class="frame-overlay"></div>

<main class="flex-column flex-stretch">

<noscript><h1><b>You need to enable JavaScript to use this emulator.</b></h1></noscript>

<?php $page->printTop(); ?>

<div id="pageHeader" class="page-header flex-row flex-stretch-ortogonal navdirection">
  <div class="containertop">
    <ul class="breadcrumb link_style">
      <li><a href="/">Home</a></li>
      <li>»</li>
      <li><a href="">Tools</a></li>
      <li>»</li>
      <li><h1 class="title">Character-Oriented Decimal Computer</h1></li>
    </ul>
    <div class="flex-stretch-center-children">
    </div>
    <div class="toolbar-horizontal">
      <a class="how_use_svg" href="https://thecodingangel.com/blog/post/computers-do-not-work-with-zeroes-and-ones-but">
        <svg width="27" height="27" viewBox="0 0 27 27" xmlns="http://www.w3.org/2000/svg">
          <title>How to use</title>
          <path d="M19.7454 4C20.988 4 21.9954 5.00736 21.9954 6.25V17.7546C21.9954 18.9972 20.988 20.0046 19.7454 20.0046H4.25C3.00736 20.0046 2 18.9972 2 17.7546V6.25C2 5.00736 3.00736 4 4.25 4H19.7454ZM19.7454 5.5H4.25C3.83579 5.5 3.5 5.83579 3.5 6.25V17.7546C3.5 18.1688 3.83579 18.5046 4.25 18.5046L6.999 18.504L7 15.75C7 14.8318 7.70711 14.0788 8.60647 14.0058L8.75 14H15.2447C16.1629 14 16.9159 14.7071 16.9889 15.6065L16.9947 15.75L16.994 18.504L19.7454 18.5046C20.1596 18.5046 20.4954 18.1688 20.4954 17.7546V6.25C20.4954 5.83579 20.1596 5.5 19.7454 5.5ZM12 7.00046C13.6569 7.00046 15 8.34361 15 10.0005C15 11.6573 13.6569 13.0005 12 13.0005C10.3431 13.0005 9 11.6573 9 10.0005C9 8.34361 10.3431 7.00046 12 7.00046Z"/>
        </svg>
      </a>
      <!--
      <a href="#" onclick="memory.saveToFile()">
        <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
          <title>Download Offline Copy</title>
          <path d="M64 0C28.7 0 0 28.7 0 64L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-288-128 0c-17.7 0-32-14.3-32-32L224 0 64 0zM256 0l0 128 128 0L256 0zM216 232l0 102.1 31-31c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-72 72c-9.4 9.4-24.6 9.4-33.9 0l-72-72c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l31 31L168 232c0-13.3 10.7-24 24-24s24 10.7 24 24z"/>
        </svg>
      </a>
      -->
      <a href="https://TheCodingAngel.org/tools/arch/Computer.zip">
        <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <title>Download Offline Copy (Open Computer.html)</title>
          <path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 242.7-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7 288 32zM64 352c-35.3 0-64 28.7-64 64l0 32c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-32c0-35.3-28.7-64-64-64l-101.5 0-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352 64 352zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/>
        </svg>
      </a>
    </div>
  </div>
</div>

<div id="pageContent" class="flex-row height-constraints full_width">
<!--
<div id="wizard" class="flex-column">
  <button class="button button_style" onclick="wizard.onNext()">Next</button>
  <button class="button button_style" onclick="wizard.onPrevious()">Previous</button>
</div>
-->

<div id="environment" class="flex-column flex-shrink">

  <input type="text" id="popupText" class="popup">
  <input type="number" inputmode="numeric" id="popupNumeric" class="popup input_focus">

  <div id="simulator" class="sidebar-horizontal flex-row flex-shrink mainbody">

    <div id="inputSection" class="section-input sidebar-vertical flex-column flex-stretch-ortogonal input_bigger bg_slight">
      <div class="flexbar">
        <h3 id="cardReader" class="section-header">Card Reader:</h3>
        <button id="loadAtStartAddress" class="button button_style" onclick="io.onLoadTextAtStartAddress()">Load at Selection Start</button>
        <button id="assembleAtStartAddress" class="button button_style" onclick="io.onLoadTextAtStartAddress()">Assemble at Selection Start</button>
      </div>
      <div id="punchReaderWrap" class="card-reader-wrap flex-row checkbox_style">
        <input type="checkbox" class="checkbox flex-pos-ortogonal-center" id="punchReaderWrapCheckbox" onchange="io.toggleReaderWrap(this)">
        <label for="punchReaderWrapCheckbox" class="label flex-pos-ortogonal-center">Wrap Text</label>
      </div>
      <textarea id="punchReader" name="input" cols="16" placeholder="Type Here..." class="card-reader flex-stretch-parallel left_textarea disable-wrap"></textarea>      
      <!-- div id="resizerInput" data-resize="punchReader" data-overlay="frameOverlay" class="resizer-vertical"></div -->
    </div>

    <div id="memorySection" class="section-memory flex-column flex-shrink bg_slight middle_area memory_inside">
      <div id="memoryHeader" class="flex-row flex-stretch-ortogonal">
        <h3 class="section-header flex-pos-ortogonal-center">Memory:</h3>
        <button class="button flex-space-left quotemark" onclick="memory.onShowHelp()">?</button>
      </div>
      <div id="memorySelection" class="flex-row memory_align">
        <button class="button button_style" onclick="memory.onSelectAddresses()">Select</button>
        <label for="addressStart" class="label flex-pos-ortogonal-center">Start:</label>
        <input type="number" inputmode="numeric" class="numedit flex-pos-ortogonal-center" id="addressStart" name="addressStart" min="-1" max="9999" size="6">
        <label for="addressEnd" class="label flex-pos-ortogonal-center">End:</label>
        <input type="number" inputmode="numeric" class="numedit flex-pos-ortogonal-center" id="addressEnd" name="addressEnd" min="-1" max="9999" size="6">
        <button class="button button_style btn_w" onclick="memory.onFillWithZeroes()">Fill with Zeroes</button>
      </div>

      <div id="memoryScrolling" class="flex-row memory_align">
        <button class="button button_style" onclick="memory.scrollToAddress(document.getElementById('addressScroll'))">Scroll to</button>
        <label for="addressScroll" class="label flex-pos-ortogonal-center">Address:</label>
        <input type="number" inputmode="numeric" class="numedit flex-pos-ortogonal-center" id="addressScroll" name="address" min="0" max="9999" value="0" size="6">
        <div class="checkbox_style">
          <input type="checkbox" class="checkbox flex-pos-ortogonal-center" id="autoScrollMemory" checked onchange="cpu.setAutoScrollToNextInstruction(this.checked)">
          <label for="autoScrollMemory" class="label flex-pos-ortogonal-center smalllabel">Auto Scroll to Next Instruction</label>
        </div>
      </div>
      
      <div id="memoryEditing" class="flex-row flex-stretch-ortogonal memory_align end_top_m">
        <div class="checkbox_style">
          <input type="checkbox" class="checkbox flex-pos-ortogonal-center" id="editMemoryByRows" onchange="memory.setEditMemoryByRows(this.checked)">
          <label for="editMemoryByRows" class="label flex-pos-ortogonal-center">Edit by rows</label>
        </div>
        
        <!--
        <input type="file" class="input-load flex-pos-ortogonal-center" id="magneticTape">
        -->
        <div class="file-area flex-space-left file_memory">
          <input type="file" id="magneticTape" required="required">
          <div class="file-dummy">
            <span class="default">Drag here a "magnetic tape" file</span>
            <span class="success">A "magnetic tape" is loaded</span>
          </div>
        </div>
        
        <button class="button button_style" onclick="document.getElementById('magneticTape').click()">Load</button>
        <button class="button button_style m-0" onclick="memory.saveToFile()">Save</button>
        
      </div>
      
      <div id="memoryPanel" class="memory-panel flex-shrink disable-dbl-tap-zoom table_middle memorymiddle">
        <table id="memory" class="clear-table disable-dbl-tap-zoom table_inner">
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
            </tr>
          </thead>
          <tbody id="memoryData" class="disable-dbl-tap-zoom">
          </tbody>
        </table>
      </div>
    </div>

    <div id="activitySection" class="flex-column flex-stretch-ortogonal rightarea">
      <div id="cpuSection" class="section-cpu flex-stretch-ortogonal bg_slight cpu_area">
        <div id="cpuHeader" class="cpu-header flex-row flex-stretch-ortogonal link_style">
          <h3 class="section-header flex-pos-ortogonal-center">CPU (<a href="https://en.wikipedia.org/wiki/I386">~i386</a>):</h3>
          <a id="instructionReference" href="#" class="instruction-reference flex-space-left">Instructions reference</a>
          <button class="button button_style" onclick="cpu.reset()">Reset</button>
        </div>
        <div id="operationsPanel" class="operations-panel flex-row cpu_align">
          <button id="runExecution" class="button button_style" onclick="emulator.run();">Run (Alt+G)</button>
          <button id="cancelExecution" class="button button_style" style="display:none" onclick="emulator.cancel();">Cancel (Alt+C)</button>
          <label for="executionInterval" class="label flex-pos-ortogonal-center">Delay</label>
          <input type="number" inputmode="numeric" class="numedit flex-pos-ortogonal-center" id="executionInterval" min="0" max="5000" maxlength="4" size="4">
          <label for="executionInterval" class="label flex-pos-ortogonal-center">ms</label>
          <button class="button button_style flex-space-left" onclick="emulator.step();">Step (Alt+P)</button>
        </div>

        <section>
          <header id="controlSection" class="flex-row cpu_table">
            <div id="controlPanel" class="flags-panel cpu_xsd">
              <table id="control" class="clear-table table_inside">
                <thead>
                  <tr>
                    <th class="table-header" role="columnheader" scope="column"><span title="Not Used" class="">X</span></th>
                    <th class="table-header" role="columnheader" scope="column"><span title="Not Used" class="">X</span></th>
                    <th class="table-header" role="columnheader" scope="column"><span title="Is Step by Step" class="">S</span></th>
                    <th class="table-header" role="columnheader" scope="column"><span title="Is Negative Direction" class="">D</span></th>
                  </tr>
                </thead>
                <tbody id="ECONTROL" class="table_body">
                  <tr>
                    <td>X</td>
                    <td>X</td>
                    <td id="c2" class="memory-cell">0</td>
                    <td id="c1" class="memory-cell">0</td>
                  </tr>
                </tbody>
              </table>
            </div>
  
            <div id="flagsPanel" class="flags-panel cpu_xsd">
              <table id="flags" class="clear-table table_inside">
                <thead>
                  <tr>
                    <th class="table-header" role="columnheader" scope="column"><span title="Not Used" class="">X</span></th>
                    <th class="table-header" role="columnheader" scope="column"><span title="Is Overflown" class="">O</span></th>
                    <th class="table-header" role="columnheader" scope="column"><span title="Is Negative" class="">N</span></th>
                    <th class="table-header" role="columnheader" scope="column"><span title="Is Positive" class="">P</span></th>
                  </tr>
                </thead>
                <tbody id="EFLAGS" class="table_body">
                  <tr>
                    <td>X</td>
                    <td id="f4" class="memory-cell">0</td>
                    <td id="f2" class="memory-cell">0</td>
                    <td id="f1" class="memory-cell">0</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </header>
          <div id="registersSection" class="flex-row table_middle">
            <div id="pointersPanel" class="registers-panel table_round">
              <table id="registersPointers" class="clear-table table_inner">
                <thead>
                  <tr>
                    <th class="table-header" role="columnheader" colspan="5">Pointers</th>
                  </tr>
                </thead>
                <tbody id="REGS_POINTERS">
                  <tr id="eipRow">
                    <td id="eip" class="memory-address"><span title="Instruction Pointer">EIP</span></td>
                    <td class="memory-cell">0</td>
                    <td class="memory-cell">0</td>
                    <td class="memory-cell">0</td>
                    <td class="memory-cell">0</td>
                  </tr>
                  <tr id="espRow">
                    <td id="esp" class="memory-address"><span title="Stack Pointer">ESP</span></td>
                    <td class="memory-cell">0</td>
                    <td class="memory-cell">0</td>
                    <td class="memory-cell">0</td>
                    <td class="memory-cell">0</td>
                  </tr>
                  <tr id="ebpRow">
                    <td id="ebp" class="memory-address"><span title="Base Pointer">EBP</span></td>
                    <td class="memory-cell">0</td>
                    <td class="memory-cell">0</td>
                    <td class="memory-cell">0</td>
                    <td class="memory-cell">0</td>
                  </tr>
                  <tr id="csRow">
                    <td id="cs" class="memory-address"><span title="Code Segment (Program Load Address)">CS</span></td>
                    <td class="memory-cell">0</td>
                    <td class="memory-cell">0</td>
                    <td class="memory-cell">0</td>
                    <td class="memory-cell">0</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div id="generalRegistersPanel" class="registers-panel table_round">
              <table id="registersGeneral" class="clear-table table_inner">
                <thead>
                  <tr>
                    <th class="table-header" role="columnheader" colspan="5">Registers</th>
                  </tr>
                </thead>
                <tbody id="REGS_GENERAL" class="table_round">
                  <tr id="eaxRow">
                    <td id="eax" class="memory-address"><span title="Universal Register A">EAX</span></td>
                    <td class="memory-cell">0</td>
                    <td class="memory-cell">0</td>
                    <td class="memory-cell">0</td>
                    <td class="memory-cell">0</td>
                  </tr>
                  <tr id="ebxRow">
                    <td id="ebx" class="memory-address"><span title="Universal Register B">EBX</span></td>
                    <td class="memory-cell">0</td>
                    <td class="memory-cell">0</td>
                    <td class="memory-cell">0</td>
                    <td class="memory-cell">0</td>
                  </tr>
                  <tr id="ecxRow">
                    <td id="ecx" class="memory-address"><span title="Counter Register">ECX</span></td>
                    <td class="memory-cell">0</td>
                    <td class="memory-cell">0</td>
                    <td class="memory-cell">0</td>
                    <td class="memory-cell">0</td>
                  </tr>
                  <tr id="idtRow">
                    <td id="idt" class="memory-address"><span title="Interrupt Description Table Register">IDTR</span></td>
                    <td class="memory-cell">0</td>
                    <td class="memory-cell">0</td>
                    <td class="memory-cell">0</td>
                    <td class="memory-cell">0</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      <div id="outputSection" class="section-output flex-column flex-stretch bg_slight printer_area">
        <div id="printerHeader" class="flex-row flex-stretch-ortogonal">
          <h3 class="section-header flex-pos-ortogonal-center">Printer:</h3>
          <button class="button flex-space-left button_style" onclick="io.onPrintTextAtSelectedAddresses()">Print Selected Addresses</button>
          <button class="button button_style" onclick="io.onClearPrintedText()">Clear</button>
        </div>
        <textarea id="printer" name="input" readonly rows="3" cols="40" class="printer flex-stretch-parallel flex-space-left printer_textarea"></textarea>
      </div>
      
      <div id="teleprinterSection" class="section-teleprinter flex-column flex-stretch bg_slight teleprinter_area">
        <div id="teleprinterHeader" class="flex-row flex-stretch-ortogonal">
          <h3 class="section-header flex-pos-ortogonal-center">Teleprinter:</h3>
          <button class="button flex-space-left button_style" onclick="io.onClearTeleprinter()">Clear</button>
        </div>
        <textarea id="teleprinter" name="input" rows="3" cols="40" class="teleprinter flex-stretch-parallel flex-space-left printer_textarea"></textarea>
      </div>
      
      <!--div id="resizerOutput" class="resizer-vertical"></div-->
    </div>

    <!--div id="resizerEmulator" class="resizer-horizontal"></div-->
  </div> <!-- simulator -->

</div> <!-- environment -->

</div> <!-- pageContent -->

<?php $page->printBottom(); ?>

</main>

<!-- memory popup  -->
<div class="memory_popup">
  <div class="bg_card"
       onclick="document.querySelector('.memory_popup').classList.remove('activemp')">
  </div>
  <div class="mp_card">
    <div class="clos_btn"
         onclick="document.querySelector('.memory_popup').classList.remove('activemp')">
      <img src="<?php $page->printImagePath('close.png'); ?>" />
    </div>
    <ul>
      <li>
        <span>1. </span>
        <span>Selecting Memory Cells:</span>
        <div class="memory_cells">
          <p>- by dragging the mouse while having the left button pressed;</p>
          <p>- by left clicking on a starting cell followed by a left clicking
            along with pressed Shift key on an end cell;</p>
          <p>- clicking the column with addresses (on the left of the cell
            matrix) clears the selection.</p>
        </div>
      </li>
      <li>
        <span>2. </span>
        <span>Loading Card Reader characters starts from the first selected
          memory cell or from address zero when there is no selection.</span>
      </li>
      <li>
        <span>3. </span>
        <span>Filling with zeroes works on the selected cells or on all cells
          if there is no selection.</span>
      </li>
      <li>
        <span>4. </span>
        <span>Loading from a file works like point 2 (loading from the first
          selected memory cell or from address zero when there is no
          selection).</span>
      </li>
      <li>
        <span>5. </span>
        <span>Saving to a file works like point 3 (saving the selected cells or
          all cells if there is no selection).</span>
      </li>
      <li>
        <span>6. </span>
        <span>Direct editing of memory cells is done by double clicking with
          the left mouse button (unlike the single click for
          registers).</span>
      </li>
      <li>
        <span>7.</span>
        <span>Popup values are applied by the Return/Enter key and canceled by
          the Esc key or clicking outside the popup.</span>
      </li>
    </ul>
  </div>
</div>
<!-- end memory popup  -->

<!-- cpu popup  -->
<div class="cpu_popup">
  <div class="bg_card" onclick="document.querySelector('.cpu_popup').classList.remove('activecpup')">
   </div>
  <div class="mp_card">
    <div class="clos_btn" onclick="document.querySelector('.cpu_popup').classList.remove('activecpup')">
      <img src="<?php $page->printImagePath('close.png'); ?>" />
    </div>
    <ul>
      <li>
        <span>Instruction Error:</span>
        <div class="memory_cells">
          <p><div class="msgcpu">Unknown opcode: 0</div></p>
        </div>
      </li>
    </ul>
  </div>
</div>
<!-- end cpu popup  -->

<script>
<?php $page->printPreloaderScript(); ?>

<?php $page->printHamburgerMenuScript(); ?>
</script>

</body>
</html>
