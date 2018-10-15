
document.addEventListener('selectionchange', function() {
    var selection = window.getSelection();
    if( selection ) {
        var msg = {
            request: 'updateContextMenu',
            selection: selection.toString(),
        };
        if (selection.rangeCount > 0) {
            var node = selection.getRangeAt(0).startContainer.parentNode;
            if( node.tagName.toLowerCase() == 'a' )
                node = node.parentNode;
            msg.context = node.textContent.trim();
        }
        chrome.runtime.sendMessage(msg);
    }
});


window.addEventListener('click', (e) => {
    let i = 0, el = e.target;
    while( el && el.tagName != 'A' && i++ < 3 ) {
        el = el.parentNode;
    }
    if( el && el.tagName == "A" && el.href ) {
        
    }
});

// window.getSelection().getRangeAt(0).startContainer.parentNode.textContent.trim()