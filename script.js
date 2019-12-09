function exportHtml(data) {
    let converter = new showdown.Converter();
    let html = converter.makeHtml(data);

    return html;
}

function loadMarkdown(fileLoc, divId){
	var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://hodgoong.github.io/" + fileLoc , true);
    xhr.send(null);

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                let html = exportHtml(xhr.responseText);
                document.getElementById(divId).innerHTML = html;
            }
        }
    }
}