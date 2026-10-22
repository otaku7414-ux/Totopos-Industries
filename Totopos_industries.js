document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("formularioAsistencia");
    const alertaExito = document.getElementById("alertaExito");
    const alertaError = document.getElementById("alertaError");
    const claveSolicitudes = "solicitudes";

    function obtenerSolicitudesGuardadas() {
        const solicitudesGuardadas = localStorage.getItem(claveSolicitudes);

        if (solicitudesGuardadas !== null) {
            const solicitudes = JSON.parse(solicitudesGuardadas);
            if (!Array.isArray(solicitudes)) {
                throw new Error("El registro guardado de solicitudes no tiene el formato esperado.");
            }
            return solicitudes;
        }

        const ultimoContacto = localStorage.getItem("ultimoContacto");
        if (ultimoContacto === null) {
            return [];
        }

        const solicitudAnterior = JSON.parse(ultimoContacto);
        if (!solicitudAnterior || typeof solicitudAnterior !== "object" || Array.isArray(solicitudAnterior)) {
            throw new Error("El contacto anterior guardado no tiene el formato esperado.");
        }

        return [solicitudAnterior];
    }

    console.info("[Totopos Industries] Página lista.");

    document.querySelectorAll("nav a[href^='#']").forEach(function (link) {
        link.addEventListener("click", function () {
            console.info("[Totopos Industries] Navegación:", link.textContent.trim());
        });
    });

    const tipoSolicitud = document.getElementById("tipoSolicitud");
    tipoSolicitud.addEventListener("change", function () {
        console.info(
            "[Totopos Industries] Tipo de solicitud seleccionado:",
            tipoSolicitud.options[tipoSolicitud.selectedIndex].text
        );
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        event.stopPropagation();
        form.classList.add("was-validated");

        if (!form.checkValidity()) {
            const camposInvalidos = Array.from(form.querySelectorAll(":invalid")).map(function (campo) {
                const etiqueta = form.querySelector('label[for="' + campo.id + '"]');
                return etiqueta ? etiqueta.textContent.replace("*", "").trim() : campo.name;
            });

            console.warn("[Totopos Industries] Solicitud no enviada. Revisa:", camposInvalidos.join(", "));
            form.querySelector(":invalid").focus();
            return;
        }

        const solicitud = Object.fromEntries(new FormData(form).entries());
        solicitud.fecha = new Date().toISOString();
        let totalSolicitudes;

        try {
            const solicitudes = obtenerSolicitudesGuardadas();
            solicitudes.push(solicitud);
            localStorage.setItem(claveSolicitudes, JSON.stringify(solicitudes));
            totalSolicitudes = solicitudes.length;

            if (localStorage.getItem("ultimoContacto") !== null) {
                localStorage.removeItem("ultimoContacto");
            }
        } catch (error) {
            console.error("[Totopos Industries] No se pudo guardar la solicitud en el navegador.", error);
            alertaError.classList.remove("d-none");
            alertaError.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }

        console.info("[Totopos Industries] Solicitud guardada en este navegador.", {
            total: totalSolicitudes
        });
        alertaError.classList.add("d-none");
        alertaExito.classList.remove("d-none");
        form.reset();
        form.classList.remove("was-validated");
        alertaExito.scrollIntoView({ behavior: "smooth", block: "center" });
    });
});
