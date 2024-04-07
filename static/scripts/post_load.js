var initialLoad = false
var modal
window.onclick = function(e) {
  if (e.target == modal) {
    closeModal(modal)
  }
}
window.onload = function() {
  modal = dquery("#commentsModal")
  const wrapper = document.querySelector("#contentContainer")
  makeRequest("/api/post?id="+id)
    .then(data => {
      wrapper.append(renderReel(data))
      dquery("#loadingScreen").style.display = "none"
    })
}