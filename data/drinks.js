import validation from "../publicMethods.js";
import {drinks, users} from "../config/mongoCollections.js";
import {ObjectId} from "mongodb";
import {getReviewInfoByReviewId} from "./reviews.js";
import {access, unlink} from 'fs/promises';
import {dirname, join} from "path";
import {fileURLToPath} from "url";

/**
 * @param {ObjectId} _id - A globally unique identifier for the specific drink.
 * @param {string} name - the Name of the drink.
 * @param {string} category - The type (liquor, cocktails) of the drink..
 * @param {string} recipe - The description of the drink.
 * @param {number} rating - Average rating of the drinks.
 * @param {array} reviews - An array that stores references (IDs) to the reviews.
 * @param {Array(String)} drinkPictureLocation - the location of the drink picture.
 * @param {number} price - the price of the drink.
 * @param {number} reservedCounts - The number of users who have reserved the specific drink..
 * @param {boolean} available - The boolean that indicate the available of the drink.
 */

//"whiskey", "vodka", "rum", "gin", "tequila", "brandy", "liqueur", "wine", "beer", "juice", "other"
export const createDrink = async (
    name,
    category,
    recipe,
    drinkPictureLocation,
    price
) => {
    name = validation.validateDrinkName(name, "DrinkName");
    category = validation.validateDrinkCategory(category, "DrinkCategory");
    recipe = validation.validateDrinkRecipe(recipe);
    price = validation.validatePrice(price, "Drink Price");

    const drinkCollection = await drinks();
    const ifExist = await drinkCollection.findOne({name: name});
    if (ifExist) {
        throw `Error: ${name} is already exist in the drinks library.`;
    }
    drinkPictureLocation = await validation.validateIfFileExist(drinkPictureLocation);
    const drink = {
        name: name,
        category: category,
        recipe: recipe,
        rating: 0,
        reviews: [],
        drinkPictureLocation: drinkPictureLocation,
        price: price,
        reservedCounts: 0,
        available: true
    }

    const insertDrink = await drinkCollection.insertOne(drink);
    if (!insertDrink.acknowledged || !insertDrink.insertedId) {
        throw `Error: couldn't add drink with the drink name: ${name}`;
    }
    return {insertedDrink: true};

}

export const updateDrink = async (
    drinkId,
    name,
    category,
    recipe,
    drinkPictureLocation,
    price
) => {
    drinkId = validation.validateId(drinkId, "Drink Id");
    name = validation.validateDrinkName(name, "Drink Name");
    category = validation.validateDrinkCategory(category, "Drink Category");
    recipe = validation.validateDrinkRecipe(recipe);
    price = validation.validatePrice(price, "Drink Price");
    const drinkCollection = await drinks();
    const drink = await drinkCollection.findOne({ _id: new ObjectId(drinkId) });

    if (!drink) {
        throw `Error: drink with the drinkId: ${drink} not found`;
    }
    const oldDrinkPictureLocation = drink.drinkPictureLocation;
    drinkPictureLocation = await validation.validateIfFileExist(drinkPictureLocation);
    const updatedDrink = {
        name: name,
        category: category,
        recipe: recipe,
        drinkPictureLocation: drinkPictureLocation,
        price: price
    };
    const updateDrink = await drinkCollection.updateOne(
        { _id: drink._id },
        { $set: updatedDrink }
    );
    if (updateDrink.modifiedCount === 0) {
        throw `Error: Failed to update drink with drinkId: ${drink._id}, drink name: ${name}`;
    }
    //delete the old drink picture file
    try {
        if (oldDrinkPictureLocation!=='') {
            const currentFilePath = fileURLToPath(import.meta.url);
            const currentDirPath = dirname(currentFilePath);
            const absolutePath = join(currentDirPath.replace('data', 'public'), oldDrinkPictureLocation);
            await access(absolutePath);
            await unlink(absolutePath);
        }
    } catch (error) {
        throw `Error: Failed to delete old drink picture at ${oldDrinkPictureLocation}`;
    }
    return { updatedDrink: true };
}

export const deleteDrink = async (
    drinkId
) => {
    drinkId = validation.validateId(drinkId,"drinkId");

    const drinkCollection = await drinks();
    const drink = await drinkCollection.findOne({ _id: new ObjectId(drinkId)});

    if (!drink) {
        throw `Error: drink with drinkId ${drinkId} not found, cannot delete`;
    }
    if(drink.available ===false){
        return { deleteDrink: true };
    }
    const updatedDrink ={
        available: false
    };
    const updateDrink = await drinkCollection.updateOne(
        { _id: drink._id },
        { $set: updatedDrink }
    );
    if (updateDrink.modifiedCount === 0) {
        throw `Error: Failed to delete drink with drinkId: ${drink._id}, drink name: ${drink.name}`;
    }
    return { deleteDrink: true };
}

