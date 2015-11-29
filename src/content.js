
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

// window.getSelection().getRangeAt(0).startContainer.parentNode.textContent.trim()