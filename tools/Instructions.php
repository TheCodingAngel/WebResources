<?php
require '../common/php/page.php';
$page = new Page('..');
?>
<!DOCTYPE html>

<html lang="en">

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Instructions</title>
  
  <?php $page->printFavIcon("favicon.ico"); ?>

  <?php $page->printCommonCss('base.css'); ?>
  <?php $page->printFontsCss(); ?>
  
  <link type="text/css" rel="stylesheet" href="scripts/Computer/documentation.css">
  <?php $page->printCommonCss('style.css'); ?>
  <?php $page->printCommonCss('responsive.css'); ?>
</head>

<body>

<main class="flex-column flex-stretch">

<noscript><h1><b>You need to enable JavaScript to use this page.</b></h1></noscript>

<?php $page->printTop(); ?>

<div id="pageHeader" class="page-header flex-row flex-stretch-ortogonal navdirection">
  <div class="containertop">

<?php $page->printBreadcrumb('Instructions'); ?>

    <div class="flex-stretch-center-children">
    </div>
    <div class="toolbar-horizontal">
      <a class="how_use_svg" href="https://youtube.com/">
        <svg width="27" height="27" viewBox="0 0 27 27" xmlns="http://www.w3.org/2000/svg">
          <title>Video Demonstration</title>
          <path d="M19.7454 4C20.988 4 21.9954 5.00736 21.9954 6.25V17.7546C21.9954 18.9972 20.988 20.0046 19.7454 20.0046H4.25C3.00736 20.0046 2 18.9972 2 17.7546V6.25C2 5.00736 3.00736 4 4.25 4H19.7454ZM19.7454 5.5H4.25C3.83579 5.5 3.5 5.83579 3.5 6.25V17.7546C3.5 18.1688 3.83579 18.5046 4.25 18.5046L6.999 18.504L7 15.75C7 14.8318 7.70711 14.0788 8.60647 14.0058L8.75 14H15.2447C16.1629 14 16.9159 14.7071 16.9889 15.6065L16.9947 15.75L16.994 18.504L19.7454 18.5046C20.1596 18.5046 20.4954 18.1688 20.4954 17.7546V6.25C20.4954 5.83579 20.1596 5.5 19.7454 5.5ZM12 7.00046C13.6569 7.00046 15 8.34361 15 10.0005C15 11.6573 13.6569 13.0005 12 13.0005C10.3431 13.0005 9 11.6573 9 10.0005C9 8.34361 10.3431 7.00046 12 7.00046Z"/>
        </svg>
      </a>
    </div>
  </div>
</div>

<div id="pageContent" class="page-content">

<div class="introduction">
<h1 class="section-header flex-pos-ortogonal-center">The instructions for
my <a href="Computer.php">simple</a> and <a href="Computer-Full.php">full</a> emulators<br>
(a mixture of <a href="https://en.wikipedia.org/wiki/I386">Intel 386</a> and
<a href="https://jnorthr.wordpress.com/2013/02/02/my-first-computer/">RCA-301</a>).</h1>
<br>
</div>

<div id="columns" class="flex-row">


<div id="index" class="section text-area mono-space">
  <p class="text-small"><strong>[opcode] - [mnemonic]:</strong></p>
  <br>
  <p><a href="#nop">[Space] - NOP</a></p>
  <br>
  <p><a href="#mov">M - MOV</a></p>
  <p><a href="#movs">S - MOVS</a></p>
  <p><a href="#stos">" - STOS</a></p>
  <br>
  <p><a href="#cmp">? - CMP</a></p>
  <p><a href="#cmps">C - CMPS</a></p>
  <p><a href="#scas">F - SCAS</a></p>
  <br>
  <p><a href="#jmp">J - JMP</a></p>
  <p><a href="#je">= - JE</a></p>
  <p><a href="#jne">! - JNE</a></p>
  <p><a href="#jl">&lt; - JL</a></p>
  <p><a href="#jg">&gt; - JG</a></p>
  <p><a href="#jle">L - JLE</a></p>
  <p><a href="#jge">G - JGE</a></p>
  <p><a href="#jo">$ - JO</a></p>
  <br>
  <p><a href="#int">T - INT</a></p>
  <p><a href="#hlt">. - HLT</a></p>
  <p><a href="#int3">, - INT3</a></p>
  <p><a href="#iret">: - IRET</a></p>
  <p><a href="#clgi">' - CLGI</a></p>
  <p><a href="#call">@ - CALL</a></p>
  <p><a href="#ret">; - RET</a></p>
  <p><a href="#push">( - PUSH</a></p>
  <p><a href="#pop">) - POP</a></p>
  <br>
  <p><a href="#add">+ - ADD</a></p>
  <p><a href="#sub">- - SUB</a></p>
  <p><a href="#mul">* - MUL</a></p>
  <p><a href="#div">/ - DIV</a></p>
  <p><a href="#mod">% - MOD</a></p>
  <p><a href="#inc"># - INC</a></p>
  <p><a href="#dec">D - DEC</a></p>
  <br>
  <p><a href="#in">I - IN</a></p>
  <p><a href="#out">O - OUT</a></p>
