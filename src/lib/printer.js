let connected = false;

export async function connectQZ() {
    if (connected) return;

    try {
        await qz.websocket.connect();
        connected = true;
        console.log("QZ conectado");
    } catch (err) {
        alert("No se pudo conectar con la impresora");
        console.error(err);
    }
}

export function buildTicket({ items, total, method }) {
    let t = "";

    t += "MI NEGOCIO\n";
    t += "-----------------------------\n";
    t += `Fecha: ${new Date().toLocaleString()}\n\n`;

    items.forEach(i => {
        t += `${i.name} x${i.qty}\n`;
        t += `   $${i.price}\n`;
    });

    t += "-----------------------------\n";
    t += `TOTAL: $${total}\n`;
    t += `PAGO: ${method}\n\n`;

    t += "Gracias por tu compra\n\n\n";
    t += "\x1D\x56\x41"; // corte

    return t;
}

export async function printTicket(data) {
    await connectQZ();

    const printer = "WAGGS 80mm Printer"; // ⚠️ CAMBIAR

    const config = qz.configs.create(printer);

    const payload = [{
        type: "raw",
        format: "plain",
        data: buildTicket(data)
    }];

    try {
        await qz.print(config, payload);
        console.log("Ticket impreso");
    } catch (err) {
        console.error("Error imprimiendo:", err);
    }
}