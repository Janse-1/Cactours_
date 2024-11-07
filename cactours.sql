-- Crear la base de datos
create database cactours_db;
use cactours_db;

-- Crear la tabla catalogo_general para opciones generales de estados y medios de pago
create table if not exists tabla_maestra(
    ID_catalogo int auto_increment primary key not null,
    categoria varchar(50) not null,
    valor varchar(50) not null unique,
    descripcion text
);

-- Insertar datos en catalogo_general
insert ignore into tabla_maestra (categoria, valor, descripcion) values 
('estado_empleado', 'activo', 'Empleado activo en la empresa'),
('estado_empleado', 'inactivo', 'Empleado inactivo en la empresa'),
('estado_tour', 'activo', 'Tour disponible para reservas'),
('estado_tour', 'inactivo', 'Tour no disponible para reservas'),
('medio_pago', 'efectivo', 'Pago en efectivo'),
('medio_pago', 'tarjeta', 'Pago con tarjeta de crédito o débito'),
('medio_pago', 'transferencia', 'Pago por transferencia bancaria');

-- Crear la tabla personas
create table if not exists personas (
    ID_persona int auto_increment primary key not null,
    nombre varchar(50) not null,
    apellido varchar(50) not null,
    identificacion varchar(50) unique not null,
    correo varchar(50) not null,
    telefono varchar(10) not null
);

-- Crear la tabla clientes referenciando personas
create table if not exists clientes (
    ID_cliente int auto_increment primary key not null,
    persona_id int not null,
    contador_reservas int default 0,
    foreign key (persona_id) references personas(ID_persona)
);

-- Crear la tabla empleados con referencia a catalogo_general para estado
create table if not exists empleados (
    ID_empleado int auto_increment primary key not null,
    persona_id int not null,
    fecha_contratacion date not null,
    cargo varchar(50) not null,
    salario decimal(10,2) not null,
    estado_id int not null, -- Referencia a catalogo_general
    foreign key (estado_id) references tabla_maestra(ID_catalogo),
    foreign key (persona_id) references personas(ID_persona)
);

-- Crear la tabla tours con estado referenciando catalogo_general
create table if not exists tours (
    ID_tours int auto_increment primary key not null,
    nombre_tour varchar(50) not null,
    descripcion text not null,
    costo decimal(10,2) not null,
    estado_id int not null, -- Referencia a catalogo_general
    foreign key (estado_id) references tabla_maestra(ID_catalogo)
);

-- Crear la tabla reservas con referencias a catalogo_general, clientes y tours
create table if not exists reservas (
    ID_reserva int auto_increment primary key not null,
    cliente_id int not null,
    tour_id int not null,
    costo_total decimal(10,2) not null,
    fecha date not null,
    hora time not null,
    medio_pago_id int not null, -- Referencia a catalogo_general
    destino varchar(50) not null,
    cant_personas int not null,
    comentarios text,
    foreign key (medio_pago_id) references tabla_maestra(ID_catalogo),
    foreign key (cliente_id) references clientes(ID_cliente),
    foreign key (tour_id) references tours(ID_tours)
);

-- Crear la tabla opcion para las opciones adicionales en los tours
create table if not exists opcion (
    ID_opcion int auto_increment primary key not null,
    nombre_op varchar(50),
    descripcion text not null,
    precio_adic decimal(10,2) not null
);

-- Crear la tabla tours_opc para relacionar tours con opciones
create table if not exists tours_opc (
    ID_tours int not null,
    ID_opcion int not null,
    primary key (ID_tours, ID_opcion),
    foreign key (ID_tours) references tours(ID_tours),
    foreign key (ID_opcion) references opcion(ID_opcion)
);
