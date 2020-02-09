let folderRootUrl = 'https://api.github.com/repos/hodgoong/hodgoong.github.io/git/trees/master';

// document.addEventListener('DOMContentLoaded', function() {
//     alert("Ready!");
// }, false);

(init())();

function init(){
    if(location.hash !== ''){
        location.hash=''
    }
    readFolder(folderRootUrl, searchTree);

}

// Handle ESC key (key code 27)
// document.addEventListener('keyup', function(e) {
//     if (e.keyCode === 27 && location.hash === 'popup-open') {
//         switcher(this.id);
//     }
// });

function makeHashDefault(){
    console.log('hi');
    if(location.hash !== ''){
        location.hash='';
    }
}

function searchTree(res){
    JSON.parse(res).tree.forEach(function(item){
        if(item.path === 'contents'){
            // console.log(item.url);
            // console.log('diving into contents folder....');
            // console.log('===============================');

            readFolder(item.url, function(res){
                // let counts = {
                //     prod: 0,
                //     proj: 0,
                //     pub: 0,
                //     max: function(){
                //         return Math.max(this.prod, this.proj, this.pub);
                //     }
                // }

                JSON.parse(res).tree.forEach(function(item){
                    // if(item.path.startsWith('prod_')){
                    //     counts.prod += 1;
                    // }
                    // else if(item.path.startsWith('proj_')){
                    //     counts.proj += 1;
                    // }
                    // else if(item.path.startsWith('pub_')){
                    //     counts.pub += 1;
                    // }
                    loadMarkdown(item.path);
                });
            });
        }
    });
}

function exportHtml(data, fileName) {
    let html = '';
    let cardId = 'cardId_' + fileName;
    let contentId = 'contentId_' + fileName;

    if(!data.length > 0){
        return html;
    }

    let arrByLines = data.split('\n');
    
    //collect first two lines and use it for the preview
    if(arrByLines.length >= 4){
        //input: title, image URL, description, id
        html = createCard(arrByLines[0], arrByLines[1], arrByLines[2], cardId)

        //collect rest of the lines to use it as a 
        //main content for the popup window when clicked 
        arrByLines.splice(0,3);
        let txtLines = '';
        arrByLines.forEach(function(line){
            txtLines += line + '\n';
        })
        // html += createContent(txtLines, contentId);
        createContent(txtLines, contentId);
        // document.getElementById('container-contents').appendChild(contentHtml);
    }
    else if(arrByLines.length == 3){
        html = createCard(arrByLines[0], arrByLines[1], arrByLines[2], cardId);
    }
    else if(arrByLines.length == 2){
        html = createCard(arrByLines[0],arrByLines[1], '', cardId);
    }
    else{
        html = createCard(arrByLines[0],'', '', cardId);
    }
        
    return html;
}

function loadMarkdown(fileName){
    let xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://hodgoong.github.io/contents/' + fileName, true);
    xhr.send(null);

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                if(fileName.endsWith('.md')){
                    fileName = fileName.replace('.md','');
                }

                //fileName is an id for the HTML card and content element
                let html = exportHtml(xhr.responseText, fileName);
                if(fileName.endsWith('.md')){
                    fileName = fileName.replace('.md','');
                }

                let x = document.createElement('div'); 
                x.id = fileName;
                x.className = 'card-container';
                x.innerHTML = html;

                let tag = document.createElement('div');

                if(fileName.startsWith('prod_')){
                    tag.className = 'tag tag-prod';
                    tag.innerHTML = 'product';
                } else if(fileName.startsWith('proj_')){
                    tag.className = "tag tag-proj";
                    tag.innerHTML = 'project';
                } else if(fileName.startsWith('pub_')){
                    tag.className = "tag tag-pub";
                    tag.innerHTML = 'publication';
                }

                x.appendChild(tag);
                document.getElementById('products').appendChild(x);
            }
        }
    }
}

// read github folder structure
function readFolder(url, fn){
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url , true);
    xhr.send(null);

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                fn(xhr.response);
            }
        }
    }
}

function createDummyCard(num){
    let x = document.createElement('div'); 
    x.className ='dummycard';

    for(i=0; i<num; i++){
        document.getElementById('products').appendChild(x);
        document.getElementById('projects').appendChild(x);
        document.getElementById('publications').appendChild(x);
    }
}

function createCard(title, img='', desc='', id){
    let cardHtml =         
    `
    <div class='microcard' id=${id} onClick='switcher(this.id, false)'>
        <div class='microcard-img'>
            <img src='${img}'>
        </div>
        <div class='microcard-text'>
            <a class='title'>${title}</a>
            <p class='description'> ${desc} </p>
        </div>
    </div>
    `

    return cardHtml;
}

// creates content(hidden as default) html
function createContent(contents, id){
    let converter = new showdown.Converter();
    let convertedHtml = converter.makeHtml(contents)
    // let contentHtml=
    // `
    // <div class='contents-popup'>
    //     <div class='contents' id='${id}' onscroll='scroll()'>
    //         <a class='x' id='${id + '_button'}' onClick='switcher(this.id,true)'>close</a>`
    //         + convertedHtml + `
    //     </div>
    // </div>
    // `

    let contentHtml=
    `
    <div class='contents' id='${id}' onscroll='scroll()'>
        <a class='x' id='${id + '_button'}' onClick='switcher(this.id,true)'>close</a>`
        + convertedHtml + `
    </div>
    `

    let x = document.createElement('div'); 
    x.className = 'contents-popup';
    x.innerHTML = contentHtml;

    document.getElementById('container-contents').appendChild(x);
    // return contentHtml;
}

// controls content popup
function switcher(id){
    if(location.hash !== '#popup-open'){
        if(id.startsWith('cardId_')){
            let contentId = id.replace('cardId_','contentId_');
            if(document.getElementById(contentId)){
                document.getElementById(contentId).style.display = 'inline';
                document.getElementById(contentId).style.overflowY='scroll';
                document.body.style.overflowY='hidden';
                location.hash = '#popup-open';
            }
        }
    }
    
    if(location.hash === '#popup-open'){
        if(id.startsWith('contentId_') && id.endsWith('_button')){
            let contentId = id.replace('_button','');
            if(document.getElementById(contentId)){
                document.getElementById(contentId).style.display = 'none';
                document.getElementById(contentId).style.overflowY='hidden';
                document.body.style.overflow='initial';
                location.hash = '';
            }
        }
    }
}