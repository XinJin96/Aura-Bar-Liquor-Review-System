import Router from "express"

const router = Router();
import validation from "../publicMethods.js";
import {createUser, getUserInfoByUserId, getUserPasswordById, loginUser} from "../data/users.js";
import {getAllDrinks, getDrinkInfoByName, getDrinkInfoByCategory, getDrinkInfoByRating} from "../data/drinks.js";
import xss from "xss";
import AWS from 'aws-sdk';
import multer from "multer";
import bcrypt from "bcrypt";

const businessPhone = "+19293335817";
const upload = multer({
    dest: "../public/uploads/",
    limits: {fileSize: 10485760},
    onError: function (err, next) {
        console.log("error", err);
        next(err);
    },
});
AWS.config.update({
    accessKeyId: "AKIAQAGUPWCDLUD5Y7PQ",
    secretAccessKey: "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",
    region: 'us-east-1'
});
router
    .route('/').get(async (req, res) => {
    if (req.session.user) {
        return res.redirect('/home');
    } else {
        return res.redirect('/login');
    }
});

router
    .route('/home').get(async (req, res) => {
    let userId = null;
    let userFirstName = null;
    let userLstName = null;
    let userProfilePictureLocation = null;
    let login = false;
    let isAdmin = false;
    if (req.session.user) {
        login = true;
        userId = req.session.user.userId;
        userFirstName = req.session.user.firstName;
        userLstName = req.session.user.lastName;
        userProfilePictureLocation = req.session.user.profilePictureLocation
        if (req.session.user.role === "admin") {
            isAdmin = true;
        }
    }
    const allDrinks = await getAllDrinks();
    if (req.session.user && req.session.user.role === "admin") {
        for (let drink of allDrinks) {
            drink.editable = true;
        }
    }
    return res.render('home', {
        title: "Aura Liquor", drinks: allDrinks, firstName: userFirstName, userId: userId,
        lastName: userLstName, userProfilePictureLocation: userProfilePictureLocation, login: login, isAdmin: isAdmin
    });
})
    .post(async (req, res) => {
        let name = xss(req.body.name);
        let category = xss(req.body.category);
        let rating = xss(req.body.rating);
        if (!name && !category && !rating) {
            res.status(400).render('home', {
                title: "Search error", message: 'Sort/Filter missing'
            });
        }
        try {
            name = validation.validateName(name, "drinkName");
            category = validation.validateDrinkCategory(category, "drinkCategory");
            rating = validation.validateRating(rating);
        } catch (error) {
            return res.status(400).render('error', {
                title: "InputError", message: error
            })
        }

        try {//  let categoryList = await getDrinkInfoByCategory(category); let ratingList = await getDrinkInfoByRating(rating);

            if (name) {
                let nameList = await getDrinkInfoByName(name); //drinkname?
                if (nameList.length === 0) {
                    return res.render('home', {title: "Profile", message: "Not found"});
                } else {
                    return res.render('home', {title: "Profile", sortTerm: nameList});
                }
            } else if (category) {
                let categoryList = await getDrinkInfoByCategory(category); //drinkname?
                if (categoryList.length === 0) {
                    return res.render('home', {title: "Profile", message: "Not found"});
                } else {
                    return res.render('home', {title: "Profile", sortTerm: categoryList});
                }
            } else if (rating) {
                let ratingList = await getDrinkInfoByRating(rating); //drinkname?
                if (ratingList.length === 0) {
                    return res.render('home', {title: "Profile", message: "Not found"});
                } else {
                    return res.render('home', {title: "Profile", sortTerm: ratingList});
                }
            } else {
                return res.status(500).render('home', {title: "error", message: "Internal Server Error"});
            }
        } catch (error) {
            console.error(error);
            return res.status(500).render('error', {title: "Error", message: "Validation Error: getDrinkInfoByName"})
        }
    })


