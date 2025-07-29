// General Character Categories
let GeneralCategories = new Map([
    ["Lu", {Name: "Uppercase Letter", CharacterType: "Graphic Character"}],
    ["Ll", {Name: "Lowercase Letter", CharacterType: "Graphic Character"}],
    ["Lt", {Name: "Titlecase Letter", CharacterType: "Graphic Character"}],
    ["Lm", {Name: "Modifier Letter", CharacterType: "Graphic Character"}],
    ["Lo", {Name: "Other Letter", CharacterType: "Graphic Character", Description: "Ideographs and Letters from unicase Alphabets"}],
    
    ["Mn", {Name: "Non Spacing Mark", CharacterType: "Graphic Character"}],
    ["Mc", {Name: "Combining Spacing Mark", CharacterType: "Graphic Character"}],
    ["Me", {Name: "Enclosing Mark", CharacterType: "Graphic Character"}],
    
    ["Nd", {Name: "Number, Decimal Digit", CharacterType: "Graphic Character"}],
    ["Nl", {Name: "Number, Letter", CharacterType: "Graphic Character"}],
    ["No", {Name: "Number, Other", CharacterType: "Graphic Character"}],
    
    ["Pc", {Name: "Connector Punctuation", CharacterType: "Graphic Character", Description: "Word Characters for regex"}],
    ["Pd", {Name: "Dash Punctuation", CharacterType: "Graphic Character"}],
    ["Ps", {Name: "Start Punctuation", CharacterType: "Graphic Character", Description: "Opening Brackets"}],
    ["Pe", {Name: "End Punctuation", CharacterType: "Graphic Character", Description: "Closing Brackets"}],
    ["Pi", {Name: "Initial Quotation Mark", CharacterType: "Graphic Character", Description: "Opening Quotation Marks"}],
    ["Pf", {Name: "Final Quotation Mark", CharacterType: "Graphic Character", Description: "Closing Quotation Marks"}],
    ["Po", {Name: "Other Punctuation", CharacterType: "Graphic Character"}],
    
    ["Sm", {Name: "Math Symbol", CharacterType: "Graphic Character"}],
    ["Sc", {Name: "Currency Symbol", CharacterType: "Graphic Character"}],
    ["Sk", {Name: "Modifier Symbol", CharacterType: "Graphic Character"}],
    ["So", {Name: "Other Symbol", CharacterType: "Graphic Character"}],
    
    ["Zs", {Name: "Space Separator", CharacterType: "Graphic Character (not Visible)"}],
    ["Zl", {Name: "Line Separator", CharacterType: "Format Character"}],
    ["Zp", {Name: "Paragraph Separator", CharacterType: "Format Character"}],
    
    ["Cc", {Name: "Other, Control", CharacterType: "Control Character"}],
    ["Cf", {Name: "Other, Format", CharacterType: "Format Character"}],
    ["Cs", {Name: "Other, Surrogate", CharacterType: "UTF-16 Surrogate"}],
    ["Co", {Name: "Other, Private Use", CharacterType: "Ignorable Character"}],
    ["Cn", {Name: "Other, Not Assigned", CharacterType: "Non-Character"}],
    
]);
