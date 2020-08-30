
(function () {
    var width = 320;    // We will scale the photo width to this
    var height = 0;     // This will be computed based on the input stream

    var streaming = false;

    var video = null;
    var canvas = null;
    var enroll = null;
    var startbutton = null;
    var subscriptionKey = "6b31ca16f7764b45bba22048b6d84dc4";
    var endpoint = "https://test-domian.cognitiveservices.azure.com/";
    var photos = {
        image1: false,
        image2: false,
        image3: false,
        image4: false,
        image5: false
    };

    function startup() {
        video = document.getElementById('video');
        canvas = document.getElementById('canvas');
        startbutton = document.getElementById('startbutton');
        enroll = document.getElementById('enroll');

        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            .then(function (stream) {
                video.srcObject = stream;
            })
            .catch(function (err) {
                handleError(err);
            });

        video.addEventListener('canplay', function (ev) {
            if (!streaming) {
                height = video.videoHeight / (video.videoWidth / width);

                if (isNaN(height)) {
                    height = width / (4 / 3);
                }

                video.setAttribute('width', width);
                video.setAttribute('height', height);
                canvas.setAttribute('width', width);
                canvas.setAttribute('height', height);
                streaming = true;
            }
        }, false);

        startbutton.addEventListener('click', function (ev) {
            takepicture();
            ev.preventDefault();
        }, false);

        document.getElementById("clear1").addEventListener('click', function (ev) {
            clearphoto("image1")
            ev.preventDefault();
        }, false);

        document.getElementById("clear2").addEventListener('click', function (ev) {
            clearphoto("image2")
            ev.preventDefault();
        }, false);

        document.getElementById("clear3").addEventListener('click', function (ev) {
            clearphoto("image3")
            ev.preventDefault();
        }, false);

        document.getElementById("clear4").addEventListener('click', function (ev) {
            clearphoto("image4")
            ev.preventDefault();
        }, false);

        document.getElementById("clear5").addEventListener('click', function (ev) {
            clearphoto("image5")
            ev.preventDefault();
        }, false);

        enroll.addEventListener('click', function (ev) {
            enrollUser();
            ev.preventDefault();
        }, false);

        document.getElementById("recognise").addEventListener('click', (ev) => {
            getUserData();
            ev.preventDefault();
        }, false)

        clearphoto();
    }

    function handleError(error) {
        if (error.name === 'ConstraintNotSatisfiedError') {
            const v = constraints.video;
            errorMsg(`The resolution ${v.width.exact}x${v.height.exact} px is not supported by your device.`);
        } else if (error.name === 'PermissionDeniedError') {
            errorMsg(`Permissions have not been granted to use your camera and
          microphone, you need to allow the page access to your devices in
          order for the demo to work.`);
        }
        errorMsg(`Camera error: ${error.name}`, error);
    }

    function errorMsg(msg, error) {
        const errorElement = document.querySelector('#errorMsg');
        errorElement.innerHTML += `<p>${msg}</p>`;
        if (typeof error !== 'undefined') {
            console.error(error);
        }
    }

    function clearphoto(id) {
        var context = canvas.getContext('2d');
        context.fillStyle = "#AAA";
        context.fillRect(0, 0, canvas.width, canvas.height);

        var data = canvas.toDataURL('image/png');
        if (!id) {
            Array.from(document.querySelectorAll(".output img")).map((val) => {
                val.setAttribute('src', data)
            })
            photos = {
                image1: false,
                image2: false,
                image3: false,
                image4: false,
                image5: false
            };
            return;
        }
        document.getElementById(id).setAttribute('src', data);
        photos[id] = false;
    };

    function convertDataURIToBinary(dataURL) {
        var BASE64_MARKER = ';base64,';
        if (dataURL.indexOf(BASE64_MARKER) == -1) {
            var parts = dataURL.split(',');
            var contentType = parts[0].split(':')[1];
            var raw = decodeURIComponent(parts[1]);
            return new Blob([raw], { type: contentType });
        }
        var parts = dataURL.split(BASE64_MARKER);
        var contentType = parts[0].split(':')[1];
        var raw = window.atob(parts[1]);
        var rawLength = raw.length;

        var uInt8Array = new Uint8Array(rawLength);

        for (var i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        return new Blob([uInt8Array], { type: contentType });
    }

    // Capture a photo by fetching the current contents of the video
    // and drawing it into a canvas, then converting that to a PNG
    // format data URL. By drawing it on an offscreen canvas and then
    // drawing that to the screen, we can change its size and/or apply
    // other changes before drawing it.

    function takepicture() {
        let imageUrl = getBase64();
        for (let key in photos) {
            if (!photos[key]) {
                document.getElementById(key).setAttribute('src', imageUrl);
                photos[key] = imageUrl;
                break;
            }
        }
    };

    //utility for getting base64
    function getBase64() {
        var context = canvas.getContext('2d');
        if (width && height) {
            canvas.width = width;
            canvas.height = height;
            context.drawImage(video, 0, 0, width, height);

            var data = canvas.toDataURL('image/png');
            return data;
        }
        return '';
    }

    // enroll user listerner
    function enrollUser() {
        enroll.disabled = true;
        var name = document.querySelector('input[name="name"]').value;
        var sex = document.querySelector('input[name="sex"]:checked').value;
        var age = document.querySelector('input[name="age"]').value;
        var mobile = document.querySelector('input[name="mobile"]').value;
        var address = document.querySelector('textarea[name="address"]').value;
        var params = {
            name, sex, age, mobile, address
        };

        let isImagesTaken = false;
        for (let key in photos) {
            if (photos[key]) {
                params[key] = photos[key];
                isImagesTaken = true;
            }
        }

        if (!isImagesTaken) {
            alert("Please take at lest 1 photo");
            enroll.disabled = false;
            return;
        }

        if (name === '') {
            alert("Please enter name");
            enroll.disabled = false;
            return;
        }
        if (mobile !== '') {
            if (mobile && isNaN(mobile)) {
                alert("Mobile number should be a number");
                enroll.disabled = false;
                return;
            }
            if (mobile.length > 10 || mobile.length < 8) {
                alert("Mobile number should have 8-10 digits only");
                enroll.disabled = false;
                return;
            }

        }

        if (age && isNaN(age)) {
            alert("Age should be a number");
            enroll.disabled = false;
            return;
        }

        var http = new XMLHttpRequest();
        http.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                enroll.disabled = false;
                alert("User has been enrolled");
            }
        };
        http.open("POST", "api/enroll-user", true);
        http.setRequestHeader("Content-type", "application/json");
        http.send(JSON.stringify(params));

    }

    //master for getting user details
    async function getUserData() {
        let button = document.getElementById("recognise");
        button.disabled = true;
        try {
            let base64 = getBase64();
            let detectedFace = await detectFace(base64);
            console.log("detectedFace", detectedFace);
            let overlay = document.getElementById("overlay");
            $("#overlay")
                .css("height", detectedFace[0].faceRectangle.height)
                .css("width", detectedFace[0].faceRectangle.width)
                .css("top", detectedFace[0].faceRectangle.top)
                .css("left", detectedFace[0].faceRectangle.left);

            let personIdentified = await identifyUserFace([detectedFace[0].faceId]);
            console.log("personIdentified", personIdentified);
            if (personIdentified.length && !personIdentified[0].candidates.length) {
                alert("Candidate not identified");
                button.disabled = false;
                return true;
            }

            let personData = await getPersonData(personIdentified[0].candidates[0].personId);
            console.log("personData ::", personData);
            let userData = JSON.parse(personData.userData);
            overlay.innerHTML = `<table>
            <tr><td>Name : </td> <td><b>${userData.name}</b></td></tr>
            <tr><td>Age : </td> <td><b>${userData.age || ''}</b></td></tr>
            <tr><td>Gender : </td> <td><b>${userData.sex || ''}</b></td></tr>
            <tr><td>Mobile : </td> <td><b>${userData.mobile || ''}</b></td></tr>
            <tr><td>Address : </td> <td><b>${userData.address || ''}</b></td></tr>
            </table>`;
            button.disabled = false;
        } catch (err) {
            console.log(err);
            alert("Something went wrong! Please try again");
        }
    }

    function detectFace(base64) {
        var params = {
            "returnFaceId": "true",
            "returnFaceLandmarks": "false"
        };

        var sourceImageUrl = convertDataURIToBinary(base64);

        // Perform the REST API call.
        return $.ajax({
            url: `${endpoint}face/v1.0/detect?${$.param(params)}`,
            beforeSend: function (xhrObj) {
                xhrObj.setRequestHeader("Content-Type", "application/octet-stream");
                xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", subscriptionKey);
            },
            type: "POST",
            data: sourceImageUrl,
            processData: false
        });

    };

    function identifyUserFace(faceids) {
        const personGroupId = "test-face-application";

        var body = {
            "personGroupId": personGroupId,
            "faceIds": faceids,
            "maxNumOfCandidatesReturned": 1,
            "confidenceThreshold": 0.5
        }

        // Perform the REST API call.
        return $.ajax({
            url: `${endpoint}face/v1.0/identify`,
            beforeSend: function (xhrObj) {
                xhrObj.setRequestHeader("Content-Type", "application/json");
                xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", subscriptionKey);
            },
            type: "POST",
            data: JSON.stringify(body),
            processData: false
        });

    };

    function getPersonData(personId) {
        const personGroupId = "test-face-application";

        // Perform the REST API call.
        return $.ajax({
            url: `${endpoint}face/v1.0/persongroups/${personGroupId}/persons/${personId}`,
            beforeSend: function (xhrObj) {
                xhrObj.setRequestHeader("Content-Type", "application/json");
                xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", subscriptionKey);
            },
            type: "GET",
            processData: false
        });
    };

    window.addEventListener('load', startup, false);
})();