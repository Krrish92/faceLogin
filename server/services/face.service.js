const request = require('request');
const fs = require('fs');
const path = require('path');
const findRemoveSync = require('find-remove');
const endpoint = "https://test-domian.cognitiveservices.azure.com/";
const service = {
    detectFace,
    createPersonGroup,
    createPersonGroupPerson,
    createPersonGroupFace,
    createPersonGroupTrain
};
module.exports = service;

//IIF for creating person group on init
(async () => {
    try {
        console.log("Creating person group in ms service")
        await createPersonGroup();
    } catch (err) {
        console.log("Error while creating personGroup ::", err)
    }
})();

function getSubscriptionHeader() {
    return {
        "Ocp-Apim-Subscription-Key": "6b31ca16f7764b45bba22048b6d84dc4"
    }
}

async function detectFace(params) {
    var params = {
        "returnFaceId": "true",
        "returnFaceLandmarks": "false",
        "returnFaceAttributes":
            "age,gender,headPose,smile,facialHair,glasses,emotion," +
            "hair,makeup,occlusion,accessories,blur,exposure,noise"
    };

    var sourceImageUrl = await convertDataURIToBinary(params.base64);
    return new Promise((resolve, reject) => {
        request.post({
            headers: {
                ...getSubscriptionHeader(),
                'content-type': 'application/octet-stream'
            },
            url: `${endpoint}`,
            qs: params,
            data: sourceImageUrl
        }, function (error, response, body) {
            if (!body) { resolve(); return; }
            let data = JSON.parse(body);
            if (data.error) {
                reject(data.error)
                return;
            }
            resolve(data);
        });
    });
};

async function createPersonGroup() {
    const { id, name, userData } = getPersonGroungMetas();
    const body = {
        "name": name,
        "userData": JSON.stringify(userData),
        "recognitionModel": "recognition_01"
    };

    return new Promise((resolve, reject) => {
        request.put({
            headers: {
                ...getSubscriptionHeader(),
                'content-type': "application/json"
            },
            url: `${endpoint}/face/v1.0/persongroups/${id}`,
            body: JSON.stringify(body)
        }, function (error, response, body) {
            if (!body) { resolve(); return; }
            let data = JSON.parse(body);
            if (data.error) {
                reject(data.error)
                return;
            }
            console.log("Created a person group successfully", typeof body)
            resolve(data);
        });
    });
}

async function createPersonGroupPerson(params) {
    const { id } = getPersonGroungMetas();
    const body = {
        "name": params.name,
        "userData": JSON.stringify({
            name: params.name,
            age: params.age || '',
            sex: params.sex || '',
            mobile: params.mobile || '',
            address: params.address || ''
        })
    };

    return new Promise((resolve, reject) => {
        request.post({
            headers: {
                ...getSubscriptionHeader(),
                'content-type': "application/json"
            },
            url: `${endpoint}/face/v1.0/persongroups/${id}/persons`,
            body: JSON.stringify(body)
        }, function (error, response, body) {
            if (!body) { resolve(); return; }
            let data = JSON.parse(body);
            if (data.error) {
                reject(data.error)
                return;
            }
            resolve(data);
        });
    });
}

async function createPersonGroupFace(params) {
    const { id } = getPersonGroungMetas();
    const qs = {
        userData: JSON.stringify({ ...params.userData }),
        detectionModel: "detection_01"
    };
    var sourceImageUrl = await convertDataURIToBinary(params.base64);
    return new Promise((resolve, reject) => {
        request.post({
            headers: {
                ...getSubscriptionHeader(),
                'content-type': 'application/octet-stream'
            },
            url: `${endpoint}/face/v1.0/persongroups/${id}/persons/${params.personId}/persistedFaces`,
            qs: qs,
            body: sourceImageUrl
        }, function (error, response, body) {
            if (!body) { resolve(); return; }
            let data = JSON.parse(body);
            if (data.error) {
                reject(data.error)
                return;
            }
            resolve(data);
        });
    });
}

async function createPersonGroupTrain() {
    const { id } = getPersonGroungMetas();
    return new Promise((resolve, reject) => {
        request.post({
            headers: {
                ...getSubscriptionHeader(),
                'content-type': "application/json"
            },
            url: `${endpoint}/face/v1.0/persongroups/${id}/train`,
            body: ""
        }, function (error, response, body) {
            if (!body) { resolve(); return; }
            let data = JSON.parse(body);
            if (data.error) {
                reject(data.error)
                return;
            }
            resolve(data);
        });
    });
}

function getPersonGroungMetas() {
    return {
        id: "test-face-application",
        name: "Krrish face application",
        userData: {
            scope: "create group of peoples for test application"
        }
    }
};


function convertDataURIToBinary(dataURL) {
    let dir = path.resolve(__dirname, "../uploads");
    !fs.existsSync(dir) && fs.mkdirSync(dir);
    findRemoveSync(dir, { age: { seconds: 300 } })
    let filePath = `${dir}/${new Date()}.png`;

    return new Promise((resolve, reject) => {
        var parts = dataURL.replace(/^data:image\/\w+;base64,/, "");
        let buff = Buffer.from(parts, 'base64');
        fs.writeFile(filePath, buff, (err) => {
            if (err) { reject(err); return; };
            resolve(fs.readFileSync(filePath));
        });
    })

}