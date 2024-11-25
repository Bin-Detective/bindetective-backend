const axios = require("axios");
require("dotenv").config(); // Load environment variables from .env file

// Load service address and port from environment variables
const serviceAddress = `${process.env.FASTAPI_SERVICE}`;

async function predictImage(imageUrl) {
  try {
    // Send a POST request to the /predict endpoint with the image URL
    const response = await axios.post(`${serviceAddress}/predict`, {
      url: imageUrl,
    });

    console.log("Prediction:", response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      console.error("Error response headers:", error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Error request data:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error message:", error.message);
    }
    throw error;
  }
}

module.exports = {
  predictImage,
};