</div>


<div id="content">

<div class="introduction text-area">

<p>
An instruction consists of 10 characters no matter how many operands it requires:
<ul>
<li>1 character - operation code (opcode)</li>
<li>1 character - <a href="Suffixes.php">suffix</a></li>
<li>4 characters - first operand</li>
<li>4 characters - second operand</li>
</ul>
</p>
<br>

<p>
Depending on the <a href="Suffixes.php">suffix</a> the operands may be treated as values,
<a href="Registers.php">register identifiers</a> or memory addresses.
</p>
<br>

<p>
The amount of characters that are handled by an instruction is:
<ul>
<li>in the <a href="Registers.php">counter register</a> (ECX) for <a href="Suffixes.php">addresses or pointers</a>;<br>
if ECX has zero or an invalid number then a default value of 4 is used;</li>
<li>the register size for <a href="Registers.php">register identifiers</a>;</li>
<li>4 characters for values (which is the size of an operand)</li>
</ul>
</p>
<br>

<p>
Numbers are formed with the characters for decimal digits.<br>
Big endian is used for ordering the digits of a multidigit decimal number.
</p>
<br>

<p>
The first line of each description is: <strong>[opcode] - [mnemonic]</strong>.<br>
<a name="nop">The opcodes</a> use always capital letters.<br>
The mnemonics are <a href="Computer-Full.php">used by the Assembly</a> and both capital and small letters are valid.<br>
Even though similar to the
<a href="https://edge.edx.org/c4x/BITSPilani/EEE231/asset/8086_family_Users_Manual_1_.pdf">x86 instruction set</a>
the instructions here have things from
<a href="https://github.com/TheCodingAngel/RCA-301-Emulator">RCA-301</a>:
</p>

</div>

