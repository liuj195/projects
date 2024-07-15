export default class FullScreen {
  /**
   * FULLSCREEN FUNCTIONS
   */

  static closeContextMenu = () => {
    let contextMenuArr = document.getElementsByClassName(
      "cy-context-menus-cxt-menu"
    );
    for (let i = 0; i < contextMenuArr.length; i++) {
      contextMenuArr[i].style.display = "none";
    }
  };
  static closeFullscreen = () => {
    FullScreen.closeContextMenu();
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      /* Firefox */
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      /* Chrome, Safari and Opera */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      /* IE/Edge */
      document.msExitFullscreen();
    }
  };

  static openFullscreen = elem => {
    FullScreen.closeContextMenu();
    let cyDiv = document.getElementById("cy");
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      /* Firefox */
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      /* Chrome, Safari and Opera */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      /* IE/Edge */
      elem.msRequestFullscreen();
    }
    cyDiv.style.height = "100%";
    //remove loader from full screen environment and re-attach to regular environment
  };

  static getFullScreen = () => {
    if (
      document.fullscreenElement ||
      document.msFullscreenElement ||
      document.webkitIsFullScreen ||
      document.fullscreenElement
    ) {
      return true;
    } else {
      return false;
    }
    //append loader to full screen environment
  };
}
