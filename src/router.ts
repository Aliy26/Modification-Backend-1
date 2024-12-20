import express from "express";
const router = express.Router();

import memberController from "./controllers/member.controller";
import uploader from "./libs/utils/uploader";
import productController from "./controllers/product.controller";
import orderController from "./controllers/order.controller";

/** Member **/
router.get("/member/admin", memberController.getRestaurant);

router.post("/member/signup", memberController.signup);
router.post("/member/login", memberController.login);
router.post(
  "/member/logout",
  memberController.verifyAuth,
  memberController.logout
);
router.get(
  "/member/detail",
  memberController.verifyAuth,
  memberController.getMemberDetail
);

router.get(
  "/member/delete/image",
  memberController.verifyAuth,
  memberController.deleteImage
);

router.post(
  "/member/update",
  memberController.verifyAuth,
  uploader("members").single("memberImage"),
  memberController.updateMember
);

router.post(
  "/member/update/password",
  memberController.verifyAuth,
  memberController.updatePassword
);

router.post(
  "/member/update/email",
  memberController.verifyAuth,
  memberController.updateEmail
);

router.post(
  "/member/delete",
  memberController.verifyAuth,
  memberController.deleteMember
);

router.get("/member/top-users", memberController.getTopUsers);

/** Product **/
router.get("/product/all", productController.getProducts);

router.get(
  "/product/like/:id",
  memberController.verifyAuth,
  productController.likeProduct
);

router.get(
  "/product/:id",
  memberController.retrieveAuth,
  productController.getProduct
);

/** Order **/
router.post(
  "/order/create",
  memberController.verifyAuth,
  orderController.createOrder
);

router.get(
  "/order/all",
  memberController.verifyAuth,
  orderController.getMyOrders
);

router.post(
  "/order/update",
  memberController.verifyAuth,
  orderController.updateOrder
);

export default router;
