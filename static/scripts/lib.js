function isScrolledToBottom(element) {
  return Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 10
}

function dquery(selector) {
  return document.querySelector(selector)
}

function dcreate(selector, classname=null) {
  const e = document.createElement(selector)
  if (classname) {
    e.className = classname
  }
  return e
}

async function makeRequest(url) {
  const a = await fetch(url)
  const b = await a.json()
  return b
}

function renderPost(item) {
  const e = dcreate("div", "post")
  const postSection1 = dcreate("div", "post-section post-header centered-vertically")
  const postSection2 = dcreate("div", "post-section centered-children")
  const postSection3 = dcreate("div", "post-section post-header centered-vertically")
  const authorIcon = dcreate("img", "post-author-icon")
  const authorName = dcreate("a", "post-author-name")
  const postContent = dcreate("img", "post-content")
  const viewInstagram = dcreate("a")
  const spacer = dcreate("div", "spacer")
  const viewComments = dcreate("a")
  authorIcon.src = `/proxy?url=${btoa(item.author.profile)}`
  authorName.innerHTML = item.author.name
  authorName.href = "https://www.instagram.com/"+item.author.id
  postSection1.append(authorIcon, authorName)
  postContent.src = `/proxy?url=${btoa(item.content)}`
  postSection2.append(postContent)
  viewInstagram.href = "https://www.instagram.com/p/"+item.id
  viewInstagram.innerHTML = "View on Instagram"
  viewComments.innerHTML = "View Comments"
  viewComments.href = `/p/${item.id}`
  spacer.innerHTML = "•"
  postSection3.append(viewInstagram, spacer, viewComments)
  e.append(postSection1, postSection2, postSection3)
  return e
}

function renderReel(item) {
  const e = dcreate("div", "reel centered-children")
  const reelVideo = dcreate("video", "video-thumbnail reel-content")
  const reelContent = dcreate("img", "reel-content")
  const reelSource = dcreate("source")
  const detailsContainer = dcreate("div", "details-container centered-vertically")
  const reelAuthorIcon = dcreate("img", "post-author-icon")
  const reelAuthorName = dcreate("a", "post-author-name")
  const extrasContainer = dcreate("div", "extras-container")
  const textContainer = dcreate("div", "text-container centered-vertically")
  const voi = dcreate("a")
  const vc = dcreate("a")
  const spacer = dcreate("div", "spacer")
  const volumeButton = dcreate("img", "volume-button")
  volumeButton.onclick = function() {
    if (reelVideo.muted) {
      reelVideo.muted = false
      volumeButton.src = "/static/assets/icon_volume.png"
    } else {
      reelVideo.muted = true
      volumeButton.src = "/static/assets/icon_mute.png"
    }
  }
  volumeButton.src = "/static/assets/icon_mute.png"
  voi.innerHTML = "Instagram"
  vc.innerHTML = "Comments"
  voi.href = "https://instagram.com/p/"+item.id
  spacer.innerHTML = "•"
  vc.style.cursor = "pointer"
  vc.onclick = function() {
    if (modal.style.display == 'none') {
      openModal(modal)
      if (commentsContainer.innerHTML == "") {
        currentReel = item.id
        commentsContainer.innerHTML = "Loading..."
        makeRequest("/api/comments?id="+item.id)
          .then(data => {
            commentsContainer.innerHTML = ""
            cursor = data.cursor
            data.data.forEach(function(item) {
              commentsContainer.append(renderComment(item))
            })
          })
      }
    } else {
      closeModal(modal)
    }
  }
  textContainer.append(voi, spacer, vc)
  extrasContainer.append(textContainer)
  reelAuthorIcon.src = `/proxy?url=${btoa(item.author.profile)}`
  reelAuthorName.innerHTML = item.author.name
  reelAuthorName.href = "https://instagram.com/"+item.author.id
  reelVideo.muted = true
  reelVideo.autoplay = true
  reelVideo.loop = true
  // reelVideo.poster = `/proxy?url=${btoa(item.content)}`
  reelContent.src = `/proxy?url=${btoa(item.content)}`
  reelContent.onload = function() {
    if (!initialLoad) {
      dquery("#loadingScreen").style.display = "none"
      initialLoad = true
    }
    e.append(detailsContainer)
    detailsContainer.style.width = reelContent.width+"px"
    extrasContainer.style.width = reelContent.width+"px"
  }
  extrasContainer.append(volumeButton)
  reelVideo.append(reelSource)
  detailsContainer.append(reelAuthorIcon, reelAuthorName)
  e.append(reelContent, reelVideo, extrasContainer)
  reelSource.src = (item.media) ? item.media.media : ''
  return e
}

function setCookie(name, value) {
  document.cookie = name + "=" + (value || "") + ";expires=Fri, 31 Dec 9999 23:59:59 GMT;path=/";
}

function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
}

function setTheme(e) {
  if (getCookie("theme") == "dark") {
    e.src = "/static/assets/light.png"
    setCookie("theme", "light")
    window.location.reload()
  } else {
    e.src = "/static/assets/dark.png"
    setCookie("theme", "dark")
    window.location.reload()
  }
}

function openModal(m) {
  m.style.display = ""
  m.style.opacity = "1"
  m.style.background = "rgba(0, 0, 0, 0.7)"
  m.style.animation = "fade-in 0.3s"
  m.children[0].style.animation = "move-up 0.3s"
}

function closeModal(m) {
  setTimeout(function() {
    m.style.display = "none"
  }, 301)
  m.children[0].style.animation = "move-down 0.3s"
  m.style.animation = "fade-out 0.3s"
  m.style.opacity = 0
}

function renderComment(item) {
  const e = dcreate("div", "comment centered-vertically")
  const avatar = dcreate("img", "comment-author-avatar")
  const textContainer = dcreate("div")
  const username = dcreate("a", "comment-author-name")
  const commentContent = dcreate("div", 'comment-content')
  if ('text' in item){
    commentContent.innerHTML = item.text
  } else {
    commentContent.innerHTML = ""
  }
  if (item.flagged) {
    textContainer.style.filter = "blur(5px)"
    textContainer.style.cursor = "pointer"
    textContainer.onclick = function(e) {
      e.preventDefault()
      textContainer.style.filter = ""
      textContainer.style.cursor = ""
    }
  }
  username.innerHTML = item.user.full_name
  username.href = "https://instagram.com/"+item.user.username
  avatar.src = "/proxy?url="+btoa(item.user.profile_pic_url)
  textContainer.append(username, commentContent)
  e.append(avatar, textContainer)
  return e
}