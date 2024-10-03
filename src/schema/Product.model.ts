import mongoose, { Schema } from "mongoose";
import {
  ProductCollection,
  ProductStatus,
  ProductUnit,
} from "../libs/enums/product.enum";

// Schema first & Code first

const productSchema = new Schema(
  {
    productStatus: {
      type: String,
      enum: ProductStatus,
      default: ProductStatus.PAUSE,
    },

    productCollection: {
      type: String,
      enum: ProductCollection,
      required: true,
    },

    productName: {
      type: String,
      required: true,
    },

    productPrice: {
      type: Number,
      required: true,
    },

    productLeftCount: {
      type: Number,
      required: true,
    },
    productSoldCount: {
      type: Number,
      default: 0,
    },

    productUnit: {
      type: String,
      enum: ProductUnit,
      required: true,
    },

    productPerSaleCount: {
      type: Number,
      required: true,
    },

    productDesc: {
      type: String,
    },
    productImages: {
      type: [String],
      default: [],
    },
    productViews: {
      type: Number,
      default: 0,
    },
  },

  { timestamps: true } // createdAt updatedAt
);

productSchema.index(
  { productName: 1, productSize: 1, productValue: 1 },
  { unique: true }
);

export default mongoose.model("Products", productSchema);
