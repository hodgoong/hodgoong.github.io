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

function exportHtml(data) {
    let converter = new showdown.Converter();
    let html = "";
    let arrByLines = data.split("\n");
    
    //collect first two lines and use it for preview
    if(arrByLines.length >= 3){
        html = createCard(arrByLines[0], arrByLines[1])
        //create html code for preview
        // let cardHtml = createCard(arrByLines[0], arrByLines[1])

        //collect rest lines to use it for main contents
        //window popup when clicked
        // arrByLines.splice(0,2);
        // let txtLines = "";
        // arrByLines.forEach(function(line){
        //     txtLines += line + "\n";
        // })
        // let popupHtml = converter.makeHtml(txtLines)

        //create html code to wrap above html
        //to be hidden in the beginning and shown when clicked

        // html = cardHtml + popupHtml;

        // need to create html to show preview 
        // and the actual contents when clicked  
    }
    else if(arrByLines.length == 2){
        // let previewTitle = converter.makeHtml(arrByLines[0]);
        // let previewImage = converter.makeHtml(arrByLines[1]);

        // html = createCard(previewTitle, previewImage)
        html = createCard(arrByLines[0], arrByLines[1])
    }
    else{
        // let previewTitle = converter.makeHtml(arrByLines[0]);
        html = createCard(arrByLines[0])
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
                let html = exportHtml(xhr.responseText);
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

function createCard(title, img="", contents = ""){
    let cardHtml =         
    `
    <div class="card">
        <a>` + title + `</a>
        <img src="`+ img +`">        
    </div>
    `

    return cardHtml;
}