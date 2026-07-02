// Sweet Alert

import swal from "sweetalert2";

export function showError(title: string, message: string, isError = true) {
    return swal.fire({
        icon: isError ? "error" : "warning",
        title,
        html: message.replace(/\n/g, "<br/>"),
        confirmButtonText: "OK"
    })
}