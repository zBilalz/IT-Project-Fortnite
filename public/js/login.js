const wrapper = document.querySelector('.wrapper');
const loginlink = document.querySelector('.login-link');
const registerLink = document.querySelector('.register-link');

registerLink.addEventListener('click',()=> {
    wrapper.classList.add('active')
})

loginlink.addEventListener('click',()=> {
    wrapper.classList.remove('active')
})