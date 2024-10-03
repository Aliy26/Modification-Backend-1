import {
  Order,
  OrderInquiry,
  OrderItems,
  OrderItemInput,
  OrderUpdateInput,
} from "../libs/types/order";
import { Member } from "../libs/types/member";
import OrderModel from "../schema/Order.model";
import OrderItem from "../schema/OrderItem.model";
import { shapeIntoMongooseObjectId } from "../libs/config";
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
    const memberId = shapeIntoMongooseObjectId(member._id);
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
      item.productId = shapeIntoMongooseObjectId(item.productId);
      return item;
    });

    await this.orderItemModel.insertMany(itemsToInsert);

    console.log("orderItemState: INSERTED");
  }

  public async getMyOrders(
    member: Member,
    inquiry: OrderInquiry
  ): Promise<Order[]> {
    const memberId = shapeIntoMongooseObjectId(member._id);
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
    const memberId = shapeIntoMongooseObjectId(member._id);
    const orderId = shapeIntoMongooseObjectId(input.orderId),
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

    if (result.orderStatus === OrderStatus.PROCESS) {
      const orders = await this.orderItemModel.find({ orderId: orderId });
      const modifyCountInput = orders.map((ele: OrderItems) => {
        return {
          _id: shapeIntoMongooseObjectId(ele.productId),
          count: -ele.itemQuantity,
        };
      });
      await this.productService.modifyCount(
        modifyCountInput,
        "productLeftCount"
      );
      await this.productService.modifyCount(
        modifyCountInput.map((item) => ({
          _id: item._id,
          count: -item.count,
        })),
        "productSoldCount"
      );
      const updateStatus = orders.map(async (ele: OrderItems) => {
        const status = ele.status;
        return await this.orderItemModel
          .findOneAndUpdate(
            { status: status },
            { status: OrderStatus.PROCESS },
            { new: true }
          )
          .exec();
      });
      await Promise.all(updateStatus);
    } else if (result.orderStatus === OrderStatus.DELETE) {
      const check = await this.orderItemModel.updateMany(
        { orderId: orderId },
        { status: OrderStatus.DELETE }
      );
      console.log(check);
    }

    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

    if (orderStatus === OrderStatus.PROCESS) {
      await this.memberService.addUserPoint(member, 1);
    }

    return result;
  }

  public async updateItemsPrice(): Promise<void> {}

  // public async cancelOverdueOrders(): Promise<void> {
  //   try {
  //     const result: Order[] = await this.orderModel
  //       .find({
  //         orderStatus: OrderStatus.DELETE,
  //       })
  //       .exec();
  //     if (result.length >= 1) {
  //       const orderIds = result.map((ele: Order) => {
  //         return ele._id;
  //       });
  //       console.log(`deleted ${result.length} cancelled orders`);
  //       await this.orderModel.deleteMany({ _id: { $in: orderIds } }).exec();
  //       await this.orderItemModel.deleteMany({ orderId: { $in: orderIds } });
  //     } else {
  //       console.log("no cancelled orders, everything is clean");
  //     }
  //   } catch (err) {
  //     console.log("Error, cancelOverdueOrders", err);
  //   }
  // }

  // public async cancelOverdueOrders(): Promise<void> {
  //   const oneDay = new Date(Date.now() - 60 * 60 * 24 * 1000);
  //   try {
  //     const overdueOrders: Order[] = await this.orderModel.find({
  //       orderStatus: OrderStatus.PAUSE,
  //       createdAt: { $lt: oneDay },
  //     });

  //     await Promise.all(
  //       overdueOrders.map((order) => this.updateOverdueOrder(order._id))
  //     );
  //   } catch (err) {
  //     console.error("Error, cancelOverdueOrders", err);
  //   }
  // }

  // public async updateOverdueOrder(orderId: ObjectId): Promise<void> {
  //   try {
  //     const orderItems: OrderItems[] = await this.orderItemModel.find({
  //       orderId,
  //     });
  //     const modifyCountInput = orderItems.map((item) => ({
  //       _id: item.productId,
  //       count: item.itemQuantity,
  //     }));

  //     await this.productService.modifyCount(modifyCountInput);

  //     await this.orderModel.findByIdAndUpdate(orderId, {
  //       orderStatus: OrderStatus.DELETE,
  //     });

  //     console.log(`Order ${orderId} cancelled successfully`);
  //   } catch (err) {
  //     console.error("Error, cancelOrder", err);
  //   }
  // }
}

export default OrderService;
