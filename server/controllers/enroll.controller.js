var express = require('express');
var router = express.Router();
var {
    createUser
} = require('../services/enroll.service');
var {
    detectFace,
    createPersonGroupPerson,
    createPersonGroupFace,
    createPersonGroupTrain
} = require("../services/face.service");

router.post("/enroll-user", enrollUser);

async function enrollUser(req, res) {
    try {
        let document = { ...req.body };
        if (!document.name) res.status(400).json({ error: "Bad request", message: "Invalid Name" });
        if (!document.image1) res.status(400).json({ error: "Bad request", message: "Invalid image1" });
        let person = await createPersonGroupPerson(document);
        document.personId = person.personId;
        let faceParam = {
            personId : person.personId,
            base64: document.image1,
            userData: {
                name: document.name,
                age: document.age || '',
                sex: document.sex || '',
                mobile: document.mobile || '',
                address: document.address || ''
            }
        }
        let face1 = await createPersonGroupFace(faceParam)
        document.face1 = face1.persistedFaceId;
        if (document.image2) {
            faceParam.base64 = document.image2;
            let face2 = await createPersonGroupFace(faceParam)
            document.face2 = face2.persistedFaceId;
        }

        if (document.image3) {
            faceParam.base64 = document.image3;
            let face3 = await createPersonGroupFace(faceParam)
            document.face3 = face3.persistedFaceId;
        }

        if (document.image4) {
            faceParam.base64 = document.image4;
            let face4 = await createPersonGroupFace(faceParam)
            document.face4 = face4.persistedFaceId;
        }

        if (document.image5) {
            faceParam.base64 = document.image5;
            let face5 = await createPersonGroupFace(faceParam)
            document.face5 = face5.persistedFaceId;
        }
        createPersonGroupTrain(); //train the group async

        let result = await createUser(document);
        res.status(200).send("User enrolled");
    } catch (err) {
        console.error("error in conroller ::", err);
        res.status(500).json({ error: "Internal Server Error", message: "Something went wrong!" });
    }
}

module.exports = router;
