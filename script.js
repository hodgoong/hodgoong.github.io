let folderRootUrl = "https://api.github.com/repos/hodgoong/hodgoong.github.io/git/trees/master";

(loadFolder(folderRootUrl, function(res){
    JSON.parse(res).tree.forEach(function(item){
        if(item.path === "contents"){
            console.log(item.url);
            console.log("going deeper..");
            console.log("");
            loadFolder(item.url, function(res){

                let mds = [];
                let prodsCount = 0;
                let projsCount = 0;
                let pubsCount = 0;

                JSON.parse(res).tree.forEach(function(item){
                    if(item.path.startsWith("prod_")){
                        prodsCount += 1;
                    }
                    if(item.path.startsWith("proj_")){
                        projsCount += 1;
                    }
                    if(item.path.startsWith("pub_")){
                        pubsCount += 1;
                    }
                    loadMarkdown(item.path);
                });

                console.log("prods:" + prodsCount);
                console.log("projs:" + projsCount);
                console.log("pubs:" + pubsCount);
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
    xhr.open("GET", "https://hodgoong.github.io/contents/"+fileName, true);
    xhr.send(null);

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                let html = exportHtml(xhr.responseText);
                document.getElementById(fileName).innerHTML = html;
            }
        }
    }
}

function loadFolder(url, fn){
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