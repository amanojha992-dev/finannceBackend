import mongoose from "mongoose";

const stockSchema = new mongoose.Schema(
  {
    
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },

    purchasePrice: {
      type: Number,
      required: true,
      min: 0
    },

  
    qty: {
      type: Number,
      required: true,
      min: 1
    },

  
    exchange: {
      type: String,
      enum: ["NSE", "BSE"],
      default: "NSE"
    },

    sector: {
      type: String,
      trim: true,
      default:"Miscellaneous"
    }

  
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Stock", stockSchema);
