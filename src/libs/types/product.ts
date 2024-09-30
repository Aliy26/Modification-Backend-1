import { ObjectId } from "mongoose";
import {
  ProductCollection,
  ProductStatus,
  ProductUnit,
} from "../enums/product.enum";

export interface Product {
  _id: ObjectId;
  productStatus: ProductStatus;
  productCollection: ProductCollection;
  productName: string;
  productPrice: number;
  productLeftCount: number;
  productDesc?: string;
  productImages: string[];
  productViews: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductInquiry {
  order: string;
  page: number;
  limit: number;
  productCollection?: ProductCollection;
  sort?: string;
  search?: string;
}

export interface ProductInput {
  productStatus?: ProductStatus;
  productCollection: ProductCollection;
  productName: string;
  productPrice: number;
  productLeftCount: number;
  productUnit: ProductUnit;
  productPerSaleCount: number;
  productVolume?: number;
  productDesc?: string;
  productImages?: string[];
  productViews?: number;
}

export interface ProductUpdateInput {
  _id: ObjectId;
  productStatus?: ProductStatus;
  productCollection: ProductCollection;
  productName?: string;
  productPrice?: number;
  productLeftCount?: number;
  productUnit?: ProductUnit;
  productPerSaleCount?: number;
  productDesc?: string;
  productImages?: string[];
  productViews?: number;
}

export interface ModifyCount {
  _id: ObjectId;
  count: number;
}
