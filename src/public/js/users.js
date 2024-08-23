console.log("Users frontend javascript file");

$(() => {
  $(".member-status").on("change", (e) => {
    const id = e.target.id;

    const memberStatus = $(`#${id}.member-status`).val();
    console.log("memberStatus", memberStatus);

    axios
      .post("/admin/user/edit", { _id: id, memberStatus: memberStatus })
      .then((response) => {
        const result = response.data;
        if (result.data) {
          $(".member-status").blur();
        } else alert("User update failed!");
      })
      .catch((err) => {
        console.log(err);
        alert("User update failed!");
      });
  });
});
