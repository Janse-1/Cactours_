from flask import Flask, render_template, request, redirect, url_for
from flask_mysqldb import MySQL
import mysql.connector

app = Flask(__name__)

# Configuración de la base de datos MySQL
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'  
app.config['MYSQL_PASSWORD'] = ''  
app.config['MYSQL_DB'] = 'cactours_db'
app.config['MYSQL_DATABASE_OPTIONS'] = {'ssl_disabled': True}


# Inicializar MySQL
mysql = MySQL(app)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/reservas.html', methods=['GET', 'POST'])
def reserve():  
    return render_template('reservas.html')

@app.route('/pagos.html', methods=['GET', 'POST'])
def payment():
    return render_template('pagos.html')

@app.route('/contactanos.html')
def contact():
    return render_template('contactanos.html')

@app.route('/registro.html', methods=['GET', 'POST'])
def registro():
    # Obtener los datos desde la URL
    tipo_tour = request.args.get('tipo_tour')
    costo = request.args.get('costo')
    opciones = request.args.get('opciones')

    if request.method == 'POST':
        # Obtener los datos del formulario de registro
        identificacion = request.form['identificacion']
        nombre = request.form['nombre']
        correo = request.form['correo']
        telefono = request.form['telefono']
        fecha_hora_reserva = request.form['fecha_hora_reserva']
        medio_pago = request.form['medio_pago']
        presupuesto = request.form['presupuesto']
        opciones_escogidas = request.form.getlist('opciones_escogidas')  # Obtener opciones como lista
        destino = request.form['destino']
        personas = request.form['personas']
        comentarios = request.form['comentarios']

        try:
            # Conectar a la base de datos y realizar la inserción
            cursor = mysql.connection.cursor()

            # Verificar si el cliente ya está registrado
            cursor.execute("SELECT * FROM clientes WHERE identificacion = %s", (identificacion,))
            cliente = cursor.fetchone()

            # Si el cliente no está registrado, lo insertamos en la tabla de clientes
            if not cliente:
                cursor.execute('''INSERT INTO clientes (identificacion, nombre, correo, telefono) 
                                  VALUES (%s, %s, %s, %s)''', 
                               (identificacion, nombre, correo, telefono))
                mysql.connection.commit()

                # Obtener el cliente registrado para usar su ID en la tabla de reservas
                cursor.execute("SELECT * FROM clientes WHERE identificacion = %s", (identificacion,))
                cliente = cursor.fetchone()

            # Insertar la reserva en la tabla de reservas
            cliente_id = cliente[0]  # El ID del cliente registrado
            cursor.execute('''INSERT INTO reservas (cliente_id, tipo_tour, costo, fecha_hora_reserva, medio_pago, presupuesto, 
                              opciones_escogidas, destino, personas, comentarios) 
                              VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)''', 
                           (cliente_id, tipo_tour, costo, fecha_hora_reserva, medio_pago, presupuesto, 
                            ','.join(opciones_escogidas), destino, personas, comentarios))  # Guardar opciones como texto separado por comas
            mysql.connection.commit()

            # Redireccionar al home después de la reserva
            return redirect(url_for('home'))

        except Exception as e:
            print(f"Error: {e}")  # Captura cualquier excepción y la imprime
            return "Error al procesar la solicitud."

    # Obtener los tours y opciones desde la base de datos para pasarlos al formulario de reservas
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM tours WHERE estado = 'Activo'")
    tours = cursor.fetchall()

    cursor.execute("SELECT * FROM opciones")
    opciones_db = cursor.fetchall()
    
    print(f"Tipo de tour: {tipo_tour}, Costo: {costo}, Opciones: {opciones}")

    return render_template('registro.html', tipo_tour=tipo_tour, costo=costo, opciones=opciones_db)  


@app.route('/test_db')
def test_db():
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT COUNT(*) FROM clientes")  # Reemplaza "clientes" con una tabla que tengas en tu BD
        count = cursor.fetchone()[0]
        return f"La conexión a la base de datos funciona. Número de registros en la tabla clientes: {count}"
    except Exception as e:
        return f"Error al conectar con la base de datos: {e}"


if __name__ == '__main__':
    app.run(debug=True)
