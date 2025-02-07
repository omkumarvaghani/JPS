var express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const userSchema = require("./model");
const { verifyLoginToken } = require("../authentication/authentication");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname.replace(/\s/g, ""));
  },
});

const upload = multer({ storage: storage });

router.post(
  "/students",
  verifyLoginToken,
  upload.single("file"),
  async (req, res) => {
    try {
      // data["createdAt"] = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
      // data["updatedAt"] = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

      const fileName = req.file.filename;
      const fileData = `./${fileName}`;
      const workbook = XLSX.readFile(fileData);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      for (const data of jsonData) {
        await userSchema.findOneAndUpdate(
          { SKU: data.SKU },
          {
            Image: data.Image,
            Video: data.Video,
            DiamondType: data["Diamond Type"],
            HA: data["H&A"],
            Ratio: data.Ratio,
            Tinge: data.Tinge,
            Milky: data.Milky,
            EyeC: data.EyeC,
            Table: data["Table(%)"],
            Depth: data["Depth(%)"],
            measurements: data.measurements,
            Amount: data["Amount U$"],
            Price: data["Price $/ct"],
            Disc: data["Disc %"],
            Rap: data["Rap $"],
            FluoInt: data["Fluo Int"],
            Symm: data.Symm,
            Polish: data.Polish,
            Cut: data.Cut,
            Clarity: data.Clarity,
            Color: data.Color,
            Carats: data.Carats,
            Shape: data.Shape,
            CertificateNo: data["Certificate No"],
            Lab: data.Lab,
            SKU: data.SKU,
            SrNo: data["Sr.No"],
          },
          { upsert: true, new: true }
        );
      }

      res
        .status(200)
        .json({ success: true, message: "Excel file processed successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "An error occurred while processing the request",
      });
    }
  }
);

const labUrlMap = {
  HRD: "https://my.hrdantwerp.com/Download/GetGradingReportPdf/?reportNumber=",
  GIA: "https://www.gia.edu/report-check?locale=en_US&reportno=",
  IGI: "https://www.igi.org/API-IGI/viewpdf-url.php?r=",
};

function getCertificateUrl(lab, certificateNo) {
  if (!lab || !certificateNo) {
    return null;
  }

  const labKey = Object.keys(labUrlMap).find(
    (key) => key.toLowerCase() === lab.toLowerCase()
  );
  if (!labKey) {
    return null;
  }

  const urlBase = labUrlMap[labKey];

  if (labKey === "HRD") {
    return `${urlBase}${encodeURIComponent(
      certificateNo
    )}&printDocumentType=DiamondIdentificationReportPlusMini`;
  }

  return `${urlBase}${encodeURIComponent(certificateNo)}`;
}

const fetchQuoteDetails = async () => {
  const quotes = await userSchema.aggregate([
    {
      $match: { IsDelete: false },
    },
    {
      $project: {
        Image: 1,
        Video: 1,
        DiamondType: 1,
        HA: 1,
        Ratio: 1,
        Tinge: 1,
        Milky: 1,
        EyeC: 1,
        Table: 1,
        Depth: 1,
        measurements: 1,
        Amount: 1,
        Price: 1,
        Disc: 1,
        Rap: 1,
        FluoInt: 1,
        Symm: 1,
        Polish: 1,
        Cut: 1,
        Clarity: 1,
        Color: 1,
        Carats: 1,
        Shape: 1,
        CertificateNo: 1,
        Lab: 1,
        SKU: 1,
        SrNo: 1,
      },
    },
  ]);

  const stockCount = quotes.length;

  return {
    statusCode: quotes.length > 0 ? 200 : 204,
    message:
      quotes.length > 0 ? "Quotes retrieved successfully" : "No quotes found",
    data: quotes,
    TotalCount: stockCount,
  };
};

