let heart = document.getElementsByClassName('fa-heart');
let trash = document.getElementsByClassName('fa-trash');

Array.from(heart).forEach(function (element) {
  element.addEventListener('click', function () {
      const heartID = element.dataset.id
      fetch('like', {
          method: 'put',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              heartID: heartID,
          }),
      })
          .then(function (response) {
              window.location.reload()
          })
  });
});

Array.from(trash).forEach(function (element) {
    element.addEventListener('click', function () {
        const eventID = element.dataset.id
        fetch('profile', {
            method: 'delete',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                eventID: eventID,
            }),
        })
            .then(function (response) {
                window.location.reload()
            })
    });
});

const success = document.querySelector('#success')
document.querySelector('.register').addEventListener('click', successMessage);

function successMessage() {
  success.innerText = "Success! You've been registered!"
}