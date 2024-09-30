export const AUTH_TIMER = 24;
export const MORGAN_FORMAT = ":method :url :response-time [:status] \n";

import mongoose from "mongoose";
export const shapeIntoMongooseObjectId = (target: any) => {
  return typeof target === "string"
    ? new mongoose.Types.ObjectId(target)
    : target;
};

import moment from "moment";

const day = moment().format("YY-MM-DD");
const time = moment().format("HH:mm");

export const emailMessage = `thank you for shopping at Gatorade.com</h1>
<p>Your order has been placed successfully! \n
Order date: 20${day} at ${time}</p> \n
Order to be deliverd to : 
`;
