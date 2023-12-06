import Router from "express";

const router = Router();
import validation from "../publicMethods.js";
import {createDrink, deleteDrink, getAllReviewsOnADrink, getDrinkInfoByDrinkId, updateDrink} from "../data/drinks.js";
import xss from "xss";


//drink detail page and shows all reviews, if the review is made by the user, it will show the edit button


// "/new" to create a drink, has method: get, post
router
    .route('/new')
    .get(async (req, res) => {
        // If logged in and the role is admin
        if (req.session.user && req.session.user.role === "admin") {
            return res.render("createDrink", {
                title: "Add A Drink",
                login: true
            });
            //if not admin
        } else if (req.session.user && req.session.user.role !== "admin") {
            res.status(403).render("error", {
                errorMsg: "Sorry, You are not admin, hence you cannot add a drink...",
                login: true,
                title: "Authorization Error"
            });
        } else {
            //if not logged in
            return res.status(401).render("error", {
                errorMsg: "Please Login to add a drink.",
                login: false,
                title: "Error"
            });
        }
    })
    .post(async (req, res) => {
        //adding a drink
        if (req.session.user && req.session.user.role === "admin") {
            let name = null;
            let category = null;
            let recipe = null;
            let drinkPictureLocation = null;
            let price = null;
            try {
                name = validation.validateName(xss(req.body.name), "Drink Name");
                category = validation.validateDrinkCategory(xss(req.body.category));
                recipe = validation.validateDrinkRecipe(xss(req.body.recipe));
                drinkPictureLocation = validation.validateIfFileExist(xss(req.body.drinkPictureLocation));
                price = validation.validatePrice(xss(req.body.price));
            } catch (error) {
                return res.status(400).render("createDrink", {
                    error: error,
                    login: true,
                    title: "Add A Drink"
                });
            }

            try {
                const newDrink = await createDrink(name, category, recipe, drinkPictureLocation, price);
                res.status(200).redirect("/drinks/" + newDrink._id.toString());
            } catch (error) {
                console.error(error);
                return res.status(500).render('error', {
                    title: "Error",
                    message: "Internal Server Error"
                });
            }

        } else {
            //if not logged in, cannot create a new drink
            return res.status(401).render("error", {
                errorMsg: "Please Login to add a drink.",
                login: false,
                title: "Error"
            });
        }
    });


// "/:id" to see the detail about a drink, has method: get, delete, post
router
    .route('/:id')
    .get(async (req, res) => {
        // If logged in
        if (req.session.user) {
            //if the drinkId is wrong
            let drinkId = null;
            try{
                drinkId = validation.validateId(req.params.id, "ID");
            }catch(error){
                return res.status(400).render("drinkInfo", {
                    error: error,
                    login: true,
                    title: "Drink Detail"
                });
            }
            // get the drinksInfo
            try {
                const drinkInfo = await getDrinkInfoByDrinkId(drinkId);
                const reviews = await getAllReviewsOnADrink(drinkId);

                return res.status(200).render('drinkInfo', {
                    title: "Drink Detail",
                    drinkInfo: drinkInfo,
                    reviews: reviews
                });
            } catch (error) {
                console.error(error);
                return res.status(500).render('error', {
                    title: "Error",
                    message: "Internal Server Error"
                });
            }
            //if not logged in
        } else {
            return res.status(401).render("error", {
                errorMsg: "Please Login to view details about this drink.",
                login: false,
                title: "Error",
            });
        }
    })
    .post(async (req, res) => {
        //post is to edit a drink
        if(req.session.user && req.session.user.role ==="admin"){
            let drinkId = null;
            let name = null;
            let category = null;
            let recipe = null;
            let drinkPictureLocation = null;
            let price = null;
            try{
                drinkId = validation.validateId(req.params._id, "drinkId");
                name = validation.validateName(xss(req.body.name), "Drink Name");
                category = validation.validateDrinkCategory(xss(req.body.category), "Drink Category")
                recipe = validation.validateDrinkRecipe(xss(req.body.recipe));
                drinkPictureLocation = validation.validateIfFileExist(xss(req.body.drinkPictureLocation));
                price = validation.validatePrice(xss(req.body.price));
            }catch (error){
                return res.status(400).render("updateDrinkInfo", {
                    error: error,
                    login: true,
                    title: "Update Drink"
                });
            }
            try{
                const updatedDrink = await updateDrink(drinkId, name, category, recipe, drinkPictureLocation, price);
                if(updatedDrink.updatedDrink===true){
                    return res.status(200).redirect('/drinkInfo/'+drinkId);
                }else{
                    throw "Error happened then updating a drink."
                }

            }catch (error){
                console.error(error);
                return res.status(500).render('error', {
                    title: "Error",
                    message: "Internal Server Error"
                });
            }
            //if no admin,
        } else if(req.session.user && req.session.user.role !=="admin"){
            return res.status(401).render("error", {
                errorMsg: "you do not have a privileges to edit a drink",
                login: true,
                title: "Error",
            });
        }else{
            return res.status(401).render("error", {
                errorMsg: "Olease login first to edit a drink",
                login: false,
                title: "Error",
            });
        }
    })
    .delete(async (req, res) => {
        if(req.session.user && req.session.user.role ==="admin"){
            let drinkId = null;
            try{
                drinkId = validation.validateId(req.params._id, "drinkId");
            }catch (error){
                return res.status(400).render("updateDrinkInfo", {
                    error: error,
                    login: true,
                    title: "Update Drink"
                });
            }
            try{
                const deletedDrink = await deleteDrink(drinkId);
                if(deletedDrink.deleteDrink===true){
                    return res.status(200).redirect('/');
                }else{
                    throw "Error happened then deleting a drink."
                }
            }catch (error){
                console.error(error);
                return res.status(500).render('error', {
                    title: "Error",
                    message: "Internal Server Error"
                });
            }
            //if no admin,
        } else if(req.session.user && req.session.user.role !=="admin"){
            return res.status(401).render("error", {
                errorMsg: "you do not have a privileges to delete a drink",
                login: true,
                title: "Error",
            });
        }else{
            //if no logged in
            return res.status(401).render("error", {
                errorMsg: "please login first to edit a drink",
                login: false,
                title: "Error",
            });
        }
    });

// if the user click on the edit button, it will direct the user to a new page exclusively for modifying the review information


export default router;
