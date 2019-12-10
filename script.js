let folderRootUrl = "https://api.github.com/repos/hodgoong/hodgoong.github.io/git/trees/master";
let counts = {
    prod: 0,
    proj: 0,
    pub: 0
}

(readFolder(folderRootUrl, function(res){
    JSON.parse(res).tree.forEach(function(item){
        if(item.path === "contents"){
            console.log(item.url);
            console.log("diving into contents folder....");
            console.log("===============================");
            readFolder(item.url, function(res){

                JSON.parse(res).tree.forEach(function(item){
                    if(item.path.startsWith("prod_")){
                        counts.prod += 1;
                    }
                    if(item.path.startsWith("proj_")){
                        counts.proj += 1;
                    }
                    if(item.path.startsWith("pub_")){
                        counts.pub += 1;
                    }
                    loadMarkdown(item.path);
                });

                console.log(counts);
            });
        }
    });
}))()

function exportHtml(data) {
    let converter = new showdown.Converter();
    let html = converter.makeHtml(data);

    return html;
}

function loadMarkdown(fileName){
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "https://hodgoong.github.io/contents/" + fileName, true);
    xhr.send(null);

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                let html = exportHtml(xhr.responseText);
                if(fileName.endsWith(".md")){
                    fileName = fileName.replace(".md","");
                }
                document.getElementById(fileName).innerHTML = html;
            }
        }
    }
}

function readFolder(url, fn){
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url , true);
    xhr.send(null);

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                fn(xhr.response);
            }
        }
    }
}