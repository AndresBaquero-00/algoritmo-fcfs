const btnEnviar = document.querySelector('#enviar');
const btnEjecutar = document.querySelector('#ejecutar');
const btnEnviarEjecutar = document.querySelector('#enviar-ejecutar');
const btnReanudar = document.querySelector('#reanudar');
const btnBloquear = document.querySelector('#bloquear');

const txtProceso = document.querySelector('#nproceso');
const txtLlegada = document.querySelector('#tllegada');
const txtRafaga = document.querySelector('#rafaga');

const divRojo = document.querySelector('#rojo');
const divVerde = document.querySelector('#verde');
const table = document.querySelector('#table');


const canvasRecta = document.querySelector('#recta');
const ctx = canvasRecta.getContext('2d');

/**
 * Array que guarda los procesos en una cola de espera.
 */
const procesos = [];
/**
 * Array que almacena los colores que se van a usar para dibujar cada proceso en el diagrama.
 */
const colores = ['red', 'green', 'blue', 'orange', '#7D3C98', 'black'];
/**
 * La cantidad de segundos totales que la sección crítica está trabajando.
 */
let seconds = 0;
/**
 * Contador de colores.
 */
let cont = 0;
/**
 * Contador de procesos.
 */
let i = 0;
/**
 * Determina si la sección crítica ejecuta procesos en tiempo real o en bloque.
 */
let ejecutar = false;
/**
 * Almacena un estado si la sección crítica cambia de proceso y hay más procesos en la lista de espera.
 */
let hayProcesos = false;

/**
 * Función que dibuja la recta numérica inicial del diagrama.
 */
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

/**
 * Función que setea la sección crítica a estado ocupado.
 */
const busy = () => {
    divVerde.className = 'verde-inactivo';
    divRojo.className = 'rojo-activo';
};

/**
 * Función que setea la sección crítica a estado desocupado.
 */
const free = () => {
    divVerde.className = 'verde-activo';
    divRojo.className = 'rojo-inactivo';
};

/**
 * Función que agrega el proceso en ejecución a la tabla de procesos ejecutados.
 * @param {any} proceso 
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

/**
 * Función que dibuja la recta asociada a cada proceso en el canvas.
 * @param {any} proceso 
 */
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
const enviarProceso = () => {
    const nproceso = txtProceso.value;
    const tllegada = Number.parseInt(txtLlegada.value);
    const rafaga = Number.parseInt(txtRafaga.value);
    const tcomienzo = procesos.length === 0 ? tllegada :
        (tllegada <= procesos[procesos.length - 1].tfinal ? procesos[procesos.length - 1].tfinal : tllegada);
    const tfinal = rafaga + tcomienzo;
    const tretorno = tfinal - tllegada;
    const tespera = tretorno - rafaga;

    if (procesos.length > 0 && tllegada < procesos[procesos.length - 1].tllegada) {
        alert(`El tiempo de llegada debe ser mayor o igual a ${ procesos[procesos.length - 1].tllegada }.`);
        return;
    }

    procesos.push({
        bloqueado: false,
        timeblock: 0,
        nproceso: nproceso,
        tllegada: tllegada,
        rafaga: rafaga,
        tcomienzo: tcomienzo,
        tfinal: tfinal,
        tretorno: tretorno,
        tespera: tespera
    });

    txtProceso.value = ''; txtLlegada.value = ''; txtRafaga.value = '';
    ejecutar = false;
    hayProcesos = true;
}

/**
 * Función que se encarga de ejecutar los procesos que están actualmente en la cola de espera.
 */
const ejecutarProceso = () => {
    ejecutar = true;
}

/**
 * Función que se encarga de agregar un nuevo proceso a la cola de espera en tiempo de ejecución.
 */
const enviarEjecutarProceso = () => {
    enviarProceso();
    ejecutarProceso();
}

/**
 * Función encargada del manejo de la sección crítica.
 */
const handler = () => {
    if (!ejecutar || !hayProcesos) {
        return;
    }

    const proceso = procesos[i];

    if (proceso.bloqueado) {
        proceso.timeblock++;
        return;
    }

    if (seconds >= proceso.tcomienzo) {
        busy();
        if (proceso.tfinal === seconds) { 
            hayProcesos = false; i++;
            registrarProceso(proceso); 
            dibujarProceso(proceso);
            free();

            if (i < procesos.length) {
                setTimeout(() => { hayProcesos = true }, 1000);
            }
        }
    } else {
        free();
    }

    seconds++;
}

/**
 * Función encargada de bloquear un proceso.
 */
const bloquearProceso = () => {
    if (i === procesos.length) {
        return;
    }

    procesos[i].bloqueado = true;
    alert(`El proceso ${ procesos[i].nproceso } ha sido bloqueado.`);
}

/**
 * Función encargada de reanudar un proceso bloqueado.
 */
const reanudarProceso = () => {
    if (i === procesos.length) {
        return;
    }
    
    procesos[i].bloqueado = false;
    procesos[i].tespera += proceso[i].timeblock;
    alert(`El proceso ${ procesos[i].nproceso } ha sido desbloqueado.`);
}

const time = setInterval(handler, 1000);

btnEnviar.addEventListener('click', () => {
    enviarProceso();
});

btnEjecutar.addEventListener('click', () => {
    ejecutarProceso();
});

btnEnviarEjecutar.addEventListener('click', () => {
    enviarEjecutarProceso();
});

btnBloquear.addEventListener('click', () => {
    bloquearProceso();
});

btnReanudar.addEventListener('click', () => {
    reanudarProceso();
});

iniciarDiagrama();
free();