router.get("/data", verifyLoginToken, async function (req, res) {
  try {
    const result = await fetchQuoteDetails();

    if (result.statusCode === 200) {
      result.data.forEach((diamond) => {
        // Add certificate URL
        const certificateUrl = getCertificateUrl(
          diamond.Lab,
          diamond.CertificateNo
        );
        diamond.certificateUrl = certificateUrl;

        // Add default image URL based on the shape
        const defaultImageUrl = getDefaultImageUrl(diamond.Shape);
        diamond.Image =
          diamond.Image && diamond.Image.length > 0
            ? diamond.Image
            : defaultImageUrl;
      });
    }

    res.status(result.statusCode).json({ result });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

const fetchcaratsDetails = async () => {
  const quotes = await userSchema.aggregate([
    {
      $match: {
        Carats: 1.32,
        IsDelete: false, // Filter to get only Carats = 1.32
      },
    },
    {
      $project: {
        Image: 1,
        Video: 1,
        DiamondType: 1,
        HA: 1,
        Ratio: 1,
        Tinge: 1,
        Milky: 1,
        EyeC: 1,
        Table: 1,
        Depth: 1,
        measurements: 1,
        Amount: 1,
        Price: 1,
        Disc: 1,
        Rap: 1,
        FluoInt: 1,
        Symm: 1,
        Polish: 1,
        Cut: 1,
        Clarity: 1,
        Color: 1,
        Carats: 1,
        Shape: 1,
        CertificateNo: 1,
        Lab: 1,
        SKU: 1,
        SrNo: 1,
      },
    },
  ]);

  const stockCount = quotes.length;

  return {
    statusCode: quotes.length > 0 ? 200 : 204,
    message:
      quotes.length > 0 ? "Quotes retrieved successfully" : "No quotes found",
    data: quotes,
    TotalCount: stockCount,
  };
};

router.get("/caretdata", verifyLoginToken, async function (req, res) {
  try {
    const result = await fetchcaratsDetails();

    if (result.statusCode === 200) {
      result.data.forEach((diamond) => {
        // Add certificate URL
        const certificateUrl = getCertificateUrl(
          diamond.Lab,
          diamond.CertificateNo
        );
        diamond.certificateUrl = certificateUrl;

        // Add default image URL based on the shape
        const defaultImageUrl = getDefaultImageUrl(diamond.Shape);
        diamond.Image =
          diamond.Image && diamond.Image.length > 0
            ? diamond.Image
            : defaultImageUrl;
      });
    }

    res.status(result.statusCode).json({ result });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

function getDefaultImageUrl(Shape) {
  const lowerCaseShape = Shape.toLowerCase();
  switch (lowerCaseShape) {
    case "asscher":
    case "sq eme":
      return "https://jpsjewels.com/wp-content/uploads/Emerald-Square.png";
    case "baguette":
    case "bug":
      return "https://jpsjewels.com/wp-content/uploads/Tapered-baguette.png";
    case "cushion":
    case "cu":
      return "https://jpsjewels.com/wp-content/uploads/Cushion.png";
    case "square cushion":
    case "sq cu":
      return "https://jpsjewels.com/wp-content/uploads/Cushion.png";
    case "cushion modified":
      return "https://jpsjewels.com/wp-content/uploads/Cushion-Square.png";
    case "emerald":
    case "eme":
      return "https://jpsjewels.com/wp-content/uploads/Emerald-Square.png";
    case "square emerald":
      return "https://jpsjewels.com/wp-content/uploads/Emerald-Square.png";
    case "heart":
    case "he":
      return "https://jpsjewels.com/wp-content/uploads/Heart.png";
    case "heart modified":
      return "https://jpsjewels.com/wp-content/uploads/Heart.png";
    case "long radiant":
    case "long rad":
      return "https://jpsjewels.com/wp-content/uploads/Radiant.png";
    case "marquise":
    case "mq":
      return "https://jpsjewels.com/wp-content/uploads/Marquise.png";
    case "marquise modified":
      return "https://jpsjewels.com/wp-content/uploads/Marquise.png";
    case "oval":
    case "ovl":
      return "https://jpsjewels.com/wp-content/uploads/Oval.png";
    case "pear":
    case "pe":
      return "https://jpsjewels.com/wp-content/uploads/Pear.png";
    case "princess":
    case "pri":
      return "https://jpsjewels.com/wp-content/uploads/Princess.png";
    case "princess modified":
      return "https://jpsjewels.com/wp-content/uploads/Princess.png";
    case "radiant":
    case "rad":
      return "https://jpsjewels.com/wp-content/uploads/Radiant-Square.png";
    case "radiant modified":
      return "https://jpsjewels.com/wp-content/uploads/Radiant.png";
    case "round":
    case "rbc":
      return "https://jpsjewels.com/wp-content/uploads/Round.png";
    default:
      return "https://jpsjewels.com/wp-content/uploads/Round.png";
  }
}

const fetchDaimondDetails = async (SkuId) => {
  const diamondSearchQuery = {
    SKU: SkuId,
    IsDelete: false,
  };

  const diamonds = await userSchema.aggregate([
    { $match: diamondSearchQuery },
    {
      $project: {
        Image: 1,
        Video: 1,
        DiamondType: 1,
        HA: 1,
        Ratio: 1,
        Tinge: 1,
        Milky: 1,
        EyeC: 1,
        Table: 1,
        Depth: 1,
        measurements: 1,
        Amount: 1,
        Price: 1,
        Disc: 1,
        Rap: 1,
        FluoInt: 1,
        Symm: 1,
        Polish: 1,
        Cut: 1,
        Clarity: 1,
        Color: 1,
        Carats: 1,
        Shape: 1,
        CertificateNo: 1,
        Lab: 1,
        SKU: 1,
        SrNo: 1,
      },
    },
  ]);

  return {
    statusCode: diamonds.length > 0 ? 200 : 204,
    message:
      diamonds.length > 0
        ? "diamonds retrieved successfully"
        : "No diamonds found",
    data: diamonds,
  };
};

router.get("/data/:SkuId", verifyLoginToken, async function (req, res) {
  try {
    const { SkuId } = req.params;
    const result = await fetchDaimondDetails(SkuId);

    if (result.statusCode === 200) {
      result.data.forEach((diamond) => {
        // Add certificate URL
        const certificateUrl = getCertificateUrl(
          diamond.Lab,
          diamond.CertificateNo
        );
        diamond.certificateUrl = certificateUrl;

        // Add default image URL based on the shape
        const defaultImageUrl = getDefaultImageUrl(diamond.Shape);
        diamond.Image =
          diamond.Image && diamond.Image.length > 0
            ? diamond.Image
            : defaultImageUrl;
      });
    }

    res.status(result.statusCode).json({
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/stockpopup", verifyLoginToken, async function (req, res) {
  try {
    const { SkuId } = req.query;
    const result = await fetchDaimondDetails(SkuId);

    if (result.statusCode === 200) {
      result.data.forEach((diamond) => {
        // Add certificate URL
        const certificateUrl = getCertificateUrl(
          diamond.Lab,
          diamond.CertificateNo
        );
        diamond.certificateUrl = certificateUrl;

        // Add default image URL based on the shape
        const defaultImageUrl = getDefaultImageUrl(diamond.Shape);
        diamond.Image =
          diamond.Image && diamond.Image.length > 0
            ? diamond.Image
            : defaultImageUrl;
      });
    }

    res.status(result.statusCode).json({
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

const deletestock = async (SKU) => {
  try {
    const updatestock = await userSchema.findOneAndUpdate(
      { SKU },
      { $set: { IsDelete: true } },
      { new: true }
    );

    if (!updatestock) {
      return {
        statusCode: 404,
        message: `No user found`,
      };
    }
    return {
      statusCode: 200,
      message: `User deleted successfully.`,
      data: updatestock,
    };
  } catch (error) {
    return {
      statusCode: 500,
      message: "Failed to soft delete user data.",
      error: error.message,
    };
  }
};

router.delete("/deletestock/:SKU", verifyLoginToken, async (req, res) => {
  try {
    const { SKU } = req.params;
    const response = await deletestock(SKU);
    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

module.exports = router;
