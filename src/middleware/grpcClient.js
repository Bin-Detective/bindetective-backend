const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const fs = require("fs");
require("dotenv").config(); // Load environment variables from .env file

// Load the protobuf
const PROTO_PATH = "../protos/waste_prediction.proto";
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const wastePredictionProto =
  grpc.loadPackageDefinition(packageDefinition).wasteprediction;

// Load service address and port from environment variables
const serviceAddress = `${process.env.ROBIN_GRPC_SERVICE}:${process.env.ROBIN_GRPC_PORT}`;

// Create a client
const client = new wastePredictionProto.WastePrediction(
  serviceAddress,
  grpc.credentials.createInsecure()
);

function predictImage(imagePath, callback) {
  // Read the image file
  const image = fs.readFileSync(imagePath);

  // Create a request
  const request = { image: image };

  // Make the call
  client.PredictImage(request, (error, response) => {
    if (error) {
      console.error("Error:", error);
      callback(error, null);
    } else {
      callback(null, response);
    }
  });
}

module.exports = {
  predictImage,
};
