(function () {
    const tempData = {};

// This part is done to make sure the script is injected only once
    if (window.__contentScriptInjected__) {
        return; // Exit if already injected
    }
    window.__contentScriptInjected__ = true;
    window.onload = () => {
        try {
            fillFormData();
            createMutationObserver();
        } catch (e) {
            console.error('Error during window.onload:', e);
        }
    };

    function createMutationObserver() {
        let debounceTimeout;

        const observer = new MutationObserver((mutationsList) => {
            try {
                // Clear the previous debounce timeout
                clearTimeout(debounceTimeout);

                // Set a new debounce timeout
                debounceTimeout = setTimeout(() => {
                    // Check for the relevant mutation types
                    let shouldFill = false;
                    for (let mutation of mutationsList) {
                        if (mutation.type === 'childList' || mutation.type === 'subtree') {
                            shouldFill = true;
                            break;
                        }
                    }

                    // Call fillFormData() if necessary
                    if (shouldFill) {
                        fillFormData();
                    }
                }, 500); // Debounce delay
            } catch (e) {
                console.error('Error during MutationObserver callback:', e);
            }
        });

        // Configuration for the observer
        const observerConfig = {
            childList: true,
            subtree: true,
        };

        try {
            // Start observing the document body for changes
            observer.observe(document.body, observerConfig);
        } catch (e) {
            console.error('Error while setting up MutationObserver:', e);
        }
    }

    function gatherFormData() {
        const data = {};
        try {
            document.querySelectorAll('input:not([type="hidden"]):not(:disabled):not([readonly]):not([type="submit"]), ' +
                'select:not(:disabled):not([readonly]), textarea:not(:disabled):not([readonly])')
                .forEach(input => {
                    const selector = getSelector(input);
                    if (selector) {
                        switch (input.type) {
                            case 'file':
                                break;
                            case 'checkbox':
                                data[selector] = {name: input.name, value: input.checked};
                                break;
                            case 'radio':
                                if (input.checked) {
                                    data[selector] = {name: input.name, value: input.value};
                                }
                                break;
                            case 'select-multiple': {
                                const selectedOptions = Array.from(input.selectedOptions).map(option => option.value);
                                data[selector] = {name: input.name, value: selectedOptions};
                                break;
                            }
                            default:
                                data[selector] = {name: input.name, value: input.value};
                        }
                    }
                });
        } catch (e) {
            console.error('Error while gathering form data:', e);
        }
        return data;
    }

    function getSelector(element) {
        try {
            if (element.id) {
                return `#${element.id}`;
            }
            if (element.name) {
                return `[name="${element.name}"]`;
            }
            const tag = element.tagName.toLowerCase();
            const classes = element.className ? `.${element.className.trim().replace(/\s+/g, '.')}` : '';
            const parent = element.parentElement ? getSelector(element.parentElement) : '';
            const selector = `${tag}${classes}`;
            return parent ? `${parent} > ${selector}` : selector;
        } catch (e) {
            console.error('Error while generating selector:', e);
            return '';
        }
    }


    function fillFormData() {
        const currentUrl = window.location.href;

        try {
            chrome.storage.local.get(currentUrl, (result) => {

                    let data = result[currentUrl] || {};

                    // If no exact match data found, perform regex matching
                    if (Object.keys(data).length === 0) {
                        chrome.storage.local.get(null, (allData) => {
                            try {
                                for (const [storedUrl, storedData] of Object.entries(allData)) {
                                    let isMatch = false;

                                    // Check if the stored URL is a regex pattern
                                    try {
                                        const pattern = storedUrl.replace(/([.*+?^${}()|[\]\\])/g, "\\$1"); // Escape special characters
                                        const regex = new RegExp(`^${pattern}$`); // Exact match pattern
                                        isMatch = regex.test(currentUrl);
                                    } catch (e) {
                                        // If regex creation fails, treat it as a plain URL
                                        isMatch = (storedUrl === currentUrl);
                                    }

                                    if (isMatch) {
                                        data = storedData;
                                        break; // Stop searching once a match is found
                                    }
                                }

                                // Proceed with filling the form data if a match was found
                                if (Object.keys(data).length > 0) {
                                    fillFormFields(data);
                                }
                            } catch (e) {
                                console.error('Error during regex matching or filling form fields:', e);
                            }
                        });
                    } else {
                        // Proceed with filling the form data if exact match was found
                        fillFormFields(data);
                    }

            });
        } catch (e) {
            console.error('Error while retrieving form data from storage:', e);
        }
    }

    function fillFormFields(data) {
        for (const [selector, {value}] of Object.entries(data)) {
            let input = null;
            if (!selector) {
                continue;
            }
            try {
                input = document.querySelector(selector);
            } catch (e) {
                console.error(`Error while querying selector '${selector}':`, e);
            }
            if (!tempData[selector] && input) {
                try {
                    switch (input.type) {
                        case 'checkbox':
                            input.checked = value;
                            break;
                        case 'radio': {
                            const radio = document.querySelector(`${selector}[value="${value}"]`);
                            if (radio) {
                                radio.checked = true;
                            }
                            break;
                        }
                        case 'select-one':
                            input.value = value;
                            break;
                        case 'select-multiple': {
                            const options = Array.from(input.options);
                            options.forEach(option => {
                                option.selected = value.includes(option.value);
                            });
                            break;
                        }
                        case 'textarea':
                            input.value = value;
                            break;
                        case 'date':
                            input.value = value; // value should be in 'YYYY-MM-DD' format
                            break;
                        case 'color':
                            input.value = value; // value should be in '#RRGGBB' format
                            break;
                        case 'range':
                            input.value = value;
                            break;
                        default:
                            input.value = value;
                    }
                    tempData[selector] = true; // Mark this element as autofilled
                    // Fire events
                    ["input", "click", "change", "blur"].forEach((event) => {
                        const changeEvent = new Event(event, {bubbles: true, cancelable: true});
                        input.dispatchEvent(changeEvent);
                    });
                } catch (e) {
                    console.error(`Error while filling form field for selector '${selector}':`, e);
                }
            }
        }
    }


    console.log('Xpress - AutoFill extension is running');
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        try {
            if (request.action === 'saveFormData') {
                const data = gatherFormData();
                chrome.storage.local.set({[window.location.href]: data}, () => {
                    sendResponse({status: 'success'});
                });
                return true; // Keeps the message channel open for sendResponse
            }
            if (request.action === 'getFormData') {
                chrome.storage.local.get(window.location.href, (result) => {
                    const savedData = result[window.location.href] || {};
                    sendResponse({status: 'success', data: savedData});
                });
                return true; // Keeps the message channel open for sendResponse
            }
            if (request.action === 'updateFormData') {
                chrome.storage.local.set({[window.location.href]: request.data}, () => {
                    sendResponse({status: 'success'});
                });
                return true; // Keeps the message channel open for sendResponse
            }
            if (request.action === 'fillFormData') {
                fillFormData();
                return true; // Keeps the message channel open for sendResponse
            }

            if (request.action === 'fillFakeValues') {
                fillVisibleInputFields();
                return true;
            }
        } catch (e) {
            console.error('Error while handling message:', e);
            sendResponse({status: 'error', message: e.message});
        }
    });

    function fillVisibleInputFields() {
        // Helper function to generate a random string
        function getRandomString(length) {
            const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let result = '';
            const charactersLength = characters.length;
            for (let i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        }

        // Helper function to generate a random email
        function getRandomEmail() {
            return getRandomName() + '@dispostable.com';
        }

        // Helper function to generate a random phone number
        function getRandomPhoneNumber() {
            return `+1${Math.floor(Math.random() * 10000000000)}`;
        }

        // Helper function to generate a random name
        function getRandomName() {
            const names = ["Alex", "Jamie", "Taylor", "Jordan", "Riley", "Casey", "Morgan", "Quinn", "Avery",
                "Cameron", "Bailey", "Rowan", "Dakota", "Sydney", "Ashton", "Harper", "Peyton", "Emerson", "Skyler",
                "Finley", "Parker", "Kennedy", "Jaden", "Charlie", "Reese", "Devon", "Marley", "Sam", "Riley", "Morgan",
                "Cameron", "Rowan", "Jaden", "Ashton", "Sydney", "Finley", "Harper", "Skyler", "Dakota", "Peyton", "Emery",
                "Jordan", "Quinn", "Casey", "Charlie", "Reese", "Devon", "Marley", "Sam", "Riley", "Morgan", "Cameron", "Alex",
                "Jamie", "Taylor", "Jordan", "Riley", "Casey", "Morgan", "Quinn", "Avery", "Cameron", "Bailey", "Rowan", "Dakota",
                "Sydney", "Ashton", "Harper", "Peyton", "Emerson", "Skyler", "Finley", "Parker", "Kennedy", "Jaden", "Charlie", "Reese",
                "Devon", "Marley", "Sam", "Riley", "Morgan", "Cameron", "Rowan", "Jaden", "Ashton", "Sydney", "Finley", "Harper", "Skyler",
                "Dakota", "Peyton", "Emery", "Jordan", "Quinn", "Casey", "Charlie"];

            return names[Math.floor(Math.random() * names.length)];
        }

        // Helper function to generate a random address
        function getRandomAddress() {
            return `${Math.floor(Math.random() * 9999)} ${getRandomString(7)} St, City, Country`;
        }


        // Helper function to determine the appropriate value based on the input
        function getFakeValue(input) {
            const nameOrId = (input.name || input.id || '').toLowerCase();
            if (/name/.test(nameOrId)) {
                return getRandomName();
            } else if (/email/.test(nameOrId)) {
                return getRandomEmail();
            } else if (/phone|tel/.test(nameOrId)) {
                return getRandomPhoneNumber();
            } else if (/number/.test(nameOrId)) {
                return Math.floor(Math.random() * 100);
            } else if (/date/.test(nameOrId)) {
                return new Date().toISOString().split('T')[0];
            } else if (/url/.test(nameOrId)) {
                return `https://example.com/${getRandomString(5)}`;
            } else if (/textarea/.test(nameOrId)) {
                return getRandomString(50);
            } else if (/select/.test(nameOrId)) {
                return '';
            } else if (/address/.test(nameOrId)) {
                return getRandomAddress();
            } else {
                return getRandomString(10);
            }
        }

        // Get all input fields
        const inputs = document.querySelectorAll('input:not([type="hidden"]):not(:disabled):not([readonly]):not([type="submit"]), select:not(:disabled):not([readonly]), textarea:not(:disabled):not([readonly])');
        inputs.forEach(input => {
            // Ensure the input field is visible and enabled
            try {
                if (input.offsetParent !== null && !input.disabled) {
                    if (input.tagName.toLowerCase() === 'input') {
                        switch (input.type) {
                            case 'file':
                                break;
                            case 'password':
                                input.value = 'P@ssword';
                                break;
                            case 'text':
                            case 'search':
                            case 'tel':
                                input.value = getFakeValue(input);
                                break;
                            case 'email':
                                input.value = getRandomEmail();
                                break;
                            case 'number':
                                input.value = Math.floor(Math.random() * 100);
                                break;
                            case 'date':
                                input.value = new Date().toISOString().split('T')[0];
                                break;
                            case 'url':
                                input.value = `https://example.com/${getRandomString(5)}`;
                                break;
                            case 'checkbox':
                            case 'radio':
                                input.checked = Math.random() < 0.5; // Randomly check or uncheck
                                break;
                            case 'range':
                                input.value = Math.floor(Math.random() * (parseInt(input.max) || 100));
                                break;
                            case 'color':
                                input.value = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
                                break;
                            default:
                                input.value = getFakeValue(input);
                        }
                    } else if (input.tagName.toLowerCase() === 'textarea') {
                        input.value = getFakeValue(input);
                    } else if (input.tagName.toLowerCase() === 'select') {
                        const options = input.options;
                        if (options.length > 0) {
                            input.selectedIndex = Math.floor(Math.random() * options.length);
                        }
                    }
                    // Fire events
                    ["input", "click", "change", "blur"].forEach((event) => {
                        const changeEvent = new Event(event, {bubbles: true, cancelable: true});
                        input.dispatchEvent(changeEvent);
                    });
                }
            } catch (e) {
                console.error(`Error while filling field of type '${input.type}':`, e);
            }
        });
    }
})();