import {
  Order,
  OrderInquiry,
  OrderItemInput,
  OrderUpdateInput,
} from "../libs/types/order";
import { Member } from "../libs/types/member";
import OrderModel from "../schema/Order.model";
import OrderItem from "../schema/OrderItem.model";
import { shapeIntoMongooseObjectID } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { ObjectId } from "mongoose";
import MemberService from "./Member.service";
import { OrderStatus } from "../libs/enums/order.enum";
import ProductService from "./Product.service";

class OrderService {
  private readonly orderModel;
  private readonly orderItemModel;
  private readonly memberService;
  private readonly productService;

  constructor() {
    this.orderModel = OrderModel;
    this.orderItemModel = OrderItem;
    this.memberService = new MemberService();
    this.productService = new ProductService();
  }

  public async createOrder(
    member: Member,
    input: OrderItemInput[]
  ): Promise<Order> {
    const memberId = shapeIntoMongooseObjectID(member._id);
    const amount = input.reduce((accumulator: number, item: OrderItemInput) => {
      return accumulator + item.itemPrice * item.itemQuantity;
    }, 0);
    const delivery = amount < 100 ? 5 : 0;

    try {
      const newOrder: Order = await this.orderModel.create({
        orderTotal: amount + delivery,
        orderDelivery: delivery,
        memberId: memberId,
      });

      const orderId = newOrder._id;
      await this.recordOrderItem(orderId, input);

      const arrOfIds = input.map((ele) => {
        return {
          _id: shapeIntoMongooseObjectID(ele.productId),
          count: -ele.itemQuantity,
        };
      });
      await this.productService.modifyCount(arrOfIds);

      return newOrder;
    } catch (err) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  private async recordOrderItem(
    orderId: ObjectId,
    input: OrderItemInput[]
  ): Promise<void> {
    const itemsToInsert = input.map((item: OrderItemInput) => {
      item.orderId = orderId;
      item.productId = shapeIntoMongooseObjectID(item.productId);
      return item;
    });

    await this.orderItemModel.insertMany(itemsToInsert);
    console.log();

    console.log("orderItemState: INSERTED");
  }

  public async getMyOrders(
    member: Member,
    inquiry: OrderInquiry
  ): Promise<Order[]> {
    const memberId = shapeIntoMongooseObjectID(member._id);
    const matches = { memberId: memberId, orderStatus: inquiry.orderStatus };

    const result = await this.orderModel.aggregate([
      { $match: matches },
      { $sort: { updatedAt: -1 } },
      { $skip: (inquiry.page - 1) * inquiry.page },
      { $limit: inquiry.limit },
      {
        $lookup: {
          from: "orderItems",
          localField: "_id",
          foreignField: "orderId",
          as: "orderItems",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "orderItems.productId",
          foreignField: "_id",
          as: "productData",
        },
      },
    ]);

    if (!result) throw new Errors(HttpCode.BAD_REQUEST, Message.NO_DATA_FOUND);

    return result;
  }

  public async updateOrder(
    member: Member,
    input: OrderUpdateInput
  ): Promise<Order> {
    const memberId = shapeIntoMongooseObjectID(member._id);
    const orderId = shapeIntoMongooseObjectID(input.orderId),
      orderStatus = input.orderStatus;

    const result = await this.orderModel
      .findOneAndUpdate(
        {
          memberId: memberId,
          _id: orderId,
        },
        { orderStatus: orderStatus },
        { new: true }
      )
      .exec();
    const orders = await this.orderItemModel.find({ orderId: orderId });
    console.log(">>>>>>>>>", orders);
    const arrOfIds = orders.map((ele) => {
      return {
        _id: shapeIntoMongooseObjectID(ele.productId),
        count: ele.itemQuantity,
      };
    });
    console.log(">>>>>,<<<<<<<", arrOfIds);
    await this.productService.modifyCount(arrOfIds);
    // console.log("length>>>>", orders.length);
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

    if (orderStatus === OrderStatus.PROCESS) {
      await this.memberService.addUserPoint(member, 1);
    }

    return result;
  }
}

export default OrderService;
