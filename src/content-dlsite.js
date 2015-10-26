
function getItem() {
    if( document.querySelector('h1#work_name') ) { // is a dlsite item page
        var title = document.querySelector('h1#work_name a').textContent;
        var brand = document.querySelector('*[itemprop="brand"]').textContent;
        var id = document.querySelector('.work_spec_list dd').textContent;
        var genresList = document.querySelectorAll('.work_genre a');
        var sellday = document.querySelector("#work_outline td").textContent.split(/[年月日]/).join("-").replace(/-$/, '');
        var genres = [];
        for(var i = 0; i < genresList.length; i++) {
            genres.push(genresList[i].textContent);
        }
        return {
            id: id,
            title: title,
            brand: brand,
            genres: genres,
            sellday: sellday,
        };
    }
}

function getType(genres) {
    var type = "";
    
    if( genres.indexOf("18禁") != -1 )
        type += '18禁';
    if( genres.indexOf('音声作品') != -1 ) {
        type += '音声作品';
    } else if( genres.indexOf('動画作品') != -1 ) {
        type += '動画作品';
    } else if( genres.indexOf('マンガ') != -1 ) {
        type += 'マンガ';
    } else if( genres.indexOf('ノベル') != -1 ) {
        type += 'ノベル';
    } else {
        type += 'ゲーム';
    }
    return type;
}

function isDoujinn(genres) {
    if( genres.indexOf("同人ソフト") != -1 || genres.indexOf("同人ゲーム") != -1 ) {
        return true;
    }
}

(function() {
    var item = getItem();
    if( item ) {
        var parent = document.querySelector('#topicpath');
        var itemNameElement = document.createElement('input');
        itemNameElement.setAttribute('type', 'text');
        itemNameElement.style.marginLeft = '20px';
        itemNameElement.style.width = '500px';
        itemNameElement.value = '(' + getType(item.genres) +')'
            + (isDoujinn(item.genres) ? '(同人)' : '')
            + '[' + item.sellday.substr(2).replace(/-/g, '') + ']'
            + '[' + item.id + ']'
            + '[' + item.brand + ']'
            + item.title;
        itemNameElement.onfocus = function() {
            this.select();
        };
        parent.appendChild(itemNameElement);
    }  
})();

