console.log("Products frontend javascript file");

$(".sort-btn").on("click", function () {
  const category = $(this).data("category");

  if (category === "all") {
    $(".tbodyy").show();
  } else {
    $(".tbodyy").hide();
    $(`.tbodyy[data-category="${category}"]`).show();
  }
});

$(function () {
  // Product Collection Change Logic
  $(".product-collection").on("change", function () {
    const selectedValue = $(this).val();

    switch (selectedValue) {
      case "POWDER":
        $("#itemUnit").val("Sticks");
        break;
      case "TABLET":
        $("#itemUnit").val("Tubes");
        break;
      case "PROTEIN":
        $("#itemUnit").val("Canister");
        break;
      case "BOTTLE":
        $("#itemUnit").val("Bottle");
        break;
      case "OTHER":
        $("#itemUnit").val("Other");
        break;
      default:
        $("#itemUnit").val("Sticks");
    }
  });

  $("#process-btn").on("click", () => {
    $(".dish-container").slideToggle(500);
    $("#process-btn").css("display", "none");
  });

  $("#cancel-btn").on("click", () => {
    $(".dish-container").slideToggle(100);
    $("#process-btn").css("display", "flex");
    return false;
  });

  const confirmation = (str) =>
    str ? confirm(`Do you want to change the item ${str}?`) : null;

  $(".remove-button").on("click", async (e) => {
    const id = e.target.id;

    if (confirm("Do you want to remove the item?")) {
      await axios.post(`/admin/product/delete/${id}`);
      try {
        $(e.target).closest("tbody").remove();
      } catch (err) {
        console.log(err);
        alert("Product deletion failed!");
      }
    } else {
      return false;
    }
  });

  $(".name-input").on("change", async (e) => {
    const id = e.target.id;
    const input = e.target.value;
    try {
      if (confirmation("name")) {
        const response = await axios.post(`/admin/product/${id}`, {
          productName: input,
        });
        const result = response.data;
        if (result.data) {
          console.log("Product updated!");
        }
      }
    } catch (err) {
      console.log(err);
      alert("Product update failed!");
    }
  });

  $(".perSaleCount").on("change", async (e) => {
    const id = e.target.id;
    const input = e.target.value;
    try {
      if (confirmation("per sale count?")) {
        const response = await axios.post(`/admin/product/${id}`, {
          productPerSaleCount: input,
        });
        const result = response.data;
        if (result.data) {
          console.log("Product updated!");
        }
      }
    } catch (err) {
      console.log(err);
      alert("Product update failed!");
    }
  });

  $(".price-input").on("change", async (e) => {
    const id = e.target.id;

    const input = e.target.value;

    try {
      if (confirmation("price")) {
        const response = await axios.post(`/admin/product/${id}`, {
          productPrice: input,
        });
        const result = response.data;
        if (result.data) {
          console.log("Product updated!");
        }
      }
    } catch (err) {
      console.log(err);
      alert("Product update failed!");
    }
  });

  $(".count-input").on("change", async (e) => {
    const id = e.target.id;
    console.log(id);
    const input = e.target.value;
    console.log(input);
    try {
      if (confirmation("count")) {
        const response = await axios.post(`/admin/product/${id}`, {
          productLeftCount: input,
        });
        const result = response.data;
        if (result.data) {
          console.log("Product updated!");
        }
      }
    } catch (err) {
      console.log(err);
      alert("Product update failed!");
    }
  });

  $(".new-product-status").on("change", async function (e) {
    const id = e.target.id,
      productStatus = $(`#${id}.new-product-status`).val();

    try {
      const response = await axios.post(`/admin/product/${id}`, {
        productStatus: productStatus,
      });
      console.log("response", response);
      const result = response.data;
      if (result.data) {
        console.log("Product updated!");
        $(".new-product-status").blur();
      } else alert("Product update failed!");
    } catch (err) {
      console.log(err);
      alert("Product update failed!");
    }
  });
});

function validateForm() {
  const productName = $(".product-name").val(),
    productPrice = $(".product-price").val(),
    productCollection = $(".product-collection").val(),
    productUnit = $(".product-unit").val(),
    productPerSale = $(".product-per-sale").val(),
    productLeftCount = $(".product-left-count").val(),
    productDesc = $(".product-desc").val(),
    productStatus = $(".product-status").val();

  if (
    productName === "" ||
    productPrice === "" ||
    productCollection === "" ||
    productUnit === "" ||
    productPerSale === "" ||
    productLeftCount === "" ||
    productDesc === "" ||
    productStatus === ""
  ) {
    alert("Please insert all details!");
    return false;
  } else return true;
}

function previewFileHandler(input, order) {
  const imgClassName = input.className;
  console.log("input:", input);
  const file = $(`.${imgClassName}`).get(0).files[0],
    fileType = file["type"],
    validImageType = ["image/jpg", "image/jpeg", "image/png"];

  if (!validImageType.includes(fileType)) {
    alert("Please only insert jpeg, jpg, png!");
  } else {
    if (file) {
      const reader = new FileReader();
      reader.onload = function () {
        $(`#image-section-${order}`).attr("src", reader.result);
      };
      reader.readAsDataURL(file);
    }
  }
}
