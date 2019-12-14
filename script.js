let folderRootUrl = "https://api.github.com/repos/hodgoong/hodgoong.github.io/git/trees/master";

(readFolder(folderRootUrl, function(res){
    JSON.parse(res).tree.forEach(function(item){
        if(item.path === "contents"){
            console.log(item.url);
            console.log("diving into contents folder....");
            console.log("===============================");
            readFolder(item.url, function(res){

                let counts = {
                    prod: 0,
                    proj: 0,
                    pub: 0,
                    max: function(){
                        return Math.max(this.prod, this.proj, this.pub);
                    }
                }

                JSON.parse(res).tree.forEach(function(item){
                    if(item.path.startsWith("prod_")){
                        counts.prod += 1;
                    }
                    else if(item.path.startsWith("proj_")){
                        counts.proj += 1;
                    }
                    else if(item.path.startsWith("pub_")){
                        counts.pub += 1;
                    }
                    loadMarkdown(item.path);
                });

                console.log(counts.max());
            });
        }
    });
}))()

function exportHtml(data, fileName) {

    let html = "";
    let cardId = "cardId_" + fileName;
    let contentId = "contentId_" + fileName;
    let arrByLines = data.split("\n");
    
    //collect first two lines and use it for preview
    if(arrByLines.length >= 3){
        html = createCard(arrByLines[0], arrByLines[1], cardId)
        //create html code for preview
        //let cardHtml = createCard(arrByLines[0], arrByLines[1])

        //collect rest lines to use it for main contents
        //window popup when clicked
        
        arrByLines.splice(0,2);
        let txtLines = "";
        arrByLines.forEach(function(line){
            txtLines += line + "\n";
        })
        html += createContent(txtLines, contentId);
        
        //create html code to wrap above html
        //to be hidden in the beginning and shown when clicked

        // html = cardHtml + popupHtml;

        // need to create html to show preview 
        // and the actual contents when clicked  
    }
    else if(arrByLines.length == 2){
        html = createCard(arrByLines[0], arrByLines[1], cardId)
    }
    else{
        html = createCard(arrByLines[0],"",cardId)
    }
    console.log(html);

    return html;
}

function loadMarkdown(fileName){
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "https://hodgoong.github.io/contents/" + fileName, true);
    xhr.send(null);

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                if(fileName.endsWith(".md")){
                    fileName = fileName.replace(".md","");
                }

                //fileName is Id for HTML card element

                let html = exportHtml(xhr.responseText, fileName);
                if(fileName.endsWith(".md")){
                    fileName = fileName.replace(".md","");
                }

                let x = document.createElement("div"); 
                x.id = fileName;
                x.innerHTML = html;

                if(fileName.startsWith("prod_")){
                    document.getElementById("products").appendChild(x);
                }
                else if(fileName.startsWith("proj_")){
                    document.getElementById("projects").appendChild(x);
                }
                else if(fileName.startsWith("pub_")){
                    document.getElementById("publications").appendChild(x);
                }
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

function createCard(title, img="", id){
    let cardHtml =         
    `
    <div class="microcard" id=${id} onClick="switcher(this.id, false)">
        <div class="microcard-img">
            <img src="${img}">
        </div>
        <div class="microcard-text">
            <a class="title">${title}</a>
            <p class="description"> lorem ipsum lorem ipsum </p>
        </div>
    </div>
    `
    // add code to create contents tag
    // make it hidden as default and show when card is clicked

    return cardHtml;
}

function createContent(contents, id){
    let converter = new showdown.Converter();
    let convertedHtml = converter.makeHtml(contents)
    let contentHtml=
    `
    <div class="contents-popup">
        <div class="contents" id="${id}" onscroll="scroll()">
            <a id="${id+"_button"}" onClick="switcher(this.id,true)" style="position:fixed;top:10px;right:10px">X</a>`
            + convertedHtml + `
        </div>
    </div>
    `
    return contentHtml;
}

function switcher(id, openState){
    if(!openState){
        if(id.startsWith("cardId_")){
            let contentId = id.replace("cardId_","contentId_");
            if(document.getElementById(contentId)){
                document.getElementById(contentId).style.display = "inline";
                document.getElementById(contentId).style.overflowY="scroll";
                document.body.style.overflow="hidden";
            }
        }
    }
    
    if(openState){
        if(id.startsWith("contentId_") && id.endsWith("_button")){
            let contentId = id.replace("_button","");
            if(document.getElementById(contentId)){
                document.getElementById(contentId).style.display = "none";
                document.getElementById(contentId).style.overflowY="hidden";
                document.body.style.overflow="initial";
            }
        }
    }
}