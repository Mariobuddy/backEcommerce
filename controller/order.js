const orderModel = require("../database/schema2");
const customError = require("../utils/errorHandler");
const productModel = require("../database/schema1");

const newOrder = async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;
  if (
    !shippingInfo &&
    !orderItems &&
    !paymentInfo &&
    !itemPrice &&
    !taxPrice &&
    !shippingPrice &&
    !totalPrice
  ) {
    return next(new customError("All Field are required", 422, "fail"));
  }
  try {
    let order = await orderModel.create({
      shippingInfo,
      orderItems,
      paymentInfo,
      itemPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paidAt: Date.now(),
      user: req.user._id,
    });
    await order.save();
    res.status(200).json({
      sucess: true,
      order,
    });
  } catch (error) {
    return next(new customError("Internal Server Error", 500, "error"));
  }
};

const allOrders = async (req, res, next) => {
  try {
    let order = await orderModel.find();
    let total = 0;
    order.map((val) => {
      total += val.totalPrice;
    });
    res.status(200).json({
      sucess: true,
      order,
      total,
    });
  } catch (error) {
    return next(new customError("Internal Server Error", 500, "error"));
  }
};

const singleOrder = async (req, res, next) => {
  try {
    const order = await orderModel
      .findById(req.params.id)
      .populate("user", "name email");

    if (!order) {
      return next(new customError("order not found", 404, "fail"));
    }

    res.status(200).json({
      sucuss: true,
      order,
    });
  } catch (error) {
    return next(new customError("Internal Server Error", 500, "error"));
  }
};

const myOrder = async (req, res, next) => {
  try {
    const order = await orderModel.find({ user: req.user._id });

    if (!order) {
      return next(new customError("order not found", 404, "fail"));
    }

    res.status(200).json({
      sucuss: true,
      order,
    });
  } catch (error) {
    return next(new customError("Internal Server Error", 500, "error"));
  }
};

const updateOrders = async (req, res, next) => {
  try {
    let order = await orderModel.findById(req.params.id);
    if (!order) {
      return next(new customError("order not found", 404, "fail"));
    }
    if (order.orderStatus === "Delivered") {
      return next(new customError("Order already delivered", 400, "fail"));
    }
    order.orderItems.map(async (val) => {
      return await updateStock(val.product, val.quantity);
    });

    if (req.body.status === "Delivered") {
      order.deliveredAt = Date.now();
    }
    res.status(200).json({
      sucess: true,
      message: "Stock Updated",
    });
  } catch (error) {
    return next(new customError("Internal Server Error", 500, "error"));
  }
};

const deleteOrder = async (req, res, next) => {
  try {
    let order = await orderModel.findByIdAndRemove(req.params.id);
    if (!order) {
      return next(new customError("order not found", 404, "fail"));
    }
    res.status(200).json({
      sucess: true,
      message: "Order Deleted",
    });
  } catch (error) {
    return next(new customError("Internal Server Error", 500, "error"));
  }
};

const updateStock = async (id, quantity) => {
  let product = await productModel.findById(id);
  product.stock -= quantity;
  await product.save();
};

module.exports = {
  newOrder,
  singleOrder,
  myOrder,
  allOrders,
  updateOrders,
  deleteOrder,
};
