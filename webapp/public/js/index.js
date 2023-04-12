// ================== navbar toggle button ==================
let menuIcon = document.querySelector('#menu_icon');
let navbar = document.querySelector('.navbar');

menuIcon.onclick = () => {
  // console.log('hi');
  menuIcon.classList.toggle('bx-x');
  navbar.classList.toggle('active');
};

// ================== scroll section active link ==================
let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header nav a');

window.onscroll = () => {
  sections.forEach(sec => {
    let top = window.scrollY;
    let offset = sec.offsetTop - 150;
    let height = sec.offsetHeight;
    let id = sec.getAttribute('id');

    if (top >= offset && top < offset + height) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        document.querySelector('header nav a[href*= ' + id + ']').classList.add('active');
      });
    };
  });
  // ================== sticky navBar ==================
  let header = document.querySelector('header');
  header.classList.toggle('sticky', window.scrollY > 100);


  // ================== remove toggle icon and navbar when click navbar link (scroll) ==================
  menuIcon.classList.remove('bx-x');
  navbar.classList.remove('active');


};

// ================== scroll reveal ==================

ScrollReveal({
  // reset: true, // true -> animation every time
  distance: '80px',
  duration: 2000,
  delay: 200
});

ScrollReveal().reveal('.home-content, .heading', { origin: 'top' });
ScrollReveal().reveal('.home-img, .services-container, .portfolio-box, .contact form', { origin: 'bottom' });
ScrollReveal().reveal('.home-content h1 , .about-img ', { origin: 'left' });
ScrollReveal().reveal('.home-content p , .about-content ', { origin: 'right' });

// ================== typed js ==================
const typed = new Typed('.multiple-text', {
  strings: ['Anonymous.', 'Secure.', 'Private.'],
  typeSpeed: 90,
  backSpeed: 90,
  backDelay: 1000,
  loop: true,
});


// ================== METAMASK ===========================

const connectButton = document.getElementById("connectButton");
const walletID = document.getElementById("walletID");
const reloadButton = document.getElementById("reloadButton");
const installAlert = document.getElementById("installAlert");
const myForm = document.getElementById("payment");


connectButton.addEventListener("click", () => {
   // Start loader while connecting
   connectButton.classList.add("loadingButton");

   if (typeof window.ethereum !== "undefined") {
      ethereum
        .request({ method: "eth_requestAccounts" })
        .then((accounts) => {
           const account = accounts[0]
           connectButton.remove();

           walletID.innerHTML = `Wallet connected: ${account}`;
            //modal opening

            const paymentSection = document.querySelector('#payment');
            paymentSection.style.display = "block";

            const myNavLinks = document.querySelectorAll('nav a');
            const paymentLink = document.querySelector('nav a[href="#payment"]');
            paymentLink.style.display = "inline-block";

            
            paymentSection.scrollIntoView({ behavior: "smooth" });


    
            
           // Stop loader when connected
           connectButton.classList.remove("loadingButton");
           

      }).catch((error) => {
        // Handle error
        console.log(error, error.code);

        // Stop loader if error occured
        // For example, when user cancelled request 
        // and closed plugin
        connectButton.classList.remove("loadingButton");

        // 4001 - The request was rejected by the user
        // -32602 - The parameters were invalid
        // -32603- Internal error
      });
   } else {
      window.open("https://metamask.io/download/", "_blank");

      // Show 'Reload page' warning to user
      installAlert.classList.add("show");
   }
})

// Reload the page on reload button click
reloadButton.addEventListener("click", () => {
  window.location.reload();
});

function openDialog() {
  document.querySelector('dialog').showModal()
}

function closeDialog() {
  document.querySelector('dialog').close()
}


/* ====================  MULTI-STEP FORM =====================*/

const DOMstrings = {
  stepsBtnClass: 'multisteps-form__progress-btn',
  stepsBtns: document.querySelectorAll(`.multisteps-form__progress-btn`),
  stepsBar: document.querySelector('.multisteps-form__progress'),
  stepsForm: document.querySelector('.multisteps-form__form'),
  stepsFormTextareas: document.querySelectorAll('.multisteps-form__textarea'),
  stepFormPanelClass: 'multisteps-form__panel',
  stepFormPanels: document.querySelectorAll('.multisteps-form__panel'),
  stepPrevBtnClass: 'js-btn-prev',
  stepNextBtnClass: 'js-btn-next' };


const removeClasses = (elemSet, className) => {

  elemSet.forEach(elem => {

    elem.classList.remove(className);

  });

};

const findParent = (elem, parentClass) => {

  let currentNode = elem;

  while (!currentNode.classList.contains(parentClass)) {
    currentNode = currentNode.parentNode;
  }

  return currentNode;

};

const getActiveStep = elem => {
  return Array.from(DOMstrings.stepsBtns).indexOf(elem);
};

const setActiveStep = activeStepNum => {

  removeClasses(DOMstrings.stepsBtns, 'js-active');

  DOMstrings.stepsBtns.forEach((elem, index) => {

    if (index <= activeStepNum) {
      elem.classList.add('js-active');
    }

  });
};

const getActivePanel = () => {

  let activePanel;

  DOMstrings.stepFormPanels.forEach(elem => {

    if (elem.classList.contains('js-active')) {

      activePanel = elem;

    }

  });

  return activePanel;

};

const setActivePanel = activePanelNum => {

  removeClasses(DOMstrings.stepFormPanels, 'js-active');

  DOMstrings.stepFormPanels.forEach((elem, index) => {
    if (index === activePanelNum) {

      elem.classList.add('js-active');

      setFormHeight(elem);

    }
  });

};

const formHeight = activePanel => {

  const activePanelHeight = activePanel.offsetHeight;

  DOMstrings.stepsForm.style.height = `${activePanelHeight}px`;

};

const setFormHeight = () => {
  const activePanel = getActivePanel();

  formHeight(activePanel);
};

DOMstrings.stepsBar.addEventListener('click', e => {

  const eventTarget = e.target;

  if (!eventTarget.classList.contains(`${DOMstrings.stepsBtnClass}`)) {
    return;
  }

  const activeStep = getActiveStep(eventTarget);

  setActiveStep(activeStep);

  setActivePanel(activeStep);
});

DOMstrings.stepsForm.addEventListener('click', e => {

  const eventTarget = e.target;

  if (!(eventTarget.classList.contains(`${DOMstrings.stepPrevBtnClass}`) || eventTarget.classList.contains(`${DOMstrings.stepNextBtnClass}`)))
  {
    return;
  }

  const activePanel = findParent(eventTarget, `${DOMstrings.stepFormPanelClass}`);

  let activePanelNum = Array.from(DOMstrings.stepFormPanels).indexOf(activePanel);

  if (eventTarget.classList.contains(`${DOMstrings.stepPrevBtnClass}`)) {
    activePanelNum--;

  } else {

    activePanelNum++;

  }

  setActiveStep(activePanelNum);
  setActivePanel(activePanelNum);

});

window.addEventListener('load', setFormHeight, false);

window.addEventListener('resize', setFormHeight, false);


const setAnimationType = newType => {
  DOMstrings.stepFormPanels.forEach(elem => {
    elem.dataset.animation = newType;
  });
};

//changing animation
const animationSelect = document.querySelector('.pick-animation__select');

animationSelect.addEventListener('change', () => {
  const newAnimationType = animationSelect.value;

  setAnimationType(newAnimationType);
});
