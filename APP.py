from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/reservas.html', methods=['GET', 'POST'])
def reserve():
    if request.method == 'POST':
        # Lógica para procesar la reserva
        return redirect(url_for('home'))
    return render_template('reservas.html')

@app.route('/pagos.html', methods=['GET', 'POST'])
def payment():
    if request.method == 'POST':
        # Lógica para procesar el pago
        return redirect(url_for('home'))
    return render_template('pagos.html')

@app.route('/contactanos.html')
def contact():
    return render_template('contactanos.html')

if __name__ == '__main__':
    app.run(debug=True)
