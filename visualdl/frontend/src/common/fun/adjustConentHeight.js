const adjustConentHeight = function () {
    let elContentContainer = document.getElementById('content-container');
    let contentHeight = window.innerHeight - 140;
    elContentContainer.style.minHeight = contentHeight + 'px';
};

const resizeContentHeightWhenScroll = function () {
    window.addEventListener('resize', () => {
        adjustConentHeight();
    });
};

export const resizeContentHeight = function () {
    adjustConentHeight();
    resizeContentHeightWhenScroll();
};
