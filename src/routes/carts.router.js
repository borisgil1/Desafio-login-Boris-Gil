const express = require("express");
const router = express.Router();
const CartManager = require("../controllers/cartManager.js");
const ProductManager = require("../controllers/productManager.js");
const cartManager = new CartManager();
const productManager = new ProductManager();
const mongoose = require("mongoose");

//Crear carrito
router.post("/", async (req, res) => {
    try {
        const newCart = {
            products: []
        };
        await cartManager.addCart(newCart);
        return res.status(201).send({ message: "Carrito nuevo agregado", newCart });
    } catch (error) {
        console.error("Error al crear nuevo carrito", error);
        return res.status(500).send("Error al crear nuevo carrito");
    }
});

//Mostrar carrito por ID
router.get("/:cid", async (req, res) => {
    let cid = req.params.cid;
    try {
        const cart = await cartManager.getCartById(cid);
        if (cart) {
            return res.send(cart);
        } else {
            return res.status(404).send("Carrito no encontrado")
        }
    } catch (error) {
        console.error("Error al mostrar carrito", error);
        return res.status(500).send("Error al mostrar carrito");
    }
});

//Mostrar todos los carritos
router.get("/", async (req, res) => {
    try {
        const carts = await cartManager.getCarts();
        return res.status(200).send(carts);
    } catch (error) {
        console.error("Error al mostrar carritos:", error);
        return res.status(500).send("Error al mostrar carritos")
    }
});

//Agregar productos a carritos
router.post("/:cid/products/:pid", async (req, res) => {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const quantity = req.body.quantity;

    try {
        const cartUpdated = await cartManager.addProductToCart(cid, pid, quantity)
        return res.status(200).send({ message: "Producto agregado al carrito con éxito", cart: cartUpdated });
    } catch (error) {
        console.error("Error al agregar producto al carrito:", error);
        return res.status(500).send("Error al agregar producto al carrito:");
    }
});



//Eliminar producto de carrito
router.delete("/:cid/products/:pid", async (req, res) => {
    let cid = req.params.cid;
    let pid = req.params.pid;
    try {
        const foundCart = await cartManager.getCartById(cid)
        if (!foundCart || !pid) {
            return res.status(404).send({ message: "Carrito o producto no encontrado" });
        }
        const productIndex = foundCart.products.findIndex(product => product.product.equals(pid));
        foundCart.products.splice(productIndex, 1);
        await foundCart.save();
        console.log("Producto eliminado:", foundCart);
        return res.status(200).send({ message: "Producto eliminado del carrito con éxito", updatedCart: foundCart });
    } catch (error) {
        console.error("Error al eliminar el producto:", error);
        return res.status(500).send("Error al eliminar el producto");
    }
})

//Actualizar productos del carrito
router.put("/:id", async (req, res) => {
    const cid = req.params.id;
    console.log(cid)
    const { product, quantity } = req.body;
    console.log("Productos recibidos:", product);
    console.log("Cantidad recibida:", quantity);
    try {
        const cartUpdated = await cartManager.updateCart(cid, { product, quantity });
        if (!cartUpdated) {
            return res.status(404).send({ message: "Carrito no encontrado" });
        }
        //console.log("Carrito modificado:", cartUpdated);
        return res.status(200).send({ message: "Carrito modificado", cart: cartUpdated });
    } catch (error) {
        //console.error("Error al modificar el carrito:", error);
        return res.status(500).send("Error al modificar el carrito");
    }
})

//Actualizar cantidad de productos del carrito
router.put("/:cid/products/:pid", async (req, res) => {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const quantity = req.body.quantity;
    try {
        const cartUpdated = await cartManager.updateQuantity(cid, pid, quantity);
        return res.status(200).send({ message: "Cantidad del producto modifiactualizada", cart: cartUpdated });
    } catch (error) {
        return res.status(500).send("Error al modificar el carrito");
    }
})


//Vaciar carrito
router.delete("/:cid", async (req, res) => {
    const id = req.params.cid;
    try {
        const updatedCart = await cartManager.emptyCart(id);
        if (!updatedCart) {
            return res.status(404).send({ message: "Carrito no encontrado" });
        }
        return res.status(200).send({ message: "Todos los productos del carrito han sido eliminados", cart: updatedCart });
    } catch (error) {
        return res.status(500).send("Error al vaciar el carrito");
    }
});

module.exports = router;