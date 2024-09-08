import React, { useState, useEffect } from 'react';
import billete10k from './assets/billetes/10k.png';
import billete20k from './assets/billetes/20k.png';
import billete50k from './assets/billetes/50k.png';
import billete100k from './assets/billetes/100k.png';
import './App.css';  // Asegúrate de mantener el CSS importado

// Cuentas y credenciales actualizadas
const CUENTAS = {
    '3108965403': { tipo: 'Nequi', clave: '1234' }, // Nequi con clave dinámica
    '13108965403': { tipo: 'Ahorro a la Mano', clave: '1234', claveEstatica: '378654' }, // Ahorro a la mano con clave estática
};

function CajeroAutomatico() {
    const [tarjeta, setTarjeta] = useState('');
    const [clave, setClave] = useState('');
    const [autenticado, setAutenticado] = useState(false);
    const [retiro, setRetiro] = useState(0);
    const [codigoTemporal, setCodigoTemporal] = useState(null);
    const [codigoIngresado, setCodigoIngresado] = useState('');
    const [tiempoCodigo, setTiempoCodigo] = useState(null);
    const [mensaje, setMensaje] = useState('');
    const [billetesUsados, setBilletesUsados] = useState([]);
    const [mostrarBotonRecibo, setMostrarBotonRecibo] = useState(false); // Para mostrar el botón de recibo
    const [mostrarRecibo, setMostrarRecibo] = useState(false); // Para mostrar/ocultar el recibo
    const [mostrarClaveEstatica, setMostrarClaveEstatica] = useState(false); // Mostrar clave estática
    const [cuenta, setCuenta] = useState(null);
    const [fechaRetiro, setFechaRetiro] = useState(''); // Guardar fecha del retiro
    const [horaRetiro, setHoraRetiro] = useState(''); // Guardar hora del retiro

    const billetes = [10, 20, 50, 100];

    useEffect(() => {
        if (cuenta && cuenta.tipo === 'Nequi' && codigoTemporal) {
            const timer = setTimeout(() => {
                setCodigoTemporal(null);
                setMensaje('La clave dinámica ha expirado.');
            }, 120000);
            return () => clearTimeout(timer);
        }
    }, [codigoTemporal, cuenta]);

    // Función para autenticar al usuario
    const autenticar = () => {
        const cuentaUsuario = CUENTAS[tarjeta]; // Busca la cuenta con el número ingresado
        if (cuentaUsuario && cuentaUsuario.clave === clave) {
            setAutenticado(true); // Marca como autenticado
            setCuenta(cuentaUsuario); // Almacena la cuenta autenticada
            setMensaje('Autenticación exitosa.');
        } else {
            setMensaje('Credenciales Incorrectas'); // Muestra mensaje de error
        }
    };

    // Generar código dinámico para Nequi
    const generarCodigoTemporal = () => {
        if (cuenta.tipo === 'Nequi') {
            if (!codigoTemporal) {
                const nuevoCodigo = Math.floor(100000 + Math.random() * 900000);
                setCodigoTemporal(nuevoCodigo.toString());
                setTiempoCodigo(Date.now());
                setMensaje(`Tu clave dinámica es: ${nuevoCodigo}`);
            }
        }
    };

    // Obtener fecha y hora en Colombia (zona horaria de Colombia) separadas
    const obtenerFechaHoraColombia = () => {
        const opcionesFecha = { timeZone: 'America/Bogota', year: 'numeric', month: 'numeric', day: 'numeric' };
        const opcionesHora = { timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
        const fecha = new Date().toLocaleDateString('es-CO', opcionesFecha);
        const hora = new Date().toLocaleTimeString('es-CO', opcionesHora);
        return { fecha, hora };
    };

    // Agrupar billetes por denominación y contar la cantidad de cada uno
    const agruparBilletes = (billetes) => {
        const agrupados = billetes.reduce((acc, billete) => {
            acc[billete] = (acc[billete] || 0) + 1;
            return acc;
        }, {});
        return agrupados;
    };

    // Validar retiro (con clave dinámica para Nequi y estática para Ahorro a la Mano)
    const validarRetiro = () => {
        if (cuenta.tipo === 'Nequi') {
            if (!codigoTemporal || Date.now() - tiempoCodigo > 120000) {
                setMensaje('Clave dinámica incorrecta o expirada.');
                return false;
            }

            if (parseInt(codigoIngresado) !== parseInt(codigoTemporal)) {
                setMensaje('Clave dinámica incorrecta.');
                return false;
            }
        } else if (cuenta.tipo === 'Ahorro a la Mano') {
            if (codigoIngresado !== CUENTAS[tarjeta].claveEstatica) {
                setMensaje('Clave estática incorrecta.');
                return false;
            }
        }

        // Lógica de retiro
        let cantidad = 0;
        let billetesUsadosTemp = [];
        let n = 0;

        while (cantidad < retiro) {
            for (let i = n; i < billetes.length; i++) {
                if (cantidad + billetes[i] <= retiro) {
                    cantidad += billetes[i];
                    billetesUsadosTemp.push(billetes[i]);
                }
            }
            n++;
            if (n === billetes.length) {
                n = 0;
            }
        }

        const { fecha, hora } = obtenerFechaHoraColombia(); // Obtener fecha y hora
        setFechaRetiro(fecha);
        setHoraRetiro(hora);
        setBilletesUsados(billetesUsadosTemp);
        setMostrarBotonRecibo(true); // Mostrar el botón para generar recibo
        setMensaje('Retiro exitoso.');
        return true;
    };

    const obtenerImagenBillete = (valorBillete) => {
        switch (valorBillete) {
            case 10:
                return billete10k;
            case 20:
                return billete20k;
            case 50:
                return billete50k;
            case 100:
                return billete100k;
            default:
                return null;
        }
    };

    // Validar que el input de tarjeta solo acepte números
    const manejarTarjetaInput = (e) => {
        const valor = e.target.value;
        if (/^\d*$/.test(valor)) {
            setTarjeta(valor);
        }
    };

    // Validar que el input de clave solo acepte números
    const manejarClaveInput = (e) => {
        const valor = e.target.value;
        if (/^\d*$/.test(valor)) {
            setClave(valor);
        }
    };

    // Mostrar recibo
    const generarRecibo = () => {
        const billetesAgrupados = agruparBilletes(billetesUsados);

        return (
            <div className="recibo">
                <h2>Banco Meteora</h2>
                <p><strong>Recibo de Retiro</strong></p>
                <p>Fecha del retiro: {fechaRetiro}</p> {/* Mostrar la fecha */}
                <p>Hora del retiro: {horaRetiro}</p> {/* Mostrar la hora */}
                <p>Número de cuenta: {cuenta.tipo === 'Nequi' ? `0${tarjeta}` : tarjeta}</p>
                <p>Tipo de cuenta: {cuenta.tipo}</p>
                <p>Valor retirado: {retiro}k</p> {/* Mostrar la "k" después del valor retirado */}
                <p>Costo de operación: $0</p>
                <p>Billetes entregados:</p>
                <ul>
                    {Object.keys(billetesAgrupados).map((denominacion) => (
                        <li key={denominacion}>
                            Billetes de {denominacion}k = {billetesAgrupados[denominacion]}
                        </li>
                    ))}
                </ul>
                <p>Gracias por usar nuestros servicios</p>
                <button className="salir" onClick={() => window.location.reload()}>Salir</button>
            </div>
        );
    };

    return (
        <div>
            {!autenticado ? (
                <div className="container">
                    <h1>Bienvenido al Banco Meteora</h1>
                    <label>Número de Tarjeta:</label>
                    <input
                        type="text"
                        value={tarjeta}
                        onChange={manejarTarjetaInput} // Solo permite números en tarjeta
                        maxLength={11}
                    />
                    <br />
                    <label>Clave:</label>
                    <input
                        type="password"
                        value={clave}
                        onChange={manejarClaveInput} // Solo permite números en clave
                        maxLength={4}
                    />
                    <br />
                    <button onClick={autenticar}>Autenticar</button> {/* Asocia el botón a la función autenticar */}
                    {mensaje && <p>{mensaje}</p>} {/* Muestra el mensaje de error o éxito */}
                </div>
            ) : (
                <div>
                    {!mostrarRecibo && (
                        <>
                            <div className="retiro-container">
                                <button onClick={cuenta.tipo === 'Nequi' ? generarCodigoTemporal : null}>
                                    {cuenta.tipo === 'Nequi' ? 'Generar Clave Dinámica' : 'Ingresar Clave Estática'}
                                </button>
                                {codigoTemporal && cuenta.tipo === 'Nequi' && (
                                    <div>
                                        <p>Ingresa la clave dinámica: {codigoTemporal}</p>
                                        <input
                                            type="text"
                                            value={codigoIngresado}
                                            onChange={e => setCodigoIngresado(e.target.value)}
                                        />
                                    </div>
                                )}
                                {cuenta.tipo === 'Ahorro a la Mano' && (
                                    <div>
                                        <p>Ingresa la clave estática:</p>
                                        <input
                                            type="text"
                                            value={codigoIngresado}
                                            onChange={e => setCodigoIngresado(e.target.value)}
                                        />
                                        {/* Botón para mostrar la clave estática */}
                                        <button onClick={() => setMostrarClaveEstatica(true)}>Mostrar Clave Estática</button>
                                        {mostrarClaveEstatica && (
                                            <p>Clave Estática: {CUENTAS[tarjeta].claveEstatica}</p>
                                        )}
                                    </div>
                                )}
                                <br />
                                <label>Cantidad a retirar:</label>
                                <input
                                    type="number"
                                    value={retiro}
                                    onChange={e => setRetiro(parseInt(e.target.value))}
                                />
                                <br />
                                <div className="botones-retiro">
                                    <button onClick={validarRetiro}>Retirar</button>
                                    {mostrarBotonRecibo && (
                                        <button onClick={() => setMostrarRecibo(true)}>Mostrar Recibo</button>
                                    )}
                                </div>
                                {mensaje && <p>{mensaje}</p>}
                            </div>

                            {/* Mostrar las imágenes de los billetes solo si no se muestra el recibo */}
                            {billetesUsados.length > 0 && (
                                <div className="billetes-container">
                                    <h3>Billetes entregados:</h3>
                                    <div className="billetes-list">
                                        {billetesUsados.map((billete, index) => (
                                            <img
                                                key={index}
                                                src={obtenerImagenBillete(billete)}
                                                alt={`Billete de ${billete}k`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Si el recibo está visible, muestra el recibo y oculta los demás elementos */}
                    {mostrarRecibo && (
                        <div>
                            {generarRecibo()}
                            <button onClick={() => setMostrarRecibo(false)}>Ocultar Recibo</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}


export default CajeroAutomatico;