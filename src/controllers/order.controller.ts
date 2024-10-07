import { ExtendedRequest, Member } from "../libs/types/member";
import Errors, { HttpCode } from "../libs/Errors";
import { T } from "../libs/types/common";
import { Request, Response } from "express";
import OrderService from "../model/Order.service";
import { OrderInquiry, OrderUpdateInput } from "../libs/types/order";
import { OrderStatus } from "../libs/enums/order.enum";
import { sendOrderConfirmation } from "../libs/emailService";
import { emailMessage } from "../libs/config";

const orderService = new OrderService();

const orderController: T = {};
orderController.createOrder = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("createOrder");
    const result = await orderService.createOrder(req.member, req.body);

    res.status(HttpCode.CREATED).json(result);
  } catch (err) {
    console.log("createOrder", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

orderController.getMyOrders = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("getMyOrders");

    const { page, limit, orderStatus } = req.query;
    const inquiry: OrderInquiry = {
      page: Number(page),
      limit: Number(limit),
      orderStatus: orderStatus as OrderStatus,
    };
    console.log("inquiry:", inquiry);
    const result = await orderService.getMyOrders(req.member, inquiry);

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("getMyOrders", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

orderController.updateOrder = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("updateOrder");
    const input: OrderUpdateInput = req.body;
    const result = await orderService.updateOrder(req.member, input);
    res.status(HttpCode.OK).json(result);
    if (result.orderStatus === OrderStatus.PROCESS) {
      try {
        await sendOrderConfirmation({
          to: req.member.memberEmail,
          subject: "Order Confirmation",
          html: `<h1>Dear ${req.member.memberNick}, ${emailMessage} ${req.member.memberAddress}🫡`,
        });
      } catch (err) {
        console.error("Failed to send order confirmation email:", err);
      }
    }
  } catch (err) {
    console.log("updateOrder", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

export default orderController;
