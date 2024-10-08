import express from "express";
const routerAdmin = express.Router();
import adminController from "./controllers/admin.controller";
import productController from "./controllers/product.controller";
import makeUploader from "./libs/utils/uploader";

/** Restaurant */

routerAdmin.get("/", adminController.goHome);

routerAdmin
  .get("/signup", adminController.getSignup)
  .post(
    "/signup",
    makeUploader("members").single("memberImage"),
    adminController.processSignup
  );

routerAdmin
  .get("/login", adminController.getLogin)
  .post("/login", adminController.processLogin);

routerAdmin.get("/logout", adminController.logout);
routerAdmin.get("/check-me", adminController.checkAuthSession);

/** Product */

routerAdmin.get(
  "/product/all",
  adminController.verifyAdmin,
  productController.getAllProducts
);
routerAdmin.post(
  "/product/create",
  adminController.verifyAdmin,
  makeUploader("products").array("productImages", 5),
  productController.createNewProduct
);

routerAdmin.post(
  "/product/delete/:id",
  adminController.verifyAdmin,
  productController.deleteProduct
);

routerAdmin.post(
  "/product/:id",
  adminController.verifyAdmin,
  productController.updateChosenProduct
);

/** User */
routerAdmin.get(
  "/user/all",
  adminController.verifyAdmin,
  adminController.getUsers
);

routerAdmin.post(
  "/user/edit",
  adminController.verifyAdmin,
  adminController.updateChosenUser
);

export default routerAdmin;
