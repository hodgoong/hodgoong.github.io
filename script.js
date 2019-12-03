function export_html(data) {
    let converter = new showdown.Converter();
    let html = converter.makeHtml(data);

    return html;
}

function loadMDs(file){
	var txtFile = new XMLHttpRequest();
    txtFile.open("GET", "https://hodgoong.github.io/" + file , true);
    txtFile.send(null);
    txtFile.onreadystatechange = function() {
        if (txtFile.readyState === 4) { // Makes sure the document is ready to parse.
            if (txtFile.status === 200) { // Makes sure the file exists.
                allText = txtFile.responseText;
                let html = export_html(txtFile.responseText);
                console.log(html);
                document.getElementById('mainView').innerHTML = html;
            }
        }
    }
}