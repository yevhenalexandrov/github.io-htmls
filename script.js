const otpForm = document.querySelector('.otp-js-form') || document;
const inputs = otpForm.querySelectorAll('.form-otp_num');
inputs.forEach((input, index) => {
    input.addEventListener('paste', (event) => {
        const pasteData = event.clipboardData.getData('text').slice(0, 6);
        const pasteValues = pasteData.split('').filter(char => /[0-9]/.test(char));

        inputs.forEach((input, i) => {
            input.value = pasteValues[i] || '';
        });

        if (pasteValues.length === 6) {
            inputs[5].focus();
        } else if (pasteValues.length) {
            inputs[pasteValues.length].focus();
        }

        // event.preventDefault();
    });
});
let htmlElement = document.documentElement;

let lang = htmlElement.getAttribute('lang');
let merchant;
let purchase;
let purchase_date;
let card_number;

if (lang === 'uk') {
    merchant = 'Торговець:';
    purchase = 'Покупка:';
    purchase_date = 'Дата покупки:';
    card_number = 'Номер картки:';
} else {
    merchant = 'Merchant:';
    purchase = 'Amount:';
    purchase_date = 'Date of Purchase:';
    card_number = 'Card number:';
}

const merchantEl = document.getElementById('merchant');
const purchaseEl = document.getElementById('purchase');
const purchaseDateEl = document.getElementById('purchase_date');
const cardNumberEl = document.getElementById('card_number');
if (merchantEl) merchantEl.innerText = merchant;
if (purchaseEl) purchaseEl.innerText = purchase;
if (purchaseDateEl) purchaseDateEl.innerText = purchase_date;
if (cardNumberEl) cardNumberEl.innerText = card_number;

function setupOtpInput() {
    const inputs = otpForm.querySelectorAll('.form-otp_num');

    const wrapper = otpForm.querySelector('#otp-input');
    if (!wrapper) {
        return;
    }

    wrapper.addEventListener('click', (e) => {
        for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i];

            console.log(input.value);
            if (!input.value) {
                input.focus();
                break;
            }
        }
    });

    for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];

        input.addEventListener('input', function () {
            // handling normal input
            if (input.value.length == 1 && i + 1 < inputs.length) {
                inputs[i + 1].focus();
            }

            // if a value is pasted, put each character to each of the next input
            if (input.value.length > 1) {
                // sanitise input
                if (isNaN(input.value)) {
                    input.value = '';
                    updateInput();
                    return;
                }

                // split characters to array
                const chars = input.value.split('');

                for (let pos = 0; pos < chars.length; pos++) {
                    // if length exceeded the number of inputs, stop
                    if (pos + i >= inputs.length) break;

                    // paste value
                    let targetInput = inputs[pos + i];
                    targetInput.value = chars[pos];
                }

                // focus the input next to the last pasted character
                let focus_index = Math.min(inputs.length - 1, i + chars.length);
                inputs[focus_index].focus();
            }
            updateInput();
        });

        input.addEventListener('keydown', function (e) {
            // backspace button
            if (e.keyCode == 8 && input.value == '' && i != 0) {
                // shift next values towards the left
                for (let pos = i; pos < inputs.length - 1; pos++) {
                    inputs[pos].value = inputs[pos + 1].value;
                }

                // clear previous box and focus on it
                inputs[i - 1].value = '';
                inputs[i - 1].focus();
                updateInput();
                return;
            }

            // delete button
            if (e.keyCode == 46 && i != inputs.length - 1) {
                // shift next values towards the left
                for (let pos = i; pos < inputs.length - 1; pos++) {
                    inputs[pos].value = inputs[pos + 1].value;
                }

                // clear the last box
                inputs[inputs.length - 1].value = '';
                input.select();
                e.preventDefault();
                updateInput();
                return;
            }

            // left button
            if (e.keyCode == 37) {
                if (i > 0) {
                    e.preventDefault();
                    inputs[i - 1].focus();
                    inputs[i - 1].select();
                }
                return;
            }

            // right button
            if (e.keyCode == 39) {
                if (i + 1 < inputs.length) {
                    e.preventDefault();
                    inputs[i + 1].focus();
                    inputs[i + 1].select();
                }
                return;
            }
        });
    }

    function updateInput() {
        let inputValue = Array.from(inputs).reduce(function (otp, input) {
            otp += input.value.length ? input.value : ' ';
            return otp;
        }, '');
        const codeInput = otpForm.querySelector('input[name=code]');
        if (codeInput) {
            codeInput.value = inputValue; //name=otp
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    setupOtpInput();

    setTimeout(() => {
        const el = otpForm.querySelector('#retry');
        if (el) {
            el.style.color = '#ff9046';
        }
    }, 1000 * 60 * 1.5);

    if ('OTPCredential' in window) {
        const inputs = otpForm.querySelectorAll(
            'input[autocomplete="one-time-code"]'
        );


        const inputCode = otpForm.querySelector('input[name="code"]');
        const ac = new AbortController();

        navigator.credentials
            .get({
                otp: { transport: ['sms'] },
                signal: ac.signal,
            })
            .then((otp) => {
                if (!otp || !otp.code) {
                    return;
                }
                if (inputCode) {
                    inputCode.value = otp.code;
                }
                for (let [index, chat] of otp.code.split('').entries()) {
                    if (inputs[index]) {
                        inputs[index].value = chat;
                    }
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }
});
 