<?php
require '../common/php/page.php';
$page = new Page('..');
?>
<!DOCTYPE html>

<html lang="en">

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Registers</title>
  
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
  
<?php $page->printBreadcrumb('Registers', 'Tools'); ?>
    
    <div class="flex-stretch-center-children">
    </div>
    <div class="toolbar-horizontal">
      <a class="how_use_svg" href="https://youtube.com/">
        <svg width="27" height="27" viewBox="0 0 27 27" xmlns="http://www.w3.org/2000/svg">
          <title>Video Demonstration</title>
          <path d="M19.7454 4C20.988 4 21.9954 5.00736 21.9954 6.25V17.7546C21.9954 18.9972 20.988 20.0046 19.7454 20.0046H4.25C3.00736 20.0046 2 18.9972 2 17.7546V6.25C2 5.00736 3.00736 4 4.25 4H19.7454ZM19.7454 5.5H4.25C3.83579 5.5 3.5 5.83579 3.5 6.25V17.7546C3.5 18.1688 3.83579 18.5046 4.25 18.5046L6.999 18.504L7 15.75C7 14.8318 7.70711 14.0788 8.60647 14.0058L8.75 14H15.2447C16.1629 14 16.9159 14.7071 16.9889 15.6065L16.9947 15.75L16.994 18.504L19.7454 18.5046C20.1596 18.5046 20.4954 18.1688 20.4954 17.7546V6.25C20.4954 5.83579 20.1596 5.5 19.7454 5.5ZM12 7.00046C13.6569 7.00046 15 8.34361 15 10.0005C15 11.6573 13.6569 13.0005 12 13.0005C10.3431 13.0005 9 11.6573 9 10.0005C9 8.34361 10.3431 7.00046 12 7.00046Z"/>
        </svg>
      </a>
      <a href="https://TheCodingAngel.org/tools/arch/Registers.zip">
        <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <title>Download Offline Copy (Open Registers.html)</title>
          <path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 242.7-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7 288 32zM64 352c-35.3 0-64 28.7-64 64l0 32c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-32c0-35.3-28.7-64-64-64l-101.5 0-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352 64 352zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/>
        </svg>
      </a>
    </div>
  </div>
</div>

<div id="pageContent" class="page-content">

<div class="introduction">
<h1 class="section-header flex-pos-ortogonal-center">CPU Registers for
my <?php $page->printInternalLink("simple", "Computer"); ?> and <?php $page->printInternalLink("full", "Computer-Full"); ?> emulators<br>
(a mixture of <a href="https://en.wikipedia.org/wiki/I386">Intel 386</a> and
<a href="http://feb-patrimoine.com/english/rca_computers.htm">RCA-301</a>).</h1>
<br>
<p>Each register contains 4 characters (though the accumulators allow separate access to their characters).</p>
</div>

<div id="registers" class="section flex-column">
  <div id="hardwareHeader" class="section-header flex-row flex-pos-ortogonal-center">
    <h3 class="section-header">Register Identifiers:</h3>
  </div>
  <div class="section-registers flex-row flex-pos-ortogonal-center">
    <table cellpadding="5" cellspacing="5">
      <thead>
        <tr>
          <th>Name</th>
          <th>Identifier</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>EIP</td>
          <td>0004</td>
          <td>Instruction Pointer - address of the first character of the next <?php $page->printInternalLink("instruction", "Instructions"); ?>.</td>
        </tr>
        <tr>
          <td>EAX</td>
          <td>0014</td>
          <td>Accumulator A - data.
            <table cellpadding="5" cellspacing="5">
              <thead>
                <tr><th>Sub-part</th><th>Identifier</th><th>Description</th></tr>
              </thead>
              <tbody>
                <tr><td>AL</td><td>0011</td><td>The lowest (the rightmost) character</td></tr>
                <tr><td>AH</td><td>0012</td><td>The second character from right to left</td></tr>
                <tr><td>AX</td><td>0013</td><td>Lowest (rightmost) 2 characters (= AH + AL)</td></tr>
              </tbody>
            </table>
          </td>
        </tr>
        <tr>
          <td>EBX</td>
          <td>0024</td>
          <td>Accumulator B - data.
            <table cellpadding="5" cellspacing="5">
              <thead>
                <tr><th>Sub-part</th><th>Identifier</th><th>Description</th></tr>
              </thead>
              <tbody>
                <tr><td>BL</td><td>0021</td><td>The lowest (the rightmost) character</td></tr>
                <tr><td>BH</td><td>0022</td><td>The second character from right to left</td></tr>
                <tr><td>BX</td><td>0023</td><td>Lowest (rightmost) 2 characters (= BH + BL)</td></tr>
              </tbody>
            </table>
          </td>
        </tr>
        <tr>
          <td>ECX</td>
          <td>0034</td>
          <td>Accumulator C - counter.
            <table cellpadding="5" cellspacing="5">
              <thead>
                <tr><th>Sub-part</th><th>Identifier</th><th>Description</th></tr>
              </thead>
              <tbody>
                <tr><td>CL</td><td>0031</td><td>The lowest (the rightmost) character</td></tr>
                <tr><td>CH</td><td>0032</td><td>The second character from right to left</td></tr>
                <tr><td>CX</td><td>0033</td><td>Lowest (rightmost) 2 characters (= CH + CL)</td></tr>
              </tbody>
            </table>
          </td>
        </tr>
        <tr>
          <td>ESP</td>
          <td>0044</td>
          <td>Stack Pointer - auto-changing address of the head of the stack:<br>
            - <a href="Instructions#push">PUSH</a> decrements it before writing data at the address in it;<br>
            - <a href="Instructions#pop">POP</a> increments it back.
          <br><br>
          Return addresses from subroutines are automatically pushed in the stack and popped from it
          (by the <a href="Instructions#call">CALL</a> and <a href="Instructions#ret">RET</a> instructions).
          <br><br>
          Registers are automatically saved and restored when handling interrupts
          (by the <a href="Instructions#int">INT</a> and <a href="Instructions#iret">IRET</a> instructions).
          <br><br>
          Initially, marks the end of a <strong>process</strong> (after loading a program from a storage into the memory).</td>
        </tr>
        <tr>
          <td>EBP</td>
          <td>0054</td>
          <td>Base Pointer - an address.</td>
        </tr>
        <tr>
          <td>CS</td>
          <td>0064</td>
          <td>Code Segment - start of the executable form of a program (i.e. start of a <strong>process</strong>).<br>
          Its value (if non-negative) is automatically added by the CPU when extracting values from any address
          (only <strong>IDTR</strong> is excluded).</td>
        </tr>
        <tr>
          <td>IDTR</td>
          <td>0074</td>
          <td>Interrupt Description Table Register - the <strong>physical</strong> address of a table with 7 elements (4 characters each ⇒ 28 characters in total):
            <div><br>
            <ol start="0">
              <li>the address of a handler for "division by zero" (fault);</li>
              <li>the address of a handler for "invalid opcode" (fault);</li>
              <li>the address of a handler for "halt";</li>
              <li>the address of a handler for "breakpoint";</li>
              <li>the address of a handler for hardware interrupts from the Teleprinter.</li>
              <li>the address of a handler for end of data copy by the DMA device.</li>
              <li>the address of a handler for a custom interrupt (API).</li>
            </ol>
            <br>Note - only non-zero values are accepted as valid addresses.
            </div>
          </td>
        </tr>
      </tbody>
    </table>
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

