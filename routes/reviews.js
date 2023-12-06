import validation from "../publicMethods.js";
import {getUserIdByEmail, getUserInfoByUserId} from "../data/users.js";
import {deleteReview, getReviewInfoByReviewId, updateReview} from "../data/reviews.js";
import {getDrinkInfoByDrinkId} from "../data/drinks.js";
import router from "./drinks.js";

router
    .route('/review/:id')
    .get(async (req, res) => {
        //code here for GET
        //check if the review belongs to the user
        if(req.session.user){
            let reviewId = null;
            try {
                reviewId = validation.validateId(req.params.id, "reviewId");
            }catch (error){
                return res.status(400).render("modifyReview", {
                    error: error,
                    login: true,
                    title: "Update Review"
                });
            }
            try{
                const userIdFromDB = await getUserIdByEmail(req.session.user.email);
                const user = await getUserInfoByUserId(userIdFromDB);
                const reviewsMadeByUser = user.reviewIds;
                if (!reviewsMadeByUser.includes(reviewId)) {
                    throw `Error: You don't have access to ${reviewId}, it is not your review!`
                }

            }catch (error){
                return res.status(400).render("modifyReview", {
                    error: error,
                    login: true,
                    title: "Update Review"
                });
            }
            try{
                const review = await getReviewInfoByReviewId(reviewId);
                const drinkInfo = await getDrinkInfoByDrinkId(review.drinkId.toString());
                return res.render("modifyReview", {title: "Modify Review", drinkName: drinkInfo.name, drinkPictureLocation: drinkInfo.drinkPictureLocation,reviewText: review.reviewText, rating: review.rating});
            }catch (error){
                return res.status(400).render("error", {
                    errorMsg: error,
                    login: true,
                    title: "Error",
                });
            }
        }else{
            //if no logged in
            return res.status(401).render("error", {
                errorMsg: "please login first to edit a drink",
                login: false,
                title: "Error",
                redirect: "/"
            });
        }

    })
    //updating a post
    .put(async (req, res) => {
        //code here for POST
        if (req.session.user) {
            let reviewId = null;
            let reviewText = null;
            let rating = null;
            let reviewPictureLocation = null;
            try {
                reviewId = validation.validateId(req.params.id, "reviewId");
                reviewText = validation.validateReviewText(req.body.reviewText);
                rating = validation.validateRating(req.body.rating);
                reviewPictureLocation = validation.validateIfFileExist(req.body.reviewPictureLocation);
            }catch (error){
                return res.status(400).render("modifyReview", {
                    error: error,
                    login: true,
                    title: "Update Review"
                });
            }
            try{
                const userIdFromDB = await getUserIdByEmail(req.session.user.email);
                const user = await getUserInfoByUserId(userIdFromDB);
                const reviewsMadeByUser = user.reviewIds;
                if (!reviewsMadeByUser.includes(reviewId)) {
                    throw `Error: You don't have access to ${reviewId}, it is not your review!`
                }

            }catch (error){
                return res.status(400).render("modifyReview", {
                    error: error,
                    login: true,
                    title: "Update Review"
                });
            }
            try{
                const review = await getReviewInfoByReviewId(reviewId);
                const updatedReview = await updateReview(
                    reviewId, validation.generateCurrentDate(), review.drinkId, review.userId, reviewText, rating,reviewPictureLocation);
                if(updatedReview.updatedReview === true){
                    return res.status(200).redirect('/review/'+reviewId);
                }
            }catch (error){
                console.error(error);
                return res.status(500).render('error', {
                    title: "Error",
                    message: "Internal Server Error"
                });
            }
        }
        else{
            return res.status(401).render("error", {
                errorMsg: "please login first to edit a review",
                login: false,
                title: "Error",
            });
        }
    })
    .delete(async (req, res) => {
        //code here for POST
        if (req.session.user) {
            if (req.session.user) {
                let reviewId = null;
                try {
                    reviewId = validation.validateId(req.params.id, "reviewId");
                }catch (error){
                    return res.status(400).render("modifyReview", {
                        error: error,
                        login: true,
                        title: "Update Review"
                    });
                }
                try{
                    const userIdFromDB = await getUserIdByEmail(req.session.user.email);
                    const user = await getUserInfoByUserId(userIdFromDB);
                    const reviewsMadeByUser = user.reviewIds;
                    if (!reviewsMadeByUser.includes(reviewId)) {
                        throw `Error: You cannot delete review: ${reviewId}, it is not your review!`
                    }

                }catch (error){
                    return res.status(400).render("modifyReview", {
                        error: error,
                        login: true,
                        title: "Update Review"
                    });
                }
                try{
                    const review = await getReviewInfoByReviewId(reviewId);
                    const drinkId = review.drinkId;
                    const deletedReview = await deleteReview(
                        reviewId);
                    if(deletedReview.deletedReview === true){
                        return res.status(200).redirect('/drink/'+drinkId);
                    }
                }catch (error){
                    console.error(error);
                    return res.status(500).render('error', {
                        title: "Error",
                        message: "Internal Server Error"
                    });
                }
            }else{
                return res.status(401).render("error", {
                    errorMsg: "please login first to delete a review",
                    login: false,
                    title: "Error",
                });
            }
        }
    });
export default router;