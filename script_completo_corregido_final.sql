-- ===========================
-- CREACIÓN Y POBLADO DE TODAS LAS BASES DE DATOS CON DATOS RELACIONADOS Y COHERENTES
-- VERSIÓN CORREGIDA - SIN INCONGRUENCIAS
-- ===========================

-- 1. asignaturas_db
DROP DATABASE IF EXISTS asignaturas_db;
CREATE DATABASE asignaturas_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE asignaturas_db;

CREATE TABLE asignacion_asignaturas (
  id_asignacion int(11) NOT NULL AUTO_INCREMENT,
  id_curso int(11) NOT NULL,
  id_asignatura int(11) NOT NULL,
  id_profesor int(11) NOT NULL,
  PRIMARY KEY (id_asignacion),
  UNIQUE KEY id_curso (id_curso, id_asignatura, id_profesor)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE asignaturas (
  id_asignatura int(11) NOT NULL AUTO_INCREMENT,
  nombre varchar(100) NOT NULL,
  PRIMARY KEY (id_asignatura)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO asignaturas (id_asignatura, nombre) VALUES
(1, 'Matemáticas'), (2, 'Español'), (3, 'Ciencias Naturales'), (4, 'Ciencias Sociales'),
(5, 'Educación Física'), (6, 'Artística'), (7, 'Inglés'), (8, 'Tecnología e Informática'),
(9, 'Ética y Valores'), (10, 'Religión'), (11, 'Música'), (12, 'Danzas'),
(13, 'Teatro'), (14, 'Filosofía'), (15, 'Química');

-- Asignaciones para cursos y profesores existentes y nuevos
INSERT INTO asignacion_asignaturas (id_asignacion, id_curso, id_asignatura, id_profesor) VALUES
-- Curso 1 (Sexto 1), profesores 7, 11, 12
(1, 1, 1, 7),  -- Matemáticas - Paula Padilla
(2, 1, 2, 11), -- Español - Luis Martínez
(3, 1, 3, 12), -- Ciencias Naturales - Diana López
(4, 1, 4, 13), -- Ciencias Sociales - Miguel Ramírez
(5, 1, 5, 11), -- Educación Física - Luis Martínez
(6, 1, 7, 7),  -- Inglés - Paula Padilla
-- Curso 2 (Noveno 2), profesores 7, 11, 13
(7, 2, 1, 7),  -- Matemáticas - Paula Padilla
(8, 2, 2, 11), -- Español - Luis Martínez
(9, 2, 3, 12), -- Ciencias Naturales - Diana López
(10, 2, 5, 13), -- Educación Física - Miguel Ramírez
(11, 2, 7, 7),  -- Inglés - Paula Padilla
(12, 2, 8, 13), -- Tecnología e Informática - Miguel Ramírez
-- Curso 3 (Sexto 2), profesores 11, 12, 13
(13, 3, 1, 11),
(14, 3, 2, 12),
(15, 3, 3, 13),
(16, 3, 4, 11),
(17, 3, 5, 12),
(18, 3, 7, 13),
-- Curso 4 (Noveno 1), profesores 7, 11
(19, 4, 1, 7),
(20, 4, 2, 11),
(21, 4, 3, 12),
(22, 4, 4, 13),
(23, 4, 5, 7),
(24, 4, 7, 11);

ALTER TABLE asignacion_asignaturas AUTO_INCREMENT = 25;
ALTER TABLE asignaturas AUTO_INCREMENT = 16;

-- 2. asistencia_db
DROP DATABASE IF EXISTS asistencia_db;
CREATE DATABASE asistencia_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE asistencia_db;

CREATE TABLE asistencia (
  id_asistencia int(11) NOT NULL AUTO_INCREMENT,
  id_estudiante int(11) NOT NULL,
  id_profesor int(11) NOT NULL,
  id_curso int(11) NOT NULL,
  id_asignatura int(11) NOT NULL,
  fecha date NOT NULL,
  presente enum('1','2','3') NOT NULL,
  observaciones text DEFAULT NULL,
  PRIMARY KEY (id_asistencia),
  UNIQUE KEY id_estudiante (id_estudiante, fecha, id_curso, id_asignatura)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Asistencias de estudiantes a clases dictadas por profesores válidos
INSERT INTO asistencia (id_estudiante, id_profesor, id_curso, id_asignatura, fecha, presente, observaciones) VALUES
(1, 7, 1, 1, '2025-07-01', '1', 'Presente y participativo'),
(2, 11, 1, 2, '2025-07-01', '1', 'Presente'),
(3, 12, 2, 3, '2025-07-01', '2', 'Ausente por enfermedad'),
(4, 13, 2, 5, '2025-07-01', '1', 'Presente'),
(5, 11, 3, 1, '2025-07-01', '3', 'Llegó tarde'),
(6, 12, 3, 2, '2025-07-01', '1', 'Presente');

ALTER TABLE asistencia AUTO_INCREMENT = 7;

-- 3. auth_db
DROP DATABASE IF EXISTS auth_db;
CREATE DATABASE auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE auth_db;

CREATE TABLE usuarios (
  id_usuario int(11) NOT NULL AUTO_INCREMENT,
  nombres varchar(50) NOT NULL,
  apellidos varchar(50) NOT NULL,
  tipo_documento varchar(20) NOT NULL,
  documento_identidad varchar(20) NOT NULL,
  telefono varchar(20) DEFAULT NULL,
  email varchar(100) NOT NULL,
  contrasena_hash varchar(255) NOT NULL,
  rol enum('administrador','acudiente','profesor') NOT NULL,
  estado enum('activo','inactivo') NOT NULL DEFAULT 'activo',
  fecha_creacion datetime NOT NULL DEFAULT current_timestamp(),
  fecha_modificacion datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (id_usuario),
  UNIQUE KEY documento_identidad (documento_identidad),
  UNIQUE KEY email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Usuarios: administradores, profesores, acudientes
INSERT INTO usuarios VALUES
(1, 'Ana', 'Admin', 'CC', '1001001', '3001112233', 'ana.admin@ejemplo.com', 'hash', 'administrador', 'activo', '2025-07-01 19:54:28', '2025-07-01 19:54:28'),
(2, 'Carlos', 'Acudiente', 'TI', '2002002', '3002223344', 'carlos.acudiente@ejemplo.com', 'hash', 'acudiente', 'activo', '2025-07-01 19:54:28', '2025-07-01 19:54:28'),
(3, 'Paula', 'Padilla', 'CC', '3003003', '3003334455', 'paula.profe@ejemplo.com', 'hash', 'profesor', 'activo', '2025-07-01 19:54:28', '2025-07-06 01:08:23'),
(4, 'Juan Carlos', 'Pérez García', 'TI', '1000001', '3101234567', 'juan.perez@acudiente.com', 'hash', 'acudiente', 'activo', '2025-07-01 20:08:10', '2025-07-01 20:08:10'),
(5, 'María Elena', 'Rodríguez López', 'TI', '1000002', '3102345678', 'maria.rodriguez@acudiente.com', 'hash', 'acudiente', 'activo', '2025-07-01 20:08:10', '2025-07-01 20:08:10'),
(6, 'Andrés Felipe', 'Gómez Martínez', 'TI', '1000003', '3103456789', 'andres.gomez@acudiente.com', 'hash', 'acudiente', 'activo', '2025-07-01 20:08:10', '2025-07-01 20:08:10'),
(7, 'Sofía Alejandra', 'Hernández Silva', 'TI', '1000004', '3104567890', 'sofia.hernandez@acudiente.com', 'hash', 'acudiente', 'activo', '2025-07-01 20:08:10', '2025-07-01 20:08:10'),
(8, 'Carlos Eduardo', 'Vargas Ruiz', 'TI', '1000005', '3105678901', 'carlos.vargas@acudiente.com', 'hash', 'acudiente', 'activo', '2025-07-01 20:08:10', '2025-07-01 20:08:10'),
(9, 'Roberto', 'Pérez Sánchez', 'CC', '40001001', '3201234567', 'roberto.perez@acudiente.com', 'hash', 'acudiente', 'activo', '2025-07-01 20:08:10', '2025-07-01 20:08:10'),
(10, 'Elena', 'García Morales', 'CC', '40002002', '3202345678', 'elena.garcia@acudiente.com', 'hash', 'acudiente', 'activo', '2025-07-01 20:08:10', '2025-07-01 20:08:10'),
(11, 'Luis Fernando', 'Martínez Torres', 'CC', '30001001', '3301234567', 'luis.martinez@profesor.com', 'hash', 'profesor', 'activo', '2025-07-01 20:08:10', '2025-07-01 20:08:10'),
(12, 'Diana Patricia', 'López Vargas', 'CC', '30002002', '3302345678', 'diana.lopez@profesor.com', 'hash', 'profesor', 'activo', '2025-07-01 20:08:10', '2025-07-01 20:08:10'),
(13, 'Miguel Ángel', 'Ramírez Castro', 'CC', '30003003', '3303456789', 'miguel.ramirez@profesor.com', 'hash', 'profesor', 'activo', '2025-07-01 20:08:10', '2025-07-01 20:08:10');

CREATE TABLE acudientes (
  id_acudiente int(11) NOT NULL AUTO_INCREMENT,
  id_usuario int(11) NOT NULL,
  parentesco varchar(50) DEFAULT NULL,
  celular varchar(20) DEFAULT NULL,
  direccion varchar(150) DEFAULT NULL,
  PRIMARY KEY (id_acudiente),
  UNIQUE KEY id_usuario (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO acudientes VALUES
(1, 2, 'Padre', '3002223344', 'Calle 123'),
(2, 4, 'Padre', '3101234567', 'Calle 5 #10-15, Cali'),
(3, 5, 'Madre', '3102345678', 'Carrera 20 #30-45, Barranquilla'),
(4, 6, 'Madre', '3103456789', 'Calle 8 #12-25, Cartagena'),
(5, 7, 'Padre', '3104567890', 'Calle 12 #30-50, Bucaramanga'),
(6, 8, 'Madre', '3105678901', 'Carrera 25 #40-60, Pereira'),
(7, 9, 'Padre', '3201234567', 'Calle 10 #20-30, Bogotá'),
(8, 10, 'Madre', '3202345678', 'Carrera 15 #25-40, Medellín');

CREATE TABLE administradores (
  id_administrador int(11) NOT NULL AUTO_INCREMENT,
  id_usuario int(11) NOT NULL,
  PRIMARY KEY (id_administrador),
  UNIQUE KEY id_usuario (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO administradores VALUES (1, 1);

CREATE TABLE profesores (
  id_profesor int(11) NOT NULL AUTO_INCREMENT,
  id_usuario int(11) NOT NULL,
  especialidad varchar(100) DEFAULT NULL,
  es_director tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id_profesor),
  UNIQUE KEY id_usuario (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Relación usuario-profesor: id_profesor = id_usuario para simplificar
INSERT INTO profesores VALUES
(7, 3, 'Matemáticas', 1),
(11, 11, 'Español', 1),
(12, 12, 'Ciencias Naturales', 0),
(13, 13, 'Educación Física', 0);

ALTER TABLE acudientes AUTO_INCREMENT = 9;
ALTER TABLE administradores AUTO_INCREMENT = 2;
ALTER TABLE profesores AUTO_INCREMENT = 14;
ALTER TABLE usuarios AUTO_INCREMENT = 14;

-- 4. calificaciones_db
DROP DATABASE IF EXISTS calificaciones_db;
CREATE DATABASE calificaciones_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE calificaciones_db;

CREATE TABLE calificaciones (
  id_calificacion int(11) NOT NULL AUTO_INCREMENT,
  id_estudiante int(11) NOT NULL,
  id_asignatura int(11) NOT NULL,
  periodo varchar(20) NOT NULL,
  nota decimal(4,2) NOT NULL,
  observaciones varchar(255) DEFAULT NULL,
  fecha_registro datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id_calificacion),
  UNIQUE KEY id_estudiante (id_estudiante, id_asignatura, periodo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Calificaciones para estudiantes, asignaturas y periodos válidos
INSERT INTO calificaciones (id_estudiante, id_asignatura, periodo, nota, observaciones) VALUES
(1, 1, '2025-1', 4.50, 'Muy participativo'),
(2, 2, '2025-1', 3.80, 'Buen desempeño'),
(3, 3, '2025-1', 4.00, 'Regular'),
(4, 5, '2025-1', 4.20, 'Excelente'),
(5, 1, '2025-1', 3.50, 'Debe mejorar en puntualidad'),
(6, 2, '2025-1', 4.90, 'Sobresaliente');

ALTER TABLE calificaciones AUTO_INCREMENT = 7;

-- 5. cursos_db
DROP DATABASE IF EXISTS cursos_db;
CREATE DATABASE cursos_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE cursos_db;

CREATE TABLE cursos (
  id_curso int(11) NOT NULL AUTO_INCREMENT,
  nombre varchar(100) NOT NULL,
  grado varchar(20) NOT NULL,
  anio_lectivo int(11) NOT NULL,
  id_sede int(11) NOT NULL,
  director_profesor int(11) NOT NULL,
  PRIMARY KEY (id_curso)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Cursos con director_profesor existente y sedes válidas
INSERT INTO cursos VALUES
(1, 'Sexto 1 (601)', 'Sexto', 2025, 1, 7),
(2, 'Noveno 2 (902)', 'Noveno', 2025, 3, 7),
(3, 'Sexto 2 (602)', 'Sexto', 2025, 2, 11),
(4, 'Noveno 1 (901)', 'Noveno', 2025, 3, 11);

ALTER TABLE cursos AUTO_INCREMENT = 5;

-- 6. estudiantes_db
DROP DATABASE IF EXISTS estudiantes_db;
CREATE DATABASE estudiantes_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE estudiantes_db;

CREATE TABLE estudiantes (
  id_estudiante int(11) NOT NULL AUTO_INCREMENT,
  nombres varchar(50) NOT NULL,
  apellidos varchar(50) NOT NULL,
  tipo_documento varchar(20) NOT NULL,
  documento_identidad varchar(20) NOT NULL,
  telefono varchar(20) DEFAULT NULL,
  email varchar(100) NOT NULL,
  fecha_nacimiento date DEFAULT NULL,
  id_acudiente int(11) DEFAULT NULL,
  id_curso int(11) DEFAULT NULL,
  id_sede int(11) NOT NULL,
  estado_matricula enum('pre-matriculado','matriculado','retirado') DEFAULT 'pre-matriculado',
  fecha_creacion datetime NOT NULL DEFAULT current_timestamp(),
  fecha_modificacion datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (id_estudiante),
  UNIQUE KEY documento_identidad (documento_identidad),
  UNIQUE KEY email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Estudiantes con acudientes, cursos y sedes válidos (corregidos para coincidir con las relaciones)
INSERT INTO estudiantes VALUES
(1, 'Pepito', 'Perez', 'TI', '1111111', '018007777', 'pepito.perez@example.com', '2012-05-10', 1, 1, 1, 'matriculado', '2025-07-05 23:42:27', '2025-07-05 23:42:27'),
(2, 'Laura', 'Martínez', 'TI', '2222222', '018007778', 'laura.martinez@example.com', '2011-09-15', 2, 1, 1, 'matriculado', '2025-07-05 23:50:00', '2025-07-05 23:50:00'),
(3, 'Andrés', 'Gómez', 'TI', '3333333', '018007779', 'andres.gomez@example.com', '2011-01-20', 3, 2, 3, 'matriculado', '2025-07-05 23:55:00', '2025-07-05 23:55:00'),
(4, 'Mariana', 'Ruiz', 'TI', '4444444', '018007780', 'mariana.ruiz@example.com', '2012-12-30', 4, 2, 3, 'matriculado', '2025-07-06 00:00:00', '2025-07-06 00:00:00'),
(5, 'Santiago', 'López', 'TI', '5555555', '018007781', 'santiago.lopez@example.com', '2012-03-03', 5, 3, 2, 'matriculado', '2025-07-06 00:05:00', '2025-07-06 00:05:00'),
(6, 'Valentina', 'Torres', 'TI', '6666666', '018007782', 'valentina.torres@example.com', '2011-07-21', 6, 4, 3, 'matriculado', '2025-07-06 00:10:00', '2025-07-06 00:10:00');

ALTER TABLE estudiantes AUTO_INCREMENT = 7;

-- 7. observaciones_db
DROP DATABASE IF EXISTS observaciones_db;
CREATE DATABASE observaciones_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE observaciones_db;

CREATE TABLE observaciones (
  id_observacion int(11) NOT NULL AUTO_INCREMENT,
  id_estudiante int(11) NOT NULL,
  id_asignatura int(11) NOT NULL,
  id_profesor int(11) NOT NULL,
  fecha_incidente date NOT NULL,
  tipo_falta varchar(50) NOT NULL,
  articulo_manual_convivencia varchar(100) DEFAULT NULL,
  observacion text NOT NULL,
  fecha_registro datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id_observacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Observaciones para estudiantes, asignaturas y profesores válidos
INSERT INTO observaciones (id_observacion, id_estudiante, id_asignatura, id_profesor, fecha_incidente, tipo_falta, articulo_manual_convivencia, observacion, fecha_registro) VALUES
(1, 1, 1, 7, '2025-06-28', 'Observación positiva', NULL, 'Ayudó a compañeros con dificultades en matemáticas', '2025-07-01 20:13:35'),
(2, 2, 2, 11, '2025-07-01', 'Falta leve', 'Art. 14.2', 'Llegó tarde después del recreo', '2025-07-01 20:13:35'),
(3, 3, 3, 12, '2025-07-02', 'Tardanza', 'Art. 15.1', 'Llegó 10 minutos tarde a ciencias naturales', '2025-07-02 18:01:41'),
(4, 4, 5, 13, '2025-07-02', 'Comportamental', 'Art. 23.2', 'Interrumpió la clase de educación física', '2025-07-02 18:14:34'),
(5, 5, 1, 11, '2025-07-02', 'Falta leve', 'Art. 15.1', 'No entregó la tarea de matemáticas', '2025-07-02 18:17:22'),
(6, 6, 2, 11, '2025-07-02', 'Observación positiva', NULL, 'Participó activamente en español', '2025-07-02 18:32:40');

ALTER TABLE observaciones AUTO_INCREMENT = 7;

-- 8. sedes_db
DROP DATABASE IF EXISTS sedes_db;
CREATE DATABASE sedes_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE sedes_db;

CREATE TABLE sedes (
  id_sede int(11) NOT NULL AUTO_INCREMENT,
  nombre varchar(100) NOT NULL,
  PRIMARY KEY (id_sede),
  UNIQUE KEY nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO sedes VALUES
(1, 'INSTITUCIÓN EDUCATIVA DEPARTAMENTAL JOSUÉ MANRIQUE'),
(2, 'CONCENTRACION RURAL CABUYARITO'),
(3, 'CONCENTRACION RURAL CAÑO TIGRE');

CREATE TABLE profesor_sede (
  id_profesor_sede int(11) NOT NULL AUTO_INCREMENT,
  id_profesor int(11) NOT NULL,
  id_sede int(11) NOT NULL,
  PRIMARY KEY (id_profesor_sede),
  UNIQUE KEY unique_profesor_sede (id_profesor, id_sede),
  KEY id_sede (id_sede),
  KEY ix_profesor_sede_id_profesor_sede (id_profesor_sede),
  CONSTRAINT profesor_sede_ibfk_1 FOREIGN KEY (id_sede) REFERENCES sedes (id_sede)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- RELACIONES CORREGIDAS: Profesores asignados a TODAS las sedes donde tienen cursos
INSERT INTO profesor_sede VALUES
-- Profesor 7 (Paula Padilla): tiene cursos en sede 1 (curso 1) y sede 3 (curso 2)
(1, 7, 1),
(2, 7, 3),
-- Profesor 11 (Luis Martínez): tiene cursos en sede 1 (curso 1) y sede 3 (curso 4) y sede 2 (curso 3)
(3, 11, 1),
(4, 11, 2),
(5, 11, 3),
-- Profesor 12 (Diana López): tiene cursos en sede 1 (curso 1), sede 3 (cursos 2,4) y sede 2 (curso 3)
(6, 12, 1),
(7, 12, 2),
(8, 12, 3),
-- Profesor 13 (Miguel Ramírez): tiene cursos en sede 1 (curso 1), sede 3 (cursos 2,4) y sede 2 (curso 3)
(9, 13, 1),
(10, 13, 2),
(11, 13, 3);

ALTER TABLE profesor_sede AUTO_INCREMENT = 12;
ALTER TABLE sedes AUTO_INCREMENT = 4;

-- ===========================
-- VERIFICACIONES DE INTEGRIDAD
-- ===========================

-- Verificar que todos los profesores estén asignados a las sedes correctas
-- Esta consulta debería mostrar todos los profesores con sus cursos y sedes
SELECT DISTINCT 
    p.id_profesor,
    u.nombres,
    u.apellidos,
    c.id_curso,
    c.nombre as curso_nombre,
    c.id_sede,
    s.nombre as sede_nombre
FROM auth_db.profesores p
JOIN auth_db.usuarios u ON p.id_usuario = u.id_usuario
JOIN asignaturas_db.asignacion_asignaturas aa ON p.id_profesor = aa.id_profesor
JOIN cursos_db.cursos c ON aa.id_curso = c.id_curso
JOIN sedes_db.sedes s ON c.id_sede = s.id_sede
ORDER BY p.id_profesor, c.id_sede;

-- Verificar que todos los profesores tengan relación en profesor_sede para cada sede donde tienen cursos
SELECT DISTINCT
    p.id_profesor,
    u.nombres,
    u.apellidos,
    c.id_sede,
    s.nombre as sede_nombre,
    CASE WHEN ps.id_profesor IS NOT NULL THEN 'SÍ' ELSE 'NO' END as asignado_en_profesor_sede
FROM auth_db.profesores p
JOIN auth_db.usuarios u ON p.id_usuario = u.id_usuario
JOIN asignaturas_db.asignacion_asignaturas aa ON p.id_profesor = aa.id_profesor
JOIN cursos_db.cursos c ON aa.id_curso = c.id_curso
JOIN sedes_db.sedes s ON c.id_sede = s.id_sede
LEFT JOIN sedes_db.profesor_sede ps ON p.id_profesor = ps.id_profesor AND c.id_sede = ps.id_sede
ORDER BY p.id_profesor, c.id_sede;

-- ===========================
-- FIN DEL SCRIPT CORREGIDO
-- ===========================
