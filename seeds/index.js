const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/YelpCamp')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(error => {
        console.log(error);
    });

// Randomization
const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: `628ce0cc5acb6edd7a136873`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            geometry: { type: 'Point', coordinates: [ cities[random1000].longitude, cities[random1000].latitude ] },
            description: `lorem ipsum dolor sit amet, consect`,
            image: `https://source.unsplash.com/collection/483251`,
            price: price,
            images:[
                {
                  url: 'https://res.cloudinary.com/di03uiiqn/image/upload/v1653728540/YelpCamp/zkwr8gnkx0a9zrb5rfrc.png',
                  filename: 'YelpCamp/zkwr8gnkx0a9zrb5rfrc',
                },
                {
                  url: 'https://res.cloudinary.com/di03uiiqn/image/upload/v1653728539/YelpCamp/rmcqsxqw8t7q6ickxhrh.png',
                  filename: 'YelpCamp/rmcqsxqw8t7q6ickxhrh',
                }
              ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})