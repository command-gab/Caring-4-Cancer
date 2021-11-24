// console.log('filed accessed')

// document.querySelector('.submitPost').addEventListener('click', postMessage)

// function postMessage() {

//   let messages = document.querySelector('.discussion').value

//   fetch('/discussion', {
//     method: 'post',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({
//       messages: messages,
//     })

//   }).then(response => {
//     console.log(response, 'response')
//     if (response.ok) return response.json()
//   })
//     .then(data => {
//       console.log(data)

//     })
// }



// let thumbUp = document.getElementsByClassName("fa-thumbs-up");

// Array.from(thumbUp).forEach(function (element) {
//   element.addEventListener('click', function () {
//     const name = this.parentNode.parentNode.childNodes[1].innerText
//     const msg = this.parentNode.parentNode.childNodes[3].innerText
//     const thumbUp = parseFloat(this.parentNode.parentNode.childNodes[5].innerText)
//     fetch('upVote', {
//       method: 'put',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         'name': name,
//         'msg': msg,
//         'thumbUp': thumbUp
//       })
//     })
//       .then(response => {
//         if (response.ok) return response.json()
//       })
//       .then(data => {
//         console.log(data)
//         window.location.reload(true)
//       })
//   });
// });

// document.querySelector('.register').addEventListener('click', postToAdmin)

// function postToAdmin() {
//   fetch('admin', {
//     method: 'post',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({
//       name: name,
//       email: email,
//       attendees: attendees,
//       event: 'event'
//     })

//   }) .then(response => {
//     if (response.ok) return response.json()
//   })
//   .then(data => {
//     console.log(data)

//   })
// }