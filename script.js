function export_html(data) {
    let converter = new showdown.Converter();
    let html = converter.makeHtml(data);

    return html;
}

function loadMDs(file){
	var txtFile = new XMLHttpRequest();
    txtFile.open("GET", "https://hodgoong.github.io/" + file , true);
    txtFile.onreadystatechange = function() {
        if (txtFile.readyState === 4) { // Makes sure the document is ready to parse.
            if (txtFile.status === 200) { // Makes sure the file exists.
                allText = txtFile.responseText;
                //lines = txtFile.responseText.split("\n"); // Will separate each line into an array
                //var customTextElement2 = document.getElementById('f0');
                //customTextElement2.innerHTML = txtFile.responseText;

	            var reader = new commonmark.Parser();
                var writer = new commonmark.HtmlRenderer();
                var parsed = reader.parse(txtFile.responseText); // parsed is a 'Node' tree
                // transform parsed if you like...
                var result = writer.render(parsed); // result is a String

                // hypeDocument.getElementById(box).innerHTML = result

                return result;
            }
        }
    }
}

let result = export_html(loadMDs("content.md"));
console.log(result);