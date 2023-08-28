const express = require("express");
// const req = require("express/lib/request");
const app = express();
const http = require("http");
const { success, failure } = require("./util/common");
const Product = require("./model/Product");
const { insertInLog } = require("./log")

app.use(express.json());
// app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.get("/products", async (req, res) => {
    //console.log(req.body);
    // return res.status(200).send({ message: "GET request successful" });

    try {
        const result = await Product.getAll();
        if (result.success) {
            console.log(result.data)
            res.status(200).send({ message: 'Successfully fetched the data', data: result.data });

        } else {
            res.status(500).send({ message: 'Failed to retrieve products' })
        }
    }

    catch (error) {
        return res.status(500).send({ message: "Internal Server Error" });
    }


});

app.get("/products/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await Product.getOneById(id);
        if (result.success) {
            console.log(result.data)
            res.status(200).send({ message: 'Successfully fetched the data', data: result.data });

        } else {
            res.status(500).send({ message: 'No data found' })
        }
    }

    catch (error) {
        return res.status(500).send({ message: "Internal Server Error" });
    }


});

// app.post("/products/insert", async (req, res) => {
//     try {
//         console.log("received body: ", req.body)
//         let newProduct = req.body;
//         let error = {};
//         if (newProduct.hasOwnProperty("id")) {
//             error.id = "Id should not be passed in body";
//         }
//         if (
//             !newProduct.hasOwnProperty("title") ||
//             newProduct?.title?.toString().trim() == ""
//         ) {
//             error.title =
//                 "title should be passed to create a product and it must have some values";
//         }

//         if (!newProduct.hasOwnProperty("price") || isNaN(newProduct.price)) {
//             error.price =
//                 "price should  be passed to create a product and it must be number type";
//         }
//         if (
//             !newProduct.hasOwnProperty("stock") ||
//             isNaN(newProduct.stock) ||
//             !Number.isInteger(Number(newProduct.stock))
//         ) {
//             error.stock =
//                 "stock should  be passed to create a product and it must be integer type";
//         }

//         if (Object.keys(error).length > 0) {
//             return res
//                 .status(400)
//                 .send({ message: "Data is not provided as per requirement", error });
//         }
//         let result = await Product.insertData(newProduct);
//         let logFileResult = await insertInLog("POST_PRODUCT", result.id);
//         if (result.success) {
//             return res.status(200).send({
//                 message: "successfully added the data",
//             });
//         } else {
//             return res.status(400).send({ message: "failed to add the data" });
//         }
//     } catch (e) {
//         console.error(e); // Log the error to the console
//         return res.status(400).send({ message: "Internal error occurred" });
//     }
// });


// ## Path Params Template ##
// app.get("/products/:id", (req, res) => {
//     const { id } = req.params;
//     console.log(id);
//     console.log(req.params);
//     return res.status(200).send({ message: "GET request successful" });
// })




// app.post("/products/add", (req, res) => {
//     console.log(req.body);
//     //console.log(req.body);
//     return res.status(200).send({ message: "POST request successful" })
// });

// app.post("/products/add", async (req, res) => {
//     console.log(req.body);
//     try {
//         const requestBody = req.body;
//         const result = await Product.add(requestBody);
//         console.log("resultoo", result);
//         if (result.success) {
//             // console.log(result.data)
//             res.status(200).send({ message: 'Successfully added the data', data: result.data });

//         } else {
//             res.status(500).send({ message: 'Failed to add the products' })
//         }
//     }

//     catch (error) {
//         return res.status(500).send({ message: "Internal Server Error" });
//     }


// });



// ## POST template ##
// app.post("/", (req, res) => {
//     console.log(req.body);
//     return res.status(200).send({ message: "POST request successful" })
// });


app.post("/products/insert", async (req, res) => {
    try {
        let newProduct = req.body;
        let error = {};
        if (newProduct.hasOwnProperty("id")) {
            error.id = "Id should not be passed in body";
        }
        if (
            !newProduct.hasOwnProperty("title") ||
            newProduct?.title?.toString().trim() == ""
        ) {
            error.title =
                "title is required and it may not be empty";
        }

        if (!newProduct.hasOwnProperty("price") || isNaN(newProduct.price)) {
            error.price =
                "price is required and it is number type";
        }
        if (
            !newProduct.hasOwnProperty("stock") ||
            isNaN(newProduct.stock) ||
            !Number.isInteger(Number(newProduct.stock))
        ) {
            error.stock =
                "stock is required and it is in integer";
        }

        if (Object.keys(error).length > 0) {
            return res
                .status(400)
                .send({ message: "Provied data doesn't meet the requirement", error });
        }
        let result = await Product.insertData(newProduct);
        //let logFileResult = await insertInLog("POST_PRODUCT", result.id);
        if (result.success) {
            return res.status(200).send({
                message: "successfully added the data",
            });
        } else {
            return res.status(400).send({ message: "failed to add the data" });
        }
    } catch (e) {
        return res.status(400).send({ message: "Internal error occured" });
    }
});

app.put("/products/update/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const updatedData = req.body;

        let error = {};

        // Check if the title property is being updated and it's empty
        if (updatedData.hasOwnProperty("title") && updatedData.title.trim() === "") {
            error.title = "Title must not be empty when updating";
        }

        // Check if the price property is being updated and it's not a valid number
        if (updatedData.hasOwnProperty("price") && isNaN(updatedData.price)) {
            error.price = "Price must be a valid number when updating";
        }

        // Check if the stock property is being updated and it's not a valid integer
        if (
            updatedData.hasOwnProperty("stock") &&
            (isNaN(updatedData.stock) || !Number.isInteger(Number(updatedData.stock)))
        ) {
            error.stock = "Stock must be a valid integer when updating";
        }

        if (Object.keys(error).length > 0) {
            return res
                .status(400)
                .send({ message: "Data is not provided as per requirement", error });
        }

        // Continue with updating the data
        const result = await Product.updateData(id, updatedData);

        if (result.success) {
            return res.status(200).send({ message: "Product updated successfully" });
        } else {
            return res.status(404).send({ message: "Product not found or failed to update" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
});




app.delete("/products/delete/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const result = await Product.deleteProduct(id);

        if (result.success) {
            return res.status(200).send({ message: "Product deleted successfully" });
        } else {
            return res.status(404).send({ message: "Product not found or failed to delete" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
});



app.use((req, res) => {
    return res.status(400).send({ message: "Wrong Method / Not Found" })
})


app.listen(8000, () => {
    console.log("Server is running on port 8000");
});

