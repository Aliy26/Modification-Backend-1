import { T } from "../libs/types/common";
import { shapeIntoMongooseObjectId } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/Errors";
import {
  ModifyCount,
  Product,
  ProductInput,
  ProductInquiry,
  ProductUpdateInput,
} from "../libs/types/product";
import ProductModel from "../schema/Product.model";
import { ProductStatus } from "../libs/enums/product.enum";
import { ObjectId } from "mongoose";
import ViewService from "./View.service";
import { ViewInput } from "../libs/types/view";
import { ViewGroup } from "../libs/enums/view.enum";
import LikeService from "./Likes.service";
import { LikeGroup } from "../libs/enums/likes";
import { LikeInput } from "../libs/types/likes";
import OrderItem from "../schema/OrderItem.model";
import { OrderStatus } from "../libs/enums/order.enum";
import { OrderItems } from "../libs/types/order";

class ProductService {
  private readonly productModel;
  private readonly viewService;
  private readonly likeService;
  private readonly orderItemModel;

  constructor() {
    this.productModel = ProductModel;
    this.orderItemModel = OrderItem;
    this.viewService = new ViewService();
    this.likeService = new LikeService();
  }

  /**  SPA */

  public async getProducts(inquiry: ProductInquiry): Promise<Product[]> {
    const match: T = {
      productStatus: ProductStatus.PROCESS,
      productLeftCount: { $ne: 0 },
    };

    if (inquiry.productCollection)
      match.productCollection = inquiry.productCollection;
    if (inquiry.search) {
      match.productName = { $regex: new RegExp(inquiry.search, "i") };
    }
    console.log(inquiry);
    const sort: T =
      inquiry.sort === "asc" ? { [inquiry.order]: 1 } : { [inquiry.order]: -1 };

    const result = await this.productModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        { $skip: (inquiry.page * 1 - 1) * inquiry.limit }, // 3 => no skip
        { $limit: inquiry.limit * 1 }, // 3 => 1, 2, 3
      ])
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result;
  }

  public async getProduct(
    memberId: ObjectId | null,
    id: string
  ): Promise<Product> {
    const productId = shapeIntoMongooseObjectId(id);
    let result = await this.productModel
      .findOne({
        _id: productId,
        productStatus: ProductStatus.PROCESS,
      })
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    if (memberId) {
      // Check Existence
      const input: ViewInput = {
        memberId: memberId,
        viewRefId: productId,
        viewGroup: ViewGroup.PRODUCT,
      };

      const existView = await this.viewService.checkViewExistence(input);
      console.log("exist", !!existView);
      if (!existView) {
        // Insert View
        await this.viewService.insertMemberView(input);

        // Increase Counts
        result = await this.productModel
          .findByIdAndUpdate(
            productId,
            { $inc: { productViews: +1 } },
            { new: true }
          )
          .exec();
      }
    }

    return result;
  }

  public async modifyCount(
    input: ModifyCount[],
    target: string
  ): Promise<void> {
    const updatePromises = input.map((item) =>
      this.productModel.findByIdAndUpdate(
        item._id,
        {
          $inc: { [target]: item.count },
        },
        { new: true }
      )
    );

    await Promise.allSettled(updatePromises);
  }

  public async likeProduct(memberId: ObjectId, id: string): Promise<Product> {
    const productId = shapeIntoMongooseObjectId(id);
    let result = await this.productModel
      .findOne({
        _id: productId,
        productStatus: ProductStatus.PROCESS,
      })
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    const input: LikeInput = {
      memberId: memberId,
      likeRefId: productId,
      likeGroup: LikeGroup.PRODUCT,
    };

    const checkLike = await this.likeService.checkLike(input);

    if (checkLike) {
      result = await this.productModel
        .findOneAndUpdate(
          productId,
          { $inc: { productLikes: -1 } },
          { new: true }
        )
        .exec();

      await this.likeService.deleteLike(input);
    } else {
      await this.likeService.regMemberLike(input);

      result = await this.productModel
        .findByIdAndUpdate(
          { _id: productId },
          { $inc: { productLikes: +1 } },
          { new: true }
        )
        .exec();
    }

    return result;
  }

  /**  SSR */

  public async getAllProducts(): Promise<Product[]> {
    const result = await this.productModel.find().exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result;
  }

  public async createNewProduct(input: ProductInput): Promise<Product> {
    try {
      return await this.productModel.create(input);
    } catch (err) {
      console.log("Error, model:createNewProduct:", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  public async updateChosenProduct(
    id: string,
    input: ProductUpdateInput
  ): Promise<Product> {
    id = shapeIntoMongooseObjectId(id);
    const product = await this.productModel.findById(id);

    const result = await this.productModel
      .findOneAndUpdate({ _id: id }, input, { new: true })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.UPDATE_FAILED);

    if (product.productPrice !== result.productPrice) {
      await this.orderItemModel
        .updateMany(
          {
            productId: result._id,
            status: OrderStatus.PAUSE,
          },
          { itemPrice: result.productPrice }
        )
        .exec();
    }
    return result;
  }

  public async deleteProduct(input: string): Promise<void> {
    input = shapeIntoMongooseObjectId(input);
    const result = await this.productModel.findByIdAndDelete(input).exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
  }
}

export default ProductService;
