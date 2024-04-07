
var cursor = 0;
var initialLoad = false
var modal
var commentsContainer
var currentScreen = 0
var cursor
var currentReel
var loading = false
window.onclick = function(e) {
  if (e.target == modal) {
    closeModal(modal)
  }
}
window.onload = async function() {
  commentsContainer = dquery("#commentsContainer")
  modal = dquery('#commentsModal')
  const wrapper = dquery("#contentContainer")

  makeRequest("/api/fetch")
    .then(data => {
      data.data.forEach(function(item) {
        wrapper.append(renderReel(item))
      })
      cursor += 5
    })
  wrapper.addEventListener('scroll', function() {
    commentsContainer.innerHTML = ""
    const scrollPosition = wrapper.scrollTop;
    const childWidth = wrapper.children[0].offsetWidth;
    currentScreen = Math.round(scrollPosition / childWidth)
    if (isScrolledToBottom(this) && cursor) {
      makeRequest("/api/fetch")
        .then(data => {
          data.data.forEach(function(item) {
            wrapper.append(renderReel(item))
          })
          cursor += 5
        })
    }
  });

  commentsContainer.addEventListener('scroll', function() {
    if (isScrolledToBottom(commentsContainer) && cursor && !loading) {
      loading = true
      makeRequest(`/api/comments?id=${currentReel}&cursor=${cursor}`)
        .then(data => {
          data.data.forEach(function(item) {
            commentsContainer.append(renderComment(item))
          })
          cursor = data.cursor
          loading = false
        })
    }
  });
}