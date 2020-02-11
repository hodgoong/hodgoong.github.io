let folderRootUrl = 'https://api.github.com/repos/hodgoong/hodgoong.github.io/git/trees/master';

/**
 * To close the content popup when ESC key is pressed. Handle ESC key (key code 27)
 */
// document.addEventListener('keyup', function(e) {
//     if (e.keyCode === 27 && location.hash === 'popup-open') {
//         switcher(this.id);
//     }
// });

(init())();

function init(){
    if(location.hash !== ''){
        location.hash=''
    }
    readFolder(folderRootUrl, searchTree);
}

/**
 * To search the folder structure of 'contents' folder in the github repo
 * @param {string} res - HTTP response
 */
function searchTree(res){
    JSON.parse(res).tree.forEach(function(item){
        if(item.path === 'contents'){
            readFolder(item.url, function(res){
                JSON.parse(res).tree.forEach(function(item){
                    loadMarkdown(item.path);
                });
            });
        }
    });
}

/**
 * To identify how many lines that loaded markdown has,
 * and create contents popup or not based on it
 * @param {*} data - loaded makrdown data
 * @param {*} fileName - markdown file name
 */
function exportHtml(data, fileName) {
    let html = '';
    let cardId = 'cardId_' + fileName;
    let contentId = 'contentId_' + fileName;

    if(!data.length > 0){
        return html;
    }

    let arrByLines = data.split('\n');
    let arrTitle = arrByLines[0];
    let arrImgURL = arrByLines[1];
    let arrDesc = arrByLines[2];
    
    //collect first two lines and use it for the preview
    if(arrByLines.length >= 4){
        html = createCard(arrTitle, arrImgURL, arrDesc, cardId)

        //collect rest of the lines to use it as a 
        //main content for the popup window when clicked 
        arrByLines.splice(0,3);
        let txtLines = '';
        arrByLines.forEach(function(line){
            txtLines += line + '\n';
        })
        createContent(txtLines, contentId, arrImgURL);
    }
    else if(arrByLines.length == 3){
        html = createCard(arrTitle, arrImgURL, arrDesc, cardId);
    }
    else if(arrByLines.length == 2){
        html = createCard(arrTitle,arrImgURL, '', cardId);
    }
    else{
        html = createCard(arrTitle,'', '', cardId);
    }
        
    return html;
}

/**
 * To load markdown and append the output HTML to the index.html
 * @param {string} fileName - markdown file name stored in the github repo
 */
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

/**
 * To read folder structure of github repo
 * @param {string} url - url to the github repo
 * @param {string} fn - callback function
 */
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

/**
 * Create HTML for the card displayed on the main page
 * @param {string} title - card title
 * @param {string} img - url indicating image file location
 * @param {string} desc - content description displayed on the card
 * @param {string} id - card id
 */
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

/**
 * Create HTML for the contents displayed when card is clicked
 * @param {string} contents - contents described in markdown format
 * @param {string} id - card id
 */
function createContent(contents, id, img){
    let converter = new showdown.Converter();
    let convertedHtml = converter.makeHtml(contents)
    let contentHtml=
    `
    <div class='contents' id='${id}' onscroll='scroll()'>
        <div class='contents-header'>
            <img src='${img}'>
        </div>
        <a class='x' id='${id + '_button'}' onClick='switcher(this.id,true)'>X</a>
        <div class='contents-body'>
            `+ convertedHtml + `
        </div>
    </div>
    `

    let x = document.createElement('div'); 
    x.className = 'contents-popup';
    x.innerHTML = contentHtml;

    document.getElementById('container-contents').appendChild(x);
}

/**
 * Change the web-browser hash to identify shown-hidden state of the content popup
 * @param {string} id - card id
 */
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