<div id="instructions" class="section text-area mono-space">
    <p>
    <h4>[Space] - NOP</h4>
    </p>
    <p>
    No operation, i.e. do nothing.<br><br>
    <a name="mov">No operands</a> used but the suffix must have the default value of space
    to decrease the chance of simulating a NOP by data having just one space.
    </p>
    <br><hr><br>
    
    <p>
    <h4><a name="movs">M - MOV</a></h4>
    </p>
    <p>
    Move data from the second operand to the first operand.
    </p>
    <br><hr><br>
    
    <p>
    <h4><a name="stos">S - MOVS</a></h4>
    </p>
    <p>
    Move string from the second operand to the first operand.
    </p>
    <br><hr><br>
    
    <p>
    <h4>" - STOS</h4>
    </p>
    <p>
    Store a string identified by the first operand.<br><br>
    <a name="cmp">The first character</a> from the second operand (or if it is an address then the character it points to)
    is repeated as many time as set in ECX.
    </p>
    <br><hr><br>
    
    <p>
    <h4><a name="cmps">? - CMP</a></h4>
    </p>
    <p>
    Compare the 2 operands.
    Flags are set as if <a href="#sub">subtract</a> is used.
    </p>
    <br><hr><br>
    
    <p>
    <h4>C - CMPS</h4>
    </p>
    <p>
    Compare Strings identified by the 2 operands.<br><br>
    Flags are set as if <a href="#sub">subtract</a> is used on each corresponding characters.<br><br>
    <a name="scas">ECX contains</a> the length of the strings.<br>
    When the instruction finishes ECX is set to the index of the first non equal character.
    </p>
    <br><hr><br>
    
    <p>
    <h4>F - SCAS</h4>
    </p>
    <p>
    Scan String (or Find) searches for characters from the second operand in a string identified by the first operand.<br><br>
    ECX contains the length of the string.<br>
    When the instruction finishes ECX is set to the index of the first found character.<br><br>
    <a name="jmp">The first character</a> of the second operand determines how many characters should be used in the search.<br>
    It could be 1, 2 or 3.
    </p>
    <br><hr><br>
    
    <p>
    <h4><a name="je">J - JMP</a></h4>
    </p>
    <p>
    Jump to an address from the first operand.<br>
    No second operand.
    </p>
    <br><hr><br>
    
    <p>
    <h4>= - JE</h4>
    </p>
    <p>
    Jump if Equal to an address from the first operand.<br><br>
    <a name="jne">The condition</a> is to have both "Is Negative" and "Is Positive" flags set to 0 (or false).<br><br>
    No second operand.
    </p>
    <br><hr><br>
    
    <p>
    <h4>! - JNE</h4>
    </p>
    <p>
    Jump if Not Equal to an address from the first operand.<br><br>
    <a name="jl">The condition</a> is to have either "Is Negative" or "Is Positive" flags set to 1 (or true).<br><br>
    No second operand.
    </p>
    <br><hr><br>
    
    <p>
    <h4>&lt; - JL</h4>
    </p>
    <p>
    Jump if Less to an address from the first operand.<br><br>
    <a name="jg">The condition</a> is to have the "Is Negative" flag set to 1 (or true).<br><br>
    No second operand.
    </p>
    <br><hr><br>
    
    <p>
    <h4>&gt; - JG</h4>
    </p>
    <p>
    Jump if Greater to an address from the first operand.<br><br>
    <a name="jle">The condition</a> is to have the "Is Positive" flag set to 1 (or true).<br><br>
    No second operand.
    </p>
    <br><hr><br>
    
    <p>
    <h4>L - JLE</h4>
    </p>
    <p>
    Jump if Less or Equal to an address from the first operand.<br><br>
    <a name="jge">The condition</a> is to have the "Is Positive" flag set to 0 (or false).<br><br>
    No second operand.
    </p>
    <br><hr><br>
    
    <p>
    <h4>G - JGE</h4>
    </p>
    <p>
    Jump if Greater or Equal to an address from the first operand.<br><br>
    <a name="jo">The condition</a> is to have the "Is Negative" flag set to 0 (or false).<br><br>
    No second operand.
    </p>
    <br><hr><br>
    
    <p>
    <h4>$ - JO</h4>
    </p>
    <p>
    Jump if Overflown to an address from the first operand.<br><br>
    <a name="int">The condition</a> is to have the "Is Overflown" flag set to 1 (or true).<br><br>
    No second operand.
    </p>
    <br><hr><br>
    
    <p>
    <h4>T - INT</h4>
    </p>
    <p>
    Execute an interrupt (also called a "trap").<br>
    The first operand is the interrupt mumber.<br><br>
    The registers are pushed in the stack (so ESP's value should allow for 36 characters to be pushed).<br>
    If IDTR has a valid value and (IDTR + interrupt mumber * 4) contains a valid address
    a jump to that address is performed.<br>
    <a name="hlt">Otherwise</a> a default handler for the interrupt is executed.<br><br>
    Allowed suffixes are the default value of space and its equivalent - 'V'.<br>
    No second operand.
    </p>
    <br><hr><br>
    
    <p>
    <h4>. - HLT</h4>
    </p>
    <p>
    Stop execution and activate a "halt" indicator to notify the Operator.<br><br>
    <a name="int3">Interrupt number 2</a> is generated
    (so for automation purposes you need to set the address of the batch handler at IDTR + 8).<br><br>
    The suffix and the operands are ignored.
    </p>
    <br><hr><br>
    
    <p>
    <h4>, - INT3</h4>
    </p>
    <p>
    Stop execution and activate a "breakpoint" indicator to notify the Programmer.<br><br>
    <a name="iret">Interrupt number 3</a> is generated
    (so for implementing a debugger you need to set the address of the handler for "hiting a breakpoint" at IDTR + 12).<br><br>
    The suffix and the operands are ignored.
    </p>
    <br><hr><br>
    
    <p>
    <h4>: - IRET</h4>
    </p>
    <p>
    Return from an interrupt.<br><br>
    Register values are restored from the stack which includes the Instruction Pointer (EIP) and
    the Code Segment (CS).<br>
    <a name="clgi">So, the 36 characters</a> pointed by ESP determine from where the execution will continue
    as well as the "context" - the values of all registers (including the flag registers).
    </p>
    <br><hr><br>
    
    <p>
    <h4>' - CLGI</h4>
    </p>
    <p>
    Clear the global interrupt flag.<br><br>
    This computer doesn't have global interrupt flag, so this
    <a href="https://0x04.net/doc/amd/33047.pdf">AMD instruction</a> has a different behaviour here.<br>
    It returns from the current interupt as if using <a href="#iret">IRET</a> but the registers are not
    restored from the stack.<br><br>
    Always returns to the instruction that follows the instruction during which execution the interrupt
    was entered.<br>
    <a name="call">This prevents</a> infinite loops between the causing instruction and an interrupt handler using
    <strong>CLGI</strong>.<br><br>
    No operands are used.
    </p>
    <br><hr><br>
    
    <p>
    <h4>@ - CALL</a></h4>
    </p>
    <p>
    Call a sub-routine (aka a procedure or a function).<br><br>
    Similar to <a href="#jmp">jmp</a> but first pushes in the stack a "return" address
    which is the address of the instruction that follows the <strong>CALL</strong> instruction.<br><br>
    <a name="ret">The</a> <a href="#ret">RET</a> instruction pops the "return" address from the stack and jumps there.<br><br>
    The first operand contains the address of the sub-routine and the second is not used (so - just like <a href="#jmp">JMP</a>).
    </p>
    <br><hr><br>
    
    <p>
    <h4>; - RET</h4>
    </p>
    <p>
    Pop a "return" address from the stack and jump there.<br>
    <a name="push">Used to return</a> from a sub-routine (aka a procedure or a function) called with <a href="#call">CALL</a>.<br>
    No operands are used.
    </p>
    <br><hr><br>
    
    <p>
    <h4><a name="pop">( - PUSH</a></h4>
    </p>
    <p>
    Push a value identified by the first operand to the stack.<br>
    The second operand is not used.
    </p>
    <br><hr><br>
    
    <p>
    <h4><a name="add">) - POP</a></h4>
    </p>
    <p>
    Pop a value from the stack into an address or a register identified by the first operand.<br>
    The second operand is not used.
    </p>
    <br><hr><br>
    
    <p>
    <h4>+ - ADD</h4>
    </p>
    <p>
    Add the value identified by the second operand
    to a value at an address or a register identified by the first operand.<br><br>
    <a name="sub">The first</a> operand determines where the result is stored.<br><br>
    The flags for positive and negative result are affected appropriately.
    </p>
    <br><hr><br>
    
    <p>
    <h4>- - SUB</h4>
    </p>
    <p>
    Subtract the value identified by the second operand
    from a value at an address or a register identified by the first operand.<br><br>
    <a name="mul">The first</a> operand determines where the result is stored.<br><br>
    The flags for positive and negative result are affected appropriately.
    </p>
    <br><hr><br>
    
    <p>
    <h4>* - MUL</h4>
    </p>
    <p>
    Multiply the value identified by the second operand,
    by a value at an address or a register identified by the first operand.<br><br>
    <a name="div">The first</a> operand determines where the result is stored.<br><br>
    The flags for positive and negative result are affected appropriately.
    </p>
    <br><hr><br>
    
    <p>
    <h4>/ - DIV</h4>
    </p>
    <p>
    Integer division of the value at an address or a register identified by the first operand, by
    the value identified by the second operand.<br><br>
    <a name="mod">The first</a> operand determines where the result is stored.<br><br>
    The flags for positive and negative result are affected appropriately.
    </p>
    <br><hr><br>
    
    <p>
    <h4>% - MOD</h4>
    </p>
    <p>
    Modulo (the remainder after an integer division) of the value at an address or a register identified by the first operand, by
    the value identified by the second operand.<br><br>
    <a name="inc">The first</a> operand determines where the result is stored.<br><br>
    The flags for positive and negative result are affected appropriately.
    </p>
    <br><hr><br>
    
    <p>
    <h4><a name="dec"># - INC</a></h4>
    </p>
    <p>
    Increment (add 1) to a value at an address or a register identified by the first operand.<br>
    The second operand is not used.
    </p>
    <br><hr><br>
    
    <p>
    <h4><a name="in">D - DEC</a></h4>
    </p>
    <p>
    Decrement (subtract 1) from a value at an address or a register identified by the first operand.<br>
    The second operand is not used.
    </p>
    <br><hr><br>
    
    <p>
    <h4><a name="out">I - IN</a></h4>
    </p>
    <p>
    Input from a port in the second operand to an address or register in the first operand.<br>
    <br>
    <ul>
    <li>Port 1 is the Card Reader (an input devise);</li>
    <li>Port 2 is the Teleprinter (an input and output device).</li>
    </ul>
    <br>
    <br>
    The <strong>"Is Overflown"</strong> flag is set if not all characters could be read.
    </p>
    <br><hr><br>
    
    <p>
    <h4><a>O - OUT</a></h4>
    </p>
    <p>
    Output the data from the second operand to a port in the first operand.<br>
    <br>
    <ul>
    <li>Port 0 is the Printer (an output device);</li>
    <li>Port 2 is the Teleprinter (an input and output device).</li>
    </ul>
    <br>
    The <strong>"Is Overflown"</strong> flag is set if not all characters could be sent.
    </p>
</div>

</div> <!-- content -->

</div> <!-- columns -->

</div> <!-- pageContent -->

<?php $page->printBottom(); ?>

</main>

<script>
<?php $page->printHamburgerMenuScript(); ?>
</script>

</body>

</html>

