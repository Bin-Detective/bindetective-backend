const { predictImage } = require("../middleware/grpcClient");

exports.handlePredictImage = (req, res) => {
  const imagePath = req.file.path; // Assuming the image is uploaded and available at req.file.path

  predictImage(imagePath, (error, response) => {
    if (error) {
      res.status(500).send("Internal Server Error");
    } else {
      res.status(200).send({
        predicted_class: response.predicted_class,
        waste_type: response.waste_type,
        probabilities: response.probabilities,
      });
    }
  });
};
