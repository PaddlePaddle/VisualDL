
export const dragMovelHandler = (event, callback) => {
  let target = event.target;
  // keep the dragged position in the data-x/data-y attributes
  let x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
  let y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
  callback(target, x, y);
};

export const tansformElement = (target, x, y) => {
  // translate the element
  target.style.webkitTransform = target.style.transform
    = 'translate(' + x + 'px, ' + y + 'px)';
  // update the posiion attributes
  target.setAttribute('data-x', x);
  target.setAttribute('data-y', y);
};

export const relativeMove = ({triggerEl, x, y}, relativeEl) => {
  let {offsetWidth: tWidth, offsetHeight: tHeight} = triggerEl;
  let {offsetWidth: rWidth, offsetHeight: rHeight} = relativeEl;

  let rX = (x / tWidth) * rWidth;
  let rY = (y / tHeight) * rHeight;

  tansformElement(relativeEl, -rX, -rY);
};
