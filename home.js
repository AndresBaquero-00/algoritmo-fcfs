const btnEnviar = document.querySelector('#enviar');
const btnReanudar = document.querySelector('#reanudar');
const btnBloquear = document.querySelector('#bloquear');
const txtProceso = document.querySelector('#nproceso');
const txtLlegada = document.querySelector('#tllegada');
const txtRafaga = document.querySelector('#rafaga');
const divRojo = document.querySelector('#rojo');
const divVerde = document.querySelector('#verde');
const table = document.querySelector('#table');


const canvasRecta = document.querySelector('#recta');
const divDiagrama = document.querySelector('.diagrama');
const ctx = canvasRecta.getContext('2d');


const procesos = [];
let seconds = 0;
let timeBlock = 0;
let i = 0;

const iniciarDiagrama = () => {
    ctx.fillStyle = '#F4F6F6';
    ctx.fillRect(0, 0, canvasRecta.width, canvasRecta.height);

    ctx.beginPath();
    ctx.fillStyle = 'black';
    ctx.font = '10pt Arial';

    ctx.moveTo(0, 7.5);
    ctx.lineTo(canvasRecta.width, 7.5);

    for(let j = 0; j <= canvasRecta.width/10; j++) {
        ctx.moveTo(2 + j*10, 2);
        ctx.lineTo(2 + j*10, 13);
        ctx.stroke();

        if (j % 5 === 0) {
            if (j >= 10) {
                ctx.fillText(j, j*10 - 5, 30);
            } else {
                ctx.fillText(j, j*10, 30);
            }
        }
    }
}

const busy = () => {
    divVerde.className = 'verde-inactivo';
    divRojo.className = 'rojo-activo';
};

const free = () => {
    divVerde.className = 'verde-activo';
    divRojo.className = 'rojo-inactivo';
};

/**
 * Funcion que añade un nuevo registro en la tabla
 * @param {any} proceso El proceso que ha terminado y va a ser añadido en la tabla
 */
const registrarProceso = (proceso) => {
    table.children[1].innerHTML +=
        `<tr>
            <td>${proceso.nproceso}</td>
            <td>${proceso.tllegada}</td>
            <td>${proceso.rafaga}</td>
            <td>${proceso.tcomienzo}</td>
            <td>${proceso.tfinal}</td>
            <td>${proceso.tretorno}</td>
            <td>${proceso.tespera}</td>
        </tr>`;
}

const colores = ['red', 'green', 'blue', 'orange', '#7D3C98', 'black'];
let cont = 0;
const dibujarProceso = (proceso) => {
    if (cont === colores.length) {
        cont = 0;
    } 
    ctx.strokeStyle = colores[cont]; cont++;
    ctx.setLineDash([]);
    /* Dibuja tiempo de llegada */
    ctx.beginPath();
    ctx.moveTo(2 + proceso.tllegada*10, 2 + 35*i);
    ctx.lineTo(2 + proceso.tllegada*10, 13 + 35*i);
    ctx.stroke();

    /* Dibuja tiempo de comienzo */
    ctx.beginPath();
    ctx.moveTo(2 + proceso.tcomienzo*10, 2 + 35*i);
    ctx.lineTo(2 + proceso.tcomienzo*10, 13 + 35*i);
    ctx.stroke();

    /* Dibuja tiempo final */
    ctx.beginPath();
    ctx.moveTo(2 + proceso.tfinal*10, 2 + 35*i);
    ctx.lineTo(2 + proceso.tfinal*10, 13 + 35*i);
    ctx.stroke();

    /* Dibuja linea desde tiempo de comienzo hasta tiempo final */
    ctx.beginPath();
    ctx.moveTo(2 + proceso.tcomienzo*10, 7.5 + 35*i);
    ctx.lineTo(2 + proceso.tfinal*10, 7.5 + 35*i);
    ctx.stroke();

    /* Dibuja linea desde tiempo de llegada hasta tiempo de comienzo */
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(2 + proceso.tllegada*10, 7.5 + 35*i);
    ctx.lineTo(2 + proceso.tcomienzo*10, 7.5 + 35*i);
    ctx.stroke();
}

/**
 * Funcion que permite agregar un proceso a la cola de espera.
 */
const agregarProceso = () => {
    const nproceso = txtProceso.value;
    const tllegada = Number.parseInt(txtLlegada.value);
    const rafaga = Number.parseInt(txtRafaga.value);
    const tcomienzo = procesos.length === 0 ? tllegada :
        (tllegada <= procesos[procesos.length - 1].tfinal ? procesos[procesos.length - 1].tfinal : tllegada);
    const tfinal = rafaga + tcomienzo;
    const tretorno = tfinal - tllegada;
    const tespera = tretorno - rafaga;

    procesos.push({
        bloqueado: false,
        nproceso,
        tllegada,
        rafaga,
        tcomienzo,
        tfinal,
        tretorno,
        tespera
    });

    txtProceso.value = ''; txtLlegada.value = ''; txtRafaga.value = '';
}

const bloquearProceso = () => {
    if (i === procesos.length) {
        return;
    }

    procesos[i].bloqueado = true;
    alert(`El proceso ${ procesos[i].nproceso } ha sido bloqueado.`);
}

const reanudarProceso = () => {
    if (i === procesos.length) {
        return;
    }
    
    procesos[i].bloqueado = false;
    procesos[i].tespera += timeBlock;
    timeBlock = 0;
    alert(`El proceso ${ procesos[i].nproceso } ha sido desbloqueado.`);
}

let time = setInterval(() => {
    if (procesos.length === i) {
        free();
        return;
    }

    const proceso = procesos[i];

    if (proceso.bloqueado) {
        timeBlock++;
        return;
    }

    if (seconds >= proceso.tcomienzo) {
        busy();
        if (proceso.tfinal === seconds) {
            i++;
            registrarProceso(proceso);
            dibujarProceso(proceso);
        }
    } else {
        free();
    }

    seconds++;
}, 1000);

btnEnviar.addEventListener('click', () => {
    agregarProceso();
});

btnBloquear.addEventListener('click', () => {
    bloquearProceso();
});

btnReanudar.addEventListener('click', () => {
    reanudarProceso();
});

iniciarDiagrama();

