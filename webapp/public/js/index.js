// ================== navbar toggle button ==================
let menuIcon = document.querySelector('#menu_icon');
let navbar = document.querySelector('.navbar');

menuIcon.onclick = () => {
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


// ================== typed js ==================
const typed = new Typed('.multiple-text', {
  strings: ['Anonymous.', 'Secure.', 'Private.'],
  typeSpeed: 90,
  backSpeed: 90,
  backDelay: 1000,
  loop: true,
});

// ================== METAMASK ===========================

// This function converts a long wallet address to a formatted view for ui/ux: 0x1a9d...184
function formatBytes(hexValue) {
  // Convert the hexadecimal value to a string
  const hexString = hexValue.toString(16);

  // Get the first 6 bytes
  const firstBytes = hexString.substr(0, 6);

  // Get the last 4 bytes
  const lastBytes = hexString.substr(-4);

  // Create the formatted string with ellipsis
  const formattedString = `${firstBytes}...${lastBytes}`;

  return formattedString;
}

// SHA256 hashing!
function sha256(message) {
  // Convert the message to a Uint8Array
  const messageBuffer = new TextEncoder().encode(message);

  // Hash the message using the SubtleCrypto API
  return crypto.subtle.digest("SHA-256", messageBuffer)
    .then(hashBuffer => {
      // Convert the hash buffer to a hexadecimal string
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, "0")).join("");
      return hashHex;
    });
}

async function encryptWithAES256(key, plaintext) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);

  // Generate a random salt
  const salt = window.crypto.getRandomValues(new Uint8Array(16));

  // Derive the key using PBKDF2
  const importedKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const derivedKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: { name: 'SHA-256' },
    },
    importedKey,
    { name: 'AES-CBC', length: 256 },
    false,
    ['encrypt']
  );

  // Generate a random initialization vector (IV)
  const iv = window.crypto.getRandomValues(new Uint8Array(16));

  // Encrypt the data
  const encryptedData = await window.crypto.subtle.encrypt(
    { name: 'AES-CBC', iv },
    derivedKey,
    data
  );

  // Encode the encrypted data as Base64
  const encryptedDataString = btoa(String.fromCharCode.apply(null, new Uint8Array(encryptedData)));

  // Return the salt, IV, and encrypted data as strings
  return {
    salt: Array.from(new Uint8Array(salt)),
    iv: Array.from(new Uint8Array(iv)),
    encryptedData: encryptedDataString,
  };
}

async function decryptWithAES256(key, ciphertext) {
  const decoder = new TextDecoder();
  const salt = new Uint8Array(ciphertext.salt);
  const iv = new Uint8Array(ciphertext.iv);

  // Decode the Base64 encrypted data back to binary
  const encryptedData = new Uint8Array(atob(ciphertext.encryptedData).split('').map(char => char.charCodeAt(0)));

  // Derive the key using PBKDF2
  const importedKey = await window.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(key), // Create a new encoder here
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const derivedKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: { name: 'SHA-256' },
    },
    importedKey,
    { name: 'AES-CBC', length: 256 },
    false,
    ['decrypt']
  );

  // Decrypt the data
  const decryptedData = await window.crypto.subtle.decrypt(
    { name: 'AES-CBC', iv },
    derivedKey,
    encryptedData
  );

  // Convert the decrypted data to a string
  const decrypted = decoder.decode(decryptedData);

  return decrypted;
}

const connectButton = document.getElementById("connectButton");
const walletID = document.getElementById("wallet-nav");
const myForm = document.getElementById("donation");


connectButton.addEventListener("click", async () => {
  // Start loader while connecting
  connectButton.classList.add("loadingButton");

  if (typeof ethereum === "undefined") {
    // MetaMask not installed or `ethereum` object not found
    window.open("https://metamask.io/download/", "_blank");
    connectButton.classList.remove("loadingButton");
    return;
  }

  try {
    await ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.providers.Web3Provider(ethereum);
    const accounts = await provider.listAccounts();
    const account = accounts[0];

    const nonceResponse = await fetch(`/nonce?address=${account}`);
    const { message, nonce } = await nonceResponse.json();
    console.log(message, nonce)

    const signer = provider.getSigner();
    const signature = await signer.signMessage(message);
    console.log(signature);

    const signatureValidationData = {
      signature: signature,
      addr: account,
      message: message
    };
    console.log(signatureValidationData)
    if (!signature || !account || !message) {
      alert('Missing required data for signature validation.');
    } else {
      fetch('/validate-signature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(signatureValidationData)
      })
        .then(response => response.json())
        .then(responseData => {
          if (responseData.success !== true) {
            alert('Wallet Authentication Failed!');
            return;
          } else {
            // Maybe private key could be stored in cookies inside of local storage for better security?
            const sha256Value = sha256(account + "zkrelief");

            sha256Value.then(hash => {
              // Check if the localStorage variable exists
              if (localStorage.getItem(hash)) {
                // Retrieve the value from localStorage
                const storedValue = localStorage.getItem(hash);
                console.log(storedValue);
                // DONT FORGET ME!!!!!!!

              } else {
                console.log('Nothing found in the local storage!')
                var nextButton = document.getElementById('pk-btn');

                nextButton.addEventListener('click', function () {
                  var pkElement = document.getElementById('pk-input');
                  var pk = pkElement.value;
                  console.log('Private key value:', pk);

                  const wallet = new ethers.Wallet(pk);
                  if (wallet.address !== account) {
                    alert('Wrong private key!')
                    return;
                  }

                  var passElement = document.getElementById('pass-input');
                  var pass = passElement.value;
                  console.log('Pass value:', pass);


                  encryptWithAES256(pass, pk)
                    .then(encryptedData => {
                      // Store the encrypted data in local storage
                      localStorage.setItem(hash, encryptedData);
                      console.log(encryptedData)
                      console.log("Data encrypted and stored in local storage");


                    })
                    .catch(error => {
                      alert('Encryption error! Check your js console!')
                      console.log('Encryption Error:', error);
                    });

                });




              }
            })
              .catch(error => {
                alert('An error occured while searching for previous provided private keys. Check the js console!')
                console.log('Error:', error);
              });
          }

        })
        .catch(error => {
          alert('An error occurred during the signature validation request. Check the js console!');
          console.log(error);
        });
    }


    connectButton.remove();
    const paymentSection = document.querySelector('#donation');
    paymentSection.style.display = "block";
    paymentSection.scrollIntoView({ behavior: "smooth" });

    const paymentLink = document.querySelector('nav a[href="#donation"]');
    paymentLink.style.display = "inline-block";
    const wallet = document.querySelector('nav a[href="#wallet"]');
    wallet.textContent = formatBytes(account);
    wallet.style.display = "inline-block";
    wallet.style.color = "#33cc33";

    // Stop loader when connected
    connectButton.classList.remove("loadingButton");
  } catch (error) {
    // Handle error
    console.log(error);

    // Stop loader if error occurred
    connectButton.classList.remove("loadingButton");
  }
});


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
  stepNextBtnClass: 'js-btn-next'
};


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

  if (!(eventTarget.classList.contains(`${DOMstrings.stepPrevBtnClass}`) || eventTarget.classList.contains(`${DOMstrings.stepNextBtnClass}`))) {
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