router
    .route('/register')
    .get(async (req, res) => {
        if (req.session.user) {
            return res.redirect('/home');
        } else {
            return res.render('register', {title: "Register"});
        }
    })
    .post(upload.single("photoInput"), async (req, res) => {
        let firstNameInput = xss(req.body.firstNameInput);//same as frontend
        let lastNameInput = xss(req.body.lastNameInput);
        let emailAddressInput = xss(req.body.emailAddressInput);
        let phoneNumberInput = xss(req.body.phoneNumberInput);
        let passwordInput = xss(req.body.passwordInput);
        let confirmPasswordInput = xss(req.body.confirmPasswordInput);
        let roleInput = xss(req.body.roleInput);

        try {
            if (!firstNameInput || !lastNameInput || !emailAddressInput || !phoneNumberInput || !passwordInput || !confirmPasswordInput || !roleInput) {
                throw "Error: You must make sure that firstName, lastName, emailAddress,  password, confirmPassword, role are supplied"
            }
            lastNameInput = validation.validateName(lastNameInput, "lastname");
            firstNameInput = validation.validateName(firstNameInput, "firstName");
            emailAddressInput = validation.validateEmail(emailAddressInput);
            phoneNumberInput = validation.validatePhoneNumber(phoneNumberInput);
            passwordInput = validation.validatePassword(passwordInput, "password");
            confirmPasswordInput = validation.validatePassword(confirmPasswordInput, "confirmPasswordInput");
            roleInput = validation.validateRole(roleInput);


            if (passwordInput !== confirmPasswordInput) {
                throw "Error: Passwords do not match";
            }
        } catch (error) {
            return res.status(400).render('error', {
                title: "InputError", errorMsg: error
            });
        }
        try {
            const user = await createUser(firstNameInput,
                lastNameInput,
                emailAddressInput,
                phoneNumberInput,
                passwordInput,
                req.file,
                // profilePictureLocationInput,
                roleInput);
            if (user.insertedUser) {
                return res.redirect('/login');
            }
        } catch (error) {
            return res.status(500).render('error', {
                title: "error",
                errorMsg: error
            });
        }
    });


router
    .route('/login')
    .get(async (req, res) => {
        //code here for GET
        if (req.session.user) {
            return res.redirect('/');
        }
        return res.render("login", {title: "Login"});
    })
    .post(async (req, res) => {
        //code here for POST
        let emailAddressInput = xss(req.body.emailAddressInput);
        let passwordInput = xss(req.body.passwordInput);
        try {
            emailAddressInput = validation.validateEmail(emailAddressInput);
            passwordInput = validation.validatePassword(passwordInput);
            const user =
                await loginUser(emailAddressInput, passwordInput);
            req.session.user = {
                userId: user.userId,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                profilePictureLocation: user.profilePictureLocation,
                role: user.role
            };
            res.cookie('AuthState', req.session.sessionID);
            return res.redirect('/home');

        } catch (error) {
            return res.status(400).render('error', {
                title: "Inputs Error",
                message: error
            });
        }
    });

router.route("/logout").get(async (req, res) => {
    if (req.session.user) {
        req.session.destroy();
        return res.render("logout", {
            logMsg: "You have been logged out",
            url: "/",
            login: false,
            title: "Logout",
        });
    } else {
        res.status(400);
        return res.redirect("/login");
    }
});


const sns = new AWS.SNS();
const sendSMS = async (phoneNumber, message) => {
    const params = {
        Message: message,
        PhoneNumber: phoneNumber,
    };
    try {
        const info = await sns.publish(params).promise();
        console.log('SMS sent: ', info);
    } catch (error) {
        console.error('Error sending SMS:', error);
    }
};

router.route("/sendMessage").post(async (req, res) => {
    if (req.session.user) {
        let message = null;
        let userPhoneNumber = null;
        try {
            message = validation.validateCallForServiceMessage(xss(req.body.message));
            userPhoneNumber = req.session.user.phoneNumber;
        } catch (error) {
            return res.status(400).render('error', {
                title: "Inputs Error",
                message: error
            });
        }
        try {
            await sendSMS(businessPhone, message);
            await sendSMS(userPhoneNumber, "Message From: Aura Bar: your message was " +
                "successfully sent to the Customer Service Team. We will service you soon. ");
            res.status(200).send('Message sent successfully');
        } catch (error) {
            res.status(500).send('Error sending message');
        }
    } else {
        return res.status(401).render("error", {
            errorMsg: "Please Login to send a message",
            login: false,
            title: "Error",
            redirect: "/login"
        });
    }
});


router
    .route('/checkPassword')
    .post(async (req, res) => {
        try {
            const userId = req.session.user.userId;
            const oldPassword = xss(req.body.oldPassword);
            const realPassword = await getUserPasswordById(userId);
            const match = await bcrypt.compare(oldPassword, realPassword.password);
            if (!match) {
                return res.status(400).send("Error: Old password is incorrect.");
            }
            res.status(200).send({ success: true, message: "Password is matched and ready to be used" });
        } catch (error) {
            res.status(500).send({ success: false, message: "Internal server error." });
        }
    })


router
    .route('/getUserId')
    .get(async (req, res) => {
        if(req.session.user && req.session.user.userId) {
            res.json({ userId: req.session.user.userId });
        } else {
            res.status(401).json({ message: 'Error: User not logged in' });
        }
    })

export default router;