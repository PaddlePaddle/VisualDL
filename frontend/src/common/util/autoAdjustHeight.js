export default function autoAdjustHeight() {
  // compute the container height
  let containerHeight = window.innerHeight - 64;
  let containerLeftEl = document.getElementsByClassName('visual-dl-page-left')[0];
  let containerRightEl = document.getElementsByClassName('visual-dl-page-right')[0];
  containerLeftEl.style.height = containerHeight + 'px';
  containerRightEl.style.height = containerHeight + 'px';
  window.addEventListener('resize', () => {
    let containerHeight = window.innerHeight - 64;
    containerLeftEl.style.height = containerHeight + 'px';
    containerRightEl.style.height = containerHeight + 'px';
  });
}
