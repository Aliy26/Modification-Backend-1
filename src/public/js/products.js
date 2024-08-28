console.log("Products frontend javascript file");

$(function () {
  $(".product-collection").on("change", () => {
    const selectedValue = $(".product-collection").val();
    if (selectedValue === "DRINK") {
      $("#product-collection").hide();
      $("#product-volume").show();
    } else {
      $("#product-volume").hide();
      $("#product-collection").show();
    }
  });

  $("#process-btn").on("click", () => {
    $(".dish-container").slideToggle(500);
    $("#process-btn").css("display", "none");
  });

  $("#cancel-btn").on("click", () => {
    $(".dish-container").slideToggle(100);
    $("#process-btn").css("display", "flex");
  });

  const confirmation = (str) =>
    str ? confirm(`Do you want to change the item ${str}?`) : null;

  $(".remove-button").on("click", async (e) => {
    const id = e.target.id;

    if (confirm("Do you want to remove the item?")) {
      await axios.post(`/admin/product/delete/${id}`);
      $(e.target).closest("tbody").remove();
    }
    try {
    } catch (err) {
      console.log(err);
      alert("Product deletion failed!");
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
    productLeftCount = $(".product-left-count").val(),
    productCollection = $(".product-collection").val(),
    productDesc = $(".product-desc").val(),
    productStatus = $(".product-status").val();

  if (
    productName === "" ||
    productPrice === "" ||
    productLeftCount === "" ||
    productCollection === "" ||
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
