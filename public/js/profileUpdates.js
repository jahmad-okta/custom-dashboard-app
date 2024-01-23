/**
 * This scripts allows one to update the profile and link accounts
 */

$(document).ready(function () {
  $("#btnSubmit").click(function () {
    // console.log("Button clicked");
    var givenName = $("#given_name").val();
    var familyName = $("#family_name").val();
    var name = $("#name").val();
    var email = $("#email").val();
    var id = $("#sub").val();
    // console.log(email);
    $.ajax({
      type: "POST",
      url:
        window.location.protocol +
        "//" +
        window.location.host +
        "/api/updateProfile?sub=" +
        id,
      contentType: "application/json",
      data: JSON.stringify({
        given_name: givenName,
        family_name: familyName,
        email: email,
      }),
    }).done(function (data) {
      console.log(data);
      if (data.status === 200) {
        $("#profileSuccess").removeClass("d-none");
      } else {
        location.replace("/profile?update=failure");
      }
    });
  });

  $("#btnLink").click(function () {
    // console.log("Start Account linking");
    const dualScreenLeft =
      window.screenLeft !== undefined ? window.screenLeft : window.screenX;
    const dualScreenTop =
      window.screenTop !== undefined ? window.screenTop : window.screenY;
    w = 400;
    h = 600;
    const width = window.innerWidth
      ? window.innerWidth
      : document.documentElement.clientWidth
      ? document.documentElement.clientWidth
      : screen.width;
    const height = window.innerHeight
      ? window.innerHeight
      : document.documentElement.clientHeight
      ? document.documentElement.clientHeight
      : screen.height;

    const systemZoom = width / window.screen.availWidth;
    const left = (width - w) / 2 / systemZoom + dualScreenLeft;
    const top = (height - h) / 2 / systemZoom + dualScreenTop;
    var params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,
        width=${w},height=${h},left=${left},top=${top}`;
    window.open(`/account-linking`, "Linking Accounts", params);
  });
});

function refreshByBtn() {
  location.replace("/profile?update=linked");
}

//This funcation remove table rows from connection client apps table
function clientDelete(ctl) {
  event.preventDefault();
  var client_id = $(ctl).parents("tr").attr("id");
  //console.log($(ctl).parents("tr").attr('id'));
  $.ajax({
    type: "DELETE",
    url:
      window.location.protocol + "//" + window.location.host + "/api-request",
    contentType: "application/json",
    data: JSON.stringify({
      client_id,
    }),
  }).done(function (data) {
    if (data.status === 204) {
      $(ctl).parents("tr").remove();
    }
  });
}