export const getDrinkInfoByDrinkId = async (
    drinkId
) => {
    drinkId = validation.validateId(drinkId,"drinkId");

    const drinkCollection = await drinks();
    const drink = await drinkCollection.findOne({ _id: new ObjectId(drinkId)});

    if (!drink) {
        throw `Error: drink with drinkId ${drinkId} not found`;
    }

    const drinkInfo = {
        _id:drink._id.toString(),
        name: drink.name,
        category: drink.category,
        recipe: drink.recipe,
        rating: drink.rating,
        reviews: drink.reviews,
        drinkPictureLocation: drink.drinkPictureLocation,
        price: drink.price,
        reservedCounts: drink.reservedCounts,
        available: drink.available,
    };

    return drinkInfo;
}

export const getAllDrinks = async () => {
    const drinkCollection = await drinks();
    const allDrinks = await drinkCollection.find({}).toArray();

    if (!allDrinks || allDrinks.length === 0) {
        throw `Error: No drinks found`;
    }

    const sortedDrinks = allDrinks.sort((a, b) => b.rating - a.rating);
    return sortedDrinks;
}

//sorted by timestamp
export const getAllReviewsOnADrink = async (drinkId) => {
    drinkId = validation.validateId(drinkId, "drinkId");

    const drinkCollection = await drinks();
    const drink = await drinkCollection.findOne({ _id: new ObjectId(drinkId) });
    if (!drink) {
        throw `Error: drink with drinkId ${drinkId} not found`;
    }

    const sortedReviews = drink.reviews.sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
    });

    let reviewsArray = [];

    for (let j = 0; j < sortedReviews.length; j++) {
        const reviewId = sortedReviews[j].toString();
        const reviewInfo = await getReviewInfoByReviewId(reviewId);
        reviewsArray.push(reviewInfo);
    }
    return reviewsArray;
};


export const increaseReservedCounts = async (
    drinkId
) => {
    drinkId = validation.validateId(drinkId,"drinkId");

    const drinkCollection = await drinks();
    const drink = await drinkCollection.findOne({ _id: new ObjectId(drinkId)});

    if (!drink) {
        throw `Error: drink with drinkId ${drinkId} not found, cannot increase ReservedCounts`;
    }
    const currentCounts =  drink.reservedCounts;
    const updatedCounts = currentCounts + 1;
    const updatedDrink = { reservedCounts: updatedCounts };
    const updateDrink = await drinkCollection.updateOne(
        { _id: drink._id },
        { $set: updatedDrink }
    );
    if (updateDrink.modifiedCount === 0) {
        throw `Error: Failed to increase ReservedCounts for drinkId: ${drink._id}, drink name: ${name}`;
    }
    return { increaseReservedCounts: true };
}
export const reserveDrink = async (userId, drinkId) => {
    userId = validation.validateId(userId, "userId");
    drinkId = validation.validateId(drinkId, "drinkId");

    const userCollection = await users();
    const user = await userCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
        throw `Error: User with ID ${userId} not found`;
    }

    const timestamp = validation.generateCurrentDate();
    const reservedDrink = { drinkId, timestamp };

    const updatedReservedDrinks = [...user.drinkReserved, reservedDrink];

    const updateResult = await userCollection.updateOne(
        { _id: user._id },
        { $set: { drinkReserved: updatedReservedDrinks } }
    );

    if (updateResult.modifiedCount === 0) {
        throw `Error: Failed to reserve drink for user with ID ${userId}`;
    }

    const increasedReservedCounts = await increaseReservedCounts(drinkId);
    if(!increasedReservedCounts.increaseReservedCounts === true){
        throw "Error: failed to increased Reserved Counts"
    }
    return { reservedDrink, userId };
};

export const updateAllDrinkRating = async () => {

    try{
        const allDrinks = await getAllDrinks();

        for (const drink of allDrinks) {
            const reviews = await getAllReviewsOnADrink(drink._id.toString());
            if(reviews.length === 0 || reviews === undefined){
                continue;
            }
            const reviewCount = reviews.length;
            let totalRating = 0;
            for (const review of reviews) {
                const oneReview = await getReviewInfoByReviewId(review);
                totalRating += oneReview.rating;
            }
            const rating = (totalRating / reviewCount).toFixed(2);


            const updatedDrinkRating = {
                rating: rating,
            };
            const drinkCollection = await drinks();
            const updateDrink = await drinkCollection.updateOne(
                { _id: drink._id },
                { $set: updatedDrinkRating }
            );
            if (updateDrink.modifiedCount === 0) {
                throw `Error: Failed to update all drinks' ratings `;
            }
        }
    }catch (error){
            throw "Error: Some problem occurred when updating all drinks review."
    }
    return { updatedAllDrinkRating: true };
};