let folderRootUrl = "https://api.github.com/repos/hodgoong/hodgoong.github.io/git/trees/master";

// function exportHtml(data) {
//     let converter = new showdown.Converter();
//     let html = converter.makeHtml(data);

//     return html;
// }

// function loadMarkdown(fileLoc, divId){
//     let res = xhrGet("https://hodgoong.github.io/"+fileLoc);
//     let html = exportHtml(res.responseText);
//     document.getElementById(divId).innerHTML = html;
// }


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

loadFolder(folderRootUrl, function(res){
    JSON.parse(res).tree.forEach(function(item){
        if(item.path === "contents"){
            console.log(item.url);
            console.log("going deeper..");
            console.log("");
            loadFolder(item.url, function(res){

                let mds = [];
                JSON.parse(res).tree.forEach(function(item){
                    markDownUrls.push(
                        {
                            path: item.tree.path,
                            url: item.tree.url
                        });
                });

                console.log(mds);
            });
        }
    });
});

// github api tree를 부를 수 있는 것이 한달에 5000번으로 제한되어 있다고 함 (확인 필요 --> 1시간에 5000번)
// 따라서, 월 5000명 이하로 방문한다고 가정한다면 할 때 tree를 한 번 불러서 cache에 저장하는 것이 유리
// 만약 월 5000명 이상을 예상한다면 html파일 안에 md 파일 형식으로 작성을 한 후 
// html을 불러와서 md를 변환하는 방법도 고려
// html에서 relative path로 md 읽는 방법이 있나?
// https://www.geeksforgeeks.org/how-to-redirect-to-a-relative-url-in-javascript/
/**
 * <!DOCTYPE html> 
<html> 
<head> 
  <script> 
    function newLocation() { 
        document.location.href="page.html"; 
    } 
  </script> 
</head> 
<body> 
  <input type="button" value="Go to new location" onclick="newLocation()"> 
</body> 
</html> 
 */

/**
 *  xhr.open("GET", "https://api.github.com/repos/hodgoong/hodgoong.github.io/git/trees/master" , true);
    xhr.send(null);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {

                let result = JSON.parse(xhr.response);
                console.log(result.tree);
				let url = result.tree.forEach(function(item){
					console.log(item.path);
					if(item.path === "contents"){
						console.log(item.url);
						xhr.open("GET", item.url, true);
						xhr.send(null);
				    	xhr.onreadystatechange = function() {
        					if (xhr.readyState === 4) {
            				if (xhr.status === 200) {		
								let r = JSON.parse(xhr.response);
								console.log(r);
                            }
                        }
					}
				}})
				console.log(url);
            }
        }
    }
 * 
 */
/**
 * Response Example:
 * 
 * {
  "sha": "4727c573fb3078b0c6678dc22d07cd4aab9ab77c",
  "url": "https://api.github.com/repos/hodgoong/hodgoong.github.io/git/trees/4727c573fb3078b0c6678dc22d07cd4aab9ab77c",
  "tree": [
    {
      "path": ".gitignore",
      "mode": "100644",
      "type": "blob",
      "sha": "c053907399408106661b54afc9228d709a0738d9",
      "size": 41,
      "url": "https://api.github.com/repos/hodgoong/hodgoong.github.io/git/blobs/c053907399408106661b54afc9228d709a0738d9"
    },
    {
      "path": "README.md",
      "mode": "100644",
      "type": "blob",
      "sha": "7b617e3c22246d136e954bb8e61543aae786b11f",
      "size": 21,
      "url": "https://api.github.com/repos/hodgoong/hodgoong.github.io/git/blobs/7b617e3c22246d136e954bb8e61543aae786b11f"
    },
    {
      "path": "content.md",
      "mode": "100644",
      "type": "blob",
      "sha": "28b44ad58809af27ea5739c9daafcbfd8098340c",
      "size": 96,
      "url": "https://api.github.com/repos/hodgoong/hodgoong.github.io/git/blobs/28b44ad58809af27ea5739c9daafcbfd8098340c"
    },
    {
      "path": "contents",
      "mode": "040000",
      "type": "tree",
      "sha": "b8d56aa3122f28114e7c9e13b0aafe7530321ef8",
      "url": "https://api.github.com/repos/hodgoong/hodgoong.github.io/git/trees/b8d56aa3122f28114e7c9e13b0aafe7530321ef8"
    },
    {
      "path": "index.html",
      "mode": "100644",
      "type": "blob",
      "sha": "528bfce2fab43f9533deb3338383bbcdd2f35b93",
      "size": 759,
      "url": "https://api.github.com/repos/hodgoong/hodgoong.github.io/git/blobs/528bfce2fab43f9533deb3338383bbcdd2f35b93"
    },
    {
      "path": "script.js",
      "mode": "100644",
      "type": "blob",
      "sha": "690b1ba488a33b9d7f01af47dedd525b584c4fb7",
      "size": 1100,
      "url": "https://api.github.com/repos/hodgoong/hodgoong.github.io/git/blobs/690b1ba488a33b9d7f01af47dedd525b584c4fb7"
    }
  ],
  "truncated": false
}
 */