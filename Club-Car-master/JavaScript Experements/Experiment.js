$(document).ready(function() {
    $("#myButton").click(function() {
        message = $("#textEntry").val();
        $("#textEntry").val("");
        sentMessage = "<p> <b>Euan</b> : " + message + "</p>";
        //$(".chatArea").append("<p class = "message"> <b>Euan</b> : Hello there </p>");
        $("#chatArea").append(sentMessage);
        $("p").addClass("message");
        //$("#chatArea").append("<br>");
    });
});